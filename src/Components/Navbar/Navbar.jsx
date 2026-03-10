import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Menu,
  Search,
  Video,
  Bell,
  MoreVertical
} from "lucide-react";
import { supabase } from "../../supabaseClient";
import ProfileAvatar from "../ProfileAvatar/ProfileAvatar";
import logo from "../../assets/logo.png";
import "./Navbar.css";

const Navbar = ({ setSidebar, sidebar, setSearchQuery }) => {
  const [searchInput, setSearchInput] = useState("");
  const [session, setSession] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setSearchQuery(searchInput);
      navigate("/"); // Redirect to home to show search results
    }
  };

  return (
    <nav className={`flex-div ${sidebar ? "expanded" : "collapsed"}`}>
      <div className="nav-left flex-div">
        <Menu
          className="menu-icon"
          onClick={() => setSidebar((prev) => !prev)}
          size={22}
          color="#333"
          style={{ cursor: "pointer" }}
        />
        <Link to="/">
          <img className="logo" src={logo} alt="VidTube Logo" />
        </Link>
      </div>

      <div className="nav-middle flex-div">
        <form className="search-container" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search videos..."
            className="search-input"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <button type="submit" className="search-button">
            <Search className="search-icon" size={20} />
          </button>
        </form>
      </div>

      <div className="nav-right flex-div">
        <Video className="nav-icon" size={24} style={{ cursor: "pointer" }} />
        <Bell className="nav-icon" size={24} style={{ cursor: "pointer" }} />
        <MoreVertical className="nav-icon" size={24} style={{ cursor: "pointer" }} />
        {session ? (
          <ProfileAvatar session={session} />
        ) : (
          <Link to="/login" className="login-link">
            <span>Account</span>
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
