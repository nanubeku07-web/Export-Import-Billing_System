import React from "react";
import { Link } from "react-router-dom";
import "./HomePage.css";

const HomePage = () => {
  const isLoggedIn = localStorage.getItem("auth");

  return (
    <div className="home-container">
      <div className="home-card">
        <h1 className="home-title">Welcome to TradeTrack</h1>

        <p className="home-subtitle">
          Smart Inventory & Billing system designed for small shops and businesses.
        </p>

        <div className="home-buttons">
          {isLoggedIn ? (
            <>
              <Link to="/dashboard" className="home-btn primary">
                Go to Dashboard
              </Link>
              <Link to="/products" className="home-btn outline">
                View Products
              </Link>
            </>
          ) : (
            <>
              <Link to="/login" className="home-btn primary">
                Login
              </Link>
              <Link to="/signup" className="home-btn outline">
                Create Account
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
