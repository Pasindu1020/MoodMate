import React, { useEffect, useState } from "react"
import { useAuth } from "../AuthContext"
import { auth, db } from "../firebase"
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider, updateProfile } from "firebase/auth"
import { doc, updateDoc } from "firebase/firestore"
import { useNavigate } from "react-router-dom"
import { FiEdit2, FiUser } from "react-icons/fi"
import { useTheme } from "../theme/useTheme"

export default function MyProfile() {
    const { user, userData, loading, logout } = useAuth()
    const navigate = useNavigate()
    const theme = useTheme()

    const [username, setUsername] = useState(user?.displayName || "")
    const [editing, setEditing] = useState(false)
    const [showPassword, setShowPassword] = useState(false)

    const [oldPassword, setOldPassword] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")

    useEffect(() => {
        if (!loading && userData && userData.displayName) {
            setUsername(userData.displayName)
        }
    }, [loading, userData])

    if (loading) {
        return (
            <div
                className="min-h-screen flex items-center justify-center"
                style={{
                    backgroundColor: theme.bg,
                    color: theme.text,
                    transition: "background-color 1.5s ease, color 1.5s ease"
                }}
            >
                Loading...
            </div>
        )
    }

    if (!user) {
        navigate("/login")
        return null
    }

    async function saveUsername() {
        if (!username.trim()) return

        await updateDoc(doc(db, "users", user.uid), {
            displayName: username
        })

        await updateProfile(auth.currentUser, {
            displayName: username
        })

        setEditing(false)
    }

    async function handlePasswordChange() {
        if (newPassword !== confirmPassword) {
            alert("Passwords do not match")
            return
        }

        try {
            const credential = EmailAuthProvider.credential(
                user.email,
                oldPassword
            )

            await reauthenticateWithCredential(auth.currentUser, credential)
            await updatePassword(auth.currentUser, newPassword)

            alert("Password has been updated")
            await logout()
            navigate("/login")
        } catch (err) {
            if (err.code === "auth/invalid-credential") {
                alert("Old password is incorrect")
            } else if (err.code === "auth/requires-recent-login") {
                alert("Please login again")
                navigate("/login")
            } else {
                alert("Password update failed")
            }
        }
    }

    return (
        <div
            className="min-h-screen flex items-center justify-center px-4"
            style={{
                backgroundColor: theme.bg,
                transition: "background-color 1.5s ease"
            }}
        >
            <div
                className="w-full max-w-md rounded-2xl p-8 shadow-2xl border border-neon-teal"
                style={{
                    backgroundColor: theme.surface,
                    color: theme.text,
                    transition: "background-color 1.5s ease, color 1.5s ease"
                }}
            >
                <h2 className="text-2xl font-bold text-neon-coral text-center mb-8">
                    My Profile
                </h2>

                <div className="flex justify-center mb-6">
                    <div className="w-28 h-28 rounded-full border-2 border-neon-teal flex items-center justify-center text-neon-teal">
                        <FiUser size={48} />
                    </div>
                </div>

                <div className="flex items-center justify-between mb-6">
                    {editing ? (
                        <input
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            className="flex-1 mr-3 px-4 py-2 rounded-lg outline-none"
                            style={{
                                backgroundColor: "#101423",
                                color: "#ffffff"
                            }}
                        />
                    ) : (
                        <span className="text-lg font-semibold">
                            {username}
                        </span>
                    )}

                    {!editing ? (
                        <FiEdit2
                            className="text-neon-teal cursor-pointer text-xl"
                            onClick={() => setEditing(true)}
                        />
                    ) : (
                        <button
                            onClick={saveUsername}
                            className="px-4 py-2 bg-neon-teal text-black rounded-lg font-bold"
                        >
                            Save
                        </button>
                    )}
                </div>

                {user.providerData[0].providerId === "password" && (
                    <>
                        <div className="border-t border-gray-700 my-6"></div>

                        {!showPassword ? (
                            <button
                                onClick={() => setShowPassword(true)}
                                className="w-full py-3 bg-neon-coral text-black rounded-lg font-bold"
                            >
                                Update Password
                            </button>
                        ) : (
                            <div className="space-y-4">
                                <input type="password" placeholder="Old Password" value={oldPassword} onChange={e => setOldPassword(e.target.value)} className="w-full px-4 py-3 rounded-lg outline-none" style={{ backgroundColor: "#101423", color: "#ffffff" }} />
                                <input type="password" placeholder="New Password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full px-4 py-3 rounded-lg outline-none" style={{ backgroundColor: "#101423", color: "#ffffff" }} />
                                <input type="password" placeholder="Confirm New Password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full px-4 py-3 rounded-lg outline-none" style={{ backgroundColor: "#101423", color: "#ffffff" }} />
                                <button onClick={handlePasswordChange} className="w-full py-3 bg-neon-teal text-black rounded-lg font-bold">
                                    Save New Password
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}
