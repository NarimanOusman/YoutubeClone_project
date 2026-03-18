import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CheckCircle2, Clapperboard, MoreHorizontal, Pencil, Save, Trash2, UploadCloud, X } from "lucide-react";
import { supabase } from "../../supabaseClient";
import ConfirmDialog from "../../Components/ConfirmDialog/ConfirmDialog";
import VideoRecorder from "../../Components/VideoRecorder/VideoRecorder";
import "./MyPosts.css";

const MyPosts = () => {
  const [session, setSession] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState("");
  const [postToDelete, setPostToDelete] = useState(null);
  const [editingPostId, setEditingPostId] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);
  const [videoFile, setVideoFile] = useState(null);
  const [videoTitle, setVideoTitle] = useState("");
  const [videoDescription, setVideoDescription] = useState("");
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [showRecorder, setShowRecorder] = useState(false);
  const uploadCardRef = useRef(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const fetchMyPosts = async (userId) => {
    const { data, error } = await supabase
      .from("videos")
      .select("id, title, description, media_url, media_type, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching posts:", error);
      return;
    }

    setPosts(data || []);
  };

  useEffect(() => {
    const init = async () => {
      const { data: authData } = await supabase.auth.getSession();
      const currentSession = authData.session;

      if (!currentSession) {
        navigate("/login");
        return;
      }

      setSession(currentSession);
      await fetchMyPosts(currentSession.user.id);
      setLoading(false);
    };

    init();
  }, [navigate]);

  // Slide-up animation: re-triggers every time the upload card enters the viewport
  useEffect(() => {
    const card = uploadCardRef.current;
    if (!card) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          card.classList.add("slide-up-in");
        } else {
          card.classList.remove("slide-up-in");
        }
      },
      { threshold: 0.05 }
    );
    observer.observe(card);
    return () => observer.disconnect();
  }, []);

  // Close 3-dot menu when clicking anywhere outside
  useEffect(() => {
    if (!openMenuId) return;
    const close = () => setOpenMenuId(null);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [openMenuId]);

  useEffect(() => {
    if (!editingPostId) return undefined;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [editingPostId]);

  const handleVideoUpload = async () => {
    if (!videoFile || !videoTitle) {
      alert("Please select a video and enter a title");
      return;
    }

    if (!session?.user?.id) {
      alert("You are not logged in. Please sign in again and retry.");
      return;
    }

    setUploadingVideo(true);
    try {
      const fileExt = videoFile.name.split(".").pop();
      const fileName = `${session.user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("videos")
        .upload(fileName, videoFile, {
          contentType: videoFile.type
        });

      if (uploadError) {
        uploadError.message = `Storage upload failed: ${uploadError.message}`;
        throw uploadError;
      }

      const { data } = supabase.storage
        .from("videos")
        .getPublicUrl(fileName);

      const { error: dbError } = await supabase
        .from("videos")
        .insert({
          user_id: session.user.id,
          title: videoTitle.trim(),
          description: videoDescription.trim(),
          media_url: data.publicUrl,
          media_type: "video",
          comments_disabled: false
        });

      if (dbError) {
        dbError.message = `Database insert failed: ${dbError.message}`;
        throw dbError;
      }

      setVideoFile(null);
      setVideoTitle("");
      setVideoDescription("");
      setUploadSuccess({
        title: videoTitle.trim(),
        description: videoDescription.trim(),
        createdAt: new Date().toISOString()
      });
      if (fileInputRef.current) fileInputRef.current.value = "";
      await fetchMyPosts(session.user.id);
    } catch (error) {
      console.error("Video upload failed:", error);
      const details = [error.message, error.details, error.hint, error.code]
        .filter(Boolean)
        .join(" | ");
      alert(`Error uploading video: ${details}`);
    } finally {
      setUploadingVideo(false);
    }
  };

  const removeFromStorage = async (mediaUrl) => {
    const splitToken = "/storage/v1/object/public/videos/";
    if (!mediaUrl.includes(splitToken)) return;

    const objectPath = decodeURIComponent(mediaUrl.split(splitToken)[1]?.split("?")[0] || "");
    if (!objectPath) return;

    await supabase.storage.from("videos").remove([objectPath]);
  };

  const handleDelete = async (post) => {
    setDeletingId(post.id);

    try {
      await removeFromStorage(post.media_url);

      const { error } = await supabase
        .from("videos")
        .delete()
        .eq("id", post.id)
        .eq("user_id", session.user.id);

      if (error) throw error;

      setPosts((prev) => prev.filter((item) => item.id !== post.id));
    } catch (error) {
      alert(`Failed to delete post: ${error.message}`);
    } finally {
      setDeletingId("");
    }
  };

  const startEdit = (post) => {
    setEditingPostId(post.id);
    setEditTitle(post.title || "");
    setEditDescription(post.description || "");
  };

  const cancelEdit = () => {
    setEditingPostId("");
    setEditTitle("");
    setEditDescription("");
  };

  const saveEdit = async () => {
    if (!editingPostId) return;

    const trimmedTitle = editTitle.trim();
    if (!trimmedTitle) {
      alert("Title is required.");
      return;
    }

    setSavingEdit(true);

    try {
      const { error } = await supabase
        .from("videos")
        .update({
          title: trimmedTitle,
          description: editDescription.trim()
        })
        .eq("id", editingPostId)
        .eq("user_id", session.user.id);

      if (error) throw error;

      setPosts((prev) => prev.map((item) => (
        item.id === editingPostId
          ? { ...item, title: trimmedTitle, description: editDescription.trim() }
          : item
      )));

      cancelEdit();
    } catch (error) {
      alert(`Failed to update post: ${error.message}`);
    } finally {
      setSavingEdit(false);
    }
  };

  const handleRecordingComplete = (blob) => {
    const file = new File([blob], `recording-${Date.now()}.webm`, {
      type: 'video/webm',
    });
    setVideoFile(file);
    setShowRecorder(false);
    // Optionally auto-set a title for recorded videos
    if (!videoTitle.trim()) {
      setVideoTitle("My Recording");
    }
  };

  return (
    <div className="my-posts-page">
      <div className="my-posts-header">
        <h1>My Posts</h1>
        <p>Manage your uploaded videos and images.</p>
      </div>

      <div className="my-posts-upload-card" ref={uploadCardRef}>
        <div className="my-posts-upload-header">
          <h3>Upload New Video</h3>
          <p>Share a clear title and description so viewers know what your video is about.</p>
        </div>
        <div className="my-posts-upload-form">
          <div className="my-posts-field">
            <label htmlFor="upload-title">Title</label>
            <input
              id="upload-title"
              type="text"
              value={videoTitle}
              onChange={(e) => setVideoTitle(e.target.value)}
              placeholder="Enter a clear video title"
              className="my-posts-input"
            />
          </div>
          <div className="my-posts-field">
            <label htmlFor="upload-file">Video File</label>
            <input
              id="upload-file"
              ref={fileInputRef}
              type="file"
              accept="video/*"
              onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
              className="my-posts-input"
            />
          </div>
          <div className="my-posts-field my-posts-field-full">
            <label htmlFor="upload-desc">Description <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0, color: '#9ca3af' }}>(shown on the video page)</span></label>
            <textarea
              id="upload-desc"
              value={videoDescription}
              onChange={(e) => setVideoDescription(e.target.value)}
              placeholder="Tell viewers what this video is about…"
              className="my-posts-input my-posts-textarea"
              rows={4}
              maxLength={600}
            />
          </div>
          <div className="my-posts-upload-meta">
            <span style={{ color: videoDescription.trim().length > 550 ? '#cc0000' : undefined }}>
              {videoDescription.trim().length}/600
            </span>
            <span>{videoFile ? videoFile.name : "No file selected"}</span>
          </div>
          <div className="my-posts-upload-actions">
            <button
              onClick={handleVideoUpload}
              disabled={uploadingVideo || !videoFile || !videoTitle.trim()}
              className="my-posts-upload-btn"
            >
              <UploadCloud size={18} />
              {uploadingVideo ? "Posting video..." : "Post Video"}
            </button>
            <button
              onClick={() => setShowRecorder(true)}
              className="my-posts-record-btn"
            >
              <Clapperboard size={18} />
              Record Video
            </button>
          </div>
        </div>
      </div>

      {showRecorder && (
        <VideoRecorder
          onRecordingComplete={handleRecordingComplete}
          onClose={() => setShowRecorder(false)}
        />
      )}

      {loading ? (
        <div className="my-posts-empty">Loading your posts...</div>
      ) : posts.length === 0 ? (
        <div className="my-posts-empty">
          <h3>No posts yet</h3>
          <p>Upload your first video above and it will appear here.</p>
          <Link to="/profile" className="my-posts-action">Edit Profile</Link>
        </div>
      ) : (
        <div className="my-posts-grid">
          {posts.map((post) => (
            <div className="my-post-card" key={post.id}>
              <Link to={`/post/${post.id}`} className="my-post-thumb">
                {post.media_type === "image" ? (
                  <img src={post.media_url} alt={post.title} />
                ) : (
                  <>
                    <video src={post.media_url} muted preload="metadata" />
                    <div className="my-post-play-badge"><span>▶</span></div>
                  </>
                )}
              </Link>

              <div className="my-post-content">
                <>
                  <Link to={`/post/${post.id}`} className="my-post-title">
                    {post.title}
                  </Link>
                  <p className="my-post-description">
                    {post.description?.trim() || "No description."}
                  </p>
                  <p>{new Date(post.created_at).toLocaleDateString()}</p>
                  <div className="my-post-menu-wrap">
                    <button
                      className="my-post-menu-btn"
                      aria-label="Options"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setOpenMenuId(openMenuId === post.id ? null : post.id);
                      }}
                    >
                      <MoreHorizontal size={16} />
                    </button>
                    {openMenuId === post.id && (
                      <div className="my-post-menu-dropdown">
                        <button
                          className="menu-item menu-item-edit"
                          onClick={(e) => { e.stopPropagation(); setOpenMenuId(null); startEdit(post); }}
                        >
                          <Pencil size={13} /> Edit
                        </button>
                        <button
                          className="menu-item menu-item-delete"
                          disabled={deletingId === post.id}
                          onClick={(e) => { e.stopPropagation(); setOpenMenuId(null); setPostToDelete(post); }}
                        >
                          <Trash2 size={13} />
                          {deletingId === post.id ? "Deleting…" : "Delete"}
                        </button>
                      </div>
                    )}
                  </div>
                </>
              </div>
            </div>
          ))}
        </div>
      )}

      {editingPostId && (
        <div className="edit-modal-overlay" onClick={cancelEdit}>
          <div className="edit-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="edit-modal-header">
              <div>
                <h3>Update Video</h3>
                <p>Edit the title and description for this post.</p>
              </div>
              <button
                type="button"
                className="edit-modal-close"
                onClick={cancelEdit}
                aria-label="Close update window"
              >
                <X size={18} />
              </button>
            </div>

            <div className="edit-modal-body">
              <label className="edit-modal-field">
                <span>Title</span>
                <input
                  className="post-edit-input edit-modal-input"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="Post title"
                />
              </label>

              <label className="edit-modal-field">
                <span>Description</span>
                <textarea
                  className="post-edit-textarea edit-modal-textarea"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="Post description"
                  rows={5}
                  maxLength={600}
                />
              </label>

              <div className="edit-modal-meta">
                <span style={{ color: editDescription.trim().length > 550 ? "#cc0000" : undefined }}>
                  {editDescription.trim().length}/600
                </span>
              </div>
            </div>

            <div className="edit-modal-actions">
              <button type="button" className="ghost-post-btn" disabled={savingEdit} onClick={cancelEdit}>
                <X size={16} /> Cancel
              </button>
              <button type="button" className="edit-post-btn edit-modal-save-btn" disabled={savingEdit} onClick={saveEdit}>
                <Save size={16} />
                {savingEdit ? "Updating..." : "Update"}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(postToDelete)}
        title="Delete This Post?"
        message="Do you want to delete this post? This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        loading={Boolean(postToDelete && deletingId === postToDelete.id)}
        onCancel={() => {
          if (!deletingId) setPostToDelete(null);
        }}
        onConfirm={async () => {
          if (!postToDelete) return;
          await handleDelete(postToDelete);
          setPostToDelete(null);
        }}
      />

      {uploadSuccess && (
        <div className="upload-success-overlay" onClick={() => setUploadSuccess(null)}>
          <div className="upload-success-modal" onClick={(e) => e.stopPropagation()}>
            <div className="upload-success-icon">
              <CheckCircle2 size={34} />
            </div>
            <h3>Video published</h3>
            <p className="upload-success-subtitle">Your video is now live and ready for viewers.</p>
            <div className="upload-success-summary">
              <p><strong>Title:</strong> {uploadSuccess.title}</p>
              <p><strong>Description:</strong> {uploadSuccess.description || "No description added"}</p>
            </div>
            <div className="upload-success-actions">
              <button
                type="button"
                className="upload-success-btn secondary"
                onClick={() => setUploadSuccess(null)}
              >
                Close
              </button>
              <button
                type="button"
                className="upload-success-btn primary"
                onClick={() => {
                  setUploadSuccess(null);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyPosts;
