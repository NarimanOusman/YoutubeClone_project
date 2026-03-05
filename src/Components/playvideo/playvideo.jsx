// PlayVideo.jsx
import React, { useState, useEffect, useRef } from "react";
import "./playvideo.css";
import { ChevronLeft, ChevronRight, Send, Trash2, Image as ImageIcon, X, Download, AlertCircle, Bookmark, CheckCircle } from "lucide-react";
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

  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [localComments, setLocalComments] = useState([]);
  const [localReplies, setLocalReplies] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [commentInteractions, setCommentInteractions] = useState({});
  const [showAllComments, setShowAllComments] = useState(false);

  // Professional Modal State
  const [modal, setModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    confirmText: "",
    onConfirm: null,
    type: "default"
  });

  const mainFileInputRef = useRef(null);
  const replyFileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleNavigate = (direction) => {
    if (videoQueue.length === 0) return;
    const currentIndex = videoQueue.findIndex(item => (typeof item.id === "string" ? item.id : item.id.videoId) === videoId);
    if (currentIndex === -1) return;
    let nextIndex = direction === "next" ? (currentIndex + 1) % videoQueue.length : (currentIndex - 1 + videoQueue.length) % videoQueue.length;
    const nextVideo = videoQueue[nextIndex];
    const nextVideoId = typeof nextVideo.id === "string" ? nextVideo.id : nextVideo.id.videoId;
    navigate(`/video/${categoryId}/${nextVideoId}`);
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    if (isDisliked) setIsDisliked(false);
  };

  const handleDislike = () => {
    setIsDisliked(!isDisliked);
    if (isLiked) setIsLiked(false);
  };

  const isSaved = savedVideos?.some(v => (typeof v.id === "string" ? v.id : v.id?.videoId) === videoId);

  const handleSaveAction = () => {
    if (isSaved) {
      setModal({
        isOpen: true,
        title: "Remove from Saved?",
        message: "This video will be removed from your Watch Later list.",
        confirmText: "Remove",
        type: "warning",
        onConfirm: () => {
          setSavedVideos(savedVideos.filter(v => (typeof v.id === "string" ? v.id : v.id?.videoId) !== videoId));
          setModal({ ...modal, isOpen: false });
        }
      });
    } else {
      setModal({
        isOpen: true,
        title: "Save Video?",
        message: "Add this video to your Watch Later list for viewing later.",
        confirmText: "Save",
        type: "success",
        onConfirm: () => {
          setSavedVideos([...savedVideos, apiData]);
          setModal({ ...modal, isOpen: false });
        }
      });
    }
  };

  const deleteCommentAction = (commentId) => {
    setModal({
      isOpen: true,
      title: "Delete Comment?",
      message: "This action cannot be undone. Your comment will be permanently removed.",
      confirmText: "Delete",
      type: "danger",
      onConfirm: () => {
        setLocalComments(localComments.filter(c => c.id !== commentId));
        setModal({ ...modal, isOpen: false });
      }
    });
  };

  const deleteReplyAction = (parentId, replyId) => {
    setModal({
      isOpen: true,
      title: "Delete Reply?",
      message: "Are you sure you want to remove your reply to this conversation?",
      confirmText: "Remove",
      type: "danger",
      onConfirm: () => {
        setLocalReplies(prev => ({
          ...prev,
          [parentId]: prev[parentId].filter(r => r.id !== replyId)
        }));
        setModal({ ...modal, isOpen: false });
      }
    });
  };

  const onFileSelect = (e) => {
    if (e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile({
        url: URL.createObjectURL(file),
        type: file.type.startsWith("image") ? "image" : "video"
      });
    }
  };

  const submitComment = (e) => {
    e.preventDefault();
    if (!newComment.trim() && !selectedFile) return;

    const timestamp = new Date().toISOString();
    const myComment = {
      id: "local-" + Date.now(),
      snippet: {
        topLevelComment: {
          snippet: {
            authorDisplayName: "You",
            authorProfileImageUrl: profile_pic,
            textDisplay: newComment,
            publishedAt: timestamp,
            likeCount: 0
          }
        }
      },
      media: selectedFile,
      isLocal: true
    };

    if (replyingTo) {
      const parentId = replyingTo.id;
      setLocalReplies(prev => ({
        ...prev,
        [parentId]: [...(prev[parentId] || []), myComment]
      }));
      setReplyingTo(null);
    } else {
      setLocalComments([myComment, ...localComments]);
    }

    setNewComment("");
    setSelectedFile(null);
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
    const fetchMain = async () => {
      try {
        const response = await fetch(`https://youtube.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${videoId}&key=${API_KEY}`);
        const data = await response.json();
        if (data.items?.length) setApiData(data.items[0]);
        setIsLiked(false);
        setIsDisliked(false);
      } catch (err) { console.error(err); }
    };
    if (videoId) fetchMain();
  }, [videoId]);

  useEffect(() => {
    const fetchChannel = async () => {
      try {
        const response = await fetch(`https://youtube.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${apiData.snippet.channelId}&key=${API_KEY}`);
        const data = await response.json();
        if (data.items?.length) setChannelData(data.items[0]);
      } catch (err) { console.error(err); }
    };
    if (apiData?.snippet?.channelId) fetchChannel();
  }, [apiData]);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await fetch(`https://youtube.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId=${videoId}&key=${API_KEY}&maxResults=15`);
        const data = await response.json();
        setCommentsData(data.items || []);
        setLocalComments([]);
        setLocalReplies({});
      } catch (err) { console.error(err); }
    };
    if (videoId) fetchComments();
  }, [videoId]);

  const getLikeDisplay = (base, active) => {
    const num = parseInt(base) || 0;
    const total = active ? num + 1 : num;
    if (total < 10000) return total.toLocaleString();
    return active ? total.toLocaleString() : value_convertor(num);
  };

  return (
    <div className="playvideo-container">
      <div className="main-content">
        <div className="player-wrapper">
          <iframe className="video-player" src={`https://www.youtube.com/embed/${videoId}?autoplay=1`} title="Video" frameBorder="0" allowFullScreen></iframe>
          <button className="nav-arrow prev" onClick={() => handleNavigate("prev")}><ChevronLeft color="white" /></button>
          <button className="nav-arrow next" onClick={() => handleNavigate("next")}><ChevronRight color="white" /></button>
        </div>

        <div className="video-content">
          <h3>{apiData?.snippet?.title || "Loading..."}</h3>
          <div className="playvideo_info">
            <p>{apiData?.statistics?.viewCount ? value_convertor(parseInt(apiData.statistics.viewCount)) : "0"} views &bull; {apiData?.snippet?.publishedAt ? moment(apiData.snippet.publishedAt).fromNow() : ""}</p>
            <div className="video-actions">
              <span onClick={handleLike} className={isLiked ? "active-like" : ""}><img src={like_icon} alt="" /> {getLikeDisplay(apiData?.statistics?.likeCount, isLiked)}</span>
              <span onClick={handleDislike} className={isDisliked ? "active-dislike" : ""}><img src={dislike_icon} alt="" /> {isDisliked ? "Disliked" : "Dislike"}</span>
              <span onClick={() => { navigator.clipboard.writeText(window.location.href); alert("Link copied!"); }}><img src={share_icon} alt="" /> Share</span>
              <span onClick={handleSaveAction} className={isSaved ? "active-save" : ""}><img src={save_icon} alt="" /> {isSaved ? "Saved" : "Save"}</span>
            </div>
          </div>
          <hr />
          <div className="publisher">
            <img src={channelData?.snippet?.thumbnails?.high?.url || jack} alt="" />
            <div><p>{apiData?.snippet?.channelTitle}</p><span>{channelData?.statistics?.subscriberCount ? value_convertor(parseInt(channelData.statistics.subscriberCount)) : "0"} subscribers</span></div>
            <button onClick={() => setIsSubscribed(!isSubscribed)} className={isSubscribed ? "subscribed" : ""}>{isSubscribed ? "Subscribed" : "Subscribe"}</button>
          </div>
          <div className="description"><p>{apiData?.snippet?.description?.slice(0, 250)}...</p></div>
          <hr />

          <div className="add-comment-section">
            <img src={profile_pic} alt="" className="user-profile-img" />
            <form onSubmit={submitComment}>
              <div className="input-group">
                <input type="text" placeholder="Add a comment..." value={newComment} onChange={(e) => setNewComment(e.target.value)} />
                <button type="button" className="icon-btn" onClick={() => mainFileInputRef.current?.click()}><ImageIcon size={20} /></button>
                <button type="submit" className={newComment.trim() || selectedFile ? "active" : ""}><Send size={18} /></button>
              </div>
              <input type="file" hidden ref={mainFileInputRef} accept="image/*,video/*" onChange={onFileSelect} />
              {selectedFile && !replyingTo && <div className="preview-container"><button className="remove-preview" onClick={() => setSelectedFile(null)}><X size={12} /></button>{selectedFile.type === "image" ? <img src={selectedFile.url} alt="" /> : <video src={selectedFile.url} muted />}</div>}
            </form>
          </div>

          <h4>{apiData?.statistics?.commentCount ? value_convertor(parseInt(apiData.statistics.commentCount) + localComments.length) : localComments.length} Comments</h4>

          {(() => {
            const allComments = [...localComments, ...commentsData];
            const displayedComments = showAllComments ? allComments : allComments.slice(0, 1);

            return (
              <>
                {displayedComments.map((item, index) => {
                  const commentId = item.id || index;
                  const interaction = commentInteractions[commentId] || { liked: false, disliked: false };
                  const snippet = item.snippet?.topLevelComment?.snippet || item.snippet;

                  return (
                    <div key={commentId} className="comment-block">
                      <div className={`comment ${item.isLocal ? "is-local" : ""}`}>
                        <img src={snippet.authorProfileImageUrl || profile_pic} alt="" />
                        <div className="comment-body">
                          <h3><span>{snippet.authorDisplayName} <small>{moment(snippet.publishedAt).fromNow()}</small></span>
                            {item.isLocal && <button className="delete-comment" onClick={() => deleteCommentAction(commentId)}><Trash2 size={16} /></button>}
                          </h3>
                          <p>{snippet.textDisplay}</p>
                          {item.media && <div className="comment-media"><img src={item.media.url} onClick={() => setSelectedImage(item.media.url)} alt="" /></div>}
                          <div className="comment-action">
                            <img src={like_icon} className={interaction.liked ? "active-like" : ""} onClick={() => handleCommentInteraction(commentId, "like")} alt="" />
                            <span>{getLikeDisplay(snippet.likeCount || 0, interaction.liked)}</span>
                            <img src={dislike_icon} className={interaction.disliked ? "active-dislike" : ""} onClick={() => handleCommentInteraction(commentId, "dislike")} alt="" />
                            <button className="reply-btn" onClick={() => setReplyingTo(item)}>Reply</button>
                          </div>
                        </div>
                      </div>
                      {localReplies[commentId]?.map(r => {
                        const rSnippet = r.snippet.topLevelComment.snippet;
                        return (
                          <div key={r.id} className="comment local-reply">
                            <img src={profile_pic} alt="" />
                            <div className="comment-body">
                              <h3>
                                <span>You <small>{moment(rSnippet.publishedAt).fromNow()}</small></span>
                                <button className="delete-comment" onClick={() => deleteReplyAction(commentId, r.id)}><Trash2 size={16} /></button>
                              </h3>
                              <p>{rSnippet.textDisplay}</p>
                              {r.media && <div className="comment-media"><img src={r.media.url} onClick={() => setSelectedImage(r.media.url)} alt="" /></div>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
                {allComments.length > 1 && (
                  <button className="see-more-comments-btn" onClick={() => setShowAllComments(!showAllComments)}>
                    {showAllComments ? "See less" : "See more"}
                  </button>
                )}
              </>
            );
          })()}
        </div>
      </div>
      <div className="recommended-section"><Recommended categoryId={categoryId} setQueue={setVideoQueue} savedVideos={savedVideos} /></div>

      {/* CUSTOM PROFESSIONAL CONFIRMATION MODAL */}
      {modal.isOpen && (
        <div className="modal-overlay" onClick={() => setModal({ ...modal, isOpen: false })}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className={`modal-icon-header ${modal.type}`}>
              {modal.type === "danger" && <AlertCircle size={32} />}
              {modal.type === "warning" && <Bookmark size={32} />}
              {modal.type === "success" && <CheckCircle size={32} />}
            </div>
            <h2>{modal.title}</h2>
            <p>{modal.message}</p>
            <div className="modal-btn-group">
              <button className="modal-btn-cancel" onClick={() => setModal({ ...modal, isOpen: false })}>Cancel</button>
              <button className={`modal-btn-confirm ${modal.type}`} onClick={() => modal.onConfirm()}>
                {modal.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REPLY DRAWER */}
      {replyingTo && (
        <div className="reply-drawer-overlay" onClick={() => { setReplyingTo(null); setSelectedFile(null); }}>
          <div className="reply-drawer" onClick={e => e.stopPropagation()}>
            <div className="reply-drawer-header">
              <h3>Replying to {replyingTo.snippet?.topLevelComment?.snippet?.authorDisplayName || "this comment"}</h3>
              <X cursor="pointer" onClick={() => { setReplyingTo(null); setSelectedFile(null); }} />
            </div>
            <div className="add-comment-section drawer-input">
              <img src={profile_pic} alt="" className="user-profile-img" />
              <form onSubmit={submitComment}>
                <div className="input-group">
                  <input autoFocus type="text" placeholder="Add a reply..." value={newComment} onChange={(e) => setNewComment(e.target.value)} />
                  <button type="button" className="icon-btn drawer-btn" onClick={() => replyFileInputRef.current?.click()}><ImageIcon size={20} /></button>
                  <button type="submit" className={newComment.trim() || selectedFile ? "active" : ""}><Send size={18} /></button>
                </div>
                <input type="file" hidden ref={replyFileInputRef} accept="image/*,video/*" onChange={onFileSelect} />
                {selectedFile && <div className="preview-container"><button className="remove-preview" onClick={() => setSelectedFile(null)}><X size={12} /></button>{selectedFile.type === "image" ? <img src={selectedFile.url} alt="" /> : <video src={selectedFile.url} muted />}</div>}
              </form>
            </div>
          </div>
        </div>
      )}

      {/* LIGHTBOX */}
      {selectedImage && (
        <div className="lightbox" onClick={() => setSelectedImage(null)}>
          <div className="lightbox-actions">
            <a href={selectedImage} download="vidtube-image.jpg" onClick={e => e.stopPropagation()}>
              <button><Download size={22} /></button>
            </a>
            <button onClick={() => setSelectedImage(null)}><X size={22} /></button>
          </div>
          <img src={selectedImage} onClick={e => e.stopPropagation()} alt="" />
        </div>
      )}
    </div>
  );
};

export default PlayVideo;
