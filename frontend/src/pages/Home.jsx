import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";

const Home = () => {
  const navigate = useNavigate();

  // If user is logged in, send them to the dashboard instead of the public hero
  useEffect(() => {
    if (localStorage.getItem("auth")) {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate]);

  return (
    <div className="hero-section">
      <div className="overlay"></div>

      <div className="hero-content">
        <h1>Welcome to <span>TradeTrack</span></h1>
        <p>Your all-in-one smart inventory & billing system</p>

        <div className="hero-buttons">
          <a href="/products" className="btn-primary">View Products</a>
          <a href="/add-product" className="btn-secondary">Add Product</a>
        </div>
      </div>
    </div>
  );
};

export default Home;
