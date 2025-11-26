import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowRight, Loader, ArrowLeft } from "lucide-react";
import AuthLayout from "../layouts/AuthLayout";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setSent(true);
    }, 1500);
  };

  return (
    <AuthLayout
      title="Reset Password"
      subtitle="Enter your email to receive reset instructions."
    >
      {!sent ? (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
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

          <button
            type="submit"
            disabled={loading}
            className="auth-btn btn-primary"
          >
            {loading ? (
              <Loader style={{ animation: 'spin 1s linear infinite' }} size={18} />
            ) : (
              <>
                Send Reset Link <ArrowRight size={18} />
              </>
            )}
          </button>

          <div style={{ textAlign: 'center', marginTop: '16px' }}>
            <Link to="/login" style={{
              fontSize: '13px',
              color: '#6366f1',
              textDecoration: 'none',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}>
              <ArrowLeft size={16} /> Back to Login
            </Link>
          </div>
        </form>
      ) : (
        <div style={{
          textAlign: 'center',
          padding: '40px 20px',
          borderRadius: '16px',
          background: 'rgba(16, 185, 129, 0.05)',
          border: '1px solid rgba(16, 185, 129, 0.2)'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            background: 'rgba(16, 185, 129, 0.2)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
            border: '2px solid rgba(16, 185, 129, 0.4)'
          }}>
            <Mail style={{
              width: '32px',
              height: '32px',
              color: '#10b981'
            }} />
          </div>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '700',
            color: '#f1f5f9',
            marginBottom: '12px'
          }}>Check your email</h3>
          <p style={{
            fontSize: '14px',
            color: '#cbd5e1',
            marginBottom: '28px',
            lineHeight: '1.6'
          }}>
            We have sent a password reset link to <strong style={{ color: '#06b6d4' }}>{email}</strong>.
          </p>
          <Link to="/login" style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '12px 24px',
            background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '10px',
            fontWeight: '600',
            fontSize: '14px',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => e.target.style.boxShadow = '0 6px 25px rgba(99, 102, 241, 0.4)'}
          onMouseLeave={(e) => e.target.style.boxShadow = '0 4px 15px rgba(99, 102, 241, 0.3)'}>
            Back to Login
          </Link>
        </div>
      )}
    </AuthLayout>
  );
};

export default ForgotPassword;
