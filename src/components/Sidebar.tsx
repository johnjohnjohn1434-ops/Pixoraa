/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { useApp } from "../context/AppContext";
import { 
  HomeIcon, SearchIcon, PlusIcon, ReelsIcon, MessageIcon, 
  NotificationsIcon, ProfileIcon, SettingsIcon, ShieldIcon, LogOutIcon 
} from "./icons";

interface SidebarProps {
  onCreatePostClick: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onCreatePostClick }) => {
  const { 
    activeTab, setActiveTab, currentUser, handleLogout, notifications, chats, messages 
  } = useApp();

  const unreadNotifs = notifications.filter(n => !n.read).length;
  
  // simple unread message counter from active chats
  const unreadMessages = messages.filter(m => !m.seen && m.senderId !== currentUser?.uid).length;

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    // Clear deep links on tab change to reset tab state
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const navItems = [
    { id: "home", label: "Home", icon: HomeIcon },
    { id: "explore", label: "Explore", icon: SearchIcon },
    { id: "reels", label: "Reels", icon: ReelsIcon },
    { id: "messages", label: "Messages", icon: MessageIcon, badge: unreadMessages },
    { id: "notifications", label: "Notifications", icon: NotificationsIcon, badge: unreadNotifs },
    { id: "profile", label: "Profile", icon: ProfileIcon },
    { id: "settings", label: "Settings", icon: SettingsIcon },
  ];

  const showAdmin = currentUser && (currentUser.role === "admin" || currentUser.role === "superadmin");

  return (
    <>
      {/* Desktop & Tablet Sidebar */}
      <aside className="hidden md:flex flex-col fixed top-0 left-0 h-screen w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-6 z-30 transition-colors duration-300">
        {/* Logo */}
        <div className="mb-8 flex items-center space-x-2">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg transform rotate-6">
            <span className="text-white font-extrabold text-xl tracking-tighter">P</span>
          </div>
          <div>
            <h1 className="text-xl font-extrabold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Pixora
            </h1>
            <span className="text-[9px] text-slate-400 dark:text-slate-500 font-semibold tracking-widest uppercase">
              Moments Connected
            </span>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isSelected = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabChange(item.id)}
                className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 group ${
                  isSelected 
                    ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400" 
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/60 hover:text-slate-900 dark:hover:text-slate-100"
                }`}
              >
                <div className="flex items-center space-x-3.5">
                  <Icon filled={isSelected} size={20} className="transform group-hover:scale-105 transition-transform" />
                  <span>{item.label}</span>
                </div>
                {item.badge && item.badge > 0 ? (
                  <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                ) : null}
              </button>
            );
          })}

          {/* Quick Create Button */}
          {currentUser && (
            <button
              onClick={onCreatePostClick}
              className="w-full mt-4 flex items-center justify-center space-x-2 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white font-bold py-3 px-4 rounded-xl shadow-md hover:from-indigo-600 hover:to-indigo-700 transition-all active:scale-95 text-xs"
            >
              <PlusIcon size={18} />
              <span>Create Post</span>
            </button>
          )}

          {/* Admin protected button */}
          {showAdmin && (
            <button
              onClick={() => handleTabChange("admin")}
              className={`w-full flex items-center space-x-3.5 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 mt-4 ${
                activeTab === "admin"
                  ? "bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/40"
                  : "text-rose-500 hover:bg-rose-50/50 dark:hover:bg-rose-950/10"
              }`}
            >
              <ShieldIcon size={20} />
              <span>Admin Panel</span>
            </button>
          )}
        </nav>

        {/* User Account / Profile Info Card at Bottom */}
        {currentUser && (
          <div className="mt-auto border-t border-slate-100 dark:border-slate-900 pt-4 space-y-3">
            <div 
              className="flex items-center space-x-3 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer"
              onClick={() => handleTabChange("profile")}
            >
              <img 
                src={currentUser.photoURL} 
                alt={currentUser.displayName}
                className="w-10 h-10 rounded-full object-cover border-2 border-slate-200 dark:border-slate-800"
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">{currentUser.displayName}</p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">@{currentUser.username}</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3.5 px-4 py-3 text-xs font-bold text-slate-500 hover:text-rose-500 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
            >
              <LogOutIcon size={16} />
              <span>Sign Out</span>
            </button>
          </div>
        )}
      </aside>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md flex items-center justify-around py-3 px-2 z-40 transition-colors duration-300">
        {navItems.slice(0, 4).map((item) => {
          const Icon = item.icon;
          const isSelected = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleTabChange(item.id)}
              className={`relative p-2.5 rounded-xl transition-all ${
                isSelected 
                  ? "text-indigo-600 dark:text-indigo-400" 
                  : "text-slate-500 dark:text-slate-400"
              }`}
            >
              <Icon filled={isSelected} size={22} />
              {item.badge && item.badge > 0 ? (
                <span className="absolute -top-0.5 -right-0.5 bg-rose-500 text-white text-[8px] font-bold h-4 w-4 flex items-center justify-center rounded-full">
                  {item.badge}
                </span>
              ) : null}
            </button>
          );
        })}

        {/* Plus trigger inside bottom navigation */}
        {currentUser && (
          <button
            onClick={onCreatePostClick}
            className="p-2.5 rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 text-white shadow-lg active:scale-90 transition-transform"
          >
            <PlusIcon size={20} filled />
          </button>
        )}

        {navItems.slice(4, 6).map((item) => {
          const Icon = item.icon;
          const isSelected = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleTabChange(item.id)}
              className={`relative p-2.5 rounded-xl transition-all ${
                isSelected 
                  ? "text-indigo-600 dark:text-indigo-400" 
                  : "text-slate-500 dark:text-slate-400"
              }`}
            >
              <Icon filled={isSelected} size={22} />
              {item.badge && item.badge > 0 ? (
                <span className="absolute -top-0.5 -right-0.5 bg-rose-500 text-white text-[8px] font-bold h-4 w-4 flex items-center justify-center rounded-full">
                  {item.badge}
                </span>
              ) : null}
            </button>
          );
        })}

        {/* Mobile Settings tab */}
        <button
          onClick={() => handleTabChange("settings")}
          className={`p-2.5 rounded-xl transition-all ${
            activeTab === "settings" 
              ? "text-indigo-600 dark:text-indigo-400" 
              : "text-slate-500 dark:text-slate-400"
          }`}
        >
          <SettingsIcon filled={activeTab === "settings"} size={22} />
        </button>
      </nav>
    </>
  );
};
