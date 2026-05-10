import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleLogin = async e => {
    e.preventDefault();
    setError("");
    try {
      await signInWithEmailAndPassword(auth, form.email, form.password);
      navigate("/");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh]">
      <div className="bg-panel-bg rounded-2xl p-8 shadow-xl w-full max-w-md border border-neon-teal">
        <h1 className="text-2xl font-bold text-neon-coral mb-6">Log In</h1>
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <input name="email" type="email" placeholder="Email" required value={form.email} onChange={handleChange} className="p-3 rounded bg-dark-bg text-white" />
          <input name="password" type="password" placeholder="Password" required value={form.password} onChange={handleChange} className="p-3 rounded bg-dark-bg text-white" />
          {error && <div className="text-neon-coral">{error}</div>}
          <button className="py-3 rounded-lg bg-neon-teal text-dark-bg font-bold hover:bg-neon-coral hover:text-white transition">Log In</button>
        </form>
        <div className="mt-4 text-center text-gray-400">
          Don’t have an account? <Link to="/signup" className="text-neon-teal underline">Sign up</Link>
        </div>
      </div>
    </div>
  );
}
