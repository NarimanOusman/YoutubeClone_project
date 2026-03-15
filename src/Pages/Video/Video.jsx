import React from "react";
import { useParams } from "react-router-dom";
import "./Video.css";
import PlayVideo from "../../Components/playvideo/playvideo";

// Video.jsx
const Video = ({ sidebar, category, savedVideos, setSavedVideos, subscribedChannels, setSubscribedChannels }) => {
  const { videoId, categoryId } = useParams();
  const normalizedCategoryId =
    category === "saved"
      ? "saved"
      : /^\d+$/.test(String(category || ""))
        ? String(category)
        : categoryId;

  return (
    <div className="played-container">
      <PlayVideo
        sidebar={sidebar}
        videoId={videoId}
        categoryId={normalizedCategoryId}
        savedVideos={savedVideos}
        setSavedVideos={setSavedVideos}
        subscribedChannels={subscribedChannels}
        setSubscribedChannels={setSubscribedChannels}
      />
    </div>
  );
};

export default Video;
