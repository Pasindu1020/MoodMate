import React, { useEffect, useState, useRef } from "react";
import { useAuth } from "../AuthContext";
import { db } from "../firebase";
import { getDoc, doc } from "firebase/firestore";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useTheme } from "../theme/useTheme";


// Helper
function getYearMonthStr(d) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}
function getDaysInMonth(year, month) {
    return new Date(year, month + 1, 0).getDate();
}
const EMOJI_SIZE = 36;

const emojiList = [
    { symbol: "😔", label: "Very Sad" },
    { symbol: "😕", label: "Sad" },
    { symbol: "😐", label: "Neutral" },
    { symbol: "🙂", label: "Happy" },
    { symbol: "😄", label: "Very Happy" },
];
function moodToEmoji(mood) {
    if (!mood) return "";
    return emojiList[mood - 1]?.symbol || "";
}

export default function Dashboard() {
    const { user, loading } = useAuth();
    const [selectedMonth, setSelectedMonth] = useState(getYearMonthStr(new Date()));
    const [emotionEntries, setEmotionEntries] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [goal, setGoal] = useState({ amount: 0 });
    const [currentBalance, setCurrentBalance] = useState(0);
    const theme = useTheme();

    const financialRef = useRef(null);

    useEffect(() => {
        if (!user) return;
        // Load emotion entries
        getDoc(doc(db, "emotions", user.uid)).then(snap => {
            setEmotionEntries(snap.data()?.entries || []);
        });
        // Load transactions
        getDoc(doc(db, "transactions", user.uid)).then(snap => {
            setTransactions(snap.data()?.entries || []);
        });
        // Load goal
        getDoc(doc(db, "users", user.uid)).then(snap => {
            setGoal(snap.data()?.goals?.[0] || { amount: 0 });
        });
    }, [user]);

    // Calculate current balance (for the selected month)
    useEffect(() => {
        const [y, m] = selectedMonth.split("-").map(Number);
        const income = transactions.filter(t => {
            const td = new Date(t.date);
            return td.getFullYear() === y && td.getMonth() === m - 1 && t.type === "income";
        }).reduce((a, b) => a + Number(b.amount), 0);
        const spend = transactions.filter(t => {
            const td = new Date(t.date);
            return td.getFullYear() === y && td.getMonth() === m - 1 && t.type === "outcome";
        }).reduce((a, b) => a + Number(b.amount), 0);
        setCurrentBalance(income - spend);
    }, [transactions, selectedMonth]);

    // Calendar for emotion entries
    const [year, month] = selectedMonth.split("-").map(Number);
    const daysInMonth = getDaysInMonth(year, month - 1);

    // Build a map {date: emoji}
    const emotionMap = {};
    for (const entry of emotionEntries) {
        if (entry.date && entry.mood) {
            emotionMap[entry.date] = moodToEmoji(entry.mood);
        }
    }

    // Chart: Income vs Spend (selected month, day-by-day)
    const chartData = Array.from({ length: daysInMonth }, (_, i) => {
        const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(i + 1).padStart(2, "0")}`;
        const income = transactions.filter(t => t.date === dateStr && t.type === "income").reduce((a, b) => a + Number(b.amount), 0);
        const spend = transactions.filter(t => t.date === dateStr && t.type === "outcome").reduce((a, b) => a + Number(b.amount), 0);
        // For goal trend
        return { day: i + 1, income, spend, goal: Number(goal.amount) || 0 };
    });

    // For Goal vs Balance trend chart: accumulate current balance over days
    let runningBalance = 0;
    const goalTrend = chartData.map(d => {
        runningBalance += (d.income || 0) - (d.spend || 0);
        return { day: d.day, balance: runningBalance, goal: d.goal };
    });

    // Print/download financial section as PDF
    const handlePrint = async () => {
        if (!financialRef.current) return;
        const canvas = await html2canvas(financialRef.current);
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF({
            orientation: "landscape",
            unit: "px",
            format: [canvas.width, canvas.height]
        });
        pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
        pdf.save("financial-report.pdf");
    };

    if (loading) return <div className="text-center py-16 text-neon-teal">Loading...</div>;
    if (!user) return <div className="text-center py-20 text-lg text-neon-coral">Please log in to view your dashboard.</div>;

    return (
        <div
            className="max-w-3xl mx-auto py-10 px-2 md:px-6"
            style={{
                color: theme.text,
                transition: "color 1.5s ease"
            }}
        >
            <div
                className="border-2 border-[#29fff7] rounded-2xl p-5 mb-10 flex flex-col sm:flex-row sm:items-center gap-4 justify-between shadow-lg"
                style={{
                    backgroundColor: theme.surface,
                    color: theme.text,
                    transition: "background-color 1.5s ease, color 1.5s ease"
                }}
            >
                <h2 className="text-2xl font-bold">Dashboard</h2>
                <label className="flex items-center gap-3 text-lg font-semibold">
                    Month:
                    <input
                        type="month"
                        value={selectedMonth}
                        onChange={e => setSelectedMonth(e.target.value)}
                        className="rounded-lg px-3 py-2 bg-white text-black border border-[#29fff7] ml-2"
                        style={{ fontSize: "1.1rem", minWidth: 130 }}
                    />
                </label>
            </div>

            <section
                className="border-2 border-[#29fff7] rounded-2xl p-5 shadow-lg mb-10"
                style={{
                    backgroundColor: theme.surface,
                    color: theme.text,
                    transition: "background-color 1.5s ease, color 1.5s ease"
                }}
            >
                <h3 className="text-xl font-bold text-neon-coral mb-4">Emotional Trend</h3>
                <div className="overflow-x-auto">
                    <table
                        className="mx-auto text-lg font-bold text-center"
                        style={{ minWidth: 500, color: theme.text }}
                    >
                        <thead>
                            <tr>
                                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(d => (
                                    <th key={d} className="px-2 py-1">
                                        {d}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {(() => {
                                const weeks = [];
                                let d = new Date(year, month - 1, 1);
                                let dayOfWeek = d.getDay(); if (dayOfWeek === 0) dayOfWeek = 7;
                                let row = Array(dayOfWeek - 1).fill(null);
                                for (let i = 1; i <= daysInMonth; ++i) {
                                    const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(i).padStart(2, "0")}`;
                                    row.push(
                                        <td key={i} className="w-20 h-20 align-top">
                                            <div className="flex flex-col items-center justify-start">
                                                <span className="text-xl font-bold">{i}</span>
                                                {emotionMap[dateStr] && (
                                                    <span style={{ fontSize: EMOJI_SIZE }}>
                                                        {emotionMap[dateStr]}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                    );
                                    if (row.length === 7) {
                                        weeks.push(<tr key={weeks.length}>{row}</tr>);
                                        row = [];
                                    }
                                }
                                if (row.length > 0) {
                                    while (row.length < 7) row.push(<td key={"e" + row.length} />);
                                    weeks.push(<tr key={weeks.length}>{row}</tr>);
                                }
                                return weeks;
                            })()}
                        </tbody>
                    </table>
                </div>
            </section>

            <section
                className="border-2 border-[#29fff7] rounded-2xl p-6 shadow-lg mb-10"
                ref={financialRef}
                style={{
                    backgroundColor: theme.surface,
                    color: theme.text,
                    transition: "background-color 1.5s ease, color 1.5s ease"
                }}
            >
                <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-neon-purple">Financial Trend</h3>
                    <button
                        className="px-5 py-2 rounded bg-[#29fff7] text-black font-bold hover:bg-[#13b8b1] transition text-lg mt-4 sm:mt-0"
                        onClick={handlePrint}
                    >
                        Print PDF
                    </button>
                </div>

                <div className="mb-12">
                    <div className="text-lg font-semibold mb-2 text-neon-teal">
                        Income vs Spend (Day by Day)
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={chartData}>
                            <XAxis dataKey="day" tick={{ fill: theme.text, fontWeight: "bold" }} />
                            <YAxis tick={{ fill: theme.text, fontWeight: "bold" }} />
                            <Tooltip />
                            <Line type="monotone" dataKey="income" stroke="#4ECDC4" strokeWidth={3} dot={{ r: 4 }} />
                            <Line type="monotone" dataKey="spend" stroke="#FF6B6B" strokeWidth={3} dot={{ r: 4 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                <div>
                    <div className="text-lg font-semibold mb-2 text-neon-coral">
                        Goal vs Current Balance Trend
                    </div>
                    <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={goalTrend}>
                            <XAxis dataKey="day" tick={{ fill: theme.text, fontWeight: "bold" }} />
                            <YAxis tick={{ fill: theme.text, fontWeight: "bold" }} />
                            <Tooltip />
                            <Line type="monotone" dataKey="goal" stroke="#7c55c8" strokeWidth={3} dot={false} />
                            <Line type="monotone" dataKey="balance" stroke="#29fff7" strokeWidth={3} dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </section>
        </div>
    );


}
