import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const UserDashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        console.error("No token found. Redirecting to login...");
        navigate("/user/login");
        return;
      }

      try {
        const response = await fetch("http://localhost:5000/api/user/user-dashboard", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // Pass token in Authorization header
          },
        });

        if (response.status === 401) {
          console.error("Unauthorized access. Redirecting to login...");
          navigate("/user/login");
          return; // Early return to stop further execution
        }

        if (response.ok) {
          const data = await response.json();
          if (data.user) {
            setUser(data.user); // Set user data if available
          } else {
            setError("User data not found in response.");
          }
        } else {
          console.error("Unexpected error:", response.statusText);
          setError("Failed to fetch dashboard data.");
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setError("An error occurred while fetching data.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate]);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="dashboard">
      {user ? (
        <div>
          <h1>Welcome, {user.email}!</h1>
          <p>User ID: {user.name}</p>
        </div>
      ) : (
        <p>No user data available.</p>
      )}
    </div>
  );
};

export default UserDashboard;
