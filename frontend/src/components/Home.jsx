import React from "react";
import "./css/Home.css"; // Import CSS file for styling

const HomePage = () => {
  return (
    <div className="container">
      <header>
        <h1>Real-Time Eye Movement & Yawn Detection</h1>
      </header>

      <section className="overview">
        <h2>📌 Overview</h2>
        <p>
          This project is a real-time eye movement and yawn detection system
          using OpenCV, TensorFlow/Keras, and Haar cascade classifiers. It
          processes live video from a webcam to detect eye states and yawning
          behavior, helping in applications like drowsiness detection, driver
          safety, and human-computer interaction.
        </p>
      </section>

      <section className="features">
        <h2>✨ Features</h2>
        <ul>
          <li>🚀 Real-time detection of eye movements and yawning.</li>
          <li>
            🎯 Classifies eye movements into:
            <ul>
              <li>Forward Look</li>
              <li>Close Look</li>
              <li>Right Look</li>
              <li>Left Look</li>
            </ul>
          </li>
          <li>💤 Detects yawning (Yawn / No Yawn).</li>
          <li>📸 Uses Haar cascade classifiers for face and eye detection.</li>
        </ul>
      </section>

      <section className="requirements">
        <h2>📦 Requirements</h2>
        <p>Make sure you have the following dependencies installed:</p>
        <code>pip install opencv-python numpy tensorflow keras</code>
      </section>

      <section className="installation">
        <h2>🚀 Installation & Setup</h2>
        <pre>
          <code>
            git clone &lt;repo-url&gt; <br />
            cd &lt;project-folder&gt; <br />
            <br />
            # Ensure models are present: <br />
            eye_model.h5 (for eye movement detection) <br />
            yawn_model.h5 (for yawn detection) <br />
            <br />
            # Run the script: <br />
            python focus.py <br />
            Press 'q' to exit the detection window.
          </code>
        </pre>
      </section>

      <section className="working">
        <h2>🛠 How It Works</h2>
        <ol>
          <li>Captures live video from the webcam.</li>
          <li>Converts frames to grayscale for processing.</li>
          <li>Detects faces and eyes using Haar cascade classifiers.</li>
          <li>Extracts detected eye and face regions, resizes them, and normalizes pixel values.</li>
          <li>Passes the processed images to pre-trained CNN models for classification.</li>
          <li>Displays predictions with bounding boxes and labels on the live video feed.</li>
        </ol>
      </section>

      <section className="models">
        <h2>🔍 Model Details</h2>
        <h3>Eye Detection Model (eye_model.h5)</h3>
        <p>Trained to classify eye movement directions.</p>
        <p>Input size: (120, 120, 3).</p>

        <h3>Yawn Detection Model (yawn_model.h5)</h3>
        <p>Trained to detect whether a person is yawning or not.</p>
        <p>Input size: (145, 145, 3).</p>
      </section>
    </div>
  );
};

export default HomePage;
