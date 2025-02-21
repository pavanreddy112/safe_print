import React, { useEffect } from "react";
import { FaLock, FaClipboardList, FaCloud, FaCogs, FaShieldAlt, FaFileAlt, FaChartLine, FaExclamationTriangle } from "react-icons/fa";  // Importing necessary icons
import "./home.css";

const HomePage = () => {
  useEffect(() => {
    const sections = document.querySelectorAll('.features-section, .why-secure-print'); // Select the sections to animate

    const observer = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active'); // Add the 'active' class when the section comes into view
          observer.unobserve(entry.target); // Stop observing after it is animated
        }
      });
    }, {
      threshold: 0.5 // Trigger animation when 50% of the section is in view
    });

    sections.forEach(section => {
      observer.observe(section); // Start observing each section
    });
  }, []);

  return (
    <div className="home-page">
      {/* Hero Section */}
      <header className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title animate-fade-in">
            Secure Print - Your Trusted Printing Partner
          </h1>
          <p className="hero-description animate-slide-up">
            Experience secure, reliable, and efficient document printing.
          </p>
          <button className="cta-button animate-bounce">Get Started</button>
        </div>
      </header>

      {/* Why Secure Print Section */}
      <section className="why-secure-print">
        <h2>Why Secure Print?</h2>
        <div className="why-grid">
          <div className="why-item">
            <FaShieldAlt size={40} />
            <h3>🔒 Unmatched Security</h3>
            <p>All your documents are encrypted end-to-end, ensuring privacy.</p>
          </div>
          <div className="why-item">
            <FaCloud size={40} />
            <h3>🌐 User-Friendly Interface</h3>
            <p>Intuitive design that makes printing and document sharing seamless.</p>
          </div>
          <div className="why-item">
            <FaCogs size={40} />
            <h3>⚙️ Customizable Options</h3>
            <p>
              Tailored solutions for businesses, including role-based access and
              temporary document storage.
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
{/* Shop and User Section */}
<section className="shop-user-section">
  <div className="shop-container">
    <h3>Shop/Owner</h3>
    <p>
      Manage printing tasks securely, adhering to privacy protocols while
      accessing user-uploaded documents.
    </p>
    <div className="shop-buttons">
      <button
        className="cta-button"
        onClick={() => window.open("/owner/signup", "_blank")}
      >
        Signup
      </button>
      <button
        className="cta-button secondary"
        onClick={() => window.open("/owner/login", "_blank")}
      >
        Login
      </button>
    </div>
  </div>
  <div className="user-container">
    <h3>Users</h3>
    <p>
      Upload your documents securely and track their progress for a seamless
      printing experience.
    </p>
    <div className="user-buttons">
      <button
        className="cta-button"
        onClick={() => window.open("/user/signup", "_blank")}
      >
        Signup
      </button>
      <button
        className="cta-button secondary"
        onClick={() => window.open("/user/login", "_blank")}
      >
        Login
      </button>
    </div>
  </div>
</section>

{/* Footer */}
<footer className="footer">
  <p>&copy; {new Date().getFullYear()} Secure Print. All rights reserved.</p>
</footer>

    </div>
  );
};

export default HomePage;
