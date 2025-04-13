import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid, ResponsiveContainer,
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

    axios.get(`http://localhost:3001/api/session/${email}`)
      .then((res) => {
        const results = res.data.results || [];
        setData(results);
      })
      .catch((err) => console.error("Error fetching session data:", err));
  }, [email]);

  // Count occurrences for each category
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

    // Convert counts into format suitable for BarChart
    const keys = new Set([
      ...Object.keys(counts.focus),
      ...Object.keys(counts.eye_status),
      ...Object.keys(counts.yawn_status),
      ...Object.keys(counts.head_pose),
    ]);

    return Array.from(keys).map((key) => ({
      status: key,
      Focus: counts.focus[key] || 0,
      Eye: counts.eye_status[key] || 0,
      Yawn: counts.yawn_status[key] || 0,
      Head: counts.head_pose[key] || 0,
    }));
  };

  return (
    <div className="container mt-5">
      <h2 className="text-center text-primary mb-4">Session Summary (Bar Chart)</h2>
      {data.length === 0 ? (
        <p className="text-center">No session data found.</p>
      ) : (
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={getCounts()} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="status" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="Focus" fill="#0d6efd" />
            <Bar dataKey="Eye" fill="#198754" />
            <Bar dataKey="Yawn" fill="#dc3545" />
            <Bar dataKey="Head" fill="#ffc107" />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default GraphPage;
