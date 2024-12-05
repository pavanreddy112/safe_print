import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import RoleSelection from "./pages/RoleSelection";
import AdminSignup from "./components/Forms/AdminSignupForm";
import OwnerSignup from "./components/Forms/OwnerSignupForm";
import UserSignup from "./components/Forms/UserSignupForm";
import OwnerLoginForm from "./components/Auth/OwnerLogin";
import UserLoginForm from "./components/Auth/UserLogin";
import OwnerDashboard from "./pages/OwnerDashboard";
import UserDashboard from "./pages/UserDashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RoleSelection />} />
        <Route path="/login" element={<OwnerLoginForm />} />
        <Route path="/user/login" element={<UserLoginForm />} />
        <Route path="/owner-dashboard" element={<OwnerDashboard />} />
        <Route path="/user-dashboard" element={<UserDashboard />} />
        <Route path="/admin/signup" element={<AdminSignup />} />
        <Route path="/owner/signup" element={<OwnerSignup />} />
        <Route path="/user/signup" element={<UserSignup />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;