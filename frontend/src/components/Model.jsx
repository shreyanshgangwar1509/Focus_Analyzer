// import axios from "axios";
// import { useEffect, useRef, useState } from "react";
// import Webcam from "react-webcam";

// export default function CameraCapture() {
//   const webcamRef = useRef(null);
//   const [result, setResult] = useState(null);
//   const [isCapturing, setIsCapturing] = useState(false);

//   const capture = async () => {
//     if (!webcamRef.current) return;
//     const imageSrc = webcamRef.current.getScreenshot();
//     if (!imageSrc) return;

//     try {
//       const res = await axios.post("http://localhost:5000/predict", {
//         image: imageSrc,
//       });
//       setResult(res.data.result);
//     } catch (error) {
//       console.error("Error capturing image:", error);
//     }
//   };

//   useEffect(() => {
//     let intervalId;

//     if (isCapturing) {
//       intervalId = setInterval(() => {
//         capture();
//       }, 1000);
//     }

//     return () => {
//       if (intervalId) clearInterval(intervalId);
//     };
//   }, [isCapturing]);

//   return (
//     <div style={{ display: "flex", gap: "20px", alignItems: "flex-start" }}>
//       <div>
//         <Webcam
//           audio={false}
//           ref={webcamRef}
//           screenshotFormat="image/jpeg"
//           width={640}
//           height={480}
//         />
//         <button
//           type="button"
//           onClick={(e) => { e.preventDefault(); setIsCapturing(prev => !prev);  setResult(null); }}
//           style={{
//             marginTop: "10px",
//             padding: "10px 20px",
//             backgroundColor: isCapturing ? "#e74c3c" : "#2ecc71",
//             color: "white",
//             border: "none",
//             borderRadius: "5px",
//             cursor: "pointer",
//           }}
//         >
//           {isCapturing ? "Stop Capturing" : "Start Capturing"}
//         </button>
//       </div>

//       <div style={{ maxWidth: "400px" }}>
//         <h3>Prediction Result:</h3>
//         {(result) ? (
//           <ul>
//             <li>Eye Status: {result.eye_status}</li>
//             <li>Focus: {result.focus}</li>
//             <li>Head Pose: {result.head_pose}</li>
//             <li>Left Eye: {result.left_eye}</li>
//             <li>Right Eye: {result.right_eye}</li>
//             <li>Yawn Status: {result.yawn_status}</li>
//           </ul>
//         ) : result ? (
//           <p>{result}</p>
//         ) : (
//           <p>No data yet.</p>
//         )}
//       </div>
//     </div>
//   );
// }




import axios from "axios";
import { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";

export default function CameraCapture() {
  const webcamRef = useRef(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [resultsList, setResultsList] = useState([]);
  const [lastResult, setLastResult] = useState(null);

  const capture = async () => {
    if (!webcamRef.current) return;
    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) return;

    try {
      const res = await axios.post("http://localhost:5000/predict", {
        image: imageSrc,
      });
      const result = res.data.result;

      setLastResult(result); // Update latest displayed result
      setResultsList(prev => [...prev, result]); // Accumulate results
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
      // Stopping capture: send results to backend
      try {
        await axios.post("http://localhost:3001/save_results", {
          email: "abcd@gmail.com", // replace with dynamic email if needed
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
    <div style={{ display: "flex", gap: "20px", alignItems: "flex-start" }}>
      <div>
        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          width={640}
          height={480}
        />
        <button
          type="button"
          onClick={handleToggleCapture}
          style={{
            marginTop: "10px",
            padding: "10px 20px",
            backgroundColor: isCapturing ? "#e74c3c" : "#2ecc71",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          {isCapturing ? "Stop Capturing" : "Start Capturing"}
        </button>
      </div>

      <div style={{ maxWidth: "400px" }}>
        <h3>Prediction Result:</h3>
        {lastResult ? (
          <ul>
            <li>Eye Status: {lastResult.eye_status}</li>
            <li>Focus: {lastResult.focus}</li>
            <li>Head Pose: {lastResult.head_pose}</li>
            <li>Left Eye: {lastResult.left_eye}</li>
            <li>Right Eye: {lastResult.right_eye}</li>
            <li>Yawn Status: {lastResult.yawn_status}</li>
          </ul>
        ) : (
          <p>No data yet.</p>
        )}
      </div>
    </div>
  );
}
