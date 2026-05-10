import React from "react";

export default function About() {
  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold text-neon-purple mb-4">About MoodMate</h1>
      <p className="mb-4 text-lg">
        <strong>MoodMate</strong> is your all-in-one personal AI assistant for emotional and financial well-being.
        We bring together advanced emotion tracking and smart financial management to empower you to live a happier, more balanced life.
      </p>
      <p className="mb-4">
        Whether you’re feeling stressed or want to improve your budgeting habits, MoodMate is here to offer real-time support and recommendations, all in a single seamless web experience.
      </p>
      <ul className="list-disc ml-6 space-y-1">
        <li>Track your mood with AI-driven insights</li>
        <li>Receive calming content and motivational tips</li>
        <li>Monitor expenses and budget proactively</li>
        <li>Get real-time chatbot assistance for both emotional and financial queries</li>
      </ul>
      <div className="mt-8 text-gray-400">
        <span className="font-bold text-neon-coral">MoodMate</span> &copy; {new Date().getFullYear()}. Created for academic purposes.
      </div>
    </div>
  );
}
