/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { 
  HomeIcon, SearchIcon, PlusIcon, ReelsIcon, MessageIcon, 
  NotificationsIcon, ProfileIcon, SettingsIcon, LogOutIcon, ShieldIcon
} from "./icons";
import { CreatePostModal } from "./Modal";

export const Navigation: React.FC = () => {
  const { 
    activeTab, setActiveTab, currentUser, handleLogout, messages, notifications,
    setSelectedUsername
  } = useApp();
  
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const unreadMessages = messages.filter(m => !m.seen && m.senderId !== currentUser?.uid).length;
  const unreadNotifications = notifications.filter(n => !n.read).length;

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === "profile" && currentUser) {
      setSelectedUsername(currentUser.username);
    }
  };

  const navItems = [
    { id: "home", label: "Home", icon: (filled: boolean) => <HomeIcon filled={filled} size={22} /> },
    { id: "explore", label: "Explore", icon: (filled: boolean) => <SearchIcon filled={filled} size={22} /> },
    { id: "reels", label: "Reels", icon: (filled: boolean) => <ReelsIcon filled={filled} size={22} /> },
    { id: "messages", label: "Messages", icon: (filled: boolean) => <MessageIcon filled={filled} size={22} />, badge: unreadMessages },
    { id: "notifications", label: "Notifications", icon: (filled: boolean) => <NotificationsIcon filled={filled} size={22} />, badge: unreadNotifications },
    { id: "settings", label: "Settings", icon: (filled: boolean) => <SettingsIcon filled={filled} size={22} /> },
  ];

  const showAdmin = currentUser?.role === "admin" || currentUser?.role === "superadmin";

  return (
    <>
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex flex-col fixed top-0 left-0 h-screen w-64 bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 p-6 z-30 transition-colors duration-300">
        {/* Brand Logo */}
        <div className="flex items-center space-x-2.5 mb-8 px-2">
          <span className="h-8.5 w-8.5 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-indigo-500/25">
            P
          </span>
          <h1 className="text-xl font-black bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent font-sans tracking-tight">
            Pixora
          </h1>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 space-y-1">
          {navItems.map((item) => {
            const isSelected = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabChange(item.id)}
                className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-xs font-semibold transition-all duration-200 group relative ${
                  isSelected 
                    ? "bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-bold" 
                    : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-100"
                }`}
              >
                <div className="flex items-center space-x-3.5">
                  <div className="transition-transform group-hover:scale-105">
                    {item.icon(isSelected)}
                  </div>
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 ? (
                  <span className="bg-rose-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                    {item.badge}
                  </span>
                ) : null}
              </button>
            );
          })}

          {/* Create trigger */}
          {currentUser && (
            <button
              onClick={() => setIsCreateOpen(true)}
              className="w-full flex items-center space-x-3.5 px-4 py-3.5 rounded-xl text-xs font-semibold text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-100 transition-all duration-200 group"
            >
              <div className="transition-transform group-hover:scale-105">
                <PlusIcon size={22} />
              </div>
              <span>Create</span>
            </button>
          )}

          {/* Admin Panel button */}
          {showAdmin && (
            <button
              onClick={() => handleTabChange("admin")}
              className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-xs font-semibold transition-all duration-200 group ${
                activeTab === "admin" 
                  ? "bg-violet-50/70 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 font-bold" 
                  : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-100"
              }`}
            >
              <div className="flex items-center space-x-3.5">
                <div className="transition-transform group-hover:scale-105">
                  <ShieldIcon size={22} className={activeTab === "admin" ? "text-violet-500" : ""} />
                </div>
                <span>Admin Panel</span>
              </div>
            </button>
          )}
        </nav>

        {/* Footer profile & logout */}
        {currentUser && (
          <div className="border-t border-slate-100 dark:border-slate-800 pt-5 space-y-3">
            <button 
              onClick={() => handleTabChange("profile")}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-left hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors ${
                activeTab === "profile" ? "bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800" : ""
              }`}
            >
              <img 
                src={currentUser.photoURL} 
                alt={currentUser.displayName}
                className="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-slate-700"
              />
              <div className="truncate flex-1">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">{currentUser.displayName}</p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">@{currentUser.username}</p>
              </div>
            </button>

            <button 
              onClick={handleLogout}
              className="w-full flex items-center space-x-3.5 px-4 py-3.5 rounded-xl text-xs font-semibold text-rose-500 hover:bg-rose-50/50 dark:hover:bg-rose-950/10 transition-colors"
            >
              <LogOutIcon size={20} />
              <span>Logout</span>
            </button>
          </div>
        )}
      </aside>

      {/* MOBILE HEADER BAR */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-14 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 flex items-center justify-between px-5 z-30 transition-colors duration-300">
        <div className="flex items-center space-x-2">
          <span className="h-7 w-7 rounded-lg bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white font-black text-sm">
            P
          </span>
          <h1 className="text-base font-black bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent tracking-tight">
            Pixora
          </h1>
        </div>

        <div className="flex items-center space-x-3.5">
          {showAdmin && (
            <button 
              onClick={() => handleTabChange("admin")}
              className={`p-1.5 rounded-lg ${activeTab === "admin" ? "text-violet-500 bg-violet-50/50 dark:bg-violet-950/35" : "text-slate-500 dark:text-slate-400"}`}
            >
              <ShieldIcon size={19} />
            </button>
          )}
          <button 
            onClick={() => handleTabChange("messages")}
            className="p-1.5 text-slate-500 dark:text-slate-400 relative"
          >
            <MessageIcon size={20} />
            {unreadMessages > 0 && (
              <span className="absolute top-1 right-1 h-2 w-2 bg-rose-500 rounded-full" />
            )}
          </button>
        </div>
      </header>

      {/* MOBILE BOTTOM NAV BAR */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/85 dark:bg-slate-900/85 backdrop-blur-md border-t border-slate-100 dark:border-slate-800 flex items-center justify-around px-2 pb-safe z-35 transition-colors duration-300">
        <button 
          onClick={() => handleTabChange("home")}
          className={`p-2.5 rounded-xl transition-colors ${activeTab === "home" ? "text-indigo-500" : "text-slate-400 dark:text-slate-500"}`}
        >
          <HomeIcon filled={activeTab === "home"} size={22} />
        </button>
        
        <button 
          onClick={() => handleTabChange("explore")}
          className={`p-2.5 rounded-xl transition-colors ${activeTab === "explore" ? "text-indigo-500" : "text-slate-400 dark:text-slate-500"}`}
        >
          <SearchIcon filled={activeTab === "explore"} size={22} />
        </button>

        {currentUser && (
          <button 
            onClick={() => setIsCreateOpen(true)}
            className="p-2.5 rounded-xl text-slate-400 dark:text-slate-500 hover:text-indigo-500"
          >
            <PlusIcon size={22} />
          </button>
        )}

        <button 
          onClick={() => handleTabChange("reels")}
          className={`p-2.5 rounded-xl transition-colors ${activeTab === "reels" ? "text-indigo-500" : "text-slate-400 dark:text-slate-500"}`}
        >
          <ReelsIcon filled={activeTab === "reels"} size={22} />
        </button>

        <button 
          onClick={() => handleTabChange("profile")}
          className={`p-2 rounded-xl transition-colors ${activeTab === "profile" ? "text-indigo-500" : "text-slate-400 dark:text-slate-500"}`}
        >
          {currentUser ? (
            <img 
              src={currentUser.photoURL} 
              alt="Profile" 
              className={`w-6.5 h-6.5 rounded-full object-cover border-2 ${activeTab === "profile" ? "border-indigo-500" : "border-transparent"}`}
            />
          ) : (
            <ProfileIcon filled={activeTab === "profile"} size={22} />
          )}
        </button>
      </nav>

      {/* CREATE POST TRIGGER */}
      <CreatePostModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
    </>
  );
};
