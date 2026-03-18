import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { Ellipsis, HelpCircle, LayoutDashboard, LogOut, Settings, UserRound } from 'lucide-react';
import './ProfileAvatar.css';

const ProfileAvatar = ({ session }) => {
  const [profile, setProfile] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileActionsOpen, setMobileActionsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 900);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (session) {
      fetchProfile();
    }
  }, [session]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
        setMobileActionsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 900);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
    setDropdownOpen(false);
    setMobileActionsOpen(false);
  };

  const handleEditProfile = () => {
    navigate('/profile');
    setDropdownOpen(false);
    setMobileActionsOpen(false);
  };

  const handleAccount = () => {
    navigate('/my-posts');
    setDropdownOpen(false);
    setMobileActionsOpen(false);
  };

  const handleSettings = () => {
    navigate('/settings');
    setDropdownOpen(false);
    setMobileActionsOpen(false);
  };

  const handleHelp = () => {
    navigate('/help');
    setDropdownOpen(false);
    setMobileActionsOpen(false);
  };

  const getInitials = (name) => {
    if (!name) return session?.user?.email?.charAt(0).toUpperCase() || 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (!session) return null;

  return (
    <div className="profile-avatar-container" ref={dropdownRef}>
      <button 
        className="profile-avatar-button"
        onClick={() => {
          setDropdownOpen((prev) => {
            const next = !prev;
            if (!next) setMobileActionsOpen(false);
            return next;
          });
        }}
      >
        {profile?.avatar_url ? (
          <img 
            src={profile.avatar_url} 
            alt="Profile" 
            className="profile-avatar-image"
          />
        ) : (
          <div className="profile-avatar-placeholder">
            {getInitials(profile?.full_name)}
          </div>
        )}
      </button>

      {dropdownOpen && (
        <div className="profile-dropdown">
          <div className="profile-dropdown-header">
            <div className="profile-info">
              <div className="profile-name">
                {profile?.full_name || 'User'}
              </div>
              <div className="profile-email">
                {session.user.email}
              </div>
            </div>
          </div>
          
          <div className="profile-dropdown-divider"></div>
          
          <div className="profile-dropdown-menu">
            <button
              className="dropdown-item"
              onClick={handleAccount}
            >
              <span className="dropdown-icon"><LayoutDashboard size={16} /></span>
              Account
            </button>

            <button 
              className="dropdown-item"
              onClick={handleEditProfile}
            >
              <span className="dropdown-icon"><UserRound size={16} /></span>
              Edit Profile
            </button>
            
            <div className="dropdown-divider"></div>

            {isMobile ? (
              <>
                <button
                  className="dropdown-item more-item"
                  onClick={() => setMobileActionsOpen((prev) => !prev)}
                >
                  <span className="dropdown-icon"><Ellipsis size={16} /></span>
                  More
                </button>

                {mobileActionsOpen && (
                  <div className="mobile-actions-panel">
                    <button className="dropdown-item" onClick={handleSettings}>
                      <span className="dropdown-icon"><Settings size={16} /></span>
                      Settings
                    </button>
                    <button className="dropdown-item" onClick={handleHelp}>
                      <span className="dropdown-icon"><HelpCircle size={16} /></span>
                      Help & Feedback
                    </button>
                    <button className="dropdown-item logout-item" onClick={handleSignOut}>
                      <span className="dropdown-icon"><LogOut size={16} /></span>
                      Sign Out
                    </button>
                  </div>
                )}
              </>
            ) : (
              <button
                className="dropdown-item logout-item"
                onClick={handleSignOut}
              >
                <span className="dropdown-icon"><LogOut size={16} /></span>
                Sign Out
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileAvatar;
