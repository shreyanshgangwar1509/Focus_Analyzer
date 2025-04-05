import axios from "axios";
import { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";

export default function CameraCapture() {
  const webcamRef = useRef(null);
  const [result, setResult] = useState("");

  const capture = async () => {
    const imageSrc = webcamRef.current.getScreenshot();

    const res = await axios.post("http://localhost:5000/predict", {
      image: imageSrc,
    });

    setResult(res.data.result); // Assuming backend returns { result: '...' }
  };
  useEffect(() => {
  const timer = setTimeout(() => {
    capture();
  }, 1000); 

  return () => clearTimeout(timer); // Cleanup
}, []);

  // useEffect(() => { }
  //   , [])
  return (
    <div>
      <Webcam
        audio={false}
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        width={1000}
        height={800}
      />
      <button onClick={capture}>Capture & Predict</button>
      {result && typeof result === 'object' ? (
        <div>
          <p>Eye Status: {result.eye_status}</p>
          <p>Focus: {result.focus}</p>
          <p>Head Pose: {result.head_pose}</p>
          <p>Left Eye: {result.left_eye}</p>
          <p>Right Eye: {result.right_eye}</p>
          <p>Yawn Status: {result.yawn_status}</p>
        </div>
      ) : (
        <p>Result: {result}</p>)}
  </div>
  );
}
