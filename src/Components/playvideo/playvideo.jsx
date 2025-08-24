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

const PlayVideo = ({ sidebar }) => {
  return (
    <div className="playvideo">
      {/* Video Player - Full Width */}
      <video
        src={video1}
        controls
        autoPlay
        muted
        width="100%"
        height="50%"
      ></video>

      {/* Content below video - This will shift based on sidebar */}
      <div
        className={`video-content ${
          sidebar ? "sidebar-expanded" : "sidebar-collapsed"
        }`}
      >
        <h31>Best YouTube Movie</h31>

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
      </div>
    </div>
  );
};

export default PlayVideo;
