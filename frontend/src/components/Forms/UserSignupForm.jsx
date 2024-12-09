import { useState } from "react";
import { useNavigate } from "react-router-dom";

const UserSignupForm = () => {
  const [name, setName] = useState(""); // New state for name
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Handle normal form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    const userData = { name, email, password }; // Include name in the payload

    try {
      const response = await fetch("http://localhost:5000/api/user/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (response.status === 201) {
        // Redirect to login page after successful signup
        navigate("/user/login");
      } else {
        setError(data.message || "Error signing up");
      }
    } catch (error) {
      setError("Error signing up");
      console.error(error);
    }
  };

  // Handle Google signup
  const handleGoogleSignup = () => {
    window.location.href = "http://localhost:5000/auth/google"; // Redirect to Google authentication route
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Sign up with Email</h2>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        placeholder="Name" // New input for name
      />
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        placeholder="Email"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        placeholder="Password"
      />
      {error && <p>{error}</p>}
      <button type="submit">Sign up</button>

      <hr />

      {/* Sign up with Google button */}
      <button type="button" onClick={handleGoogleSignup}>
        Sign up with Google
      </button>
      <button type="button" onClick={() => navigate("/user/login")}>
        Login
      </button>
    </form>
  );
};

export default UserSignupForm;
