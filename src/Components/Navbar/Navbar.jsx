import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMagnifyingGlass,
  faFileArrowUp,
  faBell,
  faBars,
} from "@fortawesome/free-solid-svg-icons";
import MoreIcon from "../more"; // ✅ Correct
import profile from "../../assets/jack.png"; // ✅ Correct
import "./Navbar.css";

import logo from "../../assets/logo.png";

const Navbar = ({ setSidebar, sidebar }) => {
  return (
    <nav className={`flex-div ${sidebar ? "expanded" : "collapsed"}`}>
      <div className="nav-left flex-div ">
        <FontAwesomeIcon
          onClick={() => setSidebar((prev) => !prev)}
          icon={faBars}
          size="1x"
          style={{ color: "rgba(73, 70, 70, 1)", fontSize: "28px" }}
          aria-hidden="true"
        />
        <img className="logo" src={logo} alt="" />
      </div>
      <div className="nav-middle flex-div">
        <div className="search-container">
          <input type="text" placeholder="Search" className="search-input" />
          <FontAwesomeIcon icon={faMagnifyingGlass} className="search-icon" />
        </div>
      </div>
      <div className="nav-right flex-div">
        <FontAwesomeIcon
          icon={faFileArrowUp}
          size="1x"
          style={{ color: "rgba(33, 108, 194, 1)", fontSize: "28px" }}
          aria-hidden="true"
        />
        <MoreIcon
          size={30}
          color="rgba(33, 108, 194, 1)"
          style={{ marginLeft: "8px", cursor: "pointer" }}
          onClick={() => console.log("Dots menu clicked!")}
          role="button"
          tabIndex="0"
          aria-label="More options"
        />
        <FontAwesomeIcon
          icon={faBell}
          size="2x"
          style={{ color: "rgba(33, 108, 194, 1)", fontSize: "28px" }}
          aria-hidden="true"
        />
        <img src={profile} alt="Profile" className="profile-img" />
      </div>
    </nav>
  );
};

export default Navbar;
