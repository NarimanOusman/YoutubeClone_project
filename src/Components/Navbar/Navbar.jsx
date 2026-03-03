import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Menu,
  Search,
  Video,
  Bell,
  MoreVertical
} from "lucide-react";
import profile from "../../assets/user_profile.jpg";
import logo from "../../assets/logo.png";
import "./Navbar.css";

const Navbar = ({ setSidebar, sidebar }) => {
  const [searchInput, setSearchInput] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput) {
      console.log("Searching for:", searchInput);
      // Example: navigate(`/search/${searchInput}`);
      // For now, let's just log it as a "placeholder activation"
    }
  };

  return (
    <nav className={`flex-div ${sidebar ? "expanded" : "collapsed"}`}>
      <div className="nav-left flex-div">
        <Menu
          className="menu-icon"
          onClick={() => setSidebar((prev) => !prev)}
          size={28}
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
            placeholder="Search"
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
        <img src={profile} alt="Profile" className="profile-img" />
      </div>
    </nav>
  );
};

export default Navbar;
