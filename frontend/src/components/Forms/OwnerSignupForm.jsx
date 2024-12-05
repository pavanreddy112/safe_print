import { useState } from "react";
import { useNavigate } from "react-router-dom";

const OwnerSignupForm = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [shopName, setShopName] = useState("");
  const [shopAddress, setShopAddress] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);  // Track loading state

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);  // Set loading to true when the request is in progress
    setError("");  // Reset error

    try {
      // Send POST request to backend
      const response = await fetch("http://localhost:5000/api/owner/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          shopName,
          shopAddress,
          username,
          email,
          password,
        }),
      });

      const data = await response.json();
      if (response.status === 201) {
        alert("Owner created successfully");
        navigate("/login");  // Redirect to login page on success
      } else {
        setError(data.message);  // Show error message from the server
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      setError("Failed to submit form. Please try again.");
    } finally {
      setLoading(false);  // Reset loading state
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4">
      <h2>Owner Signup</h2>

      {error && <div className="error-message">{error}</div>}

      <div>
        <label>Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div>
        <label>Shop Name</label>
        <input
          type="text"
          value={shopName}
          onChange={(e) => setShopName(e.target.value)}
          required
        />
      </div>

      <div>
        <label>Shop Address</label>
        <input
          type="text"
          value={shopAddress}
          onChange={(e) => setShopAddress(e.target.value)}
          required
        />
      </div>

      <div>
        <label>Username</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
      </div>

      <div>
        <label>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div>
        <label>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      <button type="submit" disabled={loading}>
        {loading ? "Submitting..." : "Sign Up"}
      </button>

      <hr />

      {/* Login button to redirect to login page */}
      <div>
        <p>Already have an account?</p>
        <button type="button" onClick={() => navigate("/login")}>
          Login
        </button>
      </div>
    </form>
  );
};

export default OwnerSignupForm;
