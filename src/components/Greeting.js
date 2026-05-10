import React from "react";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return { greet: "Good morning", msg: "How would you like to start your day?" };
  if (h < 18) return { greet: "Good afternoon", msg: "How’s your day going?" };
  return { greet: "Good evening", msg: "How was your day?" };
}

export default function Greeting({ name = "User" }) {
  const { greet, msg } = getGreeting();
  return (
    <div className="mb-8 text-center">
      <h1 className="text-4xl font-bold text-neon-teal">{greet}, {name}!</h1>
      <p className="mt-2 text-lg text-neon-coral">{msg}</p>
    </div>
  );
}
