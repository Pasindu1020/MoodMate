import React, { useState, useEffect } from "react";
import { useAuth } from "../AuthContext";
import { db } from "../firebase";
import { setDoc, doc, updateDoc, getDoc, arrayUnion } from "firebase/firestore";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useTheme } from "../theme/useTheme";

function getToday() {
  return new Date().toISOString().slice(0, 10);
}

export default function Finance() {
  const { user, loading } = useAuth();
  const [goal, setGoal] = useState({ amount: 10000, deadline: "2025-07-15" });
  const [goalInput, setGoalInput] = useState({ amount: "", deadline: "" });
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [form, setForm] = useState({ type: "income", desc: "", amount: "", date: getToday() });
  const [recurring, setRecurring] = useState({ desc: "", amount: "", day: "" });
  const [recurringBills, setRecurringBills] = useState([]);
  const [billAlert, setBillAlert] = useState(null);
    const theme = useTheme();


  useEffect(() => {
    if (user) {
      // Load transactions
      getDoc(doc(db, "transactions", user.uid)).then(snap => {
        setTransactions(snap.data()?.entries || []);
      });
      // Load goals and recurring bills
      getDoc(doc(db, "users", user.uid)).then(snap => {
        const g = snap.data()?.goals?.[0];
        if (g) setGoal(g);
        setRecurringBills(snap.data()?.recurringBills || []);
      });
    }
  }, [user]);

  // Add saving goal
  const addGoal = async () => {
    setGoal({ amount: Number(goalInput.amount), deadline: goalInput.deadline });
    if (user) {
      await setDoc(doc(db, "users", user.uid), {
        goals: [{ amount: Number(goalInput.amount), deadline: goalInput.deadline }]
      }, { merge: true });
    }
    setShowGoalForm(false);
    setGoalInput({ amount: "", deadline: "" });
  };

  // Add transaction
  const handleAdd = async e => {
    e.preventDefault();
    if (!form.desc || !form.amount || !form.date) return;
    if (user) {
      const txRef = doc(db, "transactions", user.uid);
      await setDoc(txRef, {}, { merge: true });
      await updateDoc(txRef, {
        entries: arrayUnion({
          ...form,
          amount: Number(form.amount)
        })
      });
      // reload transactions
      getDoc(txRef).then(snap => setTransactions(snap.data()?.entries || []));
    }
    setForm({ type: "income", desc: "", amount: "", date: getToday() });
  };

  // Add recurring bill
  const handleAddRecurring = async e => {
    e.preventDefault();
    const newBills = [...recurringBills, { ...recurring, amount: Number(recurring.amount), day: Number(recurring.day) }];
    setRecurringBills(newBills);
    if (user) {
      await setDoc(doc(db, "users", user.uid), {
        recurringBills: newBills
      }, { merge: true });
    }
    setRecurring({ desc: "", amount: "", day: "" });
  };

  // Mock bill alert (today matches)
  useEffect(() => {
    const today = new Date().getDate();
    const dueBill = recurringBills.find(bill => Number(bill.day) === today);
    setBillAlert(dueBill || null);
  }, [recurringBills]);

  // Settle bill
  const settleBill = async () => {
    if (user && billAlert) {
      const txRef = doc(db, "transactions", user.uid);
      await setDoc(txRef, {}, { merge: true });
      await updateDoc(txRef, {
        entries: arrayUnion({
          type: "outcome",
          desc: billAlert.desc,
          amount: billAlert.amount,
          date: getToday()
        })
      });
      setBillAlert(null);
      // reload transactions
      getDoc(txRef).then(snap => setTransactions(snap.data()?.entries || []));
    }
  };

  // Reports
  const monthlyIncome = transactions.filter(t => t.type === "income").reduce((a, b) => a + Number(b.amount), 0);
  const monthlySpend = transactions.filter(t => t.type === "outcome").reduce((a, b) => a + Number(b.amount), 0);
  const currentBalance = monthlyIncome - monthlySpend;
  const canSpend = currentBalance - goal.amount > 0 ? currentBalance - goal.amount : 0;

  // Real-time daily chart for past 7 days
  const dailyData = Array.from({length: 7}, (_, i) => {
    const day = new Date();
    day.setDate(day.getDate() - (6 - i));
    const dateStr = day.toISOString().slice(0,10);
    const income = transactions.filter(t => t.date === dateStr && t.type === "income").reduce((a, b) => a + Number(b.amount), 0);
    const spend = transactions.filter(t => t.date === dateStr && t.type === "outcome").reduce((a, b) => a + Number(b.amount), 0);
    return { date: dateStr.slice(5), income, spend };
  });

  if (loading) return <div className="text-center py-16 text-neon-teal">Loading...</div>;
  if (!user) return <div className="text-center py-20 text-lg text-neon-coral">Please log in to use your Finance dashboard.</div>;

  return (
  <div
    className="max-w-5xl mx-auto py-12 space-y-14"
    style={{
      color: theme.text,
      transition: "color 1.5s ease"
    }}
  >
    <div
      className="w-full px-6 py-4 rounded-xl shadow-lg border border-[#29fff7] flex flex-wrap items-center gap-6 mb-8 text-lg font-semibold"
      style={{
        backgroundColor: theme.surface,
        transition: "background-color 1.5s ease"
      }}
    >
      <span style={{ color: theme.text }} className="font-bold">
        Balance: LKR {currentBalance?.toLocaleString()}
      </span>
      <span className="text-neon-coral font-bold ml-4">
        Goal: LKR {goal.amount?.toLocaleString()}
      </span>
      <span className="text-neon-teal ml-4">
        Can spend: LKR {canSpend?.toLocaleString()}
      </span>
      <span style={{ color: theme.text }} className="ml-auto text-base">
        Target: {goal.deadline}
      </span>
      <button
        onClick={() => setShowGoalForm(!showGoalForm)}
        className="ml-4 px-4 py-2 rounded bg-neon-teal text-dark-bg font-bold hover:bg-neon-coral hover:text-white transition text-base"
      >
        {showGoalForm ? "Cancel" : "Add Saving Goal"}
      </button>
      
    </div>

    {showGoalForm && (
      <div
        className="mb-4 rounded-xl p-6 flex gap-4 items-end shadow"
        style={{ backgroundColor: theme.surface }}
      >
        <input name="amount" type="number" value={goalInput.amount} onChange={e=>setGoalInput({...goalInput, amount: e.target.value})} placeholder="Goal Amount" className="rounded px-2 py-1 text-black" />
        <input name="deadline" type="date" value={goalInput.deadline} onChange={e=>setGoalInput({...goalInput, deadline: e.target.value})} className="rounded px-2 py-1 text-black" />
        <button onClick={addGoal} className="px-4 py-2 rounded-lg bg-neon-teal text-dark-bg font-bold hover:bg-neon-coral hover:text-white transition">
          Add Goal
        </button>
      </div>
    )}

    <section
      className="rounded-2xl p-8 shadow-lg mb-8"
      style={{ backgroundColor: theme.surface }}
    >
      <h2 className="text-2xl font-bold mb-4" style={{ color: theme.text }}>
        Add Transaction
      </h2>
      <form className="flex flex-col md:flex-row gap-4 items-center mb-6" onSubmit={handleAdd}>
        <select name="type" value={form.type} onChange={e=>setForm({...form, type: e.target.value})} className="rounded px-2 py-1 text-black">
          <option value="income">Income</option>
          <option value="outcome">Outcome</option>
        </select>
        <input name="desc" value={form.desc} onChange={e=>setForm({...form, desc: e.target.value})} placeholder="Description" required className="rounded px-2 py-1 text-black" />
        <input name="amount" value={form.amount} onChange={e=>setForm({...form, amount: e.target.value})} type="number" placeholder="Amount" required className="rounded px-2 py-1 text-black" />
        <input name="date" value={form.date} onChange={e=>setForm({...form, date: e.target.value})} type="date" required className="rounded px-2 py-1 text-black" />
        <button className="px-4 py-2 rounded-lg bg-neon-teal text-dark-bg font-bold hover:bg-neon-coral hover:text-white transition" type="submit">
          Add
        </button>
      </form>

      <table className="w-full mt-6 text-left">
        <thead>
          <tr style={{ color: theme.text }}>
            <th className="py-2">Type</th>
            <th>Description</th>
            <th>Amount</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((t, i) => (
            <tr key={i} className={t.type === "income" ? "text-neon-teal" : "text-neon-coral"}>
              <td className="py-1">{t.type}</td>
              <td>{t.desc}</td>
              <td>LKR {t.amount?.toLocaleString()}</td>
              <td>{t.date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>

    <section
      className="rounded-2xl p-8 shadow-lg"
      style={{ backgroundColor: theme.surface }}
    >
      <h2 className="text-xl font-bold mb-2" style={{ color: theme.text }}>
        Add Monthly Recurring Outcome
      </h2>
      <form className="flex flex-col md:flex-row gap-4 items-center mb-6" onSubmit={handleAddRecurring}>
        <input name="desc" value={recurring.desc} onChange={e=>setRecurring({...recurring, desc: e.target.value})} placeholder="Bill Description" required className="rounded px-2 py-1 text-black" />
        <input name="amount" value={recurring.amount} onChange={e=>setRecurring({...recurring, amount: e.target.value})} type="number" placeholder="Amount" required className="rounded px-2 py-1 text-black" />
        <input name="day" value={recurring.day} onChange={e=>setRecurring({...recurring, day: e.target.value})} type="number" placeholder="Day (1-31)" required className="rounded px-2 py-1 text-black" />
        <button className="px-4 py-2 rounded-lg bg-neon-coral text-white font-bold hover:bg-neon-teal hover:text-dark-bg transition" type="submit">
          Add Recurring
        </button>
      </form>

      <ul style={{ color: theme.text }} className="space-y-1">
        {recurringBills.map((bill, i) => (
          <li key={i}>
            {bill.desc} – LKR {bill.amount?.toLocaleString()} every month on day {bill.day}
          </li>
        ))}
      </ul>

      {billAlert && (
        <div className="mt-6 p-4 rounded font-semibold" style={{ backgroundColor: theme.accentSoft }}>
          Alert: "{billAlert.desc}" is due today!
          <button onClick={settleBill} className="mt-2 px-4 py-2 rounded bg-neon-teal text-dark-bg hover:bg-neon-purple transition">
            Have you settled the bill? Click to confirm
          </button>
        </div>
      )}
    </section>
  </div>
);

}
