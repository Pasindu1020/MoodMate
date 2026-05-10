import React from "react";
import { SparklesIcon, CurrencyDollarIcon, ChatBubbleLeftRightIcon, HeartIcon } from "@heroicons/react/24/outline";
import { useTheme } from "../theme/useTheme";

export default function Features() {
  const theme = useTheme();
  return (
  <div
    className="max-w-4xl mx-auto py-12 px-4 space-y-8"
    style={{
      color: theme.text,
      transition: "color 1.5s ease"
    }}
  >
    <h1 className="text-3xl font-bold text-neon-teal mb-8">Features</h1>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div
        className="rounded-xl p-6 flex items-start border-l-4 border-neon-teal shadow-lg"
        style={{
          backgroundColor: theme.surface,
          transition: "background-color 1.5s ease"
        }}
      >
        <HeartIcon className="w-8 h-8 text-neon-teal mr-4" />
        <div>
          <h2 className="font-bold text-xl mb-2">Emotion Tracker</h2>
          <p style={{ color: theme.text }}>
            Monitor your daily mood, spot trends, and let MoodMate recommend uplifting or calming resources tailored to how you feel.
          </p>
        </div>
      </div>

      <div
        className="rounded-xl p-6 flex items-start border-l-4 border-neon-coral shadow-lg"
        style={{
          backgroundColor: theme.surface,
          transition: "background-color 1.5s ease"
        }}
      >
        <CurrencyDollarIcon className="w-8 h-8 text-neon-coral mr-4" />
        <div>
          <h2 className="font-bold text-xl mb-2">Financial Dashboard</h2>
          <p style={{ color: theme.text }}>
            Keep tabs on your spending, plan your budget, and receive real-time notifications if you’re overspending or at risk.
          </p>
        </div>
      </div>

      <div
        className="rounded-xl p-6 flex items-start border-l-4 border-neon-purple shadow-lg"
        style={{
          backgroundColor: theme.surface,
          transition: "background-color 1.5s ease"
        }}
      >
        <ChatBubbleLeftRightIcon className="w-8 h-8 text-neon-purple mr-4" />
        <div>
          <h2 className="font-bold text-xl mb-2">AI Chatbot</h2>
          <p style={{ color: theme.text }}>
            Get instant support for both emotional and financial queries. The chatbot is always available—at home and in your dashboards.
          </p>
        </div>
      </div>

      <div
        className="rounded-xl p-6 flex items-start border-l-4 border-neon-teal shadow-lg"
        style={{
          backgroundColor: theme.surface,
          transition: "background-color 1.5s ease"
        }}
      >
        <SparklesIcon className="w-8 h-8 text-neon-teal mr-4" />
        <div>
          <h2 className="font-bold text-xl mb-2">Modern UI</h2>
          <p style={{ color: theme.text }}>
            Enjoy a modern, dark-themed web experience with neon highlights and intuitive navigation across all your tools.
          </p>
        </div>
      </div>
    </div>
  </div>
);

}
