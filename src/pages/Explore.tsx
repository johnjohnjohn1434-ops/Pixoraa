/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { motion, AnimatePresence } from "motion/react";
import { SearchIcon, VerifiedIcon, CloseIcon, TrendingIcon } from "../components/icons";

export const Explore: React.FC = () => {
  const { 
    posts, users, setSelectedPostId, setSelectedUsername, 
    followingIds, handleFollowUser 
  } = useApp();

  const [searchQuery, setSearchQuery] = useState("");
  const [activeSearchTab, setActiveSearchTab] = useState<"all" | "accounts" | "posts">("all");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Trending tags list
  const trendingTags = ["sunrise", "coding", "nature", "uidesign", "coffee", "community"];

  // Search filter logic
  const normalizedQuery = searchQuery.trim().toLowerCase();
  
  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(normalizedQuery) ||
    u.displayName.toLowerCase().includes(normalizedQuery)
  );

  const filteredPosts = posts.filter(p => {
    if (selectedTag) {
      return p.hashtags.includes(selectedTag) && !p.isArchived;
    }
    if (normalizedQuery) {
      return (
        p.caption.toLowerCase().includes(normalizedQuery) ||
        p.hashtags.some(tag => tag.includes(normalizedQuery)) ||
        p.location?.toLowerCase().includes(normalizedQuery)
      ) && !p.isArchived;
    }
    return !p.isArchived;
  });

  const handleHashtagClick = (tag: string) => {
    setSelectedTag(tag === selectedTag ? null : tag);
    setSearchQuery(""); // Clear text search when tag selected
  };

  return (
    <div className="max-w-4xl mx-auto py-5 px-4 space-y-6 pb-24 md:pb-12">
      
      {/* SEARCH BOX HEADER */}
      <div className="relative">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400">
          <SearchIcon size={18} />
        </div>
        <input 
          type="text"
          placeholder="Search creators, hashtags, locations..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setSelectedTag(null); // Clear tag selection on type
          }}
          className="w-full text-xs pl-11 pr-10 py-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm dark:text-slate-100 transition-all"
        />
        {(searchQuery || selectedTag) && (
          <button 
            onClick={() => {
              setSearchQuery("");
              setSelectedTag(null);
            }}
            className="absolute inset-y-0 right-4 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <CloseIcon size={16} />
          </button>
        )}
      </div>

      {/* SEARCH OR HASHTAG RESULTS CONTAINER */}
      {(searchQuery || selectedTag) ? (
        <div className="space-y-6">
          {/* Sub Tab selection */}
          {!selectedTag && (
            <div className="flex space-x-4 text-xs font-bold border-b border-slate-100 dark:border-slate-800/80 pb-2">
              {(["all", "accounts", "posts"] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveSearchTab(tab)}
                  className={`capitalize pb-2 px-1 transition-colors relative ${
                    activeSearchTab === tab ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400"
                  }`}
                >
                  {tab === "all" ? "Top results" : tab}
                  {activeSearchTab === tab && (
                    <motion.div layoutId="searchTabBorder" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500" />
                  )}
                </button>
              ))}
            </div>
          )}

          {/* ACCOUNTS LISTING */}
          {(!selectedTag && (activeSearchTab === "all" || activeSearchTab === "accounts")) && (
            <div className="space-y-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
              <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                <span>Creators</span>
              </h3>
              {filteredUsers.length === 0 ? (
                <p className="text-xs text-slate-400 dark:text-slate-500 py-2">No profiles match "{searchQuery}"</p>
              ) : (
                <div className="divide-y divide-slate-50 dark:divide-slate-800/40">
                  {filteredUsers.map(user => {
                    const isFollowing = followingIds.includes(user.uid);
                    return (
                      <div key={user.uid} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
                        <div 
                          onClick={() => setSelectedUsername(user.username)}
                          className="flex items-center space-x-3 cursor-pointer group"
                        >
                          <img src={user.photoURL} className="w-10 h-10 rounded-full object-cover border border-slate-100 dark:border-slate-800" />
                          <div>
                            <div className="flex items-center space-x-1">
                              <span className="text-xs font-bold text-slate-800 dark:text-slate-100 group-hover:underline">
                                {user.username}
                              </span>
                              {user.isVerified && <VerifiedIcon size={12} />}
                            </div>
                            <span className="text-[10px] text-slate-400 dark:text-slate-500">{user.displayName}</span>
                          </div>
                        </div>

                        <button
                          onClick={() => handleFollowUser(user.uid)}
                          className={`text-[10px] font-bold px-3 py-1.5 rounded-lg transition-colors ${
                            isFollowing 
                              ? "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300" 
                              : "bg-indigo-500 hover:bg-indigo-600 text-white shadow-sm"
                          }`}
                        >
                          {isFollowing ? "Following" : "Follow"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* POSTS GRID LISTING */}
          {(activeSearchTab === "all" || activeSearchTab === "posts" || selectedTag) && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                <span>Posts</span>
                {selectedTag && <span className="text-indigo-500 lowercase">#{selectedTag}</span>}
              </h3>
              {filteredPosts.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-8 text-center rounded-2xl">
                  <p className="text-xs text-slate-400 dark:text-slate-500">No posts matched search parameters.</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  {filteredPosts.map(post => (
                    <motion.div 
                      key={post.id}
                      onClick={() => setSelectedPostId(post.id)}
                      className="aspect-square bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden cursor-pointer relative group"
                    >
                      {post.mediaType === "video" ? (
                        <video src={post.mediaUrls[0]} className="h-full w-full object-cover" muted loop />
                      ) : (
                        <img src={post.mediaUrls[0]} className="h-full w-full object-cover" />
                      )}
                      
                      {/* Overlap stats */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-4 text-white text-xs font-bold">
                        <span className="flex items-center space-x-1">
                          <span>❤️</span>
                          <span>{post.likesCount}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <span>💬</span>
                          <span>{post.commentsCount}</span>
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      ) : (
        // EXPLORE DISCOVERY DEFAULT CANVAS
        <div className="space-y-6">
          {/* Trending Categories row */}
          <div className="space-y-2">
            <h3 className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center space-x-1.5">
              <TrendingIcon size={14} className="text-rose-500" />
              <span>Trending hashtags</span>
            </h3>
            <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar py-1">
              {trendingTags.map(tag => {
                const isActive = selectedTag === tag;
                return (
                  <button
                    key={tag}
                    onClick={() => handleHashtagClick(tag)}
                    className={`text-[10px] font-bold px-3 py-2 rounded-xl transition-all border ${
                      isActive 
                        ? "bg-indigo-500 border-indigo-500 text-white shadow-md shadow-indigo-500/10" 
                        : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700"
                    }`}
                  >
                    #{tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bento-style gallery grid */}
          <div className="space-y-3">
            <h3 className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Explore Discoveries
            </h3>

            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {/* First item is large bento card */}
              {posts.filter(p => !p.isArchived).map((post, idx) => {
                // Alternating sizing bento grid
                const isLarge = idx === 0 || idx === 7;
                return (
                  <motion.div
                    key={post.id}
                    onClick={() => setSelectedPostId(post.id)}
                    className={`aspect-square ${isLarge ? "col-span-2 row-span-2" : ""} bg-slate-100 dark:bg-slate-850 rounded-2xl overflow-hidden cursor-pointer relative group shadow-sm`}
                  >
                    {post.mediaType === "video" ? (
                      <video src={post.mediaUrls[0]} className="h-full w-full object-cover" muted loop playsInline autoPlay />
                    ) : (
                      <img src={post.mediaUrls[0]} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
                    )}

                    {/* Overlay stats */}
                    <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-5 text-white text-xs font-black">
                      <span className="flex items-center space-x-1.5">
                        <span>❤️</span>
                        <span>{post.likesCount}</span>
                      </span>
                      <span className="flex items-center space-x-1.5">
                        <span>💬</span>
                        <span>{post.commentsCount}</span>
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
