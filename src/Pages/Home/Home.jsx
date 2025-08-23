import React from "react";
import "./Home.css"; // Assuming you have a CSS file for styling
import Sidebar from "../../Components/sidebar/sidebar";
import Feed from "../../Components/feed/feed";
const Home = ({ sidebar }) => {
  return (
    <>
      <Sidebar sidebar={sidebar} />
      <div className={`container ${sidebar ? "" : "large-container"}`}>
        <Feed />
      </div>
    </>
  );
};

export default Home;
