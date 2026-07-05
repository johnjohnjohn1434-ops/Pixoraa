/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { motion } from "motion/react";
import { 
  VerifiedIcon, GridIcon, BookmarkIcon, ArchiveIcon, LockIcon, PlusIcon, SettingsIcon 
} from "../components/icons";

export const Profile: React.FC = () => {
  const { 
    currentUser, users, posts, selectedUsername, setSelectedUsername, 
    savedPosts, handleFollowUser, followingIds, handleCreateHighlight,
    highlights, setSelectedPostId, handleUpdateProfile, setActiveTab 
  } = useApp();

  // Profile Editor state
  const [isEditing, setIsEditing] = useState(false);
  const [editDisplayName, setEditDisplayName] = useState(currentUser?.displayName || "");
  const [editBio, setEditBio] = useState(currentUser?.bio || "");
  const [editWebsite, setEditWebsite] = useState(currentUser?.website || "");
  const [editPhoto, setEditPhoto] = useState(currentUser?.photoURL || "");
  const [editCover, setEditCover] = useState(currentUser?.coverURL || "");

  // Highlights Creator
  const [showHighlightForm, setShowHighlightForm] = useState(false);
  const [highlightTitle, setHighlightTitle] = useState("");
  const [highlightCover, setHighlightCover] = useState("");

  const [profileTab, setProfileTab] = useState<"posts" | "saved" | "tagged">("posts");

  const usernameToFetch = selectedUsername || currentUser?.username || "";
  const profileUser = users.find(u => u.username === usernameToFetch);

  if (!profileUser) {
    return (
      <div className="text-center py-24">
        <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold">User profile not found.</p>
        <button 
          onClick={() => setSelectedUsername(currentUser?.username || null)}
          className="text-xs text-indigo-500 font-bold hover:underline mt-2"
        >
          Return to my profile
        </button>
      </div>
    );
  }

  const isMe = currentUser?.uid === profileUser.uid;
  const isFollowing = followingIds.includes(profileUser.uid);

  // Filter posts
  const userPosts = posts.filter(p => p.authorId === profileUser.uid && !p.isArchived);
  
  // Saved posts (intersection with posts database)
  const userSavedPosts = posts.filter(p => savedPosts.includes(p.id) && !p.isArchived);

  // Tagged posts (posts containing hashtag matching username or tagged lists)
  const taggedPosts = posts.filter(p => 
    p.caption.toLowerCase().includes(`@${profileUser.username.toLowerCase()}`) && !p.isArchived
  );

  const handleEditorSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleUpdateProfile({
      displayName: editDisplayName,
      bio: editBio,
      website: editWebsite,
      photoURL: editPhoto,
      coverURL: editCover
    });
    setIsEditing(false);
    alert("Profile saved!");
  };

  const handleCreateHighlightSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!highlightTitle.trim() || !highlightCover.trim()) return;
    handleCreateHighlight(highlightTitle.trim(), highlightCover.trim(), []);
    setHighlightTitle("");
    setHighlightCover("");
    setShowHighlightForm(false);
    alert("Story Highlight group created!");
  };

  const activeGridPosts = 
    profileTab === "posts" 
      ? userPosts 
      : profileTab === "saved" 
        ? userSavedPosts 
        : taggedPosts;

  const userHighlights = highlights.filter(h => h.userId === profileUser.uid);

  return (
    <div className="max-w-4xl mx-auto pb-24 md:pb-12 space-y-6">
      
      {/* PROFILE COVER BANNER */}
      <div className="h-44 sm:h-56 bg-slate-100 dark:bg-slate-800 relative overflow-hidden">
        {profileUser.coverURL ? (
          <img src={profileUser.coverURL} alt="cover banner" className="w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-r from-slate-200 to-indigo-100 dark:from-slate-800 dark:to-indigo-950/40" />
        )}
      </div>

      {/* HEADER DETAILS CARD */}
      <div className="px-4 sm:px-6 relative -mt-16 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between space-y-4 sm:space-y-0">
          
          {/* Avatar Ring */}
          <div className="relative flex-shrink-0">
            <img 
              src={profileUser.photoURL} 
              alt={profileUser.displayName}
              className="h-28 w-28 rounded-2xl object-cover border-4 border-white dark:border-slate-950 bg-slate-100 shadow-md"
            />
          </div>

          {/* Core Action triggers */}
          <div className="flex flex-wrap gap-2.5">
            {isMe ? (
              <>
                <button 
                  onClick={() => {
                    setEditDisplayName(profileUser.displayName);
                    setEditBio(profileUser.bio);
                    setEditWebsite(profileUser.website || "");
                    setEditPhoto(profileUser.photoURL);
                    setEditCover(profileUser.coverURL || "");
                    setIsEditing(true);
                  }}
                  className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 text-xs font-bold rounded-xl transition-colors"
                >
                  Edit Profile
                </button>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/#/user/${profileUser.username}`);
                    alert("Profile link copied!");
                  }}
                  className="px-4 py-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold rounded-xl transition-colors"
                >
                  Share Profile
                </button>
                <button 
                  onClick={() => setActiveTab("settings")}
                  className="p-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-800 text-slate-500 rounded-xl transition-colors"
                >
                  <SettingsIcon size={18} />
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={() => handleFollowUser(profileUser.uid)}
                  className={`px-5 py-2 rounded-xl text-xs font-extrabold transition-all shadow-sm ${
                    isFollowing 
                      ? "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200" 
                      : "bg-indigo-500 hover:bg-indigo-600 text-white"
                  }`}
                >
                  {isFollowing ? "Following" : "Follow"}
                </button>
                <button 
                  onClick={() => setActiveTab("messages")}
                  className="px-5 py-2 bg-indigo-550 hover:bg-indigo-600 border border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-200 text-xs font-extrabold rounded-xl transition-all"
                >
                  Message
                </button>
                <button 
                  onClick={() => {
                    alert(`${profileUser.username} has been muted. They won't know you did this.`);
                  }}
                  className="px-3.5 py-2 bg-rose-50 dark:bg-rose-950/10 text-rose-500 text-xs font-bold rounded-xl transition-colors"
                >
                  Mute
                </button>
              </>
            )}
          </div>
        </div>

        {/* Name and Handle description */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center space-x-1.5">
            <h2 className="text-xl font-black text-slate-800 dark:text-slate-50">{profileUser.displayName}</h2>
            {profileUser.isVerified && <VerifiedIcon size={18} />}
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-bold">@{profileUser.username}</p>
        </div>

        {/* Live Counters */}
        <div className="flex space-x-6 py-2.5 border-y border-slate-50 dark:border-slate-800/40 text-xs text-slate-600 dark:text-slate-400">
          <div>
            <span className="font-extrabold text-slate-800 dark:text-slate-100">{userPosts.length}</span> posts
          </div>
          <div className="cursor-pointer hover:underline">
            <span className="font-extrabold text-slate-800 dark:text-slate-100">{profileUser.followersCount}</span> followers
          </div>
          <div className="cursor-pointer hover:underline">
            <span className="font-extrabold text-slate-800 dark:text-slate-100">{profileUser.followingCount}</span> following
          </div>
        </div>

        {/* Bio info */}
        <div className="space-y-1 text-xs text-slate-700 dark:text-slate-300 leading-relaxed max-w-lg">
          <p>{profileUser.bio}</p>
          {profileUser.website && (
            <a 
              href={profileUser.website} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-indigo-500 hover:underline inline-block font-semibold mt-1"
            >
              🔗 {profileUser.website}
            </a>
          )}
        </div>
      </div>

      {/* STORY HIGHLIGHTS ROW */}
      <div className="px-4 sm:px-6 py-2 space-y-2.5">
        <h3 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Story Highlights</h3>
        <div className="flex items-center space-x-4 overflow-x-auto no-scrollbar py-1">
          {/* Create highlight shortcut (only current user) */}
          {isMe && (
            <div className="flex flex-col items-center space-y-1 flex-shrink-0 cursor-pointer">
              <button 
                onClick={() => setShowHighlightForm(true)}
                className="h-14 w-14 rounded-full border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-400 transition-colors flex items-center justify-center text-slate-400 dark:text-slate-500"
              >
                <PlusIcon size={18} />
              </button>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">New</span>
            </div>
          )}

          {userHighlights.map(hl => (
            <div 
              key={hl.id} 
              onClick={() => alert(`Highlight Reel "${hl.title}" launched.`)}
              className="flex flex-col items-center space-y-1 flex-shrink-0 cursor-pointer"
            >
              <div className="h-14 w-14 rounded-full p-[2px] bg-slate-200 dark:bg-slate-800 flex items-center justify-center transition-transform hover:scale-105">
                <img src={hl.coverUrl} className="h-full w-full rounded-full object-cover border border-white dark:border-slate-950" />
              </div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">{hl.title}</span>
            </div>
          ))}

          {userHighlights.length === 0 && !isMe && (
            <p className="text-[10px] text-slate-400 dark:text-slate-500">No highlight categories saved.</p>
          )}
        </div>
      </div>

      {/* GRID LAYOUT NAVIGATION TABS */}
      <div className="px-4 sm:px-6 border-b border-slate-100 dark:border-slate-800/80 flex justify-center space-x-12 text-xs font-bold">
        <button 
          onClick={() => setProfileTab("posts")}
          className={`flex items-center space-x-1.5 pb-3 transition-colors relative ${
            profileTab === "posts" ? "text-indigo-500 dark:text-indigo-400" : "text-slate-400"
          }`}
        >
          <GridIcon size={16} />
          <span>Posts</span>
          {profileTab === "posts" && (
            <motion.div layoutId="profileTabBorder" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500" />
          )}
        </button>

        {isMe && (
          <button 
            onClick={() => setProfileTab("saved")}
            className={`flex items-center space-x-1.5 pb-3 transition-colors relative ${
              profileTab === "saved" ? "text-indigo-500 dark:text-indigo-400" : "text-slate-400"
            }`}
          >
            <BookmarkIcon size={16} />
            <span>Saved</span>
            {profileTab === "saved" && (
              <motion.div layoutId="profileTabBorder" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500" />
            )}
          </button>
        )}

        <button 
          onClick={() => setProfileTab("tagged")}
          className={`flex items-center space-x-1.5 pb-3 transition-colors relative ${
            profileTab === "tagged" ? "text-indigo-500 dark:text-indigo-400" : "text-slate-400"
          }`}
        >
          <span className="text-sm">🏷️</span>
          <span>Tagged</span>
          {profileTab === "tagged" && (
            <motion.div layoutId="profileTabBorder" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500" />
          )}
        </button>
      </div>

      {/* POSTS GRID LISTING */}
      <div className="px-4 sm:px-6">
        {activeGridPosts.length === 0 ? (
          <div className="py-24 text-center space-y-2">
            <div className="inline-flex h-12 w-12 bg-slate-50 dark:bg-slate-900/60 rounded-full items-center justify-center text-slate-400 mb-2">
              <LockIcon size={20} />
            </div>
            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300">No Content Shared</h3>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">All published items mapped to this tab appear here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2 sm:gap-4">
            {activeGridPosts.map(post => (
              <motion.div 
                key={post.id}
                onClick={() => setSelectedPostId(post.id)}
                className="aspect-square bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden cursor-pointer relative group shadow-sm transition-transform hover:-translate-y-0.5"
              >
                {post.mediaType === "video" ? (
                  <video src={post.mediaUrls[0]} className="h-full w-full object-cover" muted />
                ) : (
                  <img src={post.mediaUrls[0]} alt="Grid item" className="h-full w-full object-cover" />
                )}

                {/* Hover details count */}
                <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-4 text-white text-xs font-bold">
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

      {/* INLINE PROFILE EDITOR OVERLAY MODAL */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 w-full max-w-md shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Edit Profile Details</h3>
            <form onSubmit={handleEditorSave} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Display Name</label>
                <input 
                  type="text" 
                  value={editDisplayName} 
                  onChange={(e) => setEditDisplayName(e.target.value)}
                  className="w-full text-xs p-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg text-slate-800 dark:text-slate-100 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Avatar photo URL</label>
                <input 
                  type="url" 
                  value={editPhoto} 
                  onChange={(e) => setEditPhoto(e.target.value)}
                  className="w-full text-xs p-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg text-slate-800 dark:text-slate-100 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cover banner photo URL</label>
                <input 
                  type="url" 
                  value={editCover} 
                  onChange={(e) => setEditCover(e.target.value)}
                  className="w-full text-xs p-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg text-slate-800 dark:text-slate-100 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Bio</label>
                <textarea 
                  value={editBio} 
                  onChange={(e) => setEditBio(e.target.value)}
                  rows={2}
                  className="w-full text-xs p-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg text-slate-800 dark:text-slate-100 outline-none resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Website URL</label>
                <input 
                  type="url" 
                  value={editWebsite} 
                  onChange={(e) => setEditWebsite(e.target.value)}
                  className="w-full text-xs p-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg text-slate-800 dark:text-slate-100 outline-none"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button 
                  type="button" 
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg text-xs"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-indigo-500 text-white rounded-lg text-xs font-bold hover:bg-indigo-600"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* HIGHLIGHT FORM OVERLAY */}
      {showHighlightForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 w-full max-w-sm shadow-2xl space-y-4">
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">Create Story Highlight</h3>
            <form onSubmit={handleCreateHighlightSubmit} className="space-y-3">
              <input 
                type="text" 
                placeholder="Highlight Title (e.g. Travels)"
                required
                value={highlightTitle}
                onChange={(e) => setHighlightTitle(e.target.value)}
                className="w-full text-xs p-2.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-xl text-slate-800 dark:text-slate-100 outline-none"
              />
              <input 
                type="url" 
                placeholder="Cover Photo URL"
                required
                value={highlightCover}
                onChange={(e) => setHighlightCover(e.target.value)}
                className="w-full text-xs p-2.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-xl text-slate-800 dark:text-slate-100 outline-none"
              />

              <div className="flex justify-end space-x-2 pt-1">
                <button 
                  type="button" 
                  onClick={() => setShowHighlightForm(false)}
                  className="px-3.5 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs rounded-lg"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-3.5 py-1.5 bg-indigo-500 text-white text-xs font-bold rounded-lg"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
