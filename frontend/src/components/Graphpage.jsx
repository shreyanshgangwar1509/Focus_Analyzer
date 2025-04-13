import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

const GraphPage = () => {
  const [data, setData] = useState([]);
  const [email, setEmail] = useState("");

  useEffect(() => {
    const storedEmail = localStorage.getItem("email");
    setEmail(storedEmail);
  }, []);

  useEffect(() => {
    if (!email) return;

    axios
      .get(`http://localhost:3001/api/session/${email}`)
      .then((res) => {
        const results = res.data.results || [];
        setData(results);
      })
      .catch((err) => console.error("Error fetching session data:", err));
  }, [email]);

  // Get count of each label per field
  const getCounts = () => {
    const counts = {
      focus: {},
      eye_status: {},
      yawn_status: {},
      head_pose: {},
    };

    data.forEach((item) => {
      ["focus", "eye_status", "yawn_status", "head_pose"].forEach((key) => {
        const value = item[key];
        if (value) {
          counts[key][value] = (counts[key][value] || 0) + 1;
        }
      });
    });

    return counts;
  };

  const counts = getCounts();

  const renderBarChart = (title, categoryData, color) => (
    <div style={{ marginBottom: "50px", maxWidth: "700px", margin: "0 auto" }}>
      <h4 className="text-center mb-3">{title}</h4>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={Object.entries(categoryData).map(([name, count]) => ({ name, count }))}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Legend />
          <Bar dataKey="count" fill={color} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
  

  return (
    <div className="container mt-5">
      <h2 className="text-center text-primary mb-4">Session Summary</h2>
      {data.length === 0 ? (
        <p className="text-center">No session data found.</p>
      ) : (
        <>
          {renderBarChart("Focus Status", counts.focus, "#0d6efd")}
          {renderBarChart("Eye Status", counts.eye_status, "#198754")}
          {renderBarChart("Yawn Status", counts.yawn_status, "#dc3545")}
          {renderBarChart("Head Pose", counts.head_pose, "#ffc107")}
        </>
      )}
    </div>
  );
};

export default GraphPage;
