import React from "react";
import "./css/Home.css"; // You can keep this for custom overrides
import { useNavigate } from "react-router-dom"; 
const HomePage = () => {
  const navigate = useNavigate();
  return (
    <div className="container py-5">
      <header className="text-center mb-5">
        <h1 className="display-4 text-primary fw-bold">Focus Analyzer</h1>
        <p className="lead text-muted">
          Real-time eye movement and yawn detection system using OpenCV & TensorFlow
        </p>
      </header>
      <div className="text-center mt-5">
        <button
          className="btn btn-lg btn-primary px-5 py-2 shadow"
          onClick={() => navigate("/concentration")}
        >
          🔎 Analyze Focus Now
        </button>
      </div>
      {/* Overview */}
      <section className="mb-5">
        <h2 className="h4 mb-3">📌 Overview</h2>
        <p>
          This project is a real-time eye movement and yawn detection system using OpenCV, TensorFlow/Keras, 
          and Haar cascade classifiers. It processes live video from a webcam to detect eye states and yawning 
          behavior, helping in applications like drowsiness detection, driver safety, and human-computer interaction.
        </p>
      </section>

      {/* Features */}
      <section className="mb-5">
        <h2 className="h4 mb-3">✨ Features</h2>
        <ul className="list-group list-group-flush">
          <li className="list-group-item">🚀 Real-time detection of eye movements and yawning.</li>
          <li className="list-group-item">
            🎯 Classifies eye movements into:
            <ul className="ms-4 mt-2">
              <li>Forward Look</li>
              <li>Close Look</li>
              <li>Right Look</li>
              <li>Left Look</li>
            </ul>
          </li>
          <li className="list-group-item">💤 Detects yawning (Yawn / No Yawn).</li>
          <li className="list-group-item">📸 Uses Haar cascade classifiers for face and eye detection.</li>
        </ul>
      </section>

      {/* Requirements */}
      <section className="mb-5">
        <h2 className="h4 mb-3">📦 Requirements</h2>
        <p>Make sure you have the following dependencies installed:</p>
        <pre className="bg-light p-3 rounded">
          pip install opencv-python numpy tensorflow keras
        </pre>
      </section>

      {/* Installation */}
      <section className="mb-5">
        <h2 className="h4 mb-3">🚀 Installation & Setup</h2>
        <pre className="bg-light p-3 rounded">
          git clone &lt;repo-url&gt;{"\n"}
          cd &lt;project-folder&gt;{"\n\n"}
          # Ensure models are present:{"\n"}
          eye_model.h5 (for eye movement detection){"\n"}
          yawn_model.h5 (for yawn detection){"\n\n"}
          # Run the script:{"\n"}
          python focus.py{"\n"}
          Press 'q' to exit the detection window.
        </pre>
      </section>

      {/* How it works */}
      <section className="mb-5">
        <h2 className="h4 mb-3">🛠 How It Works</h2>
        <ol className="ps-3">
          <li>Captures live video from the webcam.</li>
          <li>Converts frames to grayscale for processing.</li>
          <li>Detects faces and eyes using Haar cascade classifiers.</li>
          <li>Extracts detected eye and face regions, resizes them, and normalizes pixel values.</li>
          <li>Passes the processed images to pre-trained CNN models for classification.</li>
          <li>Displays predictions with bounding boxes and labels on the live video feed.</li>
        </ol>
      </section>

      {/* Model details */}
      <section className="mb-3">
        <h2 className="h4 mb-3">🔍 Model Details</h2>
        <div className="mb-3">
          <h5 className="text-primary">Eye Detection Model (eye_model.h5)</h5>
          <p>Trained to classify eye movement directions.</p>
          <p><strong>Input size:</strong> 120x120x3</p>
        </div>

        <div>
          <h5 className="text-primary">Yawn Detection Model (yawn_model.h5)</h5>
          <p>Trained to detect whether a person is yawning or not.</p>
          <p><strong>Input size:</strong> 145x145x3</p>
        </div>
      </section>
      <section className="mb-5">
  <h2 className="h4 mb-3">Limitations</h2>
  <ul className="ps-0">
    {[
      
      "Maintain a maximum distance of 35 cm from the camera.",
      "Designed for students and professionals working in front of a camera.",
      "Not suitable for individuals wearing spectacles.",
      "Functions correctly only when a single person is visible on the screen.",
    ].map((text, index) => (
      <li key={index} className="d-flex align-items-start mb-2" style={{ listStyle: "none" }}>
        <span className="me-2">⚠️</span>
        <span>{text}</span>
      </li>
    ))}
  </ul>
</section>


    </div>
  );
};

export default HomePage;