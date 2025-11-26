import React from 'react';
import { Globe, MapPin, Shield, Zap } from 'lucide-react';
import './AuthLayout.css';

const AuthLayout = ({ children, title, subtitle }) => {
    return (
        <div className="auth-layout">
            {/* Left Side - Hero Section with Dark Theme */}
            <div className="auth-hero">
                {/* Animated Background Gradients */}
                <div className="hero-bg-gradient gradient-1"></div>
                <div className="hero-bg-gradient gradient-2"></div>
                <div className="hero-bg-gradient gradient-3"></div>

                {/* World Map Pattern */}
                <svg className="hero-map-pattern" viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
                    {/* Grid pattern for world map effect */}
                    <defs>
                        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(99,102,241,0.1)" strokeWidth="0.5"/>
                        </pattern>
                    </defs>
                    <rect width="400" height="300" fill="url(#grid)" />
                    
                    {/* Trade route connections */}
                    <line x1="80" y1="80" x2="200" y2="120" stroke="rgba(6,182,212,0.3)" strokeWidth="2" />
                    <line x1="200" y1="120" x2="320" y2="90" stroke="rgba(6,182,212,0.3)" strokeWidth="2" />
                    <line x1="200" y1="120" x2="180" y2="240" stroke="rgba(6,182,212,0.3)" strokeWidth="2" />
                    
                    {/* Port nodes */}
                    <circle cx="80" cy="80" r="4" fill="#6366f1" />
                    <circle cx="200" cy="120" r="5" fill="#06b6d4" />
                    <circle cx="320" cy="90" r="4" fill="#10b981" />
                    <circle cx="180" cy="240" r="4" fill="#f59e0b" />
                </svg>

                {/* Hero Content */}
                <div className="hero-content">
                    <div className="logo-wrapper">
                        <div className="logo-bg">
                            <Globe size={48} className="logo-icon" />
                        </div>
                    </div>
                    
                    <h1 className="hero-title">TradeTrack</h1>
                    <p className="hero-tagline">Global Trade Made Simple</p>

                    {/* Feature Cards */}
                    <div className="feature-grid">
                        <div className="feature-card">
                            <MapPin className="feature-icon" />
                            <span>Global Coverage</span>
                        </div>
                        <div className="feature-card">
                            <Shield className="feature-icon" />
                            <span>Secure Trade</span>
                        </div>
                        <div className="feature-card">
                            <Zap className="feature-icon" />
                            <span>Instant Tracking</span>
                        </div>
                    </div>
                </div>

                {/* Floating Elements */}
                <div className="floating-element element-1"></div>
                <div className="floating-element element-2"></div>
            </div>

            {/* Right Side - Form Section */}
            <div className="auth-form-section">
                <div className="form-wrapper">
                    <div className="form-header">
                        <h2 className="form-title">{title}</h2>
                        <p className="form-subtitle">{subtitle}</p>
                    </div>
                    
                    <div className="form-content">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthLayout;
