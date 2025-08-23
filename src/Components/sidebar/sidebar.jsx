import React from "react";
import "./sidebar.css"; // Assuming you have a CSS file for styling
import {
  House,
  Gamepad2,
  Car,
  Volleyball,
  Tv,
  Laptop,
  Headphones,
  Newspaper, // ✅ Correct name
  Rss,
} from "lucide-react";
import jack from "../../assets/jack.png";
import tom from "../../assets/tom.png";
import simon from "../../assets/simon.png";
import megan from "../../assets/megan.png";
import cameron from "../../assets/cameron.png";

const Sidebar = ({ sidebar }) => {
  return (
    <div className={`sidebar ${sidebar ? "" : "small-sidebar"}`}>
      <div className="sidelink">
        <House size={24} />
        <p>Home</p>
      </div>

      <div className="sidelink">
        <Gamepad2 size={24} />
        <p>Games</p>
      </div>

      <div className="sidelink">
        <Car size={24} />
        <p>Automobiles</p>
      </div>

      <div className="sidelink">
        <Volleyball size={24} />
        <p>Sports</p>
      </div>

      <div className="sidelink">
        <Tv size={24} />
        <p>Entertainment</p>
      </div>

      <div className="sidelink">
        <Laptop size={24} />
        <p>Technology</p>
      </div>

      <div className="sidelink">
        <Headphones size={24} />
        <p>Music</p>
      </div>

      <div className="sidelink">
        <Rss size={24} />
        <p>Blog</p>
      </div>

      <div className="sidelink">
        <Newspaper size={24} />
        <p>News</p>
      </div>
      <hr />
      <div className="subscribers">
        <h3>Subscribed</h3>
        <div className="subscriber">
          <img src={jack} alt="PewDiePie" />
          <p>PewDiePie</p>
        </div>
        <div className="subscriber">
          <img src={tom} alt="Justin" />
          <p>Justin Bieber</p>
        </div>
        <div className="subscriber">
          <img src={simon} alt="Simon" />
          <p>Mr. Beast</p>
        </div>
        <div className="subscriber">
          <img src={megan} alt="5-Minute Crafts" />
          <p>5-Minute Crafts</p>
        </div>
        <div className="subscriber">
          <img src={cameron} alt="Cameron" />
          <p>Nas Daily</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
