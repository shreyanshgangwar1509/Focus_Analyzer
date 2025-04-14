import cv2
import numpy as np
import mediapipe as mp
import joblib
import tensorflow as tf
from tensorflow import keras

# Load models and encoders
kmeans = joblib.load("kmeans_model.pkl")
scaler = joblib.load("scaler.pkl")
label_encoders = joblib.load("label_encoders.pkl")
try:
    eye_model = keras.models.load_model("eye_model.h5")
except Exception as e:
    print("Error loading eye_model.h5:", e)
    eye_model = None

# print("Scaler mean:", scaler.mean_)
# print("KMeans centers:", kmeans.cluster_centers_)
# for key, le in label_encoders.items():
#     print(f"{key} classes:", le.classes_)

# Mediapipe setup
mp_face_mesh = mp.solutions.face_mesh
face_mesh = mp_face_mesh.FaceMesh(refine_landmarks=True)

# Constants
LEFT_EYE = [33, 160, 158, 133, 153, 144]
RIGHT_EYE = [362, 385, 387, 263, 373, 380]
LEFT_EYE_IRIS_BOX = [33, 133, 159, 145, 160, 144, 153, 154, 155]
RIGHT_EYE_IRIS_BOX = [362, 263, 386, 374, 387, 373, 380, 381, 382]
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

def crop_eye(frame, landmarks, indices):
    h, w = frame.shape[:2]
    points = [(int(landmarks[idx].x * w), int(landmarks[idx].y * h)) for idx in indices]
    x_coords, y_coords = zip(*points)
    x1, y1 = max(min(x_coords) - 5, 0), max(min(y_coords) - 5, 0)
    x2, y2 = min(max(x_coords) + 5, w), min(max(y_coords) + 5, h)
    return frame[y1:y2, x1:x2]

def predict_from_image(frame):
    rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    results = face_mesh.process(rgb_frame)

    left_eye_pred = "Unknown"
    right_eye_pred = "Unknown"
    eye_status = "Unknown"
    yawn_status = "Unknown"
    head_status = "Unknown"
    focus_label = "Unknown"

    if results.multi_face_landmarks:
        for face_landmarks in results.multi_face_landmarks:
            landmarks = face_landmarks.landmark
            img_h, img_w = frame.shape[:2]
            pixel_landmarks = [(int(l.x * img_w), int(l.y * img_h)) for l in landmarks]

            # EAR Calculation
            left_eye_points = get_eye_landmarks(landmarks, LEFT_EYE, img_w, img_h)
            right_eye_points = get_eye_landmarks(landmarks, RIGHT_EYE, img_w, img_h)
            left_ear = calculate_ear(left_eye_points)
            right_ear = calculate_ear(right_eye_points)
            avg_ear = (left_ear + right_ear) / 2.0

            eye_status = (
                "Fully Opened" if avg_ear > FULLY_OPEN_THRESHOLD
                else "Half Opened" if avg_ear > HALF_OPEN_THRESHOLD
                else "Closed"
            )

            # MAR Calculation
            mouth_points = np.array([pixel_landmarks[i] for i in MOUTH_INDICES])
            mar = calculate_mar(mouth_points)
            yawn_status = "No Yawn" if mar > 0.65 else "Yawn"

            # Head pose
            head_status = detect_head_pose(pixel_landmarks)

            # Crop eyes and predict direction
            left_eye_img = crop_eye(frame, landmarks, LEFT_EYE_IRIS_BOX)
            right_eye_img = crop_eye(frame, landmarks, RIGHT_EYE_IRIS_BOX)

            if left_eye_img.size > 0:
                left_eye_pred = predict_eye_direction(left_eye_img)
            if right_eye_img.size > 0:
                right_eye_pred = predict_eye_direction(right_eye_img)

            # Focus prediction
            input_data = [[eye_status, left_eye_pred, right_eye_pred, yawn_status, head_status]]
            for i in range(len(input_data[0])):
                key = list(label_encoders.keys())[i]
                input_data[0][i] = label_encoders[key].transform([input_data[0][i]])[0]
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
