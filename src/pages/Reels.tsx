/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { motion, AnimatePresence } from "motion/react";
import { 
  HeartIcon, CommentIcon, ShareIcon, BookmarkIcon, FlagIcon, VerifiedIcon 
} from "../components/icons";

export const Reels: React.FC = () => {
  const { 
    reels, users, currentUser, handleLikeReel, handleSavePost, 
    handleFollowUser, followingIds, handleReport, setSelectedUsername, savedPosts 
  } = useApp();

  const [activeIdx, setActiveIdx] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Scroll detection to update active idx and toggle play states
  const handleScroll = () => {
    if (!containerRef.current) return;
    const scrollPos = containerRef.current.scrollTop;
    const height = containerRef.current.clientHeight;
    const newIdx = Math.round(scrollPos / height);
    if (newIdx !== activeIdx && newIdx >= 0 && newIdx < reels.length) {
      setActiveIdx(newIdx);
    }
  };

  // Safe report triggers
  const [showReport, setShowReport] = useState(false);
  const [reportReason, setReportReason] = useState<any>("Spam");

  const triggerReelReport = (reelId: string) => {
    handleReport(reelId, "reel", reportReason);
    setShowReport(false);
    alert("Reel reported for administrative investigation.");
  };

  return (
    <div className="h-screen w-full bg-black flex justify-center items-center relative overflow-hidden">
      
      {/* VERTICAL SCROLL WRAPPER */}
      <div 
        ref={containerRef}
        onScroll={handleScroll}
        className="h-full w-full max-w-md overflow-y-scroll snap-y snap-mandatory no-scrollbar bg-neutral-950 shadow-2xl relative"
        style={{ scrollSnapType: "y mandatory" }}
      >
        {reels.map((reel, idx) => {
          const author = users.find(u => u.uid === reel.authorId) || {
            uid: reel.authorId,
            username: "unknown",
            displayName: "Unknown Artist",
            photoURL: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
            isVerified: false
          };

          const isActive = idx === activeIdx;
          const isLiked = savedPosts.includes(`liked_reel_${reel.id}`);
          const isSaved = savedPosts.includes(`saved_reel_${reel.id}`);
          const isFollowing = followingIds.includes(author.uid);

          return (
            <div 
              key={reel.id}
              className="h-full w-full snap-start snap-always relative flex items-center justify-center bg-black flex-shrink-0"
              style={{ height: "100vh" }}
            >
              {/* VIDEO COMPONENT */}
              <video 
                src={reel.videoUrl}
                autoPlay={isActive}
                loop
                muted={false}
                playsInline
                className="absolute inset-0 w-full h-full object-cover"
              />

              {/* GRADIENTS PANEL OVERLAY */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-transparent to-black/85 pointer-events-none" />

              {/* ACTION BUTTONS COLUMN PANEL */}
              <div className="absolute bottom-20 right-4 flex flex-col items-center space-y-5 z-20">
                {/* Like Button */}
                <div className="flex flex-col items-center">
                  <button 
                    onClick={() => handleLikeReel(reel.id)}
                    className="p-3 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 hover:scale-105 active:scale-90 transition-all shadow-md"
                  >
                    <HeartIcon filled={isLiked} className={isLiked ? "text-rose-500 scale-105" : "text-white"} size={22} />
                  </button>
                  <span className="text-[10px] font-bold text-white mt-1 shadow-sm">{reel.likesCount.toLocaleString()}</span>
                </div>

                {/* Comments button (opens detail modal or indicator) */}
                <div className="flex flex-col items-center">
                  <button 
                    onClick={() => alert("Comments system is active! Read or write inside post detail views.")}
                    className="p-3 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 hover:scale-105 active:scale-90 transition-all shadow-md"
                  >
                    <CommentIcon size={22} className="text-white" />
                  </button>
                  <span className="text-[10px] font-bold text-white mt-1 shadow-sm">{reel.commentsCount}</span>
                </div>

                {/* Save button */}
                <button 
                  onClick={() => handleSavePost(`saved_reel_${reel.id}`)}
                  className="p-3 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 hover:scale-105 active:scale-90 transition-all shadow-md"
                >
                  <BookmarkIcon filled={isSaved} size={22} className={isSaved ? "text-yellow-400" : "text-white"} />
                </button>

                {/* Share action */}
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(reel.videoUrl);
                    alert("Reel stream link copied to clipboard!");
                  }}
                  className="p-3 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 hover:scale-105 active:scale-90 transition-all shadow-md"
                >
                  <ShareIcon size={22} className="text-white" />
                </button>

                {/* Report safety trigger */}
                <button 
                  onClick={() => setShowReport(true)}
                  className="p-3 bg-white/10 backdrop-blur-md rounded-full text-rose-500 hover:bg-white/20 active:scale-95 transition-all shadow-md"
                >
                  <FlagIcon size={20} />
                </button>
              </div>

              {/* DESCRIPTION & PROFILE INFO PANEL */}
              <div className="absolute bottom-20 left-4 right-16 text-white z-20 space-y-3.5">
                {/* Author profile row */}
                <div className="flex items-center space-x-3">
                  <img 
                    src={author.photoURL} 
                    alt={author.username}
                    onClick={() => setSelectedUsername(author.username)}
                    className="h-10 w-10 rounded-full object-cover border border-white/30 cursor-pointer hover:opacity-90"
                  />
                  <div>
                    <div className="flex items-center space-x-1">
                      <span 
                        onClick={() => setSelectedUsername(author.username)}
                        className="text-xs font-bold hover:underline cursor-pointer"
                      >
                        {author.username}
                      </span>
                      {author.isVerified && <VerifiedIcon size={12} />}
                    </div>
                    <span className="text-[9px] text-white/60">{author.displayName}</span>
                  </div>
                  
                  {/* Follow Creator Trigger */}
                  {currentUser && currentUser.uid !== author.uid && (
                    <button 
                      onClick={() => handleFollowUser(author.uid)}
                      className={`text-[9px] font-extrabold px-3 py-1 rounded-full border transition-all ${
                        isFollowing 
                          ? "bg-white/10 border-white/30 text-white" 
                          : "bg-white text-black border-transparent shadow-md font-black"
                      }`}
                    >
                      {isFollowing ? "Following" : "Follow"}
                    </button>
                  )}
                </div>

                {/* Caption info */}
                <p className="text-xs text-white/90 leading-relaxed font-medium">
                  {reel.caption}
                </p>

                {/* Music title scrolling badge */}
                {reel.musicTitle && (
                  <div className="flex items-center space-x-1.5 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full w-max max-w-[200px] overflow-hidden">
                    <span className="text-[10px]">🎵</span>
                    <marquee className="text-[10px] font-semibold text-white/80" scrollamount="3">
                      {reel.musicTitle}
                    </marquee>
                  </div>
                )}
              </div>

              {/* REPORT MODAL ON ACTIVE REEL */}
              {showReport && (
                <div className="absolute inset-0 bg-black/80 z-30 flex items-center justify-center p-4">
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 w-full max-w-xs space-y-4 shadow-xl">
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">Report this reel</h3>
                    <select 
                      value={reportReason} 
                      onChange={(e) => setReportReason(e.target.value as any)}
                      className="w-full text-xs p-2.5 border border-slate-700 bg-slate-800 rounded-lg text-white outline-none"
                    >
                      <option value="Spam">Spam</option>
                      <option value="Fake Account">Fake Account</option>
                      <option value="Nudity">Nudity</option>
                      <option value="Violence">Violence</option>
                      <option value="Hate Speech">Hate Speech</option>
                      <option value="Harassment">Harassment</option>
                      <option value="Scam">Scam</option>
                    </select>

                    <div className="flex justify-end space-x-2">
                      <button 
                        onClick={() => setShowReport(false)}
                        className="px-3.5 py-1.5 bg-slate-800 text-xs font-semibold text-white rounded-lg"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={() => triggerReelReport(reel.id)}
                        className="px-3.5 py-1.5 bg-rose-500 hover:bg-rose-600 text-xs font-black text-white rounded-lg"
                      >
                        Report
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
};
