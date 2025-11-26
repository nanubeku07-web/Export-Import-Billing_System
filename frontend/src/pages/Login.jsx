import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api, { setToken } from "../api";
import { Mail, Lock, ArrowRight, Loader } from "lucide-react";
import AuthLayout from "../layouts/AuthLayout";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Using the existing api.obtainToken method if available, or direct axios call
      // Assuming api.js has obtainToken, let's try to use it to be consistent with previous code
      // If not, we can fall back to axios

      const res = await api.obtainToken(email, password);

      if (!res.ok) {
        throw new Error(res.data?.detail || "Invalid credentials");
      }

      const token = res.data.token || res.data.access;
      setToken(token);

      // Fetch user profile
      const me = await api.fetchMe();
      if (me.ok && me.data) {
        localStorage.setItem("profile", JSON.stringify(me.data));
      }

      window.dispatchEvent(new Event("authChange"));

      if (me.data?.is_staff) {
        navigate("/dashboard");
      } else {
        navigate("/home");
      }
    } catch (err) {
      console.error(err);
      setError("Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Please enter your details to sign in."
    >
      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
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
              required
              className="auth-input"
              style={{ paddingLeft: '44px' }}
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        <div className="auth-form-group">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <label className="auth-label" style={{ margin: 0 }}>Password</label>
            <Link to="/forgot-password" style={{
              fontSize: '13px',
              color: '#6366f1',
              textDecoration: 'none',
              fontWeight: '600',
              transition: 'color 0.3s ease'
            }} onMouseEnter={(e) => e.target.style.color = '#06b6d4'} onMouseLeave={(e) => e.target.style.color = '#6366f1'}>
              Forgot password?
            </Link>
          </div>
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
              required
              className="auth-input"
              style={{ paddingLeft: '44px' }}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="auth-btn btn-primary"
          style={{ marginTop: '8px' }}
        >
          {loading ? (
            <Loader style={{ animation: 'spin 1s linear infinite' }} size={18} />
          ) : (
            <>
              Sign In <ArrowRight size={18} />
            </>
          )}
        </button>

        <div className="auth-footer">
          Don't have an account?{" "}
          <Link to="/signup" style={{
            color: '#6366f1',
            textDecoration: 'none',
            fontWeight: '600'
          }}>
            Sign up for free
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
};

export default Login;
