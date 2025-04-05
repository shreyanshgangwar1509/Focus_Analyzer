import cv2
import numpy as np
import mediapipe as mp
import joblib
import tensorflow as tf
from tensorflow import keras

# Load models and resources
kmeans = joblib.load("kmeans_model.pkl")
scaler = joblib.load("scaler.pkl")
label_encoders = joblib.load("label_encoders.pkl")
try:
    eye_model = keras.models.load_model("eye_model.h5")
except Exception as e:
    print("Error loading eye_model.h5:", e)
    eye_model = None

print("Scaler mean:", scaler.mean_)
print("KMeans centers:", kmeans.cluster_centers_)
for key, le in label_encoders.items():
    print(f"{key} classes:", le.classes_)

eye_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_eye.xml")

# Mediapipe setup
mp_face_mesh = mp.solutions.face_mesh
face_mesh = mp_face_mesh.FaceMesh(refine_landmarks=True)

# Constants
LEFT_EYE = [33, 160, 158, 133, 153, 144]
RIGHT_EYE = [362, 385, 387, 263, 373, 380]
MOUTH_INDICES = [61, 67, 62, 66, 63, 65, 60, 64]
NOSE_INDEX = 1
LEFT_EYE_INDEX = 33
RIGHT_EYE_INDEX = 263
IMG_SIZE = (120, 120)

FULLY_OPEN_THRESHOLD = 0.25
HALF_OPEN_THRESHOLD = 0.18

class_labels = {
    0: "forward_look",
    1: "close_look",
    2: "right_look",
    3: "left_look"
}
cluster_labels = {
    2: "Mid - Focused",
    0: "Non - Focused",
    1: "Focused"
}

def calculate_ear(eye_landmarks):
    p1, p2, p3, p4, p5, p6 = eye_landmarks
    vertical_1 = np.linalg.norm(np.array(p2) - np.array(p6))
    vertical_2 = np.linalg.norm(np.array(p3) - np.array(p5))
    horizontal = np.linalg.norm(np.array(p1) - np.array(p4))
    ear = (vertical_1 + vertical_2) / (2.0 * horizontal)
    return ear

def get_eye_landmarks(landmarks, eye_indices, w, h):
    return [(int(landmarks[idx].x * w), int(landmarks[idx].y * h)) for idx in eye_indices]

def calculate_mar(landmarks):
    A = np.linalg.norm(landmarks[1] - landmarks[5])
    B = np.linalg.norm(landmarks[2] - landmarks[4])
    C = np.linalg.norm(landmarks[0] - landmarks[3])
    return (A + B) / (2.0 * C)

def detect_head_pose(landmarks):
    nose = landmarks[NOSE_INDEX]
    left_eye = landmarks[LEFT_EYE_INDEX]
    right_eye = landmarks[RIGHT_EYE_INDEX]
    eye_avg_y = (left_eye[1] + right_eye[1]) / 2

    if nose[0] < left_eye[0] - 5:
        return "Right Look"
    elif nose[0] > right_eye[0] + 5:
        return "Left Look"
    elif nose[1] > eye_avg_y + 60:
        return "Down Look"
    return "Forward Look"

def predict_eye_direction(eye_image):
    eye = cv2.resize(eye_image, IMG_SIZE).astype("float32") / 255.0
    eye = np.expand_dims(eye, axis=0)
    prediction = eye_model.predict(eye)
    label_index = np.argmax(prediction)
    return class_labels.get(label_index, "Unknown")

def predict_from_image(frame):
    rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    results = face_mesh.process(rgb_frame)

    left_eye_pred = "Unknown"
    right_eye_pred = "Unknown"
    eye_status = "Unknown"
    yawn_status = "Unknown"
    head_status = "Unknown"
    focus_label = "Unknown"

    eyes = eye_cascade.detectMultiScale(rgb_frame, scaleFactor=1.3, minNeighbors=5, minSize=(60, 60))
    if len(eyes) >= 2:
        eyes = sorted(eyes, key=lambda x: x[0])  # sort by x to separate left and right
        (x1, y1, w1, h1), (x2, y2, w2, h2) = eyes[:2]
        left_eye_pred = predict_eye_direction(frame[y1:y1+h1, x1:x1+w1])
        right_eye_pred = predict_eye_direction(frame[y2:y2+h2, x2:x2+w2])

    if results.multi_face_landmarks:
        for face_landmarks in results.multi_face_landmarks:
            landmarks = [(int(l.x * frame.shape[1]), int(l.y * frame.shape[0])) for l in face_landmarks.landmark]

            left_eye_points = get_eye_landmarks(face_landmarks.landmark, LEFT_EYE, frame.shape[1], frame.shape[0])
            right_eye_points = get_eye_landmarks(face_landmarks.landmark, RIGHT_EYE, frame.shape[1], frame.shape[0])
            left_ear = calculate_ear(left_eye_points)
            right_ear = calculate_ear(right_eye_points)
            avg_ear = (left_ear + right_ear) / 2.0

            if avg_ear > FULLY_OPEN_THRESHOLD:
                eye_status = "Fully Opened"
            elif avg_ear > HALF_OPEN_THRESHOLD:
                eye_status = "Half Opened"
            else:
                eye_status = "Closed"

            mouth_points = np.array([landmarks[i] for i in MOUTH_INDICES])
            mar = calculate_mar(mouth_points)
            yawn_status = "No Yawn" if mar > 0.65 else "Yawn"

            head_status = detect_head_pose(landmarks)

            input_data = [[eye_status, left_eye_pred, right_eye_pred, yawn_status, head_status]]
            for i in range(len(input_data[0])):
                input_data[0][i] = label_encoders[list(label_encoders.keys())[i]].transform([input_data[0][i]])[0]

            input_scaled = scaler.transform(input_data)
            focus_prediction = kmeans.predict(input_scaled)
            focus_label = cluster_labels.get(focus_prediction[0], "Unknown")

    return {
        "eye_status": eye_status,
        "left_eye": left_eye_pred,
        "right_eye": right_eye_pred,
        "yawn_status": yawn_status,
        "head_pose": head_status,
        "focus": focus_label
    }
