// PlayVideo.jsx
import React from "react";
import "./playvideo.css";
import video1 from "../../assets/video.mp4";
import like from "../../assets/like.png";
import dislike from "../../assets/dislike.png";
import share from "../../assets/share.png";
import save from "../../assets/save.png";
import jack from "../../assets/jack.png";
import user_profile from "../../assets/user_profile.jpg";
import Recommended from "../../Components/recommended/recommended";

const PlayVideo = ({ sidebar }) => {
  return (
    <div className="playvideo-container">
      {/* LEFT: Main Video Content */}
      <div className="main-content">
        {/* Video Player */}
        <video
          src={video1}
          controls
          autoPlay
          muted
          className="video-player"
        ></video>

        {/* Video Info Below */}
        <div className={`video-content ${sidebar ? "expanded" : "collapsed"}`}>
          <h3>Best YouTube Movie</h3> {/* ✅ Use h3, not h31 */}
          <div className="playvideo_info">
            <p>152 views &bull; 2 days ago</p>
            <div className="video-actions">
              <span>
                <img src={like} alt="like" /> 125
              </span>
              <span>
                <img src={dislike} alt="dislike" /> 2
              </span>
              <span>
                <img src={share} alt="share" /> Share
              </span>
              <span>
                <img src={save} alt="save" /> Save
              </span>
            </div>
          </div>
          <hr />
          <div className="publisher">
            <img src={jack} alt="publisher" />
            <div>
              <p>Channel Name</p>
              <span>1M Subscribers</span>
            </div>
            <button>Subscribe</button>
          </div>
          <div className="description">
            <p>This is a description of the video.</p>
            <p>Subscribe for more content!</p>
          </div>
          <hr />
          <h4>123 comments</h4>
          <div className="comment">
            <img src={user_profile} alt="user" />
            <div>
              <h3>
                User Name <span>1 day ago</span>
              </h3>
              <p>This is a comment.</p>
              <div className="comment-action">
                <img src={like} alt="like" /> <span>125</span>
                <img src={dislike} alt="dislike" />
              </div>
            </div>
          </div>
          {/* Add more comments as needed */}
        </div>
      </div>

      {/* RIGHT: Recommended Videos */}
      <div className="recommended-section">
        <Recommended />
      </div>
    </div>
  );
};

export default PlayVideo;
