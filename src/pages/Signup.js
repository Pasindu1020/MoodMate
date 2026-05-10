import React, { useState } from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { setDoc, doc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase";
import { useNavigate, Link } from "react-router-dom";

export default function Signup() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSignup = async e => {
    e.preventDefault();
    setError("");
    try {
      const userCred = await createUserWithEmailAndPassword(auth, form.email, form.password);
      await updateProfile(userCred.user, { displayName: form.name });
      await setDoc(doc(db, "users", userCred.user.uid), {
        displayName: form.name,
        email: form.email,
        createdAt: serverTimestamp(),
      });
      navigate("/"); // redirect to Home
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh]">
      <div className="bg-panel-bg rounded-2xl p-8 shadow-xl w-full max-w-md border border-neon-teal">
        <h1 className="text-2xl font-bold text-neon-teal mb-6">Sign Up</h1>
        <form onSubmit={handleSignup} className="flex flex-col gap-4">
          <input name="name" placeholder="Full Name" required value={form.name} onChange={handleChange} className="p-3 rounded bg-dark-bg text-white" />
          <input name="email" type="email" placeholder="Email" required value={form.email} onChange={handleChange} className="p-3 rounded bg-dark-bg text-white" />
          <input name="password" type="password" placeholder="Password" required value={form.password} onChange={handleChange} className="p-3 rounded bg-dark-bg text-white" />
          {error && <div className="text-neon-coral">{error}</div>}
          <button className="py-3 rounded-lg bg-neon-coral text-white font-bold hover:bg-neon-teal hover:text-dark-bg transition">Sign Up</button>
        </form>
        <div className="mt-4 text-center text-gray-400">
          Already have an account? <Link to="/login" className="text-neon-teal underline">Log In</Link>
        </div>
      </div>
    </div>
  );
}
