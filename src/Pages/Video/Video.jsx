import React from "react";
import "./Video.css";
import PlayVideo from "../../Components/playvideo/playvideo";
import { useParams } from "react-router-dom";

// Video.jsx
const Video = ({ sidebar }) => {
  const { videoId, categoryId } = useParams();
  return (
    <div className="played-container">
      <PlayVideo sidebar={sidebar} videoId={videoId} />
    </div>
  );
};

export default Video;
