import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { useNavigate } from 'react-router-dom';
import './Auth.css';

const Auth = () => {
    const [session, setSession] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
    };
    return (
        <div className="auth-page">
            <div className="auth-card" style={{ textAlign: 'center' }}>
                <h2>Authentication Disabled</h2>
                <p>The login / signup forms have been removed from this project.</p>
                {session && (
                    <button className="btn-logout" onClick={handleLogout}>
                        Log Out
                    </button>
                )}
                <button
                    className="auth-btn-primary"
                    onClick={() => navigate('/')}
                    style={{ marginTop: 12 }}
                >
                    Go Home
                </button>
            </div>
        </div>
    );
};

export default Auth;
