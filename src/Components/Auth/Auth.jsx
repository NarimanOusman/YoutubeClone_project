import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import './Auth.css';

const Auth = () => {
    const [activeTab, setActiveTab] = useState('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(false);

    // Password strength
    const getPasswordStrength = (pwd) => {
        if (!pwd) return { level: 0, label: '', color: '' };
        let score = 0;
        if (pwd.length >= 6) score++;
        if (pwd.length >= 10) score++;
        if (/[A-Z]/.test(pwd)) score++;
        if (/[0-9]/.test(pwd)) score++;
        if (/[^A-Za-z0-9]/.test(pwd)) score++;
        if (score <= 1) return { level: 1, label: 'Weak', color: '#ef4444' };
        if (score === 2) return { level: 2, label: 'Fair', color: '#f97316' };
        if (score === 3) return { level: 3, label: 'Strong', color: '#22c55e' };
        return { level: 4, label: 'Very Strong', color: '#16a34a' };
    };

    // Post form state
    const [videoTitle, setVideoTitle] = useState('');
    const [videoDesc, setVideoDesc] = useState('');
    const [videoUrl, setVideoUrl] = useState('');

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleSignUp = async (e) => {
        e.preventDefault();
        setLoading(true);
        const { error } = await supabase.auth.signUp({ email, password });
        setLoading(false);
        if (error) alert("Error: " + error.message);
        else alert("Success! Check your email to confirm your account.");
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        setLoading(false);
        if (error) alert("Error: " + error.message);
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
    };

    const handleCreatePost = async (e) => {
        e.preventDefault();
        if (!videoTitle || !videoUrl) return alert("Title and Video URL are required!");
        setLoading(true);

        const { error } = await supabase
            .from('videos')
            .insert([{
                title: videoTitle,
                description: videoDesc,
                video_url: videoUrl,
                user_id: session.user.id,
            }]);

        setLoading(false);
        if (error) {
            alert("Error posting video: " + error.message);
        } else {
            alert("Video posted successfully! 🎉");
            setVideoTitle('');
            setVideoDesc('');
            setVideoUrl('');
        }
    };

    // ─── LOGGED IN: Show Post Video form ───────────────────────────────
    if (session) {
        return (
            <div className="post-page">
                <div className="post-header">
                    <div className="post-header-info">
                        <h2>My Account</h2>
                        <p>{session.user.email}</p>
                    </div>
                    <button className="btn-logout" onClick={handleLogout}>Log Out</button>
                </div>

                <div className="post-card">
                    <h3>📹 Post a New Video</h3>
                    <form onSubmit={handleCreatePost} className="auth-form">
                        <div className="form-group">
                            <label>Video Title *</label>
                            <input
                                type="text"
                                placeholder="Enter a descriptive title"
                                value={videoTitle}
                                onChange={(e) => setVideoTitle(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Description</label>
                            <textarea
                                placeholder="What is this video about?"
                                value={videoDesc}
                                onChange={(e) => setVideoDesc(e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label>YouTube Video URL *</label>
                            <input
                                type="url"
                                placeholder="https://www.youtube.com/watch?v=..."
                                value={videoUrl}
                                onChange={(e) => setVideoUrl(e.target.value)}
                                required
                            />
                        </div>
                        <button type="submit" className="auth-btn-primary" disabled={loading}>
                            {loading ? "Posting..." : "Post Video"}
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    // ─── LOGGED OUT: Show Login / Sign Up form ──────────────────────────
    return (
        <div className="auth-page">
            <div className="auth-card">

                {/* Logo */}
                <div className="auth-logo">
                    <div className="auth-logo-icon">
                        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
                        </svg>
                    </div>
                    <span className="auth-logo-text">Vid<span>Tube</span></span>
                </div>

                <p className="auth-subtitle">Sign in to your account to post and manage videos</p>

                {/* Tabs */}
                <div className="auth-tabs">
                    <button
                        className={`auth-tab ${activeTab === 'login' ? 'active' : ''}`}
                        onClick={() => setActiveTab('login')}
                    >
                        Sign In
                    </button>
                    <button
                        className={`auth-tab ${activeTab === 'signup' ? 'active' : ''}`}
                        onClick={() => setActiveTab('signup')}
                    >
                        Create Account
                    </button>
                </div>

                {/* Login Form */}
                {activeTab === 'login' && (
                    <form onSubmit={handleLogin} className="auth-form">
                        <div className="form-group">
                            <label>Email Address</label>
                            <input
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Password</label>
                            <input
                                type="password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <button type="submit" className="auth-btn-primary" disabled={loading}>
                            {loading ? "Signing in..." : "Sign In"}
                        </button>
                    </form>
                )}

                {/* Sign Up Form */}
                {activeTab === 'signup' && (
                    <form onSubmit={handleSignUp} className="auth-form">
                        <div className="form-group">
                            <label>Email Address</label>
                            <input
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Password</label>
                            <input
                                type="password"
                                placeholder="Minimum 6 characters"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={6}
                            />
                            {/* Password Strength Meter */}
                            {password.length > 0 && (() => {
                                const strength = getPasswordStrength(password);
                                return (
                                    <div className="strength-wrapper">
                                        <div className="strength-bar-track">
                                            <div
                                                className="strength-bar-fill"
                                                style={{
                                                    width: `${(strength.level / 4) * 100}%`,
                                                    background: strength.color
                                                }}
                                            />
                                        </div>
                                        <span className="strength-label" style={{ color: strength.color }}>
                                            {strength.label}
                                        </span>
                                    </div>
                                );
                            })()}
                        </div>
                        <button type="submit" className="auth-btn-primary" disabled={loading}>
                            {loading ? "Creating account..." : "Create Account"}
                        </button>
                    </form>
                )}

            </div>
        </div>
    );
};

export default Auth;
