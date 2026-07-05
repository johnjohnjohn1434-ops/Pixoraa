/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { useApp } from "../context/AppContext";
import { Send, Image, MessageCircle, Mic, Smile, MoreHorizontal } from "lucide-react";
import { VerifiedIcon, CloseIcon, BackIcon } from "../components/icons";

export const Direct: React.FC = () => {
  const { 
    chats, messages, users, currentUser, selectedChatId, setSelectedChatId,
    handleSendMessage, handleCreateChat, handleSetTyping 
  } = useApp();

  const [messageText, setMessageText] = useState("");
  const [searchUserQuery, setSearchUserQuery] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to latest messages
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, selectedChatId]);

  // Monitor typing status debounce
  useEffect(() => {
    if (!selectedChatId) return;
    if (messageText.trim().length > 0) {
      if (!isTyping) {
        setIsTyping(true);
        handleSetTyping(selectedChatId, true);
      }
    } else {
      if (isTyping) {
        setIsTyping(false);
        handleSetTyping(selectedChatId, false);
      }
    }
  }, [messageText]);

  if (!currentUser) return null;

  // Active chat session details
  const activeChat = chats.find(c => c.id === selectedChatId);
  const activeRecipientId = activeChat?.participantIds.find(id => id !== currentUser.uid);
  const activeRecipient = users.find(u => u.uid === activeRecipientId);
  const activeChatMessages = messages.filter(m => m.chatId === selectedChatId);

  // Search users list to start chat
  const searchMatchedUsers = searchUserQuery.trim()
    ? users.filter(u => 
        u.uid !== currentUser.uid && 
        (u.username.toLowerCase().includes(searchUserQuery.toLowerCase()) || 
         u.displayName.toLowerCase().includes(searchUserQuery.toLowerCase()))
      )
    : [];

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedChatId) return;

    handleSendMessage(selectedChatId, messageText.trim());
    setMessageText("");
    if (isTyping) {
      setIsTyping(false);
      handleSetTyping(selectedChatId, false);
    }
  };

  const handleSendPhoto = () => {
    if (!selectedChatId) return;
    const url = prompt("Enter an Image URL to share in chat:");
    if (url) {
      handleSendMessage(selectedChatId, "", url, "image");
    }
  };

  const handleSendVoice = () => {
    if (!selectedChatId) return;
    alert("Voice recording started... (Simulated voice clip sent!)");
    handleSendMessage(selectedChatId, "🎙️ Audio message", "https://assets.mixkit.co/music/preview/mixkit-tech-house-vibes-130.mp3", "voice");
  };

  return (
    <div className="max-w-5xl mx-auto h-[86vh] md:h-[92vh] bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-900 rounded-3xl overflow-hidden flex shadow-md relative transition-all">
      
      {/* 1. CHAT LIST SIDEBAR PANEL */}
      <div className={`w-full md:w-80 h-full border-r border-slate-100 dark:border-slate-900 flex flex-col ${selectedChatId ? 'hidden md:flex' : 'flex'}`}>
        
        {/* Header and User Search */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-900 space-y-3">
          <h2 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider">Direct Messages</h2>
          
          <input 
            type="text" 
            placeholder="Search users to start conversation..."
            value={searchUserQuery}
            onChange={(e) => setSearchUserQuery(e.target.value)}
            className="w-full text-xs px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 rounded-xl outline-none focus:ring-1 focus:ring-indigo-500 border-0 dark:text-slate-100 placeholder-slate-400"
          />
        </div>

        {/* Dynamic New Chat Search Results */}
        {searchUserQuery.trim() && (
          <div className="bg-slate-50/50 dark:bg-slate-900/40 p-2 border-b border-slate-100 dark:border-slate-900 space-y-1 max-h-48 overflow-y-auto">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest pl-2">Start new chat</span>
            {searchMatchedUsers.length === 0 ? (
              <p className="text-[10px] text-slate-400 pl-2 py-2">No creators match your search.</p>
            ) : (
              searchMatchedUsers.map(u => (
                <div 
                  key={u.uid}
                  onClick={() => {
                    handleCreateChat(u.uid);
                    setSearchUserQuery("");
                  }}
                  className="flex items-center space-x-3 p-2 rounded-xl hover:bg-white dark:hover:bg-slate-800 cursor-pointer transition-colors"
                >
                  <img src={u.photoURL} className="w-8 h-8 rounded-full object-cover border" alt="" />
                  <div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-100">@{u.username}</span>
                    <p className="text-[9px] text-slate-400">{u.displayName}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Existing Active Chats Listing */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {chats.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-xs">
              💬 No direct conversations yet. Start one above!
            </div>
          ) : (
            chats.map((chat) => {
              const recId = chat.participantIds.find(id => id !== currentUser.uid) || "";
              const recipientUser = users.find(u => u.uid === recId) || {
                username: "unknown",
                displayName: "Unknown User",
                photoURL: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
                isVerified: false
              };

              const isSelected = chat.id === selectedChatId;
              const hasTyping = chat.typing?.[recId] === true;

              return (
                <div
                  key={chat.id}
                  onClick={() => setSelectedChatId(chat.id)}
                  className={`flex items-center justify-between p-3 rounded-2xl cursor-pointer transition-all ${
                    isSelected 
                      ? "bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400" 
                      : "hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300"
                  }`}
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <img 
                      src={recipientUser.photoURL} 
                      className="w-11 h-11 rounded-full object-cover border-2 border-slate-150 dark:border-slate-800"
                      alt="" 
                    />
                    <div className="min-w-0">
                      <div className="flex items-center space-x-1">
                        <span className="font-bold text-xs truncate max-w-[120px] text-slate-800 dark:text-slate-100">
                          {recipientUser.displayName}
                        </span>
                        {recipientUser.isVerified && <VerifiedIcon size={12} />}
                      </div>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate mt-0.5">
                        {hasTyping ? (
                          <span className="text-indigo-500 font-semibold animate-pulse">Typing...</span>
                        ) : (
                          chat.lastMessage || "Click to open chat"
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Relative date label */}
                  {chat.lastMessageAt && (
                    <span className="text-[8px] text-slate-400 dark:text-slate-500 whitespace-nowrap ml-2">
                      {new Date(chat.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 2. CHAT DETAILS CHAT WINDOW PANELS */}
      <div className={`flex-1 h-full flex flex-col bg-slate-50/30 dark:bg-slate-950/20 ${!selectedChatId ? 'hidden md:flex' : 'flex'}`}>
        {activeChat && activeRecipient ? (
          <>
            {/* Header details bar */}
            <div className="p-4 bg-white dark:bg-slate-950 border-b border-slate-100 dark:border-slate-900 flex items-center justify-between z-10 shadow-sm">
              <div className="flex items-center space-x-3">
                <button 
                  onClick={() => setSelectedChatId(null)}
                  className="md:hidden p-1.5 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-lg mr-1 text-slate-600 dark:text-slate-300"
                >
                  <BackIcon size={18} />
                </button>
                <img 
                  src={activeRecipient.photoURL} 
                  className="w-10 h-10 rounded-full object-cover border" 
                  alt="" 
                />
                <div>
                  <div className="flex items-center space-x-1">
                    <span className="font-bold text-slate-800 dark:text-slate-100 text-xs">
                      {activeRecipient.displayName}
                    </span>
                    {activeRecipient.isVerified && <VerifiedIcon size={12} />}
                  </div>
                  <span className="text-[9px] text-slate-400">@{activeRecipient.username}</span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-2 rounded-lg">
                  <MoreHorizontal size={18} />
                </button>
              </div>
            </div>

            {/* Scrollable messages container */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {activeChatMessages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-2">
                  <span className="text-2xl">👋</span>
                  <p className="text-xs text-slate-400">Say hello! Direct connection is active.</p>
                </div>
              ) : (
                activeChatMessages.map((msg) => {
                  const isMe = msg.senderId === currentUser.uid;
                  return (
                    <div 
                      key={msg.id}
                      className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[70%] rounded-2xl p-3 text-xs shadow-sm ${
                        isMe 
                          ? 'bg-indigo-500 text-white rounded-tr-none' 
                          : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-100 dark:border-slate-800 rounded-tl-none'
                      }`}>
                        {msg.text && <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>}
                        
                        {/* Media image render */}
                        {msg.mediaUrl && msg.mediaType === "image" && (
                          <div className="mt-2 rounded-xl overflow-hidden max-h-48 border">
                            <img src={msg.mediaUrl} alt="Chat attachment" className="w-full h-full object-cover" />
                          </div>
                        )}

                        {/* Audio file render */}
                        {msg.mediaUrl && msg.mediaType === "voice" && (
                          <div className="mt-2 p-2 bg-black/15 dark:bg-black/45 rounded-xl flex items-center space-x-2">
                            <span>🎙️ Voice Message</span>
                            <audio src={msg.mediaUrl} controls className="w-40 h-8 text-xs scale-90" />
                          </div>
                        )}

                        <span className={`text-[8px] mt-1 block text-right opacity-65 ${isMe ? 'text-indigo-100' : 'text-slate-400'}`}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={scrollRef} />
            </div>

            {/* Chat bottom toolbar & typing inputs */}
            <div className="p-3 bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-900">
              <form onSubmit={handleSend} className="flex items-center space-x-2 bg-slate-50 dark:bg-slate-900 rounded-2xl p-1.5">
                <button 
                  type="button" 
                  onClick={handleSendPhoto}
                  className="p-2 text-slate-400 hover:text-indigo-500 transition-colors"
                  title="Share Image Link"
                >
                  <Image size={18} />
                </button>

                <button 
                  type="button" 
                  onClick={handleSendVoice}
                  className="p-2 text-slate-400 hover:text-indigo-500 transition-colors"
                  title="Record Voice Note"
                >
                  <Mic size={18} />
                </button>

                <input 
                  type="text"
                  placeholder={`Write your message to ${activeRecipient.displayName}...`}
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  className="flex-1 bg-transparent px-3 text-xs dark:text-slate-100 outline-none border-0"
                />

                <button 
                  type="submit" 
                  disabled={!messageText.trim()}
                  className="p-2 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 disabled:opacity-40 transition-colors"
                >
                  <Send size={14} />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-8">
            <div className="h-14 w-14 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500 flex items-center justify-center rounded-2xl mb-4">
              <MessageCircle size={28} />
            </div>
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">Your direct inbox</h3>
            <p className="text-xs text-slate-400 max-w-xs mt-1.5 leading-relaxed">
              Start chat discussions, share stories responses, or connect with artists instantly. Select any inbox item to begin.
            </p>
          </div>
        )}
      </div>

    </div>
  );
};
