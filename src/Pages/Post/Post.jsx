import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Send, X } from "lucide-react";
import { supabase } from "../../supabaseClient";
import like_icon from "../../assets/like.png";
import dislike_icon from "../../assets/dislike.png";
import share_icon from "../../assets/share.png";
import save_icon from "../../assets/save.png";
import profile_pic from "../../assets/user_profile.jpg";
import moment from "moment";
import Recommended from "../../Components/recommended/recommended";
import "../../Components/playvideo/playvideo.css";
import "./Post.css";

const Post = ({
  savedVideos = [],
  setSavedVideos = () => {},
  subscribedChannels = [],
  setSubscribedChannels = () => {}
}) => {
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
  const [currentUserProfile, setCurrentUserProfile] = useState(null);

  const isSaved = useMemo(() => {
    return savedVideos.some((item) => item?.source === "community" && item?.id === postId);
  }, [savedVideos, postId]);

  const isSubscribed = useMemo(() => {
    if (!post?.user_id) return false;
    return subscribedChannels.some(
      (channel) => channel?.type === "community" && channel?.id === post.user_id
    );
  }, [subscribedChannels, post?.user_id]);

  const loadReactions = async () => {
    const { data, error } = await supabase
      .from("video_reactions")
      .select("user_id, reaction_type")
      .eq("video_id", postId);

    if (error) {
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

    const rows = data || [];
    if (rows.length === 0) {
      setComments([]);
      return;
    }

    const userIds = [...new Set(rows.map((item) => item.user_id).filter(Boolean))];
    let profileMap = {};

    if (userIds.length > 0) {
      const { data: profileRows } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .in("id", userIds);

      (profileRows || []).forEach((profile) => {
        profileMap[profile.id] = profile;
      });
    }

    const enriched = rows.map((item) => ({
      ...item,
      profile: profileMap[item.user_id] || null
    }));

    setComments(enriched);
  };

  useEffect(() => {
    const init = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const authSession = sessionData.session || null;
      setSession(authSession);

      if (authSession?.user?.id) {
        const { data: myProfile } = await supabase
          .from("profiles")
          .select("id, full_name, avatar_url")
          .eq("id", authSession.user.id)
          .single();
        setCurrentUserProfile(myProfile || null);
      }

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
      } catch {
        // user cancelled
      }
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

  const handleSaveAction = () => {
    if (!post) return;

    setSavedVideos((prev) => {
      const exists = prev.some((item) => item?.source === "community" && item?.id === post.id);
      if (exists) {
        return prev.filter((item) => !(item?.source === "community" && item?.id === post.id));
      }

      const savedPost = {
        source: "community",
        id: post.id,
        user_id: post.user_id,
        title: post.title,
        description: post.description,
        media_url: post.media_url,
        media_type: post.media_type,
        created_at: post.created_at,
        profile: {
          id: uploader?.id || post.user_id,
          full_name: uploader?.full_name || "Community Member",
          avatar_url: uploader?.avatar_url || null
        }
      };

      return [...prev, savedPost];
    });
  };

  const handleSubscribeAction = () => {
    if (!post?.user_id) return;

    setSubscribedChannels((prev) => {
      const exists = prev.some(
        (channel) => channel?.type === "community" && channel?.id === post.user_id
      );

      if (exists) {
        return prev.filter(
          (channel) => !(channel?.type === "community" && channel?.id === post.user_id)
        );
      }

      return [
        ...prev,
        {
          id: post.user_id,
          name: uploader?.full_name || "Community Member",
          image: uploader?.avatar_url || profile_pic,
          type: "community"
        }
      ];
    });
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

  // Helper: renders a real photo or an initials circle
  const AvatarOrInitials = ({ avatarUrl, name, className = "user-profile-img" }) => {
    if (avatarUrl) {
      return <img src={avatarUrl} alt={name} className={className} />;
    }
    const initial = name ? name.trim().charAt(0).toUpperCase() : "?";
    return (
      <span className={`comment-initial-avatar ${className}`} aria-label={name}>
        {initial}
      </span>
    );
  };

  const currentUserName = currentUserProfile?.full_name || (session ? "Me" : "");
  const currentUserAvatar = currentUserProfile?.avatar_url || null;

  return (
    <div className="playvideo-container">
      <div className="main-content">
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
              <span onClick={() => handleReact("like")} className={reaction === "like" ? "active-like" : ""}>
                <img src={like_icon} alt="like" /> {counts.like}
              </span>
              <span onClick={() => handleReact("dislike")} className={reaction === "dislike" ? "active-dislike" : ""}>
                <img src={dislike_icon} alt="dislike" />
              </span>
              <span onClick={handleShare}>
                <img src={share_icon} alt="share" /> Share
              </span>
              <span onClick={handleSaveAction} className={isSaved ? "active-save" : ""}>
                <img src={save_icon} alt="save" /> {isSaved ? "Saved" : "Save"}
              </span>
            </div>
          </div>

          <hr />

          <div className="publisher">
            {uploaderAvatar ? (
              <img src={uploaderAvatar} alt={uploaderName} />
            ) : (
              <span className="post-avatar-placeholder">{uploaderName.charAt(0).toUpperCase()}</span>
            )}
            <div>
              <p>{uploaderName}</p>
              <span>Community creator</span>
            </div>
            <button onClick={handleSubscribeAction} className={isSubscribed ? "subscribed" : ""}>
              {isSubscribed ? "Subscribed" : "Subscribe"}
            </button>
          </div>

          <div className="description">
            <p>{post.description?.trim() || "No description provided by the uploader."}</p>
          </div>

          <hr />

          <div className="add-comment-section">
            <AvatarOrInitials avatarUrl={currentUserAvatar} name={currentUserName} className="user-profile-img" />
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
            const commenterName = comment?.profile?.full_name || (isMyComment ? (currentUserName || "You") : "Guest");
            const commenterAvatar = comment?.profile?.avatar_url || null;

            return (
              <div key={comment.id} className="comment-block">
                <div className="comment">
                  <AvatarOrInitials avatarUrl={commenterAvatar} name={commenterName} />
                  <div className="comment-body">
                    <h3>
                      <span>
                        {commenterName}
                        <small>{moment(comment.created_at).fromNow()}</small>
                      </span>
                      {isMyComment && (
                        <button
                          className="delete-comment"
                          disabled={deletingCommentId === comment.id}
                          onClick={() => handleDeleteComment(comment.id)}
                        >
                          {deletingCommentId === comment.id ? "..." : "Delete"}
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

      <div className="recommended-section">
        <Recommended categoryId="10" />
      </div>

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
              <button className="share-item share-copy" onClick={() => copyToClipboard(shareUrl)}>
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
