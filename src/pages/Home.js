// src/pages/Home.js
import React from "react";
import { useAuth } from "../AuthContext";
import { Link } from "react-router-dom";
import { useTheme } from "../theme/useTheme";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return { greet: "Good morning", msg: "Start your day with MoodMate." };
  if (h < 18) return { greet: "Good afternoon", msg: "Hope your day is going well!" };
  return { greet: "Good evening", msg: "Wind down and reflect with MoodMate." };
}

export default function Home() {
  const { userData, user, loading } = useAuth();
  const name = userData?.displayName || "User";
  const { greet, msg } = getGreeting();
  const theme = useTheme();

  if (loading) return <div className="text-center py-16 text-neon-teal">Loading...</div>;


  if (!user)
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <div className="bg-panel-bg rounded-2xl p-8 shadow-xl w-full max-w-lg text-center border border-neon-teal">
          <h1 className="text-4xl font-bold text-neon-teal mb-4">{greet}!</h1>
          <p className="mb-6 text-lg text-white">{msg}</p>
          <Link
            to="/login"
            className="px-8 py-3 rounded-lg bg-neon-teal text-dark-bg font-bold hover:bg-neon-coral hover:text-white transition"
          >
            Log In to MoodMate
          </Link>
        </div>
      </div>
    );

  return (
    <div
      className="max-w-5xl mx-auto pt-4 pb-24 space-y-16 px-2"
      style={{
        color: theme.text,
        transition: "color 1.5s ease"
      }}
    >
      <div
        className="relative w-full h-[180px] sm:h-[220px] md:h-[288px] lg:h-[288px] rounded-2xl shadow-lg overflow-hidden mb-12"
        style={{
          backgroundImage: "url('/cover.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat"
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        <div className="relative z-10 flex flex-col items-center justify-center h-full px-4 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white drop-shadow-lg">
            {greet}, {name}!
          </h1>
          <p className="mt-3 text-lg sm:text-xl text-neon-teal drop-shadow">
            Your all-in-one assistant for mood &amp; money. Balance your mind and your wallet.
          </p>
        </div>
      </div>

      <section
        className="flex flex-col md:flex-row items-center gap-8 rounded-2xl p-8 shadow-xl border-l-8 border-neon-teal"
        style={{
          backgroundColor: theme.surface,
          transition: "background-color 1.5s ease"
        }}
      >
        <img src="/emotion_feature.png" alt="Emotion Feature" className="w-44 h-44 md:w-56 md:h-56 rounded-xl shadow-lg mx-auto md:mx-0" />
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-neon-teal mb-2">Emotion Tracker</h2>
          <p className="mb-2" style={{ color: theme.text }}>
            Log your emotions, spot trends, and get personalized activities and support for your mood.
          </p>
          <Link to="/emotion" className="inline-block px-6 py-2 mt-3 rounded-lg bg-neon-teal text-dark-bg font-bold hover:bg-neon-coral hover:text-white transition">
            Try Now
          </Link>
        </div>
      </section>

      <section
        className="flex flex-col md:flex-row-reverse items-center gap-8 rounded-2xl p-8 shadow-xl border-r-8 border-neon-coral"
        style={{
          backgroundColor: theme.surface,
          transition: "background-color 1.5s ease"
        }}
      >
        <img src="/finance_feature.png" alt="Finance Feature" className="w-44 h-44 md:w-56 md:h-56 rounded-xl shadow-lg mx-auto md:mx-0" />
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-neon-coral mb-2">Finance Dashboard</h2>
          <p className="mb-2" style={{ color: theme.text }}>
            Track income, expenses, set savings goals, and manage your finances with ease.
          </p>
          <Link to="/finance" className="inline-block px-6 py-2 mt-3 rounded-lg bg-neon-coral text-white font-bold hover:bg-neon-teal hover:text-dark-bg transition">
            Start Budgeting
          </Link>
        </div>
      </section>

      <section
        className="flex flex-col md:flex-row items-center gap-8 rounded-2xl p-8 shadow-xl border-l-8 border-neon-purple"
        style={{
          backgroundColor: theme.surface,
          transition: "background-color 1.5s ease"
        }}
      >
        <img src="/chatbot_feature.png" alt="Chatbot Feature" className="w-44 h-44 md:w-56 md:h-56 rounded-xl shadow-lg mx-auto md:mx-0" />
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-neon-purple mb-2">AI Chatbot Assistant</h2>
          <p className="mb-2" style={{ color: theme.text }}>
            Get answers, recommendations, and emotional support right inside your dashboard.
          </p>
          <Link to="/chatbot" className="inline-block px-6 py-2 mt-3 rounded-lg bg-neon-purple text-white font-bold hover:bg-neon-teal hover:text-dark-bg transition">
            Open Chatbot
          </Link>
        </div>
      </section>

      <section
        className="flex flex-col-reverse md:flex-row items-center gap-8 rounded-2xl p-8 shadow-xl border-r-8 border-neon-coral"
        style={{
          backgroundColor: theme.surface,
          transition: "background-color 1.5s ease"
        }}
      >
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-neon-coral mb-2">Daily Diary</h2>
          <p className="mb-2" style={{ color: theme.text }}>
            Write your daily diary, keep it secure with a passcode, and relive your memories anytime.
          </p>
          <Link to="/diary" className="inline-block px-6 py-2 mt-3 rounded-lg bg-neon-coral text-white font-bold hover:bg-neon-teal hover:text-dark-bg transition">
            Go to Diary
          </Link>
        </div>
        <img src="/diary_feature.png" alt="Diary Feature" className="w-44 h-44 md:w-56 md:h-56 rounded-xl shadow-lg mx-auto md:mx-0" />
      </section>
    </div>
  );

}
