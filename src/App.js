import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Emotion from "./pages/Emotion";
import Finance from "./pages/Finance";
import Features from "./pages/Features";
import About from "./pages/About";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Diary from "./pages/Diary";
import Dashboard from "./pages/Dashboard";
import Chatbot from "./pages/Chatbot";
import AdaptiveThemeProvider from "./theme/AdaptiveThemeContext";
import MyProfile from "./pages/MyProfile"


function App() {
  return (
    <BrowserRouter>
      <AdaptiveThemeProvider>
        <Navbar />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/emotion" element={<Emotion />} />
          <Route path="/finance" element={<Finance />} />
          <Route path="/features" element={<Features />} />
          <Route path="/about" element={<About />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/diary" element={<Diary />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/chatbot" element={<Chatbot />} />
          <Route path="/profile" element={<MyProfile />} />
        </Routes>

        <Footer />
      </AdaptiveThemeProvider>
    </BrowserRouter>
  );
}

export default App;
