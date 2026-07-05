/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { motion, AnimatePresence } from "motion/react";
import { 
  HeartIcon, CommentIcon, BookmarkIcon, ShareIcon, MoreIcon, 
  PlusIcon, VerifiedIcon, CloseIcon 
} from "../components/icons";
import { Post, User } from "../types";

export const Home: React.FC = () => {
  const { 
    currentUser, posts, users, stories, savedPosts,
    handleLikePost, handleSavePost, handleCreateComment,
    setSelectedPostId, setSelectedUsername, setSelectedStoryUserId,
    handleCreateStory, handleReport
  } = useApp();

  const [feedTab, setFeedTab] = useState<"recommended" | "latest" | "trending">("recommended");
  const [newCommentText, setNewCommentText] = useState<{ [postId: string]: string }>({});
  const [showStoryUpload, setShowStoryUpload] = useState(false);
  const [storyMediaUrl, setStoryMediaUrl] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  // Group stories by userId
  const uniqueStoryUsers = Array.from(new Set(stories.map(s => s.userId)));

  // Filter posts based on tab
  const getFilteredPosts = () => {
    const unarchived = posts.filter(p => !p.isArchived);
    switch (feedTab) {
      case "latest":
        return [...unarchived].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      case "trending":
        return [...unarchived].sort((a, b) => (b.likesCount + b.commentsCount) - (a.likesCount + a.commentsCount));
      case "recommended":
      default:
        // personalized: verified accounts first or highly liked
        return [...unarchived].sort((a, b) => {
          const aAuthor = users.find(u => u.uid === a.authorId);
          const bAuthor = users.find(u => u.uid === b.authorId);
          if (aAuthor?.isVerified && !bAuthor?.isVerified) return -1;
          if (!aAuthor?.isVerified && bAuthor?.isVerified) return 1;
          return b.likesCount - a.likesCount;
        });
    }
  };

  const filteredPosts = getFilteredPosts();

  const handlePostCommentSubmit = (e: React.FormEvent, postId: string) => {
    e.preventDefault();
    const txt = newCommentText[postId];
    if (!txt?.trim()) return;
    handleCreateComment(postId, txt.trim());
    setNewCommentText(prev => ({ ...prev, [postId]: "" }));
  };

  const handleStoryPublish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!storyMediaUrl.trim()) return;
    handleCreateStory(storyMediaUrl.trim(), "image");
    setStoryMediaUrl("");
    setShowStoryUpload(false);
    alert("Story shared! Active for 24 hours.");
  };

  const triggerRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  return (
    <div className="max-w-2xl mx-auto py-5 px-4 space-y-6 pb-24 md:pb-12">
      
      {/* STORIES ROW */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-4 flex items-center space-x-4 overflow-x-auto shadow-sm no-scrollbar transition-colors">
        {/* Current User Add Story Ring */}
        {currentUser && (
          <div className="flex flex-col items-center space-y-1 flex-shrink-0 cursor-pointer">
            <div 
              onClick={() => setShowStoryUpload(true)}
              className="relative h-14 w-14 rounded-full p-0.5 bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700"
            >
              <img 
                src={currentUser.photoURL} 
                alt="My profile"
                className="h-12 w-12 rounded-full object-cover"
              />
              <span className="absolute bottom-0 right-0 h-5.5 w-5.5 bg-indigo-500 rounded-full flex items-center justify-center text-white border-2 border-white dark:border-slate-900 text-xs font-bold shadow-md">
                +
              </span>
            </div>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">Your Story</span>
          </div>
        )}

        {/* Story Circles */}
        {uniqueStoryUsers.map(uid => {
          const user = users.find(u => u.uid === uid);
          if (!user || user.uid === currentUser?.uid) return null;
          return (
            <div 
              key={uid} 
              onClick={() => setSelectedStoryUserId(uid)}
              className="flex flex-col items-center space-y-1 flex-shrink-0 cursor-pointer group"
            >
              <div className="h-14 w-14 rounded-full p-[2.5px] bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center transition-transform group-hover:scale-105 active:scale-95 shadow-md shadow-purple-500/10">
                <div className="bg-white dark:bg-slate-900 p-0.5 rounded-full h-full w-full">
                  <img 
                    src={user.photoURL} 
                    alt={user.username}
                    className="h-full w-full rounded-full object-cover"
                  />
                </div>
              </div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold truncate max-w-[65px]">
                {user.username}
              </span>
            </div>
          );
        })}

        {uniqueStoryUsers.length === 0 && (
          <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium py-3 pl-2">
            No active stories. Click your avatar to create one!
          </p>
        )}
      </div>

      {/* FEED SUB-TABS */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-2.5">
        <div className="flex space-x-5 text-xs font-bold">
          {(["recommended", "latest", "trending"] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setFeedTab(tab)}
              className={`pb-2.5 capitalize transition-all relative ${
                feedTab === tab 
                  ? "text-indigo-600 dark:text-indigo-400 font-black" 
                  : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              }`}
            >
              {tab}
              {feedTab === tab && (
                <motion.div 
                  layoutId="feedTabBorder" 
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 dark:bg-indigo-400" 
                />
              )}
            </button>
          ))}
        </div>

        {/* Pull to refresh icon */}
        <button 
          onClick={triggerRefresh}
          className={`p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm text-slate-500 dark:text-slate-400 hover:text-indigo-500 transition-colors ${refreshing ? "animate-spin text-indigo-500" : ""}`}
          title="Refresh Feed"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.228 8h-2.78" />
          </svg>
        </button>
      </div>

      {/* POST CARDS */}
      <div className="space-y-6">
        <AnimatePresence mode="popLayout">
          {refreshing ? (
            <div className="py-20 text-center space-y-3">
              <div className="inline-block h-6 w-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider">Syncing Pixora feed...</p>
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 p-12 text-center rounded-2xl border border-slate-100 dark:border-slate-800/80">
              <p className="text-sm text-slate-500 dark:text-slate-400">Your feed is currently empty.</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Create a post or follow some creators to fill your wall!</p>
            </div>
          ) : (
            filteredPosts.map((post) => {
              const author = users.find(u => u.uid === post.authorId) || {
                username: "unknown",
                displayName: "Unknown Creator",
                photoURL: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
                isVerified: false
              };
              const isLiked = savedPosts.includes(`liked_${post.id}`);
              const isSaved = savedPosts.includes(post.id);

              return (
                <motion.article 
                  key={post.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl shadow-sm overflow-hidden transition-colors"
                >
                  {/* Card Header */}
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <img 
                        src={author.photoURL} 
                        alt={author.displayName}
                        className="w-10 h-10 rounded-full object-cover cursor-pointer hover:opacity-85 border border-slate-100 dark:border-slate-800"
                        onClick={() => setSelectedUsername(author.username)}
                      />
                      <div>
                        <div className="flex items-center space-x-1">
                          <span 
                            className="text-xs font-bold text-slate-800 dark:text-slate-100 cursor-pointer hover:underline"
                            onClick={() => setSelectedUsername(author.username)}
                          >
                            {author.username}
                          </span>
                          {author.isVerified && <VerifiedIcon size={14} />}
                        </div>
                        {post.location && (
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center">
                            📍 {post.location}
                          </span>
                        )}
                      </div>
                    </div>

                    <button 
                      onClick={() => setSelectedPostId(post.id)}
                      className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      <MoreIcon size={18} />
                    </button>
                  </div>

                  {/* Card Media (double click to like) */}
                  <div 
                    onDoubleClick={() => handleLikePost(post.id)}
                    className="aspect-square bg-slate-50 dark:bg-slate-950/40 relative overflow-hidden flex items-center justify-center cursor-pointer group"
                  >
                    {post.mediaType === "video" ? (
                      <video 
                        src={post.mediaUrls[0]} 
                        className="w-full h-full object-cover" 
                        muted 
                        loop 
                        playsInline
                        autoPlay
                      />
                    ) : (
                      <img 
                        src={post.mediaUrls[0]} 
                        alt="Media content"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                      />
                    )}

                    {/* Double-tap heart burst effect */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:active:opacity-100 active:scale-125 transition-all pointer-events-none duration-200">
                      <svg className="h-20 w-20 text-white/95 filter drop-shadow-lg" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                      </svg>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <button onClick={() => handleLikePost(post.id)}>
                          <HeartIcon filled={isLiked} className={isLiked ? "text-rose-500 scale-105" : "text-slate-500 dark:text-slate-400 hover:scale-105"} />
                        </button>
                        <button onClick={() => setSelectedPostId(post.id)}>
                          <CommentIcon className="text-slate-500 dark:text-slate-400 hover:scale-105" />
                        </button>
                        <button onClick={() => {
                          navigator.clipboard.writeText(`${window.location.origin}/#/post/${post.id}`);
                          alert("Link copied! Share it with your community.");
                        }}>
                          <ShareIcon className="text-slate-500 dark:text-slate-400 hover:scale-105" />
                        </button>
                      </div>
                      <button onClick={() => handleSavePost(post.id)}>
                        <BookmarkIcon filled={isSaved} className="text-slate-500 dark:text-slate-400 hover:scale-105" />
                      </button>
                    </div>

                    {/* Likes & Caption */}
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {post.likesCount.toLocaleString()} likes
                      </p>
                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                        <span 
                          className="font-bold mr-1.5 text-slate-900 dark:text-slate-50 cursor-pointer hover:underline"
                          onClick={() => setSelectedUsername(author.username)}
                        >
                          {author.username}
                        </span>
                        {post.caption}
                      </p>
                    </div>

                    {/* View all comments link */}
                    {post.commentsCount > 0 && (
                      <button 
                        onClick={() => setSelectedPostId(post.id)}
                        className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 hover:underline pt-0.5 block"
                      >
                        View all {post.commentsCount} comments
                      </button>
                    )}

                    {/* Quick comment input */}
                    {currentUser && (
                      <form 
                        onSubmit={(e) => handlePostCommentSubmit(e, post.id)} 
                        className="flex items-center space-x-2 pt-2 border-t border-slate-50 dark:border-slate-800/60"
                      >
                        <input 
                          type="text"
                          placeholder="Add a comment..."
                          value={newCommentText[post.id] || ""}
                          onChange={(e) => setNewCommentText(p => ({ ...p, [post.id]: e.target.value }))}
                          className="flex-1 text-xs bg-transparent border-0 outline-none placeholder-slate-400 dark:text-slate-100"
                        />
                        <button 
                          type="submit"
                          disabled={!newCommentText[post.id]?.trim()}
                          className="text-xs font-bold text-indigo-500 hover:text-indigo-600 disabled:opacity-40"
                        >
                          Post
                        </button>
                      </form>
                    )}
                  </div>
                </motion.article>
              );
            })
          )}
        </AnimatePresence>
      </div>

      {/* STORY CREATION MODAL OVERLAY */}
      {showStoryUpload && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl w-full max-w-md p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Publish to your Story</h3>
              <button onClick={() => setShowStoryUpload(false)} className="p-1">
                <CloseIcon size={20} className="text-slate-400" />
              </button>
            </div>
            
            <form onSubmit={handleStoryPublish} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 dark:text-slate-500">Story Image URL</label>
                <input 
                  type="url" 
                  required
                  placeholder="Paste a photo URL (active for 24h)"
                  value={storyMediaUrl}
                  onChange={(e) => setStoryMediaUrl(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-xl outline-none focus:ring-1 focus:ring-indigo-500 dark:text-slate-100"
                />
              </div>

              {storyMediaUrl.trim() && (
                <div className="h-44 w-full rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800">
                  <img src={storyMediaUrl} alt="Preview" className="h-full w-full object-cover" />
                </div>
              )}

              <button 
                type="submit"
                className="w-full bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-bold py-2.5 rounded-xl text-xs shadow-md shadow-indigo-500/20"
              >
                Post Story
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
