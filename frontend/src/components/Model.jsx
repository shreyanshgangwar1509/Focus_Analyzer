import axios from "axios";
import { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import { useNavigate } from "react-router-dom";
import "./css/CameraCapture.css"; // Importing custom styles

export default function CameraCapture() {
  const webcamRef = useRef(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [resultsList, setResultsList] = useState([]);
  const [lastResult, setLastResult] = useState(null);
  const [email, setEmail] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const storedEmail = localStorage.getItem("email");
    setEmail(storedEmail);
  }, []);

  const capture = async () => {
    if (!webcamRef.current) return;
    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) return;

    try {
      const res = await axios.post("http://localhost:5000/predict", {
        image: imageSrc,
      });
      const result = res.data.result;

      setLastResult(result);
      setResultsList(prev => [...prev, result]);
    } catch (error) {
      console.error("Error capturing image:", error);
    }
  };

  useEffect(() => {
    let intervalId;
    if (isCapturing) {
      intervalId = setInterval(() => {
        capture();
      }, 1000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isCapturing]);

  const handleToggleCapture = async () => {
    if (isCapturing) {
      try {
        await axios.post("http://localhost:3001/save_results", {
          email,
          results: resultsList,
        });
        console.log("Session data saved successfully!");
      } catch (error) {
        console.error("Failed to save session:", error);
      }

      setResultsList([]);
      setLastResult(null);
    }

    setIsCapturing(prev => !prev);
  };

  return (
    <div className="container py-5 camera-page">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-primary fw-bold">🎥 Live Focus Analyzer</h2>
        <button
          className="btn btn-outline-primary"
          onClick={() => navigate("/data")}
        >
          Go to Data Page
        </button>
      </div>

      <div className="row">
        <div className="col-md-7 mb-4">
          <div className="card shadow-sm webcam-card">
            <div className="card-body text-center">
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                className="img-fluid rounded webcam-feed"
              />
              <button
                type="button"
                onClick={handleToggleCapture}
                className={`btn mt-3 ${isCapturing ? "btn-danger" : "btn-success"}`}
              >
                {isCapturing ? "⛔ Stop Capturing" : "▶️ Start Capturing"}
              </button>
            </div>
          </div>
        </div>

        <div className="col-md-5">
          <div className="card shadow-sm h-100 result-card">
            <div className="card-body">
              <h4 className="text-secondary mb-3">🧠 Prediction Result</h4>
              {lastResult ? (
                <ul className="list-group list-group-flush">
                  <li className="list-group-item">
                    <strong>Eye Status:</strong> {lastResult.eye_status}
                  </li>
                  <li className="list-group-item">
                    <strong>Focus:</strong> {lastResult.focus}
                  </li>
                  <li className="list-group-item">
                    <strong>Head Pose:</strong> {lastResult.head_pose}
                  </li>
                  <li className="list-group-item">
                    <strong>Left Eye:</strong> {lastResult.left_eye}
                  </li>
                  <li className="list-group-item">
                    <strong>Right Eye:</strong> {lastResult.right_eye}
                  </li>
                  <li className="list-group-item">
                    <strong>Yawn Status:</strong> {lastResult.yawn_status}
                  </li>
                </ul>
              ) : (
                <p className="text-muted">No data yet. Start capturing to view predictions.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}