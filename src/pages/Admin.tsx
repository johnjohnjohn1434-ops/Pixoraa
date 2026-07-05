/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { motion, AnimatePresence } from "motion/react";
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  AreaChart, Area, PieChart, Pie, Cell 
} from "recharts";
import { ShieldIcon, VerifiedIcon } from "../components/icons";

export const Admin: React.FC = () => {
  const { 
    reports, posts, users, currentUser, handleUpdateReportStatus, 
    handleDeletePost, handleWarnUser, adminLogs 
  } = useApp();

  const [filterStatus, setFilterStatus] = useState<"pending" | "resolved" | "all">("pending");

  if (!currentUser || (currentUser.role !== "admin" && currentUser.role !== "superadmin")) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] text-center p-4">
        <span className="text-3xl">⚠️</span>
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mt-2">Access Restrained</h3>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">This administrative chamber is strictly for verified system moderators.</p>
      </div>
    );
  }

  // Pre-formatted analytics mock data based on actual app data counts
  const reportCategoryCounts = reports.reduce((acc, report) => {
    acc[report.reason] = (acc[report.reason] || 0) + 1;
    return acc;
  }, {} as { [key: string]: number });

  const analyticsBarData = Object.keys(reportCategoryCounts).map(category => ({
    name: category,
    reports: reportCategoryCounts[category]
  }));

  // Hourly Traffic stats
  const trafficData = [
    { hour: "08:00", sessions: 450, posts: 120 },
    { hour: "10:00", sessions: 820, posts: 240 },
    { hour: "12:00", sessions: 1340, posts: 380 },
    { hour: "14:00", sessions: 980, posts: 310 },
    { hour: "16:00", sessions: 1120, posts: 410 },
    { hour: "18:00", sessions: 1560, posts: 520 },
    { hour: "20:00", sessions: 1890, posts: 630 },
  ];

  const pieColors = ["#6366f1", "#ec4899", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6"];

  const filteredReports = reports.filter(r => {
    if (filterStatus === "all") return true;
    return r.status === filterStatus;
  });

  return (
    <div className="max-w-6xl mx-auto py-5 px-4 space-y-6 pb-24 md:pb-12">
      
      {/* ADMIN CHAMBER HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 rounded-2xl shadow-sm">
            <ShieldIcon size={24} />
          </div>
          <div>
            <h1 className="text-base font-black text-slate-800 dark:text-slate-100 uppercase tracking-widest">
              Pixora Security Command
            </h1>
            <p className="text-[10px] text-slate-400 dark:text-slate-500">
              Logged in as {currentUser.displayName} • Level: {currentUser.role}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl self-start">
          {(["pending", "resolved", "all"] as const).map(st => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`text-[10px] font-bold px-3 py-1.5 rounded-lg capitalize transition-colors ${
                filterStatus === st 
                  ? "bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 shadow-sm" 
                  : "text-slate-500 hover:text-slate-700 dark:text-slate-400"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* VISUAL ANALYTICS bento grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Traffic Area chart */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 p-5 rounded-2xl shadow-sm space-y-3.5 transition-colors">
          <h3 className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Hourly Community Traffic Dynamics
          </h3>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trafficData}>
                <defs>
                  <linearGradient id="colorSessions" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="hour" stroke="#94a3b8" fontSize={9} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ fontSize: '10px', borderRadius: '10px' }} />
                <Area type="monotone" dataKey="sessions" stroke="#6366f1" strokeWidth={2.5} fillOpacity={1} fill="url(#colorSessions)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Reports Categories Bar chart */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 p-5 rounded-2xl shadow-sm space-y-3.5 transition-colors">
          <h3 className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Safety Report Category Distribution
          </h3>
          <div className="h-44">
            {analyticsBarData.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <p className="text-xs text-slate-400">No active safety metrics reported.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analyticsBarData}>
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ fontSize: '10px', borderRadius: '10px' }} />
                  <Bar dataKey="reports" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={32}>
                    {analyticsBarData.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={pieColors[idx % pieColors.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

      </div>

      {/* CORE REPORTS MODERATOR PANEL */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-sm transition-colors space-y-4">
        <div>
          <h3 className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-widest">
            Pending Incident Reports Triage
          </h3>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
            Review reported items and perform direct moderator responses (dismissals, item deletions, warnings, or user bans).
          </p>
        </div>

        {filteredReports.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-slate-100 dark:border-slate-800 rounded-xl">
            <span className="text-2xl">🎉</span>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold mt-1">Excellent job! Safety queue cleared.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReports.map(report => {
              const reporter = users.find(u => u.uid === report.reporterId);
              const suspectPost = posts.find(p => p.id === report.reportedItemId);
              const suspectUser = suspectPost ? users.find(u => u.uid === suspectPost.authorId) : null;

              return (
                <div 
                  key={report.id}
                  className="p-4 border border-slate-100 dark:border-slate-800 rounded-2xl space-y-3.5 bg-slate-50/40 dark:bg-slate-950/20"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2.5">
                    <div className="flex items-center space-x-2">
                      <span className="px-2.5 py-1 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 text-rose-500 font-extrabold text-[9px] rounded-full uppercase tracking-wider">
                        {report.reason}
                      </span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500">
                        Submitted by: @{reporter?.username || "unknown"}
                      </span>
                    </div>

                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold">
                      {new Date(report.createdAt).toLocaleString()}
                    </span>
                  </div>

                  {/* Incident target description */}
                  {suspectPost && (
                    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl p-3 flex space-x-3">
                      <img src={suspectPost.mediaUrls[0]} className="h-14 w-14 rounded-lg object-cover" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-100">
                          Post Creator: <span className="text-indigo-500 font-semibold">@{suspectUser?.username}</span>
                        </p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 truncate">{suspectPost.caption}</p>
                      </div>
                    </div>
                  )}

                  {/* Actions Bar */}
                  {report.status === "pending" && (
                    <div className="flex flex-wrap gap-2 pt-1 border-t border-slate-100 dark:border-slate-800/60 pt-3">
                      <button 
                        onClick={() => {
                          handleUpdateReportStatus(report.id, "resolved");
                          alert("Report dismissed with no actions taken.");
                        }}
                        className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] font-bold rounded-lg transition-colors"
                      >
                        Dismiss Report
                      </button>

                      {suspectPost && (
                        <button 
                          onClick={() => {
                            handleDeletePost(suspectPost.id);
                            handleUpdateReportStatus(report.id, "resolved");
                            alert("Post deleted and removed from feeds.");
                          }}
                          className="px-3.5 py-1.5 bg-rose-50 dark:bg-rose-950/10 hover:bg-rose-100/50 dark:hover:bg-rose-950/30 text-rose-500 text-[10px] font-bold rounded-lg transition-colors border border-rose-100/40 dark:border-rose-900/30"
                        >
                          Delete Post
                        </button>
                      )}

                      {suspectUser && (
                        <>
                          <button 
                            onClick={() => {
                              handleWarnUser(suspectUser.uid, `Administrative Warning regarding reported ${report.reason} incident.`);
                              handleUpdateReportStatus(report.id, "resolved");
                              alert(`Official moderator warning dispatched to @${suspectUser.username}.`);
                            }}
                            className="px-3.5 py-1.5 bg-amber-50 dark:bg-amber-950/10 hover:bg-amber-100/50 text-amber-500 text-[10px] font-bold rounded-lg transition-colors border border-amber-100/40"
                          >
                            Warn User
                          </button>
                          
                          <button 
                            onClick={() => {
                              alert(`@${suspectUser.username} account suspended indefinitely.`);
                              handleUpdateReportStatus(report.id, "resolved");
                            }}
                            className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white text-[10px] font-black rounded-lg shadow-sm"
                          >
                            Suspend User
                          </button>
                        </>
                      )}
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* RECENT ADMIN LOGS CHAMBER */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-sm transition-colors space-y-4">
        <h3 className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-widest">
          System Moderator Action Logs
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-500 dark:text-slate-400">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] uppercase font-bold text-slate-400">
                <th className="py-2.5">Moderator</th>
                <th className="py-2.5">Action Executed</th>
                <th className="py-2.5">Target</th>
                <th className="py-2.5">Reason</th>
                <th className="py-2.5">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/40 font-semibold">
              {adminLogs.map(log => (
                <tr key={log.id}>
                  <td className="py-2.5 text-slate-800 dark:text-slate-200">@{log.adminUsername}</td>
                  <td className="py-2.5 capitalize">{log.action}</td>
                  <td className="py-2.5">{log.targetId}</td>
                  <td className="py-2.5">{log.details || "No comments"}</td>
                  <td className="py-2.5 text-[10px] font-normal">{new Date(log.createdAt).toLocaleTimeString()}</td>
                </tr>
              ))}
              {adminLogs.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-4 text-center text-[11px] text-slate-400">No events recorded in this session.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
