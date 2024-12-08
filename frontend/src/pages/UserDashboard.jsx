import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const UserDashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState(""); // Search input value
  const [shopSuggestions, setShopSuggestions] = useState([]); // Suggestions list
  const [selectedShop, setSelectedShop] = useState(null); // Selected shop for communication
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
          return;
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

  // Function to handle search input change
  const handleSearchChange = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.length > 2) { // Fetch suggestions if query is longer than 2 characters
      console.log(`Searching for shops with query: ${query}`);
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("No token found. Redirecting to login...");
          navigate("/user/login");
          return;
        }

        const response = await fetch(`http://localhost:5000/api/shops/search?query=${query}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          console.log("Shops found:", data.shops);
          setShopSuggestions(data.shops || []); // Update suggestions with data from the backend
        } else {
          console.error("Failed to fetch shop suggestions:", response.status);
          setShopSuggestions([]); // Clear suggestions if there's an error
        }
      } catch (error) {
        console.error("Error fetching shop suggestions:", error);
        setShopSuggestions([]); // Clear suggestions on error
      }
    } else {
      setShopSuggestions([]); // Clear suggestions if the search query is too short
    }
  };

  // Function to select a shop
  const handleShopSelect = (shop) => {
    setSelectedShop(shop);
    console.log("Selected Shop:", shop); // Handle further actions like opening a chat
    navigate(`/chat/${shop._id}`); // Navigate to chat page with selected shop
  };

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

          {/* Search Section */}
          <div className="search-section">
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search for shops..."
              className="search-bar"
            />
            {/* Display search suggestions */}
            {shopSuggestions.length > 0 && (
              <ul className="suggestions">
                {shopSuggestions.map((shop) => (
                  <li
                    key={shop._id}
                    className="suggestion-item"
                    onClick={() => handleShopSelect(shop)}
                  >
                    {shop.name}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Selected Shop */}
          {selectedShop && (
            <div className="selected-shop">
              <h2>Selected Shop: {selectedShop.name}</h2>
              <p>Owner: {selectedShop.owner.name}</p>
            </div>
          )}
        </div>
      ) : (
        <p>No user data available.</p>
      )}
    </div>
  );
};

export default UserDashboard;
