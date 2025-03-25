# Real-Time Eye Movement & Yawn Detection

## 📌 Overview
This project is a real-time **eye movement and yawn detection system** using **OpenCV, TensorFlow/Keras, and Haar cascade classifiers**. It processes live video from a webcam to detect **eye states** and **yawning behavior**, helping in applications like **drowsiness detection, driver safety, and human-computer interaction**.

## ✨ Features
- 🚀 **Real-time detection** of eye movements and yawning.
- 🎯 **Classifies eye movements** into:
  - Forward Look
  - Close Look
  - Right Look
  - Left Look
- 💤 **Detects yawning** (Yawn / No Yawn).
- 📸 Uses **Haar cascade classifiers** for face and eye detection.
- 🤖 Uses KMeans clustering for additional feature analysis.

## 📦 Requirements
Make sure you have the following dependencies installed:
```bash
pip install opencv-python numpy tensorflow keras
```

## 🚀 Installation & Setup
1. **Clone the repository:**
   ```bash
   git clone <repo-url>
   cd <project-folder>
   ```
2. **Ensure models are present:**
   - `eye_model.h5` (for eye movement detection)
   - `yawn_modal.h5` (for yawn detection)
   - `scaler_modal.h5` (for head position ,eye openness ,eye direction ,yawn detection )
   - `label_encoders modal.pkl` (labels the tabular data based on features)
   - `kmeans_model.pkl` (used for clustering features related to eye movement and yawning)
3. **Run the script:**
   ```bash
   python focus.py
   ```
4. **Press 'q'** to exit the detection window.

## 🛠 How It Works
1. Captures live video from the webcam.
2. Converts frames to grayscale for processing.
3. Detects **faces** and **eyes** using Haar cascade classifiers.
4. Extracts detected eye and face regions, resizes them, and normalizes pixel values.
5. Uses pre-trained CNN models for classification:
    - eye_model.h5 for eye movement detection.
    - yawn_model.h5 for yawning detection.
6. Applies KMeans clustering (`kmeans_model.pkl`) to analyze patterns in eye movement        and yawning behavior.
7. Displays predictions with bounding boxes and labels on the live video feed.

## 🔍 Model Details
- **Eye Detection Model (`eye_model.h5`)**
  - Trained to classify **eye movement directions**.
  - Input size: `(120, 120, 3)`.
- **Yawn Detection Model (`yawn_modal.h5`)**
  - Trained to detect whether a person is **yawning or not**.
  - Input size: `(145, 145, 3)`.
- **KMeans Model (`kmeans_model.pkl`)**
  - Used for clustering eye movement and yawning behaviors.
  - Helps identify patterns in user behavior for improved analysis.

## ⚡ Example Output
Upon running the script, you will see a real-time window with:
✅ Bounding boxes around detected eyes and face.
✅ Classification labels such as **'Right Look' (0.85 confidence)**.
✅ 'Yawn: Yes/No' displayed for detected faces.



## 🤝 Contributing
Feel free to open issues or submit pull requests to improve the model and add new features!

---
Developed with ❤️ by **Shreyansh Gangwar and Team**
Developed by **Sparsh Gupta** and **Sayali Chaudhari**

