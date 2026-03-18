import React, { useState, useRef, useEffect } from 'react';
import { Settings, HelpCircle, LogOut, MoreVertical } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import './UtilityMenu.css';

export default function UtilityMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error);
    } else {
      navigate('/login');
    }
  };

  const handleSettings = () => {
    setIsOpen(false);
    navigate('/settings');
  };

  const handleHelp = () => {
    setIsOpen(false);
    navigate('/help');
  };

  return (
    <div className="utility-menu" ref={dropdownRef}>
      <button
        className="utility-menu-btn"
        onClick={() => setIsOpen(!isOpen)}
        title="More options"
        aria-label="More options"
      >
        <MoreVertical size={24} />
      </button>

      {isOpen && (
        <div className="utility-dropdown">
          <button
            className="utility-menu-item"
            onClick={handleSettings}
            title="Settings"
          >
            <Settings size={18} />
            <span>Settings</span>
          </button>
          <button
            className="utility-menu-item"
            onClick={handleHelp}
            title="Help & Feedback"
          >
            <HelpCircle size={18} />
            <span>Help & Feedback</span>
          </button>
          <div className="utility-menu-divider" />
          <button
            className="utility-menu-item utility-menu-item-danger"
            onClick={handleSignOut}
            title="Sign out"
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      )}
    </div>
  );
}
