// PlayVideo.jsx
import React, { useState, useEffect } from "react";
import "./playvideo.css";
import { ChevronLeft, ChevronRight, Send } from "lucide-react";
import like_icon from "../../assets/like.png";
import dislike_icon from "../../assets/dislike.png";
import share_icon from "../../assets/share.png";
import save_icon from "../../assets/save.png";
import jack from "../../assets/jack.png";
import profile_pic from "../../assets/user_profile.jpg";

import Recommended from "../../Components/recommended/recommended";
import value_convertor, { API_KEY } from "../../data";
import moment from "moment";
import { useParams, useNavigate } from "react-router-dom";

const PlayVideo = ({ sidebar, videoId, categoryId }) => {
  const [apiData, setApiData] = useState(null);
  const [channelData, setChannelData] = useState(null);
  const [commentsData, setCommentsData] = useState([]);
  const [videoQueue, setVideoQueue] = useState([]);

  // Interactive States
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [localComments, setLocalComments] = useState([]);

  const navigate = useNavigate();

  // Navigation Logic
  const handleNavigate = (direction) => {
    if (videoQueue.length === 0) return;
    const currentIndex = videoQueue.findIndex((item) => item.id === videoId || item.id.videoId === videoId);
    if (currentIndex === -1) return;
    let nextIndex = direction === "next" ? (currentIndex + 1) % videoQueue.length : (currentIndex - 1 + videoQueue.length) % videoQueue.length;
    const nextVideo = videoQueue[nextIndex];
    const nextVideoId = nextVideo.id.videoId || nextVideo.id;
    navigate(`/video/${categoryId}/${nextVideoId}`);
  };

  // Interaction Handlers
  const handleLike = () => {
    setIsLiked(!isLiked);
    if (isDisliked) setIsDisliked(false);
  };

  const handleDislike = () => {
    setIsDisliked(!isDisliked);
    if (isLiked) setIsLiked(false);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: apiData?.snippet?.title,
          url: window.location.href,
        });
      } catch (err) {
        console.log("Error sharing:", err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
    alert(isSaved ? "Removed from Watch Later" : "Saved to Watch Later");
  };

  const handleAddComment = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const myComment = {
      snippet: {
        topLevelComment: {
          snippet: {
            authorDisplayName: "You",
            authorProfileImageUrl: profile_pic,
            textDisplay: newComment,
            publishedAt: new Date().toISOString(),
            likeCount: 0
          }
        }
      },
      isLocal: true,
      id: Date.now()
    };

    setLocalComments([myComment, ...localComments]);
    setNewComment("");
  };

  useEffect(() => {
    const getting = async () => {
      try {
        const videoDetail_url = `https://youtube.googleapis.com/youtube/v3/videos?part=snippet%2CcontentDetails%2Cstatistics&id=${videoId}&key=${API_KEY}`;
        const response = await fetch(videoDetail_url);
        const data = await response.json();
        if (data.items?.length) setApiData(data.items[0]);
      } catch (error) {
        console.error("Fetch error:", error);
      }
    };
    if (videoId) getting();
  }, [videoId]);

  useEffect(() => {
    const fetchOtherData = async () => {
      try {
        const channelData_url = `https://youtube.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${apiData.snippet.channelId}&key=${API_KEY}`;
        const response = await fetch(channelData_url);
        const data = await response.json();
        if (data.items?.length) setChannelData(data.items[0]);
      } catch (error) {
        console.error("Error fetching channel data:", error);
      }
    };
    if (apiData?.snippet?.channelId) fetchOtherData();
  }, [apiData]);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const comment_url = `https://youtube.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId=${videoId}&key=${API_KEY}&maxResults=20&order=relevance`;
        const response = await fetch(comment_url);
        const data = await response.json();
        setCommentsData(data.items || []);
        setLocalComments([]); // Reset local comments on video change
      } catch (error) {
        console.error("Error fetching comments:", error);
      }
    };
    if (videoId) fetchComments();
  }, [videoId]);

  return (
    <div className="playvideo-container">
      <div className="main-content">
        <div className="player-wrapper">
          <iframe
            className="video-player"
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
          <button className="nav-arrow prev" onClick={() => handleNavigate("prev")}>
            <ChevronLeft size={35} color="white" />
          </button>
          <button className="nav-arrow next" onClick={() => handleNavigate("next")}>
            <ChevronRight size={35} color="white" />
          </button>
        </div>

        <div className={`video-content ${sidebar ? "expanded" : "collapsed"}`}>
          <h3>{apiData?.snippet?.title || "Loading..."}</h3>
          <div className="playvideo_info">
            <p>
              {apiData?.statistics?.viewCount ? value_convertor(parseInt(apiData.statistics.viewCount)) : "0"} views &bull; {apiData?.snippet?.publishedAt ? moment(apiData.snippet.publishedAt).fromNow() : ""}
            </p>
            <div className="video-actions">
              <span onClick={handleLike} className={isLiked ? "active-like" : ""}>
                <img src={like_icon} alt="like" />
                {apiData?.statistics?.likeCount ? value_convertor(parseInt(apiData.statistics.likeCount) + (isLiked ? 1 : 0)) : "0"}
              </span>
              <span onClick={handleDislike} className={isDisliked ? "active-dislike" : ""}>
                <img src={dislike_icon} alt="dislike" />
              </span>
              <span onClick={handleShare}>
                <img src={share_icon} alt="share" /> Share
              </span>
              <span onClick={handleSave} className={isSaved ? "active-save" : ""}>
                <img src={save_icon} alt="save" /> {isSaved ? "Saved" : "Save"}
              </span>
            </div>
          </div>
          <hr />
          <div className="publisher">
            <img src={channelData?.snippet?.thumbnails?.high?.url || jack} alt="" />
            <div>
              <p>{apiData?.snippet?.channelTitle}</p>
              <span>{channelData?.statistics?.subscriberCount ? value_convertor(parseInt(channelData.statistics.subscriberCount)) : "0"} subscribers</span>
            </div>
            <button>Subscribe</button>
          </div>
          <div className="description">
            <p>{apiData?.snippet?.description.slice(0, 250)}...</p>
          </div>
          <hr />

          {/* Add Comment Section */}
          <div className="add-comment-section">
            <img src={profile_pic} alt="" className="user-profile-img" />
            <form onSubmit={handleAddComment}>
              <input
                type="text"
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />
              <button type="submit" className={newComment.trim() ? "active" : ""}>
                <Send size={18} />
              </button>
            </form>
          </div>

          <h4>{apiData?.statistics?.commentCount ? value_convertor(parseInt(apiData.statistics.commentCount) + localComments.length) : localComments.length} Comments</h4>

          {[...localComments, ...commentsData].map((item, index) => (
            <div className="comment" key={item.id || index}>
              <img src={item.snippet.topLevelComment.snippet.authorProfileImageUrl} alt="" />
              <div>
                <h3>{item.snippet.topLevelComment.snippet.authorDisplayName} <span>{moment(item.snippet.topLevelComment.snippet.publishedAt).fromNow()}</span></h3>
                <p>{item.snippet.topLevelComment.snippet.textDisplay}</p>
                <div className="comment-action">
                  <img src={like_icon} alt="" className="comment-like" />
                  <span>{value_convertor(item.snippet.topLevelComment.snippet.likeCount)}</span>
                  <img src={dislike_icon} alt="" className="comment-dislike" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="recommended-section">
        <Recommended categoryId={categoryId} setQueue={setVideoQueue} />
      </div>
    </div>
  );
};

export default PlayVideo;
