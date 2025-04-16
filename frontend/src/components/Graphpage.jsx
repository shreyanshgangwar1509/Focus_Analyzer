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
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Spinner, Card, Row, Col } from "react-bootstrap"; // Import Bootstrap components

const GraphPage = () => {
  const [data, setData] = useState([]);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true); // Loading state for data fetch

  useEffect(() => {
    const storedEmail = localStorage.getItem("email");
    setEmail(storedEmail);
  }, []);

  useEffect(() => {
    if (!email) return;

    setLoading(true); // Show loading spinner when data is being fetched
    axios
      .get(`http://localhost:3001/api/session/${email}`)
      .then((res) => {
        const results = res.data.results || [];
        setData(results);
      })
      .catch((err) => console.error("Error fetching session data:", err))
      .finally(() => setLoading(false)); // Hide loading spinner once data is fetched
  }, [email]);

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
  const FOCUS_COLORS = ["#0d6efd", "#6c757d", "#6610f2", "#fd7e14"];

  const renderBarChart = (title, categoryData, color) => (
    <Card className="mb-4">
      <Card.Body>
        <h5 className="text-center">{title}</h5>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={Object.entries(categoryData).map(([name, count]) => ({
              name,
              count,
            }))}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" fill={color} />
          </BarChart>
        </ResponsiveContainer>
      </Card.Body>
    </Card>
  );

  const renderFocusPieChart = (focusData) => {
    const total = Object.values(focusData).reduce((sum, val) => sum + val, 0);
    const pieData = Object.entries(focusData).map(([name, value]) => ({
      name,
      value: parseFloat(((value / total) * 100).toFixed(2)),
    }));

    return (
      <Card className="mb-4">
        <Card.Body>
          <h5 className="text-center">Focus Percentage</h5>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={({ name, value }) => `${name}: ${value}%`}
              >
                {pieData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={FOCUS_COLORS[index % FOCUS_COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Card.Body>
      </Card>
    );
  };

  return (
    <div className="container mt-5">
      <h2 className="text-center text-primary mb-4">Session Summary</h2>
      {loading ? (
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
        </div>
      ) : data.length === 0 ? (
        <p className="text-center">No session data found.</p>
      ) : (
        <Row>
          <Col md={6} lg={4}>
            {renderFocusPieChart(counts.focus)}
          </Col>
          <Col md={6} lg={4}>
            {renderBarChart("Focus Status", counts.focus, "#0d6efd")}
          </Col>
          <Col md={6} lg={4}>
            {renderBarChart("Eye Status", counts.eye_status, "#198754")}
          </Col>
          <Col md={6} lg={4}>
            {renderBarChart("Yawn Status", counts.yawn_status, "#dc3545")}
          </Col>
          <Col md={6} lg={4}>
            {renderBarChart("Head Pose", counts.head_pose, "#ffc107")}
          </Col>
        </Row>
      )}
    </div>
  );
};

export default GraphPage;
