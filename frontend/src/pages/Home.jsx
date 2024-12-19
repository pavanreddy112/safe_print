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
      <section className="features-section">
        <h2>Features</h2>
        <div className="features-grid">
          <div className="feature-item">
            <FaLock size={40} />
            <h3>🔒 Advanced Encryption</h3>
            <p>Protect your documents with military-grade security.</p>
          </div>
          <div className="feature-item">
            <FaClipboardList size={40} />
            <h3>✅ Reliable Authentication</h3>
            <p>Access control for both users and shop owners.</p>
          </div>
          <div className="feature-item">
            <FaFileAlt size={40} />
            <h3>📊 Transparent Logging</h3>
            <p>Full visibility into document activity.</p>
          </div>
          <div className="feature-item">
            <FaChartLine size={40} />
            <h3>⚡ Efficient Workflow</h3>
            <p>Streamlined printing to save time and reduce errors.</p>
          </div>
        </div>
      </section>

      {/* Real-Time Cyber Print Thefts Section */}
      <section className="cyber-theft-section">
        <h2>Real-Time Cyber Print Thefts & Statistics</h2>
        <div className="cyber-theft-report">
          <FaExclamationTriangle size={40} color="red" />
          <h3>Cyber Print Theft: A Growing Concern</h3>
          <p>
            Recent statistics show an alarming increase in cyber print thefts across the globe. In the past year alone, incidents have risen by 25%, with many businesses becoming victims of security breaches that compromise sensitive print jobs.
          </p>
          <ul>
            <li><strong>25% increase</strong> in cyber print theft incidents in the last year</li>
            <li><strong>50% of breaches</strong> involve unsecured document printing systems</li>
            <li><strong>80% of organizations</strong> reported poor access control as a key vulnerability</li>
          </ul>
          <p>
            As cyber threats continue to evolve, Secure Print is committed to providing cutting-edge solutions to protect your confidential documents from such threats.
          </p>
        </div>
      </section>

      {/* Roadmap Section */}
      <section className="roadmap-section">
        <h2>Project Roadmap</h2>
        <div className="roadmap-container">
          <div className="roadmap-stage">
            <span className="marker">Brainstorm Idea</span>
          </div>
          <div className="roadmap-stage">
            <span className="marker">Prototype Building</span>
          </div>
          <div className="roadmap-stage active">
            <span className="marker">Testing <span className="gps">📍</span></span>
          </div>
          <div className="roadmap-stage">
            <span className="marker">Deployment</span>
          </div>
          <div className="roadmap-stage">
            <span className="marker">Maintenance</span>
          </div>
        </div>
        <div className="roadmap-line">
          <div className="progress"></div>
        </div>
      </section>

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
              onClick={() => (window.location.href = "/owner/signup")}
            >
              Signup
            </button>
            <button
              className="cta-button secondary"
              onClick={() => (window.location.href = "/owner/login")}
            >
              Login
            </button>
          </div>
        </div>
        <div className="user-container">
          <h3>Users</h3>
          <p>
            Upload your documents securely and track their progress for a
            seamless printing experience.
          </p>
          <div className="user-buttons">
            <button
              className="cta-button"
              onClick={() => (window.location.href = "/user/signup")}
            >
              Signup
            </button>
            <button
              className="cta-button secondary"
              onClick={() => (window.location.href = "/user/login")}
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
