
// Index Component
import React from "react";
import Roadmap from "./Roadmap";


const Index = () => {
  return (
    <div className="home-page">
      {/* Hero Section */}
      <header className="hero-section">
        <div className="hero-content">
          <h1 className="text-4xl lg:text-6xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent mb-6">
            Secure Printing Solutions
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            Advanced technology ensuring safe and reliable printing for your business needs.
          </p>
          <button className="btn-primary">Get Started</button>
        </div>
        <div className="hero-image">
          <img
            src="https://images.unsplash.com/photo-1488590528505-98d2b5aba04b"
            alt="Technology Security"
            className="w-full rounded-lg shadow-xl"
          />
        </div>
      </header>

      {/* Technology Section */}
      <section className="tech-section">
        <h2 className="section-title">Our Technology</h2>
        <div className="tech-grid">
          <div className="tech-card">
            <img
              src="https://images.unsplash.com/photo-1518770660439-4636190af475"
              alt="Secure Technology"
              className="w-full h-48 object-cover rounded-lg mb-4"
            />
            <h3 className="text-xl font-semibold mb-2">Secure Infrastructure</h3>
            <p className="text-muted-foreground">
              Enterprise-grade security for all your printing needs
            </p>
          </div>
          <div className="tech-card">
            <img
              src="https://images.unsplash.com/photo-1461749280684-dccba630e2f6"
              alt="Monitoring Systems"
              className="w-full h-48 object-cover rounded-lg mb-4"
            />
            <h3 className="text-xl font-semibold mb-2">Real-time Monitoring</h3>
            <p className="text-muted-foreground">
              Advanced systems for print job tracking and security
            </p>
          </div>
          <div className="tech-card">
            <img
              src="https://images.unsplash.com/photo-1483058712412-4245e9b90334"
              alt="Control Systems"
              className="w-full h-48 object-cover rounded-lg mb-4"
            />
            <h3 className="text-xl font-semibold mb-2">Smart Controls</h3>
            <p className="text-muted-foreground">
              Intelligent print management and access control
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
