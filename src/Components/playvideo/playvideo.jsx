// PlayVideo.jsx
import React, { useState, useEffect, useRef } from "react";
import "./playvideo.css";
import { ChevronLeft, ChevronRight, Send, Trash2, Image as ImageIcon } from "lucide-react";
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

const PlayVideo = ({ sidebar, videoId, categoryId, savedVideos, setSavedVideos }) => {
  const [apiData, setApiData] = useState(null);
  const [channelData, setChannelData] = useState(null);
  const [commentsData, setCommentsData] = useState([]);
  const [videoQueue, setVideoQueue] = useState([]);

  // Interactive States
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [localComments, setLocalComments] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);
  const [commentInteractions, setCommentInteractions] = useState({});

  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  // Navigation Logic
  const handleNavigate = (direction) => {
    if (videoQueue.length === 0) return;
    const currentIndex = videoQueue.findIndex((item) => {
      const id = typeof item.id === "string" ? item.id : item.id.videoId;
      return id === videoId;
    });
    if (currentIndex === -1) return;
    let nextIndex = direction === "next" ? (currentIndex + 1) % videoQueue.length : (currentIndex - 1 + videoQueue.length) % videoQueue.length;
    const nextVideo = videoQueue[nextIndex];
    const nextVideoId = typeof nextVideo.id === "string" ? nextVideo.id : nextVideo.id.videoId;
    navigate(`/video/${categoryId}/${nextVideoId}`);
  };

  // Video Like/Dislike
  const handleLike = () => {
    setIsLiked(!isLiked);
    if (isDisliked) setIsDisliked(false);
  };
  const handleDislike = () => {
    setIsDisliked(!isDisliked);
    if (isLiked) setIsLiked(false);
  };

  // Saved Videos
  const isSaved = savedVideos?.some(v => {
    const vId = typeof v.id === "string" ? v.id : v.id?.videoId;
    return vId === videoId;
  });
  const handleSave = () => {
    if (isSaved) {
      setSavedVideos(savedVideos.filter(v => (typeof v.id === "string" ? v.id : v.id?.videoId) !== videoId));
    } else {
      setSavedVideos([...savedVideos, apiData]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      setSelectedFile({
        url: URL.createObjectURL(file),
        type: file.type.startsWith("image") ? "image" : "video"
      });
    }
  };

  const postComment = (e) => {
    e.preventDefault();
    if (!newComment.trim() && !selectedFile) return;

    const myComment = {
      id: "local-" + Date.now(),
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
      media: selectedFile,
      isLocal: true,
      replies: []
    };

    if (replyingTo) {
      setLocalComments(prev => prev.map(c =>
        c.id === replyingTo ? { ...c, replies: [...(c.replies || []), myComment] } : c
      ));
    } else {
      setLocalComments([myComment, ...localComments]);
    }

    setNewComment("");
    setSelectedFile(null);
    setReplyingTo(null);
  };

  const handleCommentInteraction = (commentId, type) => {
    setCommentInteractions(prev => {
      const current = prev[commentId] || { liked: false, disliked: false };
      if (type === "like") {
        return { ...prev, [commentId]: { liked: !current.liked, disliked: false } };
      } else {
        return { ...prev, [commentId]: { disliked: !current.disliked, liked: false } };
      }
    });
  };

  useEffect(() => {
    const getting = async () => {
      try {
        const videoDetail_url = `https://youtube.googleapis.com/youtube/v3/videos?part=snippet%2CcontentDetails%2Cstatistics&id=${videoId}&key=${API_KEY}`;
        const response = await fetch(videoDetail_url);
        const data = await response.json();
        if (data.items?.length) setApiData(data.items[0]);
      } catch (error) { console.error("Fetch error:", error); }
    };
    if (videoId) getting();
  }, [videoId]);

  useEffect(() => {
    const fetchOtherData = async () => {
      try {
        const channelId = apiData.snippet.channelId;
        const channelData_url = `https://youtube.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${channelId}&key=${API_KEY}`;
        const response = await fetch(channelData_url);
        const data = await response.json();
        if (data.items?.length) setChannelData(data.items[0]);
      } catch (error) { console.error("Error fetching channel data:", error); }
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
        setLocalComments([]);
      } catch (error) { console.error("Error fetching comments:", error); }
    };
    if (videoId) fetchComments();
  }, [videoId]);

  const getDisplayCount = (base, active) => {
    const num = Number(base) || 0;
    if (!active) return value_convertor(num);
    return value_convertor(num + 1);
  };

  return (
    <div className="playvideo-container">
      <div className="main-content">
        <div className="player-wrapper">
          <iframe className="video-player" src={`https://www.youtube.com/embed/${videoId}?autoplay=1`} title="Video" frameBorder="0" allowFullScreen></iframe>
          <button className="nav-arrow prev" onClick={() => handleNavigate("prev")}><ChevronLeft size={35} color="white" /></button>
          <button className="nav-arrow next" onClick={() => handleNavigate("next")}><ChevronRight size={35} color="white" /></button>
        </div>

        <div className="video-content">
          <h3>{apiData?.snippet?.title || "Loading..."}</h3>
          <div className="playvideo_info">
            <p>{apiData?.statistics?.viewCount ? value_convertor(parseInt(apiData.statistics.viewCount)) : "0"} views &bull; {apiData?.snippet?.publishedAt ? moment(apiData.snippet.publishedAt).fromNow() : ""}</p>
            <div className="video-actions">
              <span onClick={handleLike} className={isLiked ? "active-like" : ""}><img src={like_icon} alt="" /> {getDisplayCount(apiData?.statistics?.likeCount, isLiked)}</span>
              <span onClick={handleDislike} className={isDisliked ? "active-dislike" : ""}><img src={dislike_icon} alt="" /></span>
              <span onClick={() => { navigator.clipboard.writeText(window.location.href); alert("Link Copied!"); }}><img src={share_icon} alt="" /> Share</span>
              <span onClick={handleSave} className={isSaved ? "active-save" : ""}><img src={save_icon} alt="" /> {isSaved ? "Saved" : "Save"}</span>
            </div>
          </div>
          <hr />
          <div className="publisher">
            <img src={channelData?.snippet?.thumbnails?.high?.url || jack} alt="" />
            <div>
              <p>{apiData?.snippet?.channelTitle}</p>
              <span>{channelData?.statistics?.subscriberCount ? value_convertor(parseInt(channelData.statistics.subscriberCount)) : "0"} subscribers</span>
            </div>
            <button onClick={() => setIsSubscribed(!isSubscribed)} className={isSubscribed ? "subscribed" : ""}>
              {isSubscribed ? "Subscribed" : "Subscribe"}
            </button>
          </div>
          <div className="description"><p>{apiData?.snippet?.description?.slice(0, 250)}...</p></div>
          <hr />

          <div className="add-comment-section">
            <img src={profile_pic} alt="" className="user-profile-img" />
            <form onSubmit={postComment}>
              <div className="input-group">
                {replyingTo && <span className="reply-tag">Replying... <button onClick={() => setReplyingTo(null)}>×</button></span>}
                <input type="text" placeholder={replyingTo ? "Add a reply..." : "Add a comment..."} value={newComment} onChange={(e) => setNewComment(e.target.value)} />
                <input type="file" hidden ref={fileInputRef} accept="image/*,video/*" onChange={handleFileChange} />
                <button type="button" className="icon-btn" onClick={() => fileInputRef.current?.click()}><ImageIcon size={20} /></button>
                <button type="submit" className={newComment.trim() || selectedFile ? "active" : ""}><Send size={18} /></button>
              </div>
              {selectedFile && (
                <div className="preview-container">
                  <button className="remove-preview" onClick={() => setSelectedFile(null)}>×</button>
                  {selectedFile.type === "image" ? <img src={selectedFile.url} alt="" /> : <video src={selectedFile.url} muted />}
                </div>
              )}
            </form>
          </div>

          <h4>{apiData?.statistics?.commentCount ? value_convertor(parseInt(apiData.statistics.commentCount) + localComments.length) : localComments.length} Comments</h4>

          {[...localComments, ...commentsData].map((item, index) => {
            const commentId = item.id || index;
            const interaction = commentInteractions[commentId] || { liked: false, disliked: false };
            const snippet = item.snippet?.topLevelComment?.snippet || item.snippet;

            return (
              <div key={commentId} className="comment-block">
                <div className={`comment ${item.isLocal ? "is-local" : ""}`}>
                  <img src={snippet.authorProfileImageUrl} alt="" />
                  <div className="comment-body">
                    <h3><span>{snippet.authorDisplayName} <small>{moment(snippet.publishedAt).fromNow()}</small></span>
                      {item.isLocal && <button className="delete-comment" onClick={() => setLocalComments(localComments.filter(c => c.id !== commentId))}><Trash2 size={16} /></button>}
                    </h3>
                    <p>{snippet.textDisplay}</p>
                    {item.media && <div className="comment-media">{item.media.type === "image" ? <img src={item.media.url} alt="" /> : <video src={item.media.url} controls />}</div>}
                    <div className="comment-action">
                      <img src={like_icon} className={`comment-like ${interaction.liked ? "active" : ""}`} onClick={() => handleCommentInteraction(commentId, "like")} alt="" />
                      <span>{getDisplayCount(snippet.likeCount || 0, interaction.liked)}</span>
                      <img src={dislike_icon} className={`comment-dislike ${interaction.disliked ? "active" : ""}`} onClick={() => handleCommentInteraction(commentId, "dislike")} alt="" />
                      <button className="reply-btn" onClick={() => setReplyingTo(commentId)}>Reply</button>
                    </div>
                  </div>
                </div>
                {item.replies?.map(reply => (
                  <div key={reply.id} className="comment local-reply">
                    <img src={reply.snippet.topLevelComment.snippet.authorProfileImageUrl} alt="" />
                    <div className="comment-body">
                      <h3>{reply.snippet.topLevelComment.snippet.authorDisplayName} <small>{moment(reply.snippet.publishedAt).fromNow()}</small></h3>
                      <p>{reply.snippet.topLevelComment.snippet.textDisplay}</p>
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
      <div className="recommended-section"><Recommended categoryId={categoryId} setQueue={setVideoQueue} /></div>
    </div>
  );
};

export default PlayVideo;
