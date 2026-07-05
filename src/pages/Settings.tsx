/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { motion } from "motion/react";
import { SettingsIcon, LockIcon, ShieldIcon } from "../components/icons";

export const Settings: React.FC = () => {
  const { 
    theme, setTheme, language, setLanguage, currentUser, users, 
    handleUnblockUser, handleAddKeywordFilter, handleRemoveKeywordFilter 
  } = useApp();

  const [newKeyword, setNewKeyword] = useState("");
  const [sensitiveToggle, setSensitiveToggle] = useState(false);
  const [privateToggle, setPrivateToggle] = useState(false);

  // Grab list of blocked profiles (mocking representation using seeds or custom values)
  const blockedIds = currentUser?.blockedUserIds || [];
  const blockedUsers = users.filter(u => blockedIds.includes(u.uid));

  const keywordFilters = currentUser?.keywordFilters || ["spam", "free coins", "advertisement"];

  const handleKeywordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyword.trim()) return;
    handleAddKeywordFilter(newKeyword.trim().toLowerCase());
    setNewKeyword("");
  };

  return (
    <div className="max-w-2xl mx-auto py-5 px-4 space-y-6 pb-24 md:pb-12">
      
      {/* Settings Header */}
      <div className="flex items-center space-x-2.5 border-b border-slate-100 dark:border-slate-800/80 pb-4">
        <div className="p-2 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl text-indigo-500">
          <SettingsIcon size={20} />
        </div>
        <div>
          <h2 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider">Account Settings</h2>
          <p className="text-[10px] text-slate-400 dark:text-slate-500">Configure theme, safety levels, and privacy boundaries</p>
        </div>
      </div>

      {/* CORE CONFIGURATION CARD */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 space-y-5 shadow-sm transition-colors">
        
        {/* App Appearance toggle */}
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">Dark Mode</h4>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Toggle immersive charcoal canvas theme</p>
          </div>
          <button 
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className={`w-11 h-6 rounded-full p-1 transition-colors ${
              theme === "dark" ? "bg-indigo-500" : "bg-slate-200 dark:bg-slate-800"
            }`}
          >
            <div className={`bg-white h-4 w-4 rounded-full shadow-sm transition-transform ${theme === "dark" ? "translate-x-5" : ""}`} />
          </button>
        </div>

        {/* Localized Language selection */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-slate-800/60">
          <div>
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">App Language</h4>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Adjust display labels</p>
          </div>
          <select 
            value={language}
            onChange={(e) => setLanguage(e.target.value as any)}
            className="text-xs p-1.5 border border-slate-200 dark:border-slate-700 bg-transparent dark:text-slate-100 rounded-lg outline-none"
          >
            <option value="en">English (US)</option>
            <option value="es">Español</option>
            <option value="fr">Français</option>
            <option value="de">Deutsch</option>
          </select>
        </div>

        {/* Private Account visibility */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-slate-800/60">
          <div>
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">Private Account</h4>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Require follow approval requests</p>
          </div>
          <button 
            onClick={() => setPrivateToggle(!privateToggle)}
            className={`w-11 h-6 rounded-full p-1 transition-colors ${
              privateToggle ? "bg-indigo-500" : "bg-slate-200 dark:bg-slate-800"
            }`}
          >
            <div className={`bg-white h-4 w-4 rounded-full shadow-sm transition-transform ${privateToggle ? "translate-x-5" : ""}`} />
          </button>
        </div>

        {/* Sensitive content filtering */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-slate-800/60">
          <div>
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">Sensitive Content Filter</h4>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Hide potentially offensive or flagged posts by default</p>
          </div>
          <button 
            onClick={() => setSensitiveToggle(!sensitiveToggle)}
            className={`w-11 h-6 rounded-full p-1 transition-colors ${
              sensitiveToggle ? "bg-indigo-500" : "bg-slate-200 dark:bg-slate-800"
            }`}
          >
            <div className={`bg-white h-4 w-4 rounded-full shadow-sm transition-transform ${sensitiveToggle ? "translate-x-5" : ""}`} />
          </button>
        </div>

      </div>

      {/* COMMENTS SAFETY KEYWORDS CARD */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm transition-colors">
        <div>
          <h3 className="text-xs font-bold text-slate-800 dark:text-slate-100">Comment Filtering Keywords</h3>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Comments containing these words will be automatically hidden from your posts</p>
        </div>

        {/* Keyword Tags list */}
        <div className="flex flex-wrap gap-2 py-1">
          {keywordFilters.map(word => (
            <span 
              key={word}
              className="inline-flex items-center space-x-1.5 px-3 py-1 bg-slate-50 dark:bg-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-300 rounded-lg border border-slate-100 dark:border-slate-700"
            >
              <span>{word}</span>
              <button 
                onClick={() => handleRemoveKeywordFilter(word)}
                className="text-slate-400 hover:text-rose-500 font-extrabold text-xs"
              >
                ×
              </button>
            </span>
          ))}
          {keywordFilters.length === 0 && (
            <p className="text-[10px] text-slate-400 dark:text-slate-500 italic">No keyword filters defined.</p>
          )}
        </div>

        {/* Add Filter form */}
        <form onSubmit={handleKeywordSubmit} className="flex space-x-2 pt-2 border-t border-slate-50 dark:border-slate-800/60">
          <input 
            type="text" 
            placeholder="Add hidden keyword..."
            value={newKeyword}
            onChange={(e) => setNewKeyword(e.target.value)}
            className="flex-1 text-xs px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-xl outline-none focus:ring-1 focus:ring-indigo-500 dark:text-slate-100"
          />
          <button 
            type="submit"
            className="px-3.5 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-sm"
          >
            Add
          </button>
        </form>
      </div>

      {/* BLOCKED USERS MANAGEMENT CARD */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm transition-colors">
        <div>
          <h3 className="text-xs font-bold text-slate-850 dark:text-slate-100">Blocked Profiles</h3>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">These accounts can no longer view your posts, stories, or send direct chats</p>
        </div>

        {blockedUsers.length === 0 ? (
          <p className="text-[11px] text-slate-400 dark:text-slate-500 italic py-1">You haven't blocked any accounts.</p>
        ) : (
          <div className="divide-y divide-slate-50 dark:divide-slate-800/40">
            {blockedUsers.map(user => (
              <div key={user.uid} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
                <div className="flex items-center space-x-3">
                  <img src={user.photoURL} className="w-8 h-8 rounded-full object-cover" />
                  <div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-100">{user.username}</span>
                    <p className="text-[9px] text-slate-400 dark:text-slate-500">{user.displayName}</p>
                  </div>
                </div>
                <button 
                  onClick={() => handleUnblockUser(user.uid)}
                  className="text-[10px] font-bold text-indigo-500 hover:underline"
                >
                  Unblock
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
