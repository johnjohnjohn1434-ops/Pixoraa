/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { motion } from "motion/react";

export const Auth: React.FC = () => {
  const { handleLogin, handleSignup, handleGoogleLogin, handleResetPassword, users } = useApp();
  
  const [isLogin, setIsLogin] = useState(true);
  const [showForgot, setShowForgot] = useState(false);
  
  // Forms state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      if (showForgot) {
        if (!email.trim()) throw new Error("Please enter your email.");
        await handleResetPassword(email.trim());
        setSuccess("Password reset email sent successfully! Please check your inbox.");
      } else if (isLogin) {
        if (!email.trim() || !password) throw new Error("Please fill in all fields.");
        await handleLogin(email.trim(), password);
      } else {
        if (!username.trim() || !displayName.trim() || !email.trim() || !password) {
          throw new Error("Please fill in all fields.");
        }
        if (password.length < 6) throw new Error("Password must be at least 6 characters.");
        await handleSignup(username.trim(), displayName.trim(), email.trim(), password);
      }
    } catch (err: any) {
      setError(err.message || "An authentication error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoBypass = async (demoUsername: string) => {
    setError("");
    setLoading(true);
    try {
      // simulate email match based on username or log in
      await handleLogin(`${demoUsername}@pixora.com`, "demopassword");
    } catch (e) {
      setError("Demo login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 transition-colors duration-300">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl shadow-xl w-full max-w-md overflow-hidden p-6 sm:p-8 space-y-6"
      >
        {/* Brand Header */}
        <div className="text-center space-y-1.5">
          <div className="inline-flex h-12 w-12 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 items-center justify-center text-white font-black text-2xl shadow-lg shadow-indigo-500/25 mb-1">
            P
          </div>
          <h2 className="text-2xl font-black bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent tracking-tight">
            Pixora
          </h2>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            {showForgot 
              ? "Retrieve your credentials and return to sharing"
              : isLogin 
                ? "Share Moments. Build Community." 
                : "Create an account and start connecting."}
          </p>
        </div>

        {/* Error / Success Notifications */}
        {error && (
          <div className="bg-rose-50 dark:bg-rose-950/10 border border-rose-100 dark:border-rose-900/30 text-rose-600 dark:text-rose-400 text-xs p-3 rounded-xl">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-emerald-50 dark:bg-emerald-950/10 border border-emerald-100 dark:border-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-xs p-3 rounded-xl">
            {success}
          </div>
        )}

        {/* Forgot Password Toggle Form */}
        {showForgot ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Email Address</label>
              <input 
                type="email" 
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 dark:text-slate-100"
              />
            </div>
            
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-500 to-indigo-600 text-white py-2.5 rounded-xl text-xs font-bold hover:from-indigo-600 hover:to-indigo-700 shadow-md transition-all disabled:opacity-50"
            >
              {loading ? "Sending..." : "Send Password Reset Link"}
            </button>

            <button 
              type="button" 
              onClick={() => setShowForgot(false)}
              className="w-full text-xs font-semibold text-slate-500 dark:text-slate-400 hover:underline"
            >
              Back to Login
            </button>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Sign Up Fields */}
            {!isLogin && (
              <>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Username</label>
                  <input 
                    type="text" 
                    placeholder="alice_clicks"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 dark:text-slate-100"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Display Name</label>
                  <input 
                    type="text" 
                    placeholder="Alice Johnson"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 dark:text-slate-100"
                  />
                </div>
              </>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Email Address</label>
              <input 
                type="email" 
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 dark:text-slate-100"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Password</label>
                {isLogin && (
                  <button 
                    type="button" 
                    onClick={() => setShowForgot(true)}
                    className="text-[11px] text-indigo-500 hover:underline"
                  >
                    Forgot?
                  </button>
                )}
              </div>
              <input 
                type="password" 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 dark:text-slate-100"
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-500 to-indigo-600 text-white py-2.5 rounded-xl text-xs font-bold hover:from-indigo-600 hover:to-indigo-700 shadow-md transition-all disabled:opacity-50"
            >
              {loading ? "Please wait..." : isLogin ? "Sign In" : "Create Account"}
            </button>

            {/* Google Login button */}
            <button 
              type="button" 
              onClick={handleGoogleLogin}
              className="w-full bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 py-2.5 rounded-xl text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center space-x-2 transition-colors border border-slate-100 dark:border-slate-700"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>Continue with Google</span>
            </button>

            {/* Toggle Signin/Signup */}
            <div className="text-center pt-2">
              <button 
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-indigo-500 transition-colors"
              >
                {isLogin ? "New to Pixora? Create an account" : "Already have an account? Sign In"}
              </button>
            </div>
          </form>
        )}

        {/* DEMO BYPASS SECTION */}
        <div className="border-t border-slate-100 dark:border-slate-800 pt-5 space-y-3">
          <div className="text-center">
            <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest bg-slate-50 dark:bg-slate-800/40 px-2.5 py-1 rounded-full">
              ⚡ Sandbox Guest Access
            </span>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1.5">
              Skip formal signup and enter instantly as a pre-populated test profile:
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button 
              onClick={() => handleDemoBypass("alice_pix")}
              className="bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/40 dark:hover:bg-slate-800 text-[11px] font-bold py-2 px-3 rounded-xl text-slate-700 dark:text-slate-200 border border-slate-100 dark:border-slate-800 flex items-center justify-center space-x-1.5"
            >
              <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=50" className="h-4.5 w-4.5 rounded-full object-cover" />
              <span>Alice (Creator)</span>
            </button>
            <button 
              onClick={() => handleDemoBypass("bob_builder")}
              className="bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/40 dark:hover:bg-slate-800 text-[11px] font-bold py-2 px-3 rounded-xl text-slate-700 dark:text-slate-200 border border-slate-100 dark:border-slate-800 flex items-center justify-center space-x-1.5"
            >
              <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=50" className="h-4.5 w-4.5 rounded-full object-cover" />
              <span>Bob (Developer)</span>
            </button>
            <button 
              onClick={() => handleDemoBypass("charlie_ventures")}
              className="bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/40 dark:hover:bg-slate-800 text-[11px] font-bold py-2 px-3 rounded-xl text-slate-700 dark:text-slate-200 border border-slate-100 dark:border-slate-800 flex items-center justify-center space-x-1.5 col-span-2"
            >
              <img src="https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=50" className="h-4.5 w-4.5 rounded-full object-cover" />
              <span>Charlie (Private Acc)</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
