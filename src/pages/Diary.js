import React, { useState, useEffect, useRef } from "react"
import { useAuth } from "../AuthContext"
import { db } from "../firebase"
import { doc, getDoc, setDoc, updateDoc, arrayUnion } from "firebase/firestore"
import CryptoJS from "crypto-js"

const SECRET_KEY = process.env.REACT_APP_FIRESTORE_SECRET || "MOODMATE_DIARY_SECRET"
const encrypt = t => CryptoJS.AES.encrypt(t, SECRET_KEY).toString()
const decrypt = t => CryptoJS.AES.decrypt(t, SECRET_KEY).toString(CryptoJS.enc.Utf8)

const moods = ["😊", "😔", "😡", "😴", "🤔"]
const MAX_LINES = 13

const styles = `
@import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400;700&family=Playfair+Display:wght@700&display=swap');

html, body {
  overflow-x: hidden;
}

*{box-sizing:border-box;margin:0;padding:0}

.book-viewport{
  perspective:2500px;
  width:100%;
  min-height:100vh;
  display:flex;
  justify-content:center;
  padding:2vh 2vw;
  flex-wrap: wrap;
}

.book-wrapper{
  position: relative;
  width: clamp(280px, 85vw, 420px);
  max-width: 92vw;
  max-height: 78vh;
  aspect-ratio: 3.5/4.8;
  transform-style: preserve-3d;
  transition: transform 1.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.book-stage{
  width: 100%;
  max-width: 420px;
  display: flex;
  justify-content: center;
  align-items:flex-start;
  flex-shrink: 0;
}



@media (max-width: 600px) {
  .book-stage {
    align-items: flex-start;
    flex-shrink: 0;
  }
}


.spiral{
  position:absolute;
  left:-22px;
  height:92%;
  width:44px;
  top:4%;
  display:flex;
  flex-direction:column;
  justify-content:space-around;
  z-index:50;
}

.ring{
  width:50px;
  height:14px;
  background:linear-gradient(135deg,#e5e7eb,#4b5563,#e5e7eb);
  border-radius:10px;
}

.leaf{
  position:absolute;
  width:100%;
  height:100%;
  transform-origin:left;
  transform-style:preserve-3d;
  transition:transform 1.4s cubic-bezier(.645,.045,.355,1);
  z-index:var(--z);
}

.leaf.flipped{
  transform:rotateY(-180deg);
  z-index:var(--flipped-z);
}

.page-side{
  position:absolute;
  width:100%;
  height:100%;
  backface-visibility:hidden;
  padding:32px 42px;
  display:flex;
  flex-direction:column;
}

.page-side.back{
  transform:rotateY(180deg);
}

.cover{
  background:#1e3a8a url('https://www.transparenttextures.com/patterns/leather.png');
  color:#f3f4f6;
  border-left:10px solid #172554;
  display:flex;
  flex-direction:column;
  align-items:center;
  justify-content:center;
}

.cover h1{
  font-family:'Playfair Display';
  font-size:3.2rem;
  letter-spacing:4px;
  color:#fbbf24;
}

.lock-box{
  margin-top:40px;
  display:flex;
  flex-direction:column;
  align-items:center;
  gap:12px;
}

.lock-box input{
  width:130px;
  padding:10px;
  text-align:center;
  color:#262626;
  font-size:1.1rem;
  border-radius:6px;
  border:none;
  outline:none;
}

.lock-box button{
  padding:10px 26px;
  background:#fbbf24;
  color:#172554;
  font-size:1.1rem;
  font-family:'Lucida Sans';
  font-weight:900;
  border:none;
  border-radius:6px;
  cursor:pointer;
}

.paper{
  background:#fffdf0;
  background-image:
    linear-gradient(90deg,rgba(0,0,0,.03) 0%,transparent 5%,transparent 95%,rgba(0,0,0,.03) 100%),
    linear-gradient(#d1d5db 1px,transparent 1px);
  background-size: 100% 32px;
  background-position:0 0,0 100px;
}

.date-header{
  font-family:'Caveat';
  font-size:1.55rem;
  font-weight:bold;
  color:#1e3a8a;
  border-bottom:2px solid #1e3a8a;
  margin-bottom:12px;
  margin-top:4px;
  height: 35px;
}

.notebook-input{
  flex:1;
  background:transparent;
  overflow:hidden;
  border:none;
  outline:none;
  resize:none;
  font-family:'Caveat';
  font-size:1.5rem;
  color:#262626;
 line-height:32px;
  padding-top:-6px;
  margin-top:25px;
}

.notebook-input2{
  flex:1;
  background:transparent;
  overflow:hidden;
  border:none;
  outline:none;
  resize:none;
  font-family:'Caveat';
  font-size:1.5rem;
  color:#262626;
 line-height:32px;
  padding-top:-6px;
  margin-top:10px;
  margin-left:10px;
}

.emoji-row{
  display:flex;
  justify-content:center;
  flex-wrap:wrap;
  gap:10px;
  margin-bottom:10px;
}

.emoji-item{
  font-size:1.7rem;
  background:none;
  border:none;
  cursor:pointer;
}

.emoji-item.selected{
  transform:scale(1.3);
  filter:drop-shadow(0 0 6px #fbbf24);
}

.save-btn{
  padding:8px 22px;
  background:#1e3a8a;
  color:white;
  border:none;
  border-radius:6px;
  font-weight:bold;
  cursor:pointer;
}

@keyframes paperIn{
  0%{
    opacity:0;
    transform:translateY(40px) rotate(-2deg) scale(0.95);
  }
  100%{
    opacity:1;
    transform:translateY(0) rotate(0deg) scale(1);
  }
}


.diary-book-container{
  flex: 1 1 420px;
  display: flex;
  justify-content: center;
}

.diary-calendar-container{
  flex: 1 1 320px;
  max-width: 360px;
  margin-top: 100px;
  margin-right: 50px;
}

@media (max-width: 768px){
  .diary-book-container{
    flex: 1 1 100%;
    margin-left: 500px;
  }

  .diary-calendar-container{
    flex: 1 1 100%;
    max-width: 100%;
    margin-top: 35px;
    margin-left: 30px;
    margin-right: 0;
  }
}

@media (max-width: 768px) {
  .book-viewport {
    overflow-y: auto;
    overflow-x: hidden;
    -webkit-overflow-scrolling: touch;
    padding-bottom: 120px;
  }
}
`

export default function Diary() {
  const { user, loading } = useAuth()

  const page1Ref = useRef(null)
  const page2Ref = useRef(null)

  const [showSavedPopup, setShowSavedPopup] = useState(false)

  const [flipped, setFlipped] = useState([])
  const [passcode, setPasscode] = useState("")
  const [savedCode, setSavedCode] = useState("")
  const [unlocked, setUnlocked] = useState(false)

  const [page1Text, setPage1Text] = useState("")
  const [page2Text, setPage2Text] = useState("")
  const [selectedMood, setSelectedMood] = useState(null)
  const [dateStr, setDateStr] = useState("")

  // Search Option

  const [diaryEntries, setDiaryEntries] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(
    `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`
  );
  const [selectedDate, setSelectedDate] = useState(null);
  const [backupEntry, setBackupEntry] = useState(null);
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [backupData, setBackupData] = useState(null)



  useEffect(() => {
    if (!user) return;
    getDoc(doc(db, "diaries", user.uid)).then(snap => {
      setDiaryEntries(snap.data()?.entries || []);
    });
  }, [user]);

  const diaryMap = {};
  diaryEntries.forEach(entry => {
    if (entry.date && entry.mood) {
      diaryMap[entry.date] = entry;
    }
  });

  const getDaysInMonth = (year, month) =>
    new Date(year, month + 1, 0).getDate();

  const getStartDay = (year, month) =>
    new Date(year, month, 1).getDay();

  const [year, month] = selectedMonth.split("-").map(Number);
  const daysInMonth = getDaysInMonth(year, month - 1);
  const startDay = getStartDay(year, month - 1);

  const loadDiaryByDate = (dateKey) => {
    const entry = diaryMap[dateKey]
    if (!entry) return

    if (!isSearchMode) {
      setBackupData({
        page1Text,
        page2Text,
        selectedMood,
        dateStr
      })
    }

    const fullText = decrypt(entry.text)
    const lines = fullText.split("\n")

    setPage1Text(lines.slice(0, MAX_LINES).join("\n"))
    setPage2Text(lines.slice(MAX_LINES).join("\n"))
    setSelectedMood(moods.indexOf(entry.mood))

    setDateStr(
      new Date(dateKey).toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
      })
    )

    setIsSearchMode(true)
    setSelectedDate(dateKey)
  }


  const exitSearch = () => {
    if (backupData) {
      setPage1Text(backupData.page1Text)
      setPage2Text(backupData.page2Text)
      setSelectedMood(backupData.selectedMood)
      setDateStr(backupData.dateStr)
    }

    setIsSearchMode(false)
    setSelectedDate(null)
  }



  useEffect(() => {
    if (!showSavedPopup) return
    const t = setTimeout(() => setShowSavedPopup(false), 3000)
    return () => clearTimeout(t)
  }, [showSavedPopup])


  useEffect(() => {
    setDateStr(
      new Date().toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
      })
    )
  }, [])

  useEffect(() => {
    if (!user) return
    getDoc(doc(db, "users", user.uid)).then(s => {
      if (s.exists()) setSavedCode(s.data().diaryPasscode || "")
    })
  }, [user])

  const splitTextByLines = (text) => {
    const lines = text.split("\n")
    return {
      first: lines.slice(0, MAX_LINES).join("\n"),
      second: lines.slice(MAX_LINES).join("\n")
    }
  }

  const unlock = async () => {
    if (savedCode) {
      if (decrypt(savedCode) !== passcode) return
    } else {
      const enc = encrypt(passcode)
      await setDoc(doc(db, "users", user.uid), { diaryPasscode: enc }, { merge: true })
    }
    setUnlocked(true)
    setFlipped([0])
  }

  const toggle = i => {
    if (!unlocked) return
    setFlipped(f => f.includes(i) ? f.filter(x => x !== i) : [...f, i].sort())
  }

  const saveDiary = async () => {
    if (isSearchMode) return
    const fullText = `${page1Text}\n${page2Text}`.trim()
    if (!fullText || selectedMood === null) return

    const ref = doc(db, "diaries", user.uid)
    await setDoc(ref, {}, { merge: true })
    await updateDoc(ref, {
      entries: arrayUnion({
        date: new Date().toISOString().slice(0, 10),
        text: encrypt(fullText),
        mood: moods[selectedMood],
        createdAt: new Date()
      })
    })

    setSelectedMood(null)
    setShowSavedPopup(true)

  }

  if (loading || !user) return null

  return (
    <div className="book-viewport">
      <style>{styles}</style>
      <div className="diary-book-container">
        <div
          style={{
            display: "flex",
            width: "100%",
            gap: "30px",
            justifyContent: "center",
            flexWrap: "wrap"
          }}
        >
          <div
            style={{
              flex: "1 1 420px",
              display: "flex",
              justifyContent: "center"
            }}>
            <div className="book-stage">
              <div className={`book-wrapper ${flipped.length ? "is-open" : ""}`}>
                <div className="spiral">{[...Array(12)].map((_, i) => <div key={i} className="ring" />)}</div>

                <div
                  className={`leaf ${flipped.includes(0) ? "flipped" : ""}`}
                  style={{ "--z": 3, "--flipped-z": 1 }}
                  onClick={() => toggle(0)}
                >
                  <div className="page-side cover" onClick={e => e.stopPropagation()}>
                    <h1>Diary</h1>
                    {!unlocked && (
                      <div className="lock-box">
                        <input
                          type="password"
                          maxLength={4}
                          value={passcode}
                          onChange={e => setPasscode(e.target.value)}
                        />
                        <button onClick={unlock}>Unlock</button>
                      </div>
                    )}
                  </div>

                  <div className="page-side paper back" onClick={e => e.stopPropagation()}>
                    <div className="date-header">{dateStr}</div>
                    <textarea
                      readOnly={isSearchMode}
                      ref={page1Ref}
                      className="notebook-input"
                      rows={MAX_LINES}
                      value={page1Text}
                      onChange={(e) => {
                        const value = e.target.value
                        const lines = value.split("\n")

                        if (lines.length <= MAX_LINES) {
                          setPage1Text(value)
                          return
                        }

                        const first = lines.slice(0, MAX_LINES).join("\n")
                        const overflow = lines.slice(MAX_LINES).join("\n")

                        setPage1Text(first)
                        setPage2Text(prev => prev + (prev ? "\n" : "") + overflow)

                        page2Ref.current?.focus()

                      }}
                    />
                  </div>
                </div>

                <div
                  className={`leaf ${flipped.includes(1) ? "flipped" : ""}`}
                  style={{ "--z": 2, "--flipped-z": 2 }}
                  onClick={() => toggle(1)}
                >
                  <div className="page-side paper" onClick={e => e.stopPropagation()}>
                    <textarea
                      readOnly={isSearchMode}
                      className="notebook-input2"
                      rows={MAX_LINES}
                      value={page2Text}
                      onChange={e => setPage2Text(e.target.value)}
                    />


                    <div className="emoji-row">
                      {moods.map((m, i) => (
                        <button
                          key={i}
                          className={`emoji-item ${selectedMood === i ? "selected" : ""}`}
                          onClick={() => setSelectedMood(i)}
                          disabled={isSearchMode}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                    <button className="save-btn" onClick={saveDiary}>Save</button>

                  </div>

                  <div className="page-side paper back" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="diary-calendar-container">
        {unlocked && (
          <div
            style={{
              flex: "1 1 260px",
              maxWidth: 320,
              background: "#f8f4e8",
              color: "#1E3A8A",
              padding: 16,
              borderRadius: 12,
              fontFamily: "Caveat",
              boxShadow: "0 8px 20px rgba(0,0,0,.25)",
              overflow: "hidden"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
              <button onClick={() =>
                setSelectedMonth(prev => {
                  const d = new Date(prev + "-01");
                  d.setMonth(d.getMonth() - 1);
                  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
                })
              }>◀</button>

              <strong>
                {new Date(selectedMonth + "-01").toLocaleString("default", {
                  month: "long",
                  year: "numeric"
                })}
              </strong>

              <button onClick={() =>
                setSelectedMonth(prev => {
                  const d = new Date(prev + "-01");
                  d.setMonth(d.getMonth() + 1);
                  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
                })
              }>▶</button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", textAlign: "center", fontWeight: "bold" }}>
              {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(d => <div key={d}>{d}</div>)}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 6 }}>
              {[...Array(startDay)].map((_, i) => <div key={"e" + i} />)}

              {[...Array(daysInMonth)].map((_, i) => {
                const day = i + 1;
                const dateKey = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                const entry = diaryMap[dateKey];

                return (
                  <div
                    key={dateKey}
                    onClick={() => {
                      setSelectedDate(dateKey);
                      loadDiaryByDate(dateKey);
                    }}
                    style={{
                      cursor: entry ? "pointer" : "default",
                      padding: 6,
                      borderRadius: 6,
                      background: selectedDate === dateKey ? "#1e3a8a" : "transparent",
                      color: selectedDate === dateKey ? "#fff" : "#1e293b",
                      textAlign: "center",
                      overflow: "hidden"
                    }}
                  >
                    {day}
                    {entry && <div style={{ fontSize: "clamp(14px, 3vw, 18px)", lineHeight: "1", marginTop: 2 }}>{entry.mood}</div>}
                  </div>
                );
              })}
            </div>

            {isSearchMode && (
              <button
                onClick={exitSearch}
                style={{
                  marginTop: 12,
                  width: "100%",
                  background: "#6b7280",
                  color: "white",
                  border: "none",
                  borderRadius: 6,
                  fontWeight: "bold",
                  fontSize: 20,
                  padding: 6,
                  cursor: "pointer"
                }}
              >
                Back to Today
              </button>
            )}
          </div>
        )}
      </div>

      {showSavedPopup && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.35)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 999
          }}
          onClick={() => setShowSavedPopup(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#cdcdcdff",
              color: "black",
              padding: "22px 30px",
              borderRadius: "8px",
              border: "1px solid #d1d5db",
              boxShadow: "0 12px 35px rgba(0,0,0,0.35)",
              fontFamily: "Caveat",
              fontSize: "1.5rem",
              textAlign: "center",
              minWidth: "260px",
              animation: "paperIn 0.6s cubic-bezier(.22,1,.36,1)"
            }}
          >
            Diary data saved
            <div style={{ marginTop: "14px" }}>
              <button
                onClick={() => setShowSavedPopup(false)}
                style={{
                  background: "#1e3a8a",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  padding: "6px 16px",
                  cursor: "pointer",
                  fontSize: "1rem"
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}