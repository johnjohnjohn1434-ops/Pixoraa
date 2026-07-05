/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { motion, AnimatePresence } from "motion/react";
import { 
  HeartIcon, CommentIcon, BookmarkIcon, ShareIcon, CloseIcon, 
  VerifiedIcon, BackIcon, FlagIcon, MoreIcon, TrashIcon 
} from "./icons";
import { Post, Comment, Story, User } from "../types";

// Helper to format date
const formatTimeAgo = (dateString: string) => {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHr / 24);

  if (diffSec < 60) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  return `${diffDays}d ago`;
};

// ==========================================
// 1. POST DETAIL MODAL
// ==========================================
export const PostDetailModal: React.FC = () => {
  const { 
    selectedPostId, setSelectedPostId, posts, comments, users, currentUser,
    handleLikePost, handleSavePost, handleCreateComment, handleDeleteComment,
    savedPosts, setSelectedUsername, handleReport, handleDeletePost
  } = useApp();

  const [commentText, setCommentText] = useState("");
  const [showReport, setShowReport] = useState(false);
  const [reportReason, setReportReason] = useState<any>("Spam");
  const [reportDesc, setReportDesc] = useState("");

  if (!selectedPostId) return null;

  const post = posts.find(p => p.id === selectedPostId);
  if (!post) return null;

  const author = users.find(u => u.uid === post.authorId) || {
    uid: post.authorId,
    username: "unknown",
    displayName: "Unknown User",
    photoURL: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
    isVerified: false
  };

  const postComments = comments.filter(c => c.postId === post.id);
  const isLiked = savedPosts.includes(`liked_${post.id}`);
  const isSaved = savedPosts.includes(post.id);

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    handleCreateComment(post.id, commentText.trim());
    setCommentText("");
  };

  const handleUsernameClick = (username: string) => {
    setSelectedUsername(username);
    setSelectedPostId(null);
  };

  const handleReportPostSubmit = () => {
    handleReport(post.id, "post", reportReason, reportDesc);
    setShowReport(false);
    setReportDesc("");
    alert("Thank you. Post report submitted for moderation review.");
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden w-full max-w-5xl h-[85vh] sm:h-[80vh] flex flex-col md:flex-row shadow-2xl relative"
      >
        {/* Close Button */}
        <button 
          onClick={() => setSelectedPostId(null)}
          className="absolute top-4 right-4 z-10 p-2 bg-black/40 text-white rounded-full hover:bg-black/60 transition-colors"
        >
          <CloseIcon size={20} />
        </button>

        {/* Media Box */}
        <div className="md:w-3/5 bg-black flex items-center justify-center relative group min-h-[35%] md:min-h-0">
          {post.mediaType === "video" ? (
            <video 
              src={post.mediaUrls[0]} 
              controls 
              autoPlay 
              loop
              className="w-full h-full object-contain"
            />
          ) : (
            <img 
              src={post.mediaUrls[0]} 
              alt="Post Content" 
              className="w-full h-full object-contain"
            />
          )}
          {post.location && (
            <div className="absolute bottom-4 left-4 bg-black/60 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-sm">
              📍 {post.location}
            </div>
          )}
        </div>

        {/* Info & Comments Panel */}
        <div className="md:w-2/5 flex flex-col h-[65%] md:h-full border-l border-slate-100 dark:border-slate-800">
          {/* Header */}
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img 
                src={author.photoURL} 
                alt={author.displayName}
                className="w-10 h-10 rounded-full object-cover cursor-pointer hover:opacity-85"
                onClick={() => handleUsernameClick(author.username)}
              />
              <div>
                <div className="flex items-center space-x-1">
                  <span 
                    className="font-semibold text-slate-800 dark:text-slate-100 cursor-pointer hover:underline text-sm"
                    onClick={() => handleUsernameClick(author.username)}
                  >
                    {author.username}
                  </span>
                  {author.isVerified && <VerifiedIcon size={14} />}
                </div>
                <p className="text-xs text-slate-400 dark:text-slate-500">{author.displayName}</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button 
                onClick={() => setShowReport(true)}
                className="text-slate-400 hover:text-rose-500 p-1.5 rounded-lg transition-colors"
                title="Report Post"
              >
                <FlagIcon size={18} />
              </button>
              {(currentUser?.role === "admin" || currentUser?.role === "superadmin" || currentUser?.uid === post.authorId) && (
                <button 
                  onClick={() => {
                    if (confirm("Are you sure you want to delete this post?")) {
                      handleDeletePost(post.id);
                      setSelectedPostId(null);
                    }
                  }}
                  className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg"
                >
                  <TrashIcon size={18} />
                </button>
              )}
            </div>
          </div>

          {/* Caption & Comments Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Post Caption as first comment */}
            <div className="flex items-start space-x-3 pb-3 border-b border-slate-50 dark:border-slate-800/50">
              <img 
                src={author.photoURL} 
                alt={author.displayName}
                className="w-8 h-8 rounded-full object-cover"
              />
              <div>
                <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
                  <span className="font-semibold mr-2 text-slate-900 dark:text-slate-50">{author.username}</span>
                  {post.caption}
                </p>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 block">
                  {formatTimeAgo(post.createdAt)}
                </span>
              </div>
            </div>

            {/* Comment Threads */}
            <div className="space-y-4">
              {postComments.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-xs text-slate-400 dark:text-slate-500">No comments yet. Start the conversation!</p>
                </div>
              ) : (
                postComments.map((comment) => {
                  const commenter = users.find(u => u.uid === comment.authorId) || {
                    username: "user",
                    photoURL: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"
                  };
                  return (
                    <div key={comment.id} className="flex items-start justify-between group">
                      <div className="flex items-start space-x-3 max-w-[85%]">
                        <img 
                          src={commenter.photoURL} 
                          alt={commenter.username}
                          className="w-8 h-8 rounded-full object-cover cursor-pointer"
                          onClick={() => handleUsernameClick(commenter.username)}
                        />
                        <div>
                          <p className="text-xs text-slate-800 dark:text-slate-200">
                            <span 
                              className="font-semibold mr-1.5 text-slate-900 dark:text-slate-100 cursor-pointer hover:underline"
                              onClick={() => handleUsernameClick(commenter.username)}
                            >
                              {commenter.username}
                            </span>
                            {comment.content}
                          </p>
                          <span className="text-[9px] text-slate-400 dark:text-slate-500 mt-1 block">
                            {formatTimeAgo(comment.createdAt)}
                          </span>
                        </div>
                      </div>
                      
                      {/* Delete comment trigger */}
                      {(currentUser?.uid === comment.authorId || currentUser?.role === "admin" || currentUser?.role === "superadmin" || currentUser?.uid === post.authorId) && (
                        <button 
                          onClick={() => handleDeleteComment(comment.id)}
                          className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-500 transition-opacity p-1"
                        >
                          <CloseIcon size={12} />
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Engagement Counts Bar */}
          <div className="p-4 bg-slate-50 dark:bg-slate-950/40 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button onClick={() => handleLikePost(post.id)}>
                  <HeartIcon filled={isLiked} className={isLiked ? "text-rose-500" : "text-slate-500 dark:text-slate-400 hover:scale-105"} />
                </button>
                <button>
                  <CommentIcon className="text-slate-500 dark:text-slate-400 hover:scale-105" />
                </button>
                <button onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/#/post/${post.id}`);
                  alert("Post link copied to clipboard!");
                }}>
                  <ShareIcon className="text-slate-500 dark:text-slate-400 hover:scale-105" />
                </button>
              </div>
              <button onClick={() => handleSavePost(post.id)}>
                <BookmarkIcon filled={isSaved} className="text-slate-500 dark:text-slate-400 hover:scale-105" />
              </button>
            </div>
            
            <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              {post.likesCount.toLocaleString()} likes
            </div>
            <div className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              {new Date(post.createdAt).toLocaleDateString()}
            </div>
          </div>

          {/* Comment Form Input */}
          <form onSubmit={handleSubmitComment} className="p-3 border-t border-slate-100 dark:border-slate-800 flex items-center space-x-2">
            <input 
              type="text" 
              placeholder="Add a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-950/50 border-0 focus:ring-1 focus:ring-indigo-500 rounded-xl text-xs dark:text-slate-100 outline-none"
            />
            <button 
              type="submit" 
              disabled={!commentText.trim()}
              className="text-xs font-semibold text-indigo-500 hover:text-indigo-600 disabled:opacity-50 px-2.5"
            >
              Post
            </button>
          </form>
        </div>
      </motion.div>

      {/* Safety Report Overlay Overlay */}
      {showReport && (
        <div className="fixed inset-0 bg-black/65 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl p-5 w-full max-w-md shadow-xl border border-slate-100 dark:border-slate-800">
            <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100 mb-3">Report this content</h3>
            <label className="text-xs text-slate-500 dark:text-slate-400 mb-1.5 block">Select violation reason</label>
            <select 
              value={reportReason} 
              onChange={(e) => setReportReason(e.target.value as any)}
              className="w-full text-xs p-2.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg dark:text-slate-100 outline-none mb-3"
            >
              <option value="Spam">Spam</option>
              <option value="Fake Account">Fake Account</option>
              <option value="Nudity">Nudity</option>
              <option value="Violence">Violence</option>
              <option value="Hate Speech">Hate Speech</option>
              <option value="Harassment">Harassment</option>
              <option value="Scam">Scam</option>
              <option value="Copyright">Copyright</option>
              <option value="Other">Other</option>
            </select>
            
            <label className="text-xs text-slate-500 dark:text-slate-400 mb-1.5 block">Provide optional details</label>
            <textarea 
              value={reportDesc}
              onChange={(e) => setReportDesc(e.target.value)}
              placeholder="Provide context for our moderators..."
              className="w-full text-xs p-2.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg dark:text-slate-100 outline-none h-20 mb-4 resize-none"
            />
            
            <div className="flex space-x-3 justify-end">
              <button 
                onClick={() => setShowReport(false)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg text-xs hover:opacity-90"
              >
                Cancel
              </button>
              <button 
                onClick={handleReportPostSubmit}
                className="px-4 py-2 bg-rose-500 text-white rounded-lg text-xs font-semibold hover:bg-rose-600"
              >
                Submit Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


// ==========================================
// 2. STORY VIEWER MODAL
// ==========================================
export const StoryViewerModal: React.FC = () => {
  const { 
    selectedStoryUserId, setSelectedStoryUserId, stories, users, currentUser,
    handleLikeStory, handleViewStory, handleSendMessage, handleCreateChat
  } = useApp();

  const [activeStoryIdx, setActiveStoryIdx] = useState(0);
  const [replyText, setReplyText] = useState("");
  const [progress, setProgress] = useState(0);

  const userStories = stories.filter(s => s.userId === selectedStoryUserId);
  const storyUser = users.find(u => u.uid === selectedStoryUserId);

  useEffect(() => {
    if (!selectedStoryUserId || userStories.length === 0) return;
    
    // Log view count automatically when loaded
    const currentStory = userStories[activeStoryIdx];
    if (currentStory) {
      handleViewStory(currentStory.id);
    }

    setProgress(0);
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          handleNext();
          return 0;
        }
        return p + 1.25; // timing variable
      });
    }, 60);

    return () => clearInterval(interval);
  }, [selectedStoryUserId, activeStoryIdx]);

  if (!selectedStoryUserId || userStories.length === 0 || !storyUser) return null;

  const activeStory = userStories[activeStoryIdx];

  const handleNext = () => {
    if (activeStoryIdx < userStories.length - 1) {
      setActiveStoryIdx(prev => prev + 1);
    } else {
      setSelectedStoryUserId(null); // close stories
    }
  };

  const handlePrev = () => {
    if (activeStoryIdx > 0) {
      setActiveStoryIdx(prev => prev - 1);
    } else {
      setSelectedStoryUserId(null);
    }
  };

  const handleReplyStorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !currentUser) return;
    
    // Create direct message with story reply
    const chatId = await handleCreateChat(storyUser.uid);
    await handleSendMessage(chatId, `replied to your story: "${replyText.trim()}"`, activeStory.mediaUrl, "image");
    
    setReplyText("");
    alert(`Story reply sent to ${storyUser.displayName}'s inbox!`);
  };

  return (
    <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-0 md:p-4">
      <div className="w-full max-w-lg h-full md:h-[90vh] bg-neutral-900 rounded-none md:rounded-2xl overflow-hidden flex flex-col relative">
        
        {/* Progress Bars Row */}
        <div className="absolute top-4 left-4 right-4 z-20 flex space-x-1.5">
          {userStories.map((_, idx) => (
            <div key={idx} className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white transition-all duration-75"
                style={{ 
                  width: idx < activeStoryIdx ? "100%" : idx === activeStoryIdx ? `${progress}%` : "0%" 
                }}
              />
            </div>
          ))}
        </div>

        {/* Header Controls */}
        <div className="absolute top-8 left-4 right-4 z-20 flex items-center justify-between">
          <div className="flex items-center space-x-3 text-white">
            <img 
              src={storyUser.photoURL} 
              alt={storyUser.displayName}
              className="w-9 h-9 rounded-full object-cover border border-white/40"
            />
            <div>
              <div className="flex items-center space-x-1">
                <span className="text-xs font-semibold">{storyUser.username}</span>
                {storyUser.isVerified && <VerifiedIcon size={12} />}
              </div>
              <span className="text-[10px] text-white/60">{formatTimeAgo(activeStory.createdAt)}</span>
            </div>
          </div>

          <button 
            onClick={() => setSelectedStoryUserId(null)}
            className="p-1.5 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors"
          >
            <CloseIcon size={20} />
          </button>
        </div>

        {/* Media Window */}
        <div className="flex-1 bg-black flex items-center justify-center relative">
          <img 
            src={activeStory.mediaUrl} 
            alt="Story Screen" 
            className="w-full h-full object-contain"
          />

          {/* Left/Right Navigation Taps */}
          <div className="absolute inset-y-0 left-0 w-1/4 cursor-pointer" onClick={handlePrev} />
          <div className="absolute inset-y-0 right-0 w-1/4 cursor-pointer" onClick={handleNext} />
        </div>

        {/* Footer Interaction */}
        {currentUser && (
          <div className="p-4 bg-gradient-to-t from-black/80 to-transparent z-10 flex items-center space-x-3.5 border-t border-white/5">
            <form onSubmit={handleReplyStorySubmit} className="flex-1 flex bg-white/10 rounded-full backdrop-blur-md px-4 py-2 border border-white/10">
              <input 
                type="text" 
                placeholder={`Reply to ${storyUser.username}...`}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="flex-1 bg-transparent border-0 outline-none text-white text-xs placeholder-white/50"
              />
              <button 
                type="submit" 
                disabled={!replyText.trim()}
                className="text-white hover:text-indigo-400 font-semibold text-xs disabled:opacity-50"
              >
                Send
              </button>
            </form>

            <button 
              onClick={() => handleLikeStory(activeStory.id)}
              className="text-white hover:text-rose-500 transform hover:scale-110 active:scale-95 transition-all"
            >
              <HeartIcon 
                filled={activeStory.likes?.includes(currentUser.uid)} 
                size={22} 
                className={activeStory.likes?.includes(currentUser.uid) ? "text-rose-500" : "text-white"} 
              />
            </button>
          </div>
        )}

      </div>
    </div>
  );
};


// ==========================================
// 3. CREATE POST MODAL
// ==========================================
interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreatePostModal: React.FC<CreatePostModalProps> = ({ isOpen, onClose }) => {
  const { handleCreatePost } = useApp();
  const [mediaUrl, setMediaUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [location, setLocation] = useState("");
  const [isSubmit, setIsSubmit] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mediaUrl.trim() || !caption.trim()) return;

    setIsSubmit(true);
    // Simple mock image validator
    await handleCreatePost([mediaUrl.trim()], "image", caption.trim(), location.trim() || undefined);
    
    setIsSubmit(false);
    setMediaUrl("");
    setCaption("");
    setLocation("");
    onClose();
    alert("Post shared successfully!");
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden w-full max-w-lg shadow-2xl"
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">Create new post</h2>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <CloseIcon size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Media Image URL</label>
            <input 
              type="url" 
              required
              placeholder="Paste a photo URL (e.g. Unsplash, Imgur, etc.)"
              value={mediaUrl}
              onChange={(e) => setMediaUrl(e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 dark:text-slate-100"
            />
          </div>

          {mediaUrl.trim() && (
            <div className="h-36 w-full rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 flex items-center justify-center">
              <img 
                src={mediaUrl} 
                alt="Upload preview" 
                className="h-full w-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1598128558393-70ff21433be0?w=300";
                }}
              />
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Caption</label>
            <textarea 
              required
              rows={3}
              placeholder="Write a caption... Auto-parse #hashtags"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="w-full text-xs p-3 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 resize-none dark:text-slate-100"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Location (optional)</label>
            <input 
              type="text" 
              placeholder="Add location (e.g. Paris, France)"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 dark:text-slate-100"
            />
          </div>

          <button 
            type="submit" 
            disabled={isSubmit || !mediaUrl.trim() || !caption.trim()}
            className="w-full bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-xl py-3 text-xs font-bold hover:from-indigo-600 hover:to-indigo-700 shadow-md transition-all disabled:opacity-50"
          >
            {isSubmit ? "Sharing..." : "Share Moments"}
          </button>
        </form>
      </motion.div>
    </div>
  );
};
