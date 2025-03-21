import cv2
import mediapipe as mp
import numpy as np
import pandas as pd
import time
import tensorflow as tf
from tensorflow import keras

# Initialize Mediapipe FaceMesh
mp_face_mesh = mp.solutions.face_mesh
face_mesh = mp_face_mesh.FaceMesh(refine_landmarks=True)
mp_drawing = mp.solutions.drawing_utils

# Facial for Eyes, Mouth, and Nose
LEFT_EYE = [33, 160, 158, 133, 153, 144]
RIGHT_EYE = [362, 385, 387, 263, 373, 380]
MOUTH_INDICES = [61, 67, 62, 66, 63, 65, 60, 64]
NOSE_INDEX = 1
LEFT_EYE_INDEX = 33
RIGHT_EYE_INDEX = 263

# Eye Aspect Ratio (EAR) Thresholds
FULLY_OPEN_THRESHOLD = 0.25
HALF_OPEN_THRESHOLD = 0.18
CLOSED_THRESHOLD = 0.12

# Initialize data table
data = []
start_time = time.time()

#lables of eye lokkings
class_labels = {
    0: "forward_look",
    1: "close_look",
    2: "right_look",
    3: "left_look"
}

#for eyes modal loading 

try:
    eye_model = keras.models.load_model("eye_model.h5")
    print("Model loaded successfully!")
except Exception as e:
    print(f" Error loading model: {e}")

IMG_SIZE = (120, 120)  

eye_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_eye.xml")

# Calculate Eye Aspect Ratio (ear)
def calculate_ear(eye_landmarks):
    p1, p2, p3, p4, p5, p6 = eye_landmarks
    vertical_1 = np.linalg.norm(np.array(p2) - np.array(p6))
    vertical_2 = np.linalg.norm(np.array(p3) - np.array(p5))
    horizontal = np.linalg.norm(np.array(p1) - np.array(p4))
    ear = (vertical_1 + vertical_2) / (2.0 * horizontal)
    return ear

# Extract Eye Landmarks
def get_eye_landmarks(landmarks, eye_indices, frame_width, frame_height):
    return [(int(landmarks[idx].x * frame_width), int(landmarks[idx].y * frame_height)) for idx in eye_indices]

# Calculate Mouth Aspect Ratio (MAR) for yawning detection
def calculate_mar(landmarks):
    A = np.linalg.norm(landmarks[1] - landmarks[5])  # Upper-Lower Lip Distance
    B = np.linalg.norm(landmarks[2] - landmarks[4])
    C = np.linalg.norm(landmarks[0] - landmarks[3])  # Horizontal Distance
    MAR = (A + B) / (2.0 * C)
    return MAR

# Detect Head Pose
def head_pose(landmarks):
    nose = landmarks[NOSE_INDEX]
    left_eye = landmarks[LEFT_EYE_INDEX]
    right_eye = landmarks[RIGHT_EYE_INDEX]

    eye_avg_y = (left_eye[1] + right_eye[1]) / 2

    if nose[0] < left_eye[0] - 5:
        return "Right Look"
    elif nose[0] > right_eye[0] + 5:
        return "Left Look"
    if nose[1] > eye_avg_y + 60:
        return "Down Look"

    return "Forward Look"

# Start Video Capture
cap = cv2.VideoCapture(0)

while cap.isOpened():
    success, frame = cap.read()
    if not success:
        break

    frame = cv2.flip(frame, 1)  # Mirror Effect
    rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    results = face_mesh.process(rgb_frame)
    
    eyes = eye_cascade.detectMultiScale(rgb_frame, scaleFactor=1.3, minNeighbors=5, minSize=(60, 60))
    
    predictions_text = []

    if len(eyes) > 0: 
        for (x, y, w, h) in eyes[:2]:  
            eye = frame[y:y+h, x:x+w] 
            eye = cv2.resize(eye, IMG_SIZE)  
            eye = eye.astype("float32") / 255.0  
            eye = np.expand_dims(eye, axis=0)  

            predictions = eye_model.predict(eye)
            predicted_index = np.argmax(predictions)
            confidence = np.max(predictions)
            predicted_label = class_labels.get(predicted_index, "Unknown")

            predictions_text.append(f"{predicted_label}")

            cv2.putText(frame, f"{predicted_label}",
                        (x, y - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.4, (0, 255, 0), 1)
            cv2.rectangle(frame, (x, y), (x + w, y + h), (0, 255, 0), 2)
    
    if predictions_text:
        text = " | ".join(predictions_text)
        text_size = cv2.getTextSize(text, cv2.FONT_HERSHEY_SIMPLEX, 0.7, 2)[0]
        text_x = (frame.shape[0] - text_size[1]) //2
        text_y = 100 

        cv2.putText(frame, text, (text_x, text_y), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)


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
            yawn_status = "No Yawn" if mar > 0.65 else "Yawn"  # Adjust threshold

            head_status = head_pose(landmarks)

            cv2.putText(frame, f"EAR: {avg_ear:.2f} - {eye_status}", (10, 30), 
                        cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
            cv2.putText(frame, f"Yawn: {yawn_status} | Look: {head_status}", (10, 60), 
                        cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 255), 2)

            if time.time() - start_time >= 1:
                left_eye_pred = predictions_text[0] if len(predictions_text) > 0 else "Unknown"
                right_eye_pred = predictions_text[1] if len(predictions_text) > 1 else "Unknown"
                data.append([eye_status,left_eye_pred,right_eye_pred, yawn_status, head_status])
                start_time = time.time()


    cv2.imshow("Concentration Monitor", frame)
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()

# Convert to DataFrame
df = pd.DataFrame(data, columns=["Eye Status","left eye looking ","right eye looking", "Yawn Status", "Head Pose"])

# Save as CSV
df.to_csv("concentration_data.csv", index=False)

print("Data Saved!")
print(df)

