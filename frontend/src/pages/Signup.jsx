import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { User, Mail, Lock, ArrowRight, Loader } from "lucide-react";
import AuthLayout from "../layouts/AuthLayout";

const Signup = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const { register, setToken } = await import('../api');
      const res = await register(formData.username, formData.email, formData.password);

      if (res.ok) {
        // Store token and redirect to dashboard
        setToken(res.data.token, true);
        navigate("/home");
      } else {
        // Handle validation errors
        if (res.data.username) {
          setError(res.data.username[0]);
        } else if (res.data.email) {
          setError(res.data.email[0]);
        } else if (res.data.password) {
          setError(res.data.password[0]);
        } else {
          setError("Registration failed. Please try again.");
        }
      }
    } catch (err) {
      console.error("Registration error:", err);
      setError("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create Account"
      subtitle="Join Global Trade today."
    >
      <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {error && (
          <div className="auth-error" style={{
            padding: '12px 16px',
            background: 'rgba(239, 68, 68, 0.1)',
            borderLeft: '3px solid #ef4444',
            borderRadius: '8px',
            color: '#ef4444',
            fontSize: '13px'
          }}>
            ❌ {error}
          </div>
        )}

        <div className="auth-form-group">
          <label className="auth-label">Full Name</label>
          <div style={{ position: 'relative' }}>
            <User style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '18px',
              height: '18px',
              color: '#6366f1',
              pointerEvents: 'none'
            }} />
            <input
              type="text"
              name="username"
              required
              className="auth-input"
              style={{ paddingLeft: '44px' }}
              placeholder="John Doe"
              value={formData.username}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="auth-form-group">
          <label className="auth-label">Email Address</label>
          <div style={{ position: 'relative' }}>
            <Mail style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '18px',
              height: '18px',
              color: '#6366f1',
              pointerEvents: 'none'
            }} />
            <input
              type="email"
              name="email"
              required
              className="auth-input"
              style={{ paddingLeft: '44px' }}
              placeholder="name@company.com"
              value={formData.email}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="auth-form-group">
          <label className="auth-label">Password</label>
          <div style={{ position: 'relative' }}>
            <Lock style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '18px',
              height: '18px',
              color: '#6366f1',
              pointerEvents: 'none'
            }} />
            <input
              type="password"
              name="password"
              required
              className="auth-input"
              style={{ paddingLeft: '44px' }}
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="auth-form-group">
          <label className="auth-label">Confirm Password</label>
          <div style={{ position: 'relative' }}>
            <Lock style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '18px',
              height: '18px',
              color: '#6366f1',
              pointerEvents: 'none'
            }} />
            <input
              type="password"
              name="confirmPassword"
              required
              className="auth-input"
              style={{ paddingLeft: '44px' }}
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="auth-btn btn-primary"
          style={{ marginTop: '12px' }}
        >
          {loading ? (
            <Loader style={{ animation: 'spin 1s linear infinite' }} size={18} />
          ) : (
            <>
              Sign Up <ArrowRight size={18} />
            </>
          )}
        </button>

        <div className="auth-footer">
          Already have an account?{" "}
          <Link to="/login" style={{
            color: '#6366f1',
            textDecoration: 'none',
            fontWeight: '600'
          }}>
            Sign in
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
};

export default Signup;
