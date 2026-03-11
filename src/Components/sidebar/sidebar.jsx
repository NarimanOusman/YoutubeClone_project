import React from "react";
import "./sidebar.css";
import {
  House,
  Gamepad2,
  Car,
  Volleyball,
  Tv,
  Laptop,
  Headphones,
  Newspaper,
  Rss,
  Clock,
  Image,
} from "lucide-react";
import jack from "../../assets/jack.png";
import tom from "../../assets/tom.png";
import simon from "../../assets/simon.png";
import megan from "../../assets/megan.png";
import cameron from "../../assets/cameron.png";
import { useNavigate, useLocation } from "react-router-dom";

const Sidebar = ({ sidebar, category, setCategory, setSearchQuery, subscribedChannels = [] }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleCategoryChange = (newCategory) => {
    setCategory(newCategory);
    if (setSearchQuery) setSearchQuery("");

    // Always navigate to home for watch later and subscription filters to show the grid.
    if (
      newCategory === "saved" ||
      String(newCategory).startsWith("channel_") ||
      String(newCategory).startsWith("community_user_") ||
      !location.pathname.startsWith("/video")
    ) {
      navigate("/");
    }
  };

  return (
    <div className={`sidebar ${sidebar ? "" : "small-sidebar"}`}>
      <div
        className={`sidelink ${category === "0" ? "active" : ""}`}
        onClick={() => handleCategoryChange("0")}
      >
        <House size={24} />
        <p>Home</p>
      </div>

      <div
        className={`sidelink ${category === "20" ? "active" : ""}`}
        onClick={() => handleCategoryChange("20")}
      >
        <Gamepad2 size={24} />
        <p>Games</p>
      </div>

      <div
        className={`sidelink ${category === "2" ? "active" : ""}`}
        onClick={() => handleCategoryChange("2")}
      >
        <Car size={24} />
        <p>Automobiles</p>
      </div>

      <div
        className={`sidelink ${category === "17" ? "active" : ""}`}
        onClick={() => handleCategoryChange("17")}
      >
        <Volleyball size={24} />
        <p>Sports</p>
      </div>

      <div
        className={`sidelink ${category === "24" ? "active" : ""}`}
        onClick={() => handleCategoryChange("24")}
      >
        <Tv size={24} />
        <p>Entertainment</p>
      </div>

      <div
        className={`sidelink ${category === "28" ? "active" : ""}`}
        onClick={() => handleCategoryChange("28")}
      >
        <Laptop size={24} />
        <p>Technology</p>
      </div>

      <div
        className={`sidelink ${category === "10" ? "active" : ""}`}
        onClick={() => handleCategoryChange("10")}
      >
        <Headphones size={24} />
        <p>Music</p>
      </div>

      <div
        className={`sidelink ${category === "22" ? "active" : ""}`}
        onClick={() => handleCategoryChange("22")}
      >
        <Rss size={24} />
        <p>Blog</p>
      </div>

      <div
        className={`sidelink ${category === "25" ? "active" : ""}`}
        onClick={() => handleCategoryChange("25")}
      >
        <Newspaper size={24} />
        <p>News</p>
      </div>
      <hr />
      <div
        className={`sidelink ${category === "saved" ? "active" : ""}`}
        onClick={() => handleCategoryChange("saved")}
      >
        <Clock size={24} />
        <p>Watch Later</p>
      </div>
      <div
        className={`sidelink ${location.pathname === "/my-posts" ? "active" : ""}`}
        onClick={() => navigate("/my-posts")}
      >
        <Image size={24} />
        <p>My Posts</p>
      </div>
      <hr />

      {subscribedChannels.length > 0 && (
        <div className="subscribers">
          <h3>Subscribed</h3>
          {subscribedChannels.map((channel, index) => {
            const categoryKey = channel.type === "community"
              ? `community_user_${channel.id}`
              : `channel_${channel.id}`;

            return (
              <div
                key={`${channel.type || "youtube"}-${channel.id}-${index}`}
                className={`subscriber ${category === categoryKey ? "active" : ""}`}
                onClick={() => handleCategoryChange(categoryKey)}
                style={{ cursor: "pointer" }}
              >
                <img src={channel.image} alt={channel.name} />
                <p>{channel.name}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Sidebar;
