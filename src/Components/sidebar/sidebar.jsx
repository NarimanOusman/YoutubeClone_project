import React, { useEffect, useState } from "react";
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
  Clock
} from "lucide-react";
import { supabase } from "../../supabaseClient";
import { useNavigate, useLocation } from "react-router-dom";

const Sidebar = ({ sidebar, category, setCategory, setSearchQuery, subscribedChannels = [] }) => {
  const [myProfile, setMyProfile] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const loadProfile = async () => {
      const { data: authData } = await supabase.auth.getSession();
      const userId = authData?.session?.user?.id;
      if (!userId) {
        setMyProfile(null);
        return;
      }

      const { data } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .eq("id", userId)
        .maybeSingle();

      setMyProfile(data || null);
    };

    loadProfile();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      loadProfile();
    });

    return () => subscription.unsubscribe();
  }, []);

  const myInitial = (myProfile?.full_name || "U").trim().charAt(0).toUpperCase();

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
        {myProfile?.avatar_url ? (
          <img
            src={myProfile.avatar_url}
            alt={myProfile.full_name || "My profile"}
            className="sidebar-my-posts-avatar"
          />
        ) : (
          <span className="sidebar-my-posts-avatar sidebar-my-posts-fallback">{myInitial}</span>
        )}
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
