import React, { useState, useEffect } from "react";
import Header from "../shared/Header";
import { Bar, Line, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import axios from "axios";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const AcademicManagerDashboard = () => {
  const [courses, setCourses] = useState([]);
  const [timetable, setTimetable] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE_URL = "http://localhost:5555/api";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const [coursesResponse, timetableResponse] = await Promise.all([
          axios.get(`${API_BASE_URL}/courses`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API_BASE_URL}/timetable`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setCourses(coursesResponse.data);
        setTimetable(timetableResponse.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load data");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Prepare data for charts
  const getCourseDurationData = () => {
    const durations = courses.map((course) => course.duration);
    const uniqueDurations = [...new Set(durations)];
    const countByDuration = uniqueDurations.map((duration) => ({
      duration,
      count: durations.filter((d) => d === duration).length,
    }));

    return {
      labels: countByDuration.map((item) => `${item.duration} hours`),
      datasets: [
        {
          label: "Number of Courses",
          data: countByDuration.map((item) => item.count),
          backgroundColor: "rgba(54, 162, 235, 0.5)",
          borderColor: "rgba(54, 162, 235, 1)",
          borderWidth: 1,
        },
      ],
    };
  };

  const getCoursePriceData = () => {
    const prices = courses.map((course) =>
      parseFloat(course.price.replace("$", ""))
    );
    return {
      labels: courses.map((course) => course.name),
      datasets: [
        {
          label: "Course Price ($)",
          data: prices,
          backgroundColor: "rgba(75, 192, 192, 0.5)",
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 1,
        },
      ],
    };
  };

  const getLecturerDistributionData = () => {
    const lecturers = courses.map((course) => course.lecturer);
    const uniqueLecturers = [...new Set(lecturers)];
    const countByLecturer = uniqueLecturers.map((lecturer) => ({
      lecturer,
      count: lecturers.filter((l) => l === lecturer).length,
    }));

    return {
      labels: countByLecturer.map((item) => item.lecturer),
      datasets: [
        {
          data: countByLecturer.map((item) => item.count),
          backgroundColor: [
            "rgba(255, 99, 132, 0.5)",
            "rgba(54, 162, 235, 0.5)",
            "rgba(255, 206, 86, 0.5)",
            "rgba(75, 192, 192, 0.5)",
            "rgba(153, 102, 255, 0.5)",
          ],
          borderColor: [
            "rgba(255, 99, 132, 1)",
            "rgba(54, 162, 235, 1)",
            "rgba(255, 206, 86, 1)",
            "rgba(75, 192, 192, 1)",
            "rgba(153, 102, 255, 1)",
          ],
          borderWidth: 1,
        },
      ],
    };
  };

  const getTimetableDistributionData = () => {
    const days = timetable.map((entry) => entry.day);
    const uniqueDays = [...new Set(days)];
    const countByDay = uniqueDays.map((day) => ({
      day,
      count: days.filter((d) => d === day).length,
    }));

    return {
      labels: countByDay.map((item) => item.day),
      datasets: [
        {
          label: "Number of Classes",
          data: countByDay.map((item) => item.count),
          backgroundColor: "rgba(153, 102, 255, 0.5)",
          borderColor: "rgba(153, 102, 255, 1)",
          borderWidth: 1,
        },
      ],
    };
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Course and Timetable Analytics",
      },
    },
  };

  if (loading) {
    return (
      <>
        <Header title="Academic Manager Dashboard" />
        <div className="dashboard-container">
          <p>Loading data...</p>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header title="Academic Manager Dashboard" />
        <div className="dashboard-container">
          <p className="error">{error}</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Header title="Academic Manager Dashboard" />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)", // 2 columns
          gap: "20px",
          marginTop: "20px",
        }}
      >
        <div>
          <div className="">
            <h3>Course Duration Distribution</h3>
            <Bar data={getCourseDurationData()} options={chartOptions} />
          </div>
          <div className="">
            <h3>Course Prices</h3>
            <Line data={getCoursePriceData()} options={chartOptions} />
          </div>
        </div>

        <div>
          {" "}
          <div className="">
            <h3>Lecturer Distribution</h3>
            <Pie data={getLecturerDistributionData()} options={chartOptions} />
          </div>
          <div className=""></div>
        </div>
      </div>
    </>
  );
};

export default AcademicManagerDashboard;
