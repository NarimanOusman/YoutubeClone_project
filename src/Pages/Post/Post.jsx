import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Send, X } from "lucide-react";
import { supabase } from "../../supabaseClient";
import like_icon from "../../assets/like.png";
import dislike_icon from "../../assets/dislike.png";
import share_icon from "../../assets/share.png";
import profile_pic from "../../assets/user_profile.jpg";
import moment from "moment";
import "../../Components/playvideo/playvideo.css";
import "./Post.css";

const Post = () => {
  const { postId } = useParams();
  const navigate = useNavigate();

  const [session, setSession] = useState(null);
  const [post, setPost] = useState(null);
  const [uploader, setUploader] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reactionsEnabled, setReactionsEnabled] = useState(true);
  const [reaction, setReaction] = useState(null);
  const [counts, setCounts] = useState({ like: 0, dislike: 0 });
  const [commentsEnabled, setCommentsEnabled] = useState(true);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [postingComment, setPostingComment] = useState(false);
  const [deletingCommentId, setDeletingCommentId] = useState("");
  const [shareOpen, setShareOpen] = useState(false);

  const isOwner = useMemo(() => {
    return Boolean(session?.user?.id && post?.user_id && session.user.id === post.user_id);
  }, [session, post]);

  /* ---------- data loaders ---------- */

  const loadReactions = async () => {
    const { data, error } = await supabase
      .from("video_reactions")
      .select("user_id, reaction_type")
      .eq("video_id", postId);

    if (error) {
      // Table does not exist yet. Keep post page functional without reaction persistence.
      if (error.code === "42P01") {
        setReactionsEnabled(false);
        return;
      }
      console.error("Error loading reactions:", error);
      return;
    }

    const likeCount = data.filter((item) => item.reaction_type === "like").length;
    const dislikeCount = data.filter((item) => item.reaction_type === "dislike").length;
    setCounts({ like: likeCount, dislike: dislikeCount });

    if (session?.user?.id) {
      const mine = data.find((item) => item.user_id === session.user.id);
      setReaction(mine?.reaction_type || null);
    }
  };

  useEffect(() => {
    const init = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      setSession(sessionData.session || null);

      const { data, error } = await supabase
        .from("videos")
        .select("id, user_id, title, description, media_url, media_type, created_at")
        .eq("id", postId)
        .single();

      if (error) {
        alert("Post not found.");
        navigate("/");
        return;
      }

      setPost(data);

      // Fetch uploader profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .eq("id", data.user_id)
        .single();
      setUploader(profileData || null);

      setLoading(false);
    };

    init();
  }, [navigate, postId]);

  useEffect(() => {
    if (!postId) return;
    loadReactions();
  }, [postId, session?.user?.id]);

  const loadComments = async () => {
    const { data, error } = await supabase
      .from("video_comments")
      .select("id, user_id, content, created_at")
      .eq("video_id", postId)
      .order("created_at", { ascending: false });

    if (error) {
      if (error.code === "42P01") {
        setCommentsEnabled(false);
        return;
      }
      console.error("Error loading comments:", error);
      return;
    }

    setComments(data || []);
  };

  useEffect(() => {
    if (!postId) return;
    loadComments();
  }, [postId]);

  const handleReact = async (type) => {
    if (!session) {
      alert("Please login to react.");
      return;
    }

    if (!reactionsEnabled) {
      alert("Reactions table is not set up yet. Run the SQL script first.");
      return;
    }

    const nextReaction = reaction === type ? null : type;

    try {
      if (!nextReaction) {
        const { error } = await supabase
          .from("video_reactions")
          .delete()
          .eq("video_id", postId)
          .eq("user_id", session.user.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("video_reactions")
          .upsert(
            {
              video_id: postId,
              user_id: session.user.id,
              reaction_type: nextReaction
            },
            { onConflict: "video_id,user_id" }
          );

        if (error) throw error;
      }

      setReaction(nextReaction);
      await loadReactions();
    } catch (error) {
      alert(`Failed to save reaction: ${error.message}`);
    }
  };

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(post?.title || "Community Post");

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: post?.title || "Community Post", url: shareUrl });
        return;
      } catch { /* user cancelled */ }
    }
    setShareOpen(true);
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      alert("Link copied!");
    } catch {
      alert("Could not copy link.");
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();

    if (!session) {
      alert("Please login to comment.");
      return;
    }

    if (!commentsEnabled) {
      alert("Comments table is not set up yet. Run the SQL migration first.");
      return;
    }

    const content = newComment.trim();
    if (!content) return;

    setPostingComment(true);

    try {
      const { error } = await supabase
        .from("video_comments")
        .insert({
          video_id: postId,
          user_id: session.user.id,
          content
        });

      if (error) throw error;

      setNewComment("");
      await loadComments();
    } catch (err) {
      alert(`Failed to post comment: ${err.message}`);
    } finally {
      setPostingComment(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    setDeletingCommentId(commentId);
    try {
      const { error } = await supabase
        .from("video_comments")
        .delete()
        .eq("id", commentId)
        .eq("user_id", session.user.id);

      if (error) throw error;

      setComments((prev) => prev.filter((item) => item.id !== commentId));
    } catch (err) {
      alert(`Failed to delete comment: ${err.message}`);
    } finally {
      setDeletingCommentId("");
    }
  };

  if (loading) {
    return <div className="post-page-loading">Loading post...</div>;
  }

  const uploaderName = uploader?.full_name || "Community Member";
  const uploaderAvatar = uploader?.avatar_url || null;

  return (
    <div className="playvideo-container">
      <div className="main-content">

        {/* Media player */}
        <div className="player-wrapper">
          {post.media_type === "image" ? (
            <img
              src={post.media_url}
              alt={post.title}
              style={{ width: "100%", aspectRatio: "16/9", objectFit: "contain", background: "#000" }}
            />
          ) : (
            <video
              src={post.media_url}
              controls
              autoPlay
              style={{ width: "100%", aspectRatio: "16/9", display: "block", background: "#000" }}
            />
          )}
        </div>

        <div className="video-content">
          <h3>{post.title}</h3>

          <div className="playvideo_info">
            <p>{moment(post.created_at).fromNow()} &bull; Community Post</p>
            <div className="video-actions">
              <span
                onClick={() => handleReact("like")}
                className={reaction === "like" ? "active-like" : ""}
              >
                <img src={like_icon} alt="like" /> {counts.like}
              </span>
              <span
                onClick={() => handleReact("dislike")}
                className={reaction === "dislike" ? "active-dislike" : ""}
              >
                <img src={dislike_icon} alt="dislike" />
              </span>
              <span onClick={handleShare}>
                <img src={share_icon} alt="share" /> Share
              </span>
              {isOwner && (
                <Link to="/my-posts" style={{ textDecoration: "none" }}>
                  <span className="manage-post-btn">✏️ Manage Post</span>
                </Link>
              )}
            </div>
          </div>

          <hr />

          {/* Uploader info */}
          <div className="publisher">
            {uploaderAvatar ? (
              <img src={uploaderAvatar} alt={uploaderName} />
            ) : (
              <div className="post-avatar-placeholder">
                {uploaderName.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <p>{uploaderName}</p>
              <span>Community Member</span>
            </div>
          </div>

          {post.description ? (
            <div className="description"><p>{post.description}</p></div>
          ) : null}

          <hr />

          {/* Comment input */}
          <div className="add-comment-section">
            <img src={profile_pic} alt="you" className="user-profile-img" />
            <form onSubmit={handleCommentSubmit}>
              <div className="input-group">
                <input
                  type="text"
                  placeholder={session ? "Add a comment..." : "Log in to comment..."}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  disabled={!session}
                />
                <button
                  type="submit"
                  disabled={postingComment || !newComment.trim()}
                  className={newComment.trim() ? "active" : ""}
                >
                  <Send size={18} />
                </button>
              </div>
            </form>
          </div>

          <h4>{comments.length} Comment{comments.length !== 1 ? "s" : ""}</h4>

          {comments.map((comment) => {
            const isMyComment = session?.user?.id === comment.user_id;
            return (
              <div key={comment.id} className="comment-block">
                <div className="comment">
                  <img src={profile_pic} alt="" />
                  <div className="comment-body">
                    <h3>
                      <span>
                        {isMyComment ? "You" : "User"}
                        <small>{moment(comment.created_at).fromNow()}</small>
                      </span>
                      {isMyComment && (
                        <button
                          className="delete-comment"
                          disabled={deletingCommentId === comment.id}
                          onClick={() => handleDeleteComment(comment.id)}
                        >
                          {deletingCommentId === comment.id ? "..." : "🗑"}
                        </button>
                      )}
                    </h3>
                    <p>{comment.content}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Share sheet */}
      {shareOpen && (
        <div className="share-overlay" onClick={() => setShareOpen(false)}>
          <div className="share-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="share-header">
              <h3>Share</h3>
              <button className="share-close" onClick={() => setShareOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="share-actions">
              <a
                className="share-item"
                href={`https://wa.me/?text=${encodedTitle}%20${encodedUrl}`}
                target="_blank"
                rel="noreferrer"
              >
                WhatsApp
              </a>
              <a
                className="share-item"
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
                target="_blank"
                rel="noreferrer"
              >
                Facebook
              </a>
              <button
                className="share-item share-copy"
                onClick={() => copyToClipboard(shareUrl)}
              >
                Copy link
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Post;
