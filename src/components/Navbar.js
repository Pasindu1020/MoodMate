import React, { useState, useRef, useEffect } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import Logo from "./Logo"
import { useAuth } from "../AuthContext"
import { useTheme } from "../theme/useTheme"
import { FiUser, FiMenu, FiX } from "react-icons/fi"

export default function Navbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const theme = useTheme()

  const [menuOpen, setMenuOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const dropdownRef = useRef(null)

  const navItems = [
    { label: "Home", path: "/" },
    { label: "Emotion", path: "/emotion" },
    { label: "Diary", path: "/diary" },
    { label: "ChatBot", path: "/chatbot" },
    { label: "Finance", path: "/finance" },
    { label: "Dashboard", path: "/dashboard" },
    { label: "Features", path: "/features" },
    { label: "About", path: "/about" },
  ]

  async function handleLogout() {
    await logout()
    navigate("/login")
  }

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <nav
      style={{
        backgroundColor: theme.surface,
        color: theme.text,
        transition: "background-color 1.5s ease, color 1.5s ease"
      }}
      className="w-full shadow-md relative z-50"
    >
      <div className="flex items-center justify-between px-4 md:px-8 py-4">
        <Logo />

        <div className="hidden md:flex space-x-6 text-lg">
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              style={{ color: "inherit" }}
              className={`transition hover:text-neon-teal ${
                location.pathname === item.path
                  ? "font-bold text-neon-teal"
                  : ""
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center space-x-4 relative" ref={dropdownRef}>
          {!user && (
            <>
              <Link
                to="/login"
                className="px-4 py-2 rounded-lg border border-neon-teal text-neon-teal hover:bg-neon-teal hover:text-dark-bg transition"
              >
                Log In
              </Link>
              <Link
                to="/signup"
                className="px-4 py-2 rounded-lg bg-neon-coral text-white hover:bg-neon-teal hover:text-dark-bg transition"
              >
                Sign Up
              </Link>
            </>
          )}

          {user && (
            <>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                style={{
                  borderColor: theme.accent,
                  boxShadow: `0 0 12px ${theme.accent}`,
                  transition: "border-color 1.5s ease, box-shadow 1.5s ease"
                }}
                className="w-10 h-10 rounded-full border-2 flex items-center justify-center"
              >
                <FiUser size={20} style={{ color: theme.accent }} />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 top-14 w-44 rounded-xl shadow-xl bg-panel-bg border border-gray-700 overflow-hidden">
                  <button
                    onClick={() => {
                      setDropdownOpen(false)
                      navigate("/profile")
                    }}
                    className="w-full text-left px-4 py-3 text-white hover:bg-neon-teal hover:text-dark-bg transition"
                  >
                    My Profile
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-3 text-white hover:bg-neon-coral transition"
                  >
                    Logout
                  </button>
                </div>
              )}
            </>
          )}

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden text-2xl"
            style={{ color: theme.accent }}
          >
            {menuOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden px-4 pb-4 space-y-3">
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMenuOpen(false)}
              className={`block text-base transition hover:text-neon-teal ${
                location.pathname === item.path
                  ? "font-bold text-neon-teal"
                  : ""
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  )
}
