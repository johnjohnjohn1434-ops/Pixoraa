/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { motion, AnimatePresence } from "motion/react";
import { 
  HeartIcon, CommentIcon, ProfileIcon, VerifiedIcon, CloseIcon 
} from "../components/icons";

export const Notifications: React.FC = () => {
  const { 
    notifications, users, handleMarkNotificationsRead, 
    handleFollowUser, followingIds, setSelectedPostId, setSelectedUsername 
  } = useApp();

  const [filter, setFilter] = useState<"all" | "like" | "comment" | "follow">("all");

  const unreadCount = notifications.filter(n => !n.read).length;

  const getFilteredNotifications = () => {
    const sorted = [...notifications].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    if (filter === "all") return sorted;
    return sorted.filter(n => n.type === filter);
  };

  const filtered = getFilteredNotifications();

  return (
    <div className="max-w-2xl mx-auto py-5 px-4 space-y-6 pb-24 md:pb-12">
      
      {/* Header section */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-4">
        <div>
          <h2 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-widest">
            Notification Center
          </h2>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
            You have {unreadCount} unread activity alerts
          </p>
        </div>

        {unreadCount > 0 && (
          <button 
            onClick={handleMarkNotificationsRead}
            className="text-[10px] font-bold text-indigo-500 hover:underline bg-indigo-50 dark:bg-indigo-950/40 px-3 py-1.5 rounded-lg"
          >
            Mark all as read
          </button>
        )}
      </div>

      {/* FILTER BUTTONS */}
      <div className="flex space-x-2">
        {(["all", "like", "comment", "follow"] as const).map(type => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`text-[10px] font-bold px-3 py-2 rounded-xl capitalize transition-all border ${
              filter === type 
                ? "bg-indigo-500 border-indigo-500 text-white shadow-md shadow-indigo-500/10" 
                : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700"
            }`}
          >
            {type === "all" ? "All Activity" : `${type}s`}
          </button>
        ))}
      </div>

      {/* NOTIFICATION ITEM FEED */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 shadow-sm divide-y divide-slate-50 dark:divide-slate-850 transition-colors">
        <AnimatePresence mode="popLayout">
          {filtered.length === 0 ? (
            <div className="text-center py-12">
              <span className="text-xl">🔔</span>
              <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold mt-1">No activities found in this filter.</p>
            </div>
          ) : (
            filtered.map(notif => {
              const sender = users.find(u => u.uid === notif.senderId);
              const isFollowing = sender ? followingIds.includes(sender.uid) : false;

              // Action text mapper
              const getNotificationText = () => {
                switch (notif.type) {
                  case "like":
                    return "liked your post";
                  case "comment":
                    return `commented: "${notif.customText || 'awesome!'}"`;
                  case "follow":
                    return "started following you";
                  case "mention":
                    return "mentioned you in a caption";
                  case "message":
                    return "sent you a direct chat message";
                  case "verification":
                    return "your creator verification profile has been officially approved!";
                  default:
                    return "interacted with your profile";
                }
              };

              return (
                <motion.div 
                  key={notif.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`flex items-center justify-between py-3.5 first:pt-0 last:pb-0 ${!notif.read ? "bg-slate-50/40 dark:bg-slate-950/20 px-2 rounded-xl" : ""}`}
                >
                  <div className="flex items-center space-x-3.5 flex-1 min-w-0">
                    {/* Icon prefix indicator */}
                    <div className="relative">
                      {sender ? (
                        <img 
                          src={sender.photoURL} 
                          alt={sender.username}
                          onClick={() => setSelectedUsername(sender.username)}
                          className="w-10 h-10 rounded-full object-cover cursor-pointer hover:opacity-85 border border-slate-100 dark:border-slate-800"
                        />
                      ) : (
                        <div className="h-10 w-10 bg-indigo-50 dark:bg-indigo-950 rounded-full flex items-center justify-center text-indigo-500">
                          <VerifiedIcon size={18} />
                        </div>
                      )}

                      {/* Micro badge indicator */}
                      <span className="absolute -bottom-1 -right-1 bg-white dark:bg-slate-900 h-5 w-5 rounded-full flex items-center justify-center border border-slate-50 dark:border-slate-800 text-[10px] shadow-sm">
                        {notif.type === "like" ? "❤️" : notif.type === "comment" ? "💬" : notif.type === "follow" ? "👤" : "🔔"}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-normal">
                        {sender ? (
                          <span 
                            onClick={() => setSelectedUsername(sender.username)}
                            className="font-bold text-slate-900 dark:text-slate-50 mr-1.5 cursor-pointer hover:underline"
                          >
                            {sender.username}
                          </span>
                        ) : (
                          <span className="font-bold text-slate-900 dark:text-slate-50 mr-1.5">Pixora Moderator</span>
                        )}
                        {getNotificationText()}
                      </p>
                      <span className="text-[9px] text-slate-400 dark:text-slate-500 font-semibold block mt-1">
                        {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>

                  {/* Right side quick actions */}
                  <div className="flex-shrink-0 pl-3">
                    {notif.type === "follow" && sender && (
                      <button
                        onClick={() => handleFollowUser(sender.uid)}
                        className={`text-[9px] font-extrabold px-3 py-1.5 rounded-lg border transition-all ${
                          isFollowing 
                            ? "bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-500" 
                            : "bg-indigo-500 hover:bg-indigo-600 text-white font-black"
                        }`}
                      >
                        {isFollowing ? "Mutual" : "Follow Back"}
                      </button>
                    )}

                    {notif.postId && (
                      <button
                        onClick={() => setSelectedPostId(notif.postId!)}
                        className="text-[10px] font-bold text-indigo-500 hover:underline bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-750 px-2.5 py-1 rounded-lg"
                      >
                        Preview
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>

    </div>
  );
};
