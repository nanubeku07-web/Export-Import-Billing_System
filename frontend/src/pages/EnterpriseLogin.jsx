import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api, { setToken } from "../api";
import "./EnterpriseLogin.css";

const EnterpriseLogin = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState("email"); // email, password, otp
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [requiresOtp, setRequiresOtp] = useState(false);

  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const otpRef = useRef(null);

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    const re = /^\S+@\S+\.\S+$/;
    if (!email || !re.test(email)) {
      setError("Please enter a valid email address");
      emailRef.current?.focus();
      return;
    }
    setError(null);
    setStep("password");
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!password) {
      setError("Please enter your password");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const r = await api.obtainToken(email, password);
      if (!r.ok) {
        setError(r.data || `Login failed (status ${r.status})`);
        setLoading(false);
        return;
      }

      // Some backends may return a flag requiring OTP. Handle gracefully.
      if (r.data && r.data.requires_otp) {
        setRequiresOtp(true);
        setStep('otp');
        setLoading(false);
        return;
      }

      const token = r.data && (r.data.token || r.data.key || r.data.auth_token);
      if (!token) {
        setError('Authentication succeeded but no token received');
        setLoading(false);
        return;
      }

      setToken(token, rememberMe);
      window.dispatchEvent(new Event("authChange"));

      // Fetch profile
      const me = await api.fetchMe();
      if (me.ok && me.data) {
        localStorage.setItem("profile", JSON.stringify(me.data));
        const isAdmin = me.data.is_staff || me.data.can_view_reports;
        window.location.replace(isAdmin ? "/dashboard" : "/home");
      } else {
        setError("Failed to fetch profile");
        setLoading(false);
      }
    } catch (err) {
      setError("Authentication failed: " + err.message);
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    if (!otp) { setError('Enter the OTP'); otpRef.current?.focus(); return; }
    setLoading(true); setError(null);
    try {
      const res = await api.apiFetch('/api/verify-otp/', { method: 'POST', body: JSON.stringify({ email, otp }) });
      if (!res.ok) { setError(res.data || 'OTP verification failed'); setLoading(false); return; }
      const token = res.data && (res.data.token || res.data.key);
      if (!token) { setError('No token from OTP verification'); setLoading(false); return; }
      setToken(token, rememberMe);
      window.dispatchEvent(new Event('authChange'));
      const me = await api.fetchMe();
      if (me.ok && me.data) {
        localStorage.setItem('profile', JSON.stringify(me.data));
        const isAdmin = me.data.is_staff || me.data.can_view_reports;
        window.location.replace(isAdmin ? '/dashboard' : '/home');
      } else {
        setError('Failed to fetch profile after OTP'); setLoading(false);
      }
    } catch (err) { setError('OTP error: '+err.message); setLoading(false); }
  };

  const resendOtp = async () => {
    setLoading(true); setError(null);
    try {
      const res = await api.apiFetch('/api/resend-otp/', { method: 'POST', body: JSON.stringify({ email }) });
      if (!res.ok) setError(res.data || 'Failed to resend OTP');
    } catch (err) { setError('Resend error: '+err.message); }
    setLoading(false);
  };

  return (
    <div className="enterprise-login">
      {/* Left Panel */}
      <div className="login-left">
        <div className="login-brand-section">
          <div className="login-logo-large">
            <span>🌍</span>
          </div>
          <h1>TradeTrack Pro</h1>
          <p>Global Trade Made Simple</p>
          <p className="tagline">Manage imports, exports, and invoicing in one unified platform</p>
        </div>

        <div className="login-features">
          <div className="feature">
            <span className="feature-icon">📊</span>
            <h4>Real-Time Analytics</h4>
            <p>Track sales and inventory with live dashboards</p>
          </div>
          <div className="feature">
            <span className="feature-icon">📋</span>
            <h4>Invoice Management</h4>
            <p>Generate and manage professional invoices</p>
          </div>
          <div className="feature">
            <span className="feature-icon">🌐</span>
            <h4>Global Operations</h4>
            <p>Handle import/export orders across borders</p>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="login-right">
        <div className="login-card glass">
          <div className="login-header">
            <h2>Welcome Back</h2>
            <p>Sign in to your account</p>
          </div>

          <form onSubmit={step === "email" ? handleEmailSubmit : step === 'password' ? handlePasswordSubmit : handleOtpSubmit} className="login-form" aria-live="polite">
            {step === "email" && (
              <>
                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <input
                    id="email"
                    ref={emailRef}
                    type="email"
                    aria-label="Email address"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoFocus
                    aria-invalid={!!error}
                  />
                </div>
                <button type="submit" className="btn btn-primary btn-full">
                  Continue
                </button>
              </>
            )}

            {step === "password" && (
              <>
                <div className="login-email-display">
                  <p>{email}</p>
                  <button type="button" onClick={() => { setStep("email"); setPassword(""); }} className="change-email">
                    Change
                  </button>
                </div>

                <div className="form-group">
                  <label htmlFor="password">Password</label>
                  <input
                    id="password"
                    ref={passwordRef}
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoFocus
                    aria-invalid={!!error}
                  />
                </div>

                <div className="form-row">
                  <label className="checkbox-inline">
                    <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} /> Remember me
                  </label>
                  <button type="submit" className="btn btn-primary btn-full" disabled={loading} aria-busy={loading}>
                    {loading ? <span className="spinner"></span> : "Sign In"}
                  </button>
                </div>

                <div style={{marginTop: '0.5rem'}}>
                  <button type="button" className="btn btn-ghost" onClick={async () => {
                    // quick demo signin without waiting for React state updates
                    setLoading(true); setError(null);
                    try {
                      const r = await api.obtainToken('admin@tradetrack.com','admin123');
                      if (!r.ok) { setError(r.data || 'Demo login failed'); setLoading(false); return; }
                      const token = r.data && (r.data.token || r.data.key || r.data.auth_token);
                      if (!token) { setError('Demo auth returned no token'); setLoading(false); return; }
                      setToken(token, true);
                      window.dispatchEvent(new Event('authChange'));
                      const me = await api.fetchMe();
                      if (me.ok && me.data) { localStorage.setItem('profile', JSON.stringify(me.data)); window.location.replace((me.data.is_staff||me.data.can_view_reports)?'/dashboard':'/home') }
                    } catch (err) { setError('Demo sign-in failed: '+err.message); }
                    setLoading(false);
                  }}>Use Demo Account</button>
                </div>
              </>
            )}

            {step === 'otp' && (
              <>
                <div className="form-group">
                  <label htmlFor="otp">One-Time Password (OTP)</label>
                  <input id="otp" ref={otpRef} type="text" value={otp} onChange={(e)=>setOtp(e.target.value)} placeholder="123456" aria-label="OTP code" />
                </div>
                <div className="form-row">
                  <button type="submit" className="btn btn-primary btn-full" disabled={loading} aria-busy={loading}>{loading? <span className="spinner"/>:'Verify OTP'}</button>
                </div>
                <div style={{marginTop:'0.5rem'}}>
                  <button type="button" className="btn btn-ghost" onClick={resendOtp}>Resend OTP</button>
                </div>
              </>
            )}
            {error && <div className="login-error" role="status" aria-live="polite">{error}</div>}
          </form>

          <div className="login-footer">
            <p>Don't have an account? <a href="/signup">Create one</a></p>
            <p><a href="/forgot-password">Forgot your password?</a></p>
          </div>

          <div className="login-demo">
            <p className="demo-label">Demo Credentials</p>
            <div className="demo-box">
              <p><strong>Email:</strong> admin@tradetrack.com</p>
              <p><strong>Password:</strong> admin123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnterpriseLogin;
