/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { AppProvider, useApp } from "./context/AppContext";
import { Navigation } from "./components/Navigation";
import { Auth } from "./pages/Auth";
import { Home } from "./pages/Home";
import { Explore } from "./pages/Explore";
import { Reels } from "./pages/Reels";
import { Messages } from "./pages/Messages";
import { Notifications } from "./pages/Notifications";
import { Profile } from "./pages/Profile";
import { Settings } from "./pages/Settings";
import { Admin } from "./pages/Admin";
import { PostDetailModal, StoryViewerModal, CreatePostModal } from "./components/Modal";

// Inner component to consume the Context
const AppContent: React.FC = () => {
  const { 
    currentUser, activeTab, selectedPostId, setSelectedPostId, 
    selectedStoryUserId, setSelectedStoryUserId, 
    isCreatePostOpen, setIsCreatePostOpen 
  } = useApp();

  // Redirect to Auth if not logged in
  if (!currentUser) {
    return <Auth />;
  }

  // Render correct active panel
  const renderActiveTabContent = () => {
    switch (activeTab) {
      case "home":
        return <Home />;
      case "explore":
        return <Explore />;
      case "reels":
        return <Reels />;
      case "messages":
        return <Messages />;
      case "notifications":
        return <Notifications />;
      case "profile":
        return <Profile />;
      case "settings":
        return <Settings />;
      case "admin":
        return <Admin />;
      default:
        return <Home />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col md:flex-row transition-colors duration-300">
      
      {/* Dynamic Navigation Rails */}
      <Navigation />

      {/* Main Content Workspace Container */}
      <main className="flex-1 min-h-screen relative overflow-x-hidden pt-14 md:pt-8 md:pl-64">
        <div className="absolute inset-0 bg-[radial-gradient(120%_120%_at_top_left,rgba(99,102,241,0.02),transparent_50%)] dark:bg-[radial-gradient(120%_120%_at_top_left,rgba(99,102,241,0.06),transparent_50%)] pointer-events-none" />
        <div className="relative z-10 max-w-6xl mx-auto">
          {renderActiveTabContent()}
        </div>
      </main>

      {/* Global Modals overlay containers */}
      {selectedPostId && (
        <PostDetailModal 
          postId={selectedPostId} 
          onClose={() => setSelectedPostId(null)} 
        />
      )}

      {selectedStoryUserId && (
        <StoryViewerModal 
          userId={selectedStoryUserId} 
          onClose={() => setSelectedStoryUserId(null)} 
        />
      )}

      {isCreatePostOpen && (
        <CreatePostModal 
          onClose={() => setIsCreatePostOpen(false)} 
        />
      )}

    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
