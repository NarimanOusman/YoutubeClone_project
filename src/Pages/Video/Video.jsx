import React from "react";
import { useParams } from "react-router-dom";
import "./Video.css";
import PlayVideo from "../../Components/playvideo/playvideo";

// Video.jsx
const Video = ({ sidebar, category }) => {
  const { videoId, categoryId } = useParams();

  return (
    <div className="played-container">
      {/* 
        We pass the global 'category' if it's been changed by the user, 
        otherwise fallback to the 'categoryId' from the URL.
      */}
      <PlayVideo sidebar={sidebar} videoId={videoId} categoryId={category !== "0" ? category : categoryId} />
    </div>
  );
};

export default Video;
