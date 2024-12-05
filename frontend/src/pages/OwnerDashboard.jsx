import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const OwnerDashboard = () => {
  const [owner, setOwner] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        console.error("No token found. Redirecting to login...");
        navigate("/login"); // Redirect to login if no token
        return;
      }

      try {
        const response = await fetch("http://localhost:5000/api/owner/owner-dashboard", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // Pass token in Authorization header
          },
        });

        if (response.status === 401) {
          console.error("Unauthorized access. Redirecting to login...");
          navigate("/login"); // Redirect if unauthorized
        } else if (response.ok) {
          const data = await response.json();
          setOwner(data.owner); // Store owner details in state
        } else {
          console.error("Unexpected error:", response.statusText);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate]);

  if (loading) {
    return <h1>Loading...</h1>;
  }

  if (!owner) {
    return <h1>Owner details could not be loaded.</h1>;
  }

  return (
    <div className="dashboard-container">
      <h1>Welcome, {owner.name}!</h1>
      <p>Username: {owner.username}</p>
      <p>Shop Name: {owner.shopName}</p>
    </div>
  );
};

export default OwnerDashboard;
