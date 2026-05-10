import React, { useState, useEffect, } from "react";
import { useTheme } from "../theme/useTheme";
import { useAuth } from "../AuthContext";
import { db } from "../firebase";
import { setDoc, updateDoc, doc, getDoc, arrayUnion } from "firebase/firestore";
import "./MovieCard.css";



// Helper for YouTube info without API key
async function getYoutubeInfo(videoId) {
  const url = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
  try {
    const resp = await fetch(url);
    if (!resp.ok) return null;
    return await resp.json();
  } catch {
    return null;
  }
}

const genreMap = {
  28: "Action",
  16: "Animation",
  35: "Comedy",
  878: "Sci-Fi",
  14: "Fantasy",
  // Add more as needed
};

const apiKey = '89b8584abafe02ac354744a9d4d8170f';
const apiUrl = `https://api.themoviedb.org/3/trending/movie/week?api_key=${apiKey}`;

const supportTypes = [
  { id: "anxiety", label: "Anxiety Support" },
  { id: "depression", label: "Depression Support" },
  { id: "deep_sleep", label: "Deep Sleep Support" },
];

function getToday() {
  return new Date().toISOString().slice(0, 10);
}

// --- MovieCard component, using your CSS and markup ---
function MovieCard({ movie }) {
  return (
    <div className="card">
      <div className="poster">
        <img src={`https://image.tmdb.org/t/p/original${movie.poster_path}`} alt={movie.title} />
      </div>
      <div className="details">
        <h1>{movie.title}</h1>
        <div className="tags">
          {(movie.genre_ids || []).map((gid) => (
            <span className="tag" key={gid}>
              {genreMap[gid] || "Other"}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// --- VideoCard component, styled similarly ---
function VideoCard({ yt }) {
  return (
    <div
      className="bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer hover:ring-4 hover:ring-[#29fff7] transition -full max-w-[360px] mx-auto"
      onClick={() => window.open(`https://youtu.be/${yt.id}`, "_blank")}
      tabIndex={0}
    >
      <img src={yt.thumbnail_url} alt={yt.title} className="w-full h-40 object-cover" />
      <div className="p-3">
        <div className="font-semibold text-base text-black line-clamp-2">{yt.title}</div>
        <div className="text-[#7c55c8] text-xs mt-1">YouTube</div>
      </div>
    </div>
  );
}


export default function Emotion() {
  const { user, loading } = useAuth();
  const [mood, setMood] = useState(3);
  const [submitted, setSubmitted] = useState(false);
  const [recDoc, setRecDoc] = useState(null);
  const [youtubeRecs, setYoutubeRecs] = useState([]);
  const [calmMusic, setCalmMusic] = useState([]);
  const [lofiMusic, setLofiMusic] = useState([]);
  const [danceMusic, setDanceMusic] = useState([]);
  const [movies, setMovies] = useState([]);
  const [movieGenres, setMovieGenres] = useState([]);
  const [loadingRecs, setLoadingRecs] = useState(false);
  const theme = useTheme();

  //Modification
//   const [activities, setActivities] = useState("")
//   const [loadingActivities, setLoadingActivities] = useState(false)

//   async function getActivitiesFromAI(emotion, money) {
//   const prompt = `User has ${emotion} and has ${money} to spend, recommend some activities user can do for this emotion`

//   try {
//     const res = await fetch("http://localhost:5000/api/chatbot/chat", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ message: prompt })
//     })

//     if (!res.ok) throw new Error("Network response not OK")

//     const data = await res.json()
//     return data.reply || "Here are some simple activities you can try."
//   } catch (err) {
//     console.error("OLLAMA FETCH ERROR:", err)
//     return "Here are some simple activities you can try."
//   }
// }
// const handleFetchActivities = async () => {
//   setLoadingActivities(true)
//   const result = await getActivitiesFromAI(emotion, money)
//   setActivities(result)
//   setLoadingActivities(false)
// }

const [activities, setActivities] = useState("")
const [loadingActivities, setLoadingActivities] = useState(false)
const [emotion, setEmotion] = useState("")
const [money, setMoney] = useState("")

async function getActivitiesFromAI(emotionVal, moneyVal) {
  //const prompt = `User has ${emotionVal} and has ${moneyVal} to spend, recommend some activities user can do for this emotion`
  const prompt = `You are a helpful assistant. 
The user feels "${emotionVal}" and has "${moneyVal}"$ amount to spend. 
Suggest 3-5 simple activities the user can do to improve their mood by spending money. 
Reply only with the activities, in plain text.`

  try {
    const res = await fetch("http://localhost:5000/api/chatbot", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ message: prompt })
})

    if (!res.ok) throw new Error("Network response not OK")

    const data = await res.json()
    return data.reply || "Here are some simple activities you can try."
  } catch (err) {
    console.error("OLLAMA FETCH ERROR:", err)
    return "Here are some simple activities you can try."
  }

 

}
const handleFetchActivities = async () => {
  if (!emotion || !money) return
  setLoadingActivities(true)

  let result = await getActivitiesFromAI(emotion, money)

  const lines = result.split(/\d+\.\s+/).filter(l => l.trim() !== "")
  const activitiesToShow = lines.slice(0, 5)


  setActivities(activitiesToShow)
  setLoadingActivities(false)
}

{/* <div className="mt-4">
  {loadingActivities && <div className="text-gray-400 italic">Loading activities…</div>}
  {activities.length > 0 && !loadingActivities && (
    <ul className="text-white list-disc list-inside space-y-1">
      {activities.map((act, idx) => (
        <li key={idx}>{act}</li>
      ))}
    </ul>
  )}
</div> */}

  // Section 2 state:
  const [support, setSupport] = useState("");
  const [videoList, setVideoList] = useState([]);
  const [videoInfos, setVideoInfos] = useState({});
  const [loadingVideos, setLoadingVideos] = useState(false);

  const emojiList = [
    { symbol: "😔", label: "Very Sad" },
    { symbol: "😕", label: "Sad" },
    { symbol: "😐", label: "Neutral" },
    { symbol: "🙂", label: "Happy" },
    { symbol: "😄", label: "Very Happy" },
  ];



  useEffect(() => {
    if (!submitted) return;
    const label = emojiList[mood - 1].label.toLowerCase().replace(" ", "_");
    setLoadingRecs(true);


    getDoc(doc(db, "mood_recommendations", label)).then(async snap => {
      const recs = snap.data() || {};
      setRecDoc(recs);

      // 1. YouTube: Try Not to Laugh
      const ytIds = recs.youtube || [];
      const yt = await Promise.all(ytIds.map(async id => ({
        ...await getYoutubeInfo(id),
        id,
      })));
      setYoutubeRecs(yt.filter(Boolean));

      // 2. Calm Music
      const calmIds = recs.calm_music || [];
      setCalmMusic(
        (await Promise.all(calmIds.map(async id => ({
          ...await getYoutubeInfo(id),
          id,
        })))).filter(Boolean)
      );

      // 3. Lofi Songs
      const lofiIds = recs.lofi || [];
      setLofiMusic(
        (await Promise.all(lofiIds.map(async id => ({
          ...await getYoutubeInfo(id),
          id,
        })))).filter(Boolean)
      );

      // 4. Music Make You Dance
      const danceIds = recs.music_dance || [];
      setDanceMusic(
        (await Promise.all(danceIds.map(async id => ({
          ...await getYoutubeInfo(id),
          id,
        })))).filter(Boolean)
      );

      // 5. Movies
      let categories = recs.movie_categories || [];
      const resp = await fetch(apiUrl);
      const movieData = await resp.json();
      const allMovies = movieData.results || [];
      const genreNameToId = {
        "action": 28,
        "animation": 16,
        "comedy": 35,
        "sci-fi": 878,
        "fantasy": 14
      };
      let genreIds = categories.flatMap(cat =>
        genreNameToId[cat.toLowerCase()] ? [genreNameToId[cat.toLowerCase()]] : []
      );
      setMovieGenres(categories);

      // Unique movies by id, filter by any of mood genres
      const uniqueMovies = Array.from(
        new Map(
          allMovies
            .filter(m => m.genre_ids.some(gid => genreIds.includes(gid)))
            .map(m => [m.id, m])
        ).values()
      );
      setMovies(uniqueMovies.slice(0, 9));
      setLoadingRecs(false);
    });
    // eslint-disable-next-line
  }, [submitted]);


  useEffect(() => {
    if (!support) return;
    setLoadingVideos(true);
    getDoc(doc(db, "support_videos", support)).then(snap => {
      const data = snap.data();
      const vidsRaw = data?.videos;
      const vids = Array.isArray(vidsRaw) ? vidsRaw : [];
      setVideoList(vids);
      setVideoInfos({});
      Promise.all(
        vids.map(async vid => [vid, await getYoutubeInfo(vid)])
      ).then(results => {
        const infoMap = {};
        for (const [vid, info] of results) {
          if (info) infoMap[vid] = info;
        }
        setVideoInfos(infoMap);
        setLoadingVideos(false);
      });
    });
    // Track support usage
    if (user) {
      setDoc(doc(db, "support_usage", user.uid), {
        supports: arrayUnion({ type: support, timestamp: new Date() })
      }, { merge: true });
    }
  }, [support, user]);

  // Track which video is clicked most (Section 2)
  const handleVideoClick = async (videoId) => {
    if (user) {
      await setDoc(doc(db, "video_clicks", user.uid), {
        videos: arrayUnion({ id: videoId, type: support, timestamp: new Date() })
      }, { merge: true });
    }
    window.open(`https://www.youtube.com/watch?v=${videoId}`, "_blank");
  };

  // Save mood and show recommendations
  const handleSubmit = async e => {
    e.preventDefault();
    setSubmitted(true);

    //Modification
    let canSpendAmount = 0

    if (user) {
      const txSnap = await getDoc(doc(db, "transactions", user.uid))
      const transactions = txSnap.data()?.entries || []

      const income = transactions
        .filter(t => t.type === "income")
        .reduce((a, b) => a + Number(b.amount), 0)

      const spend = transactions
        .filter(t => t.type === "outcome")
        .reduce((a, b) => a + Number(b.amount), 0)

      const balance = income - spend

      const userSnap = await getDoc(doc(db, "users", user.uid))
      const goal = userSnap.data()?.goals?.[0]?.amount || 0

      canSpendAmount = balance - goal > 0 ? balance - goal : 0
    }

    const emotionLabel = emojiList[mood - 1].label

    setLoadingActivities(true)

    const aiActivities = await getActivitiesFromAI(emotionLabel, canSpendAmount)

    if (!aiActivities) {
      setActivities("AI is not responding. Please check Ollama server.")
    } else {
      setActivities(aiActivities)
    }
    setLoadingActivities(false)


    // Save to Firestore
    if (user) {
      const emotionRef = doc(db, "emotions", user.uid);
      await setDoc(emotionRef, {}, { merge: true });
      await updateDoc(emotionRef, {
        entries: arrayUnion({
          date: getToday(),
          mood,
          createdAt: new Date()
        })
      });
    }
    await handleFetchActivities()
  };

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Please log in.</div>;

  return (
    <div
      className="max-w-7xl mx-auto px-4 sm:px-6 py-12 space-y-12"
      style={{
        backgroundColor: theme.bg,
        transition: "background-color 1.5s ease"
      }}
    >
      <div className="sticky top-4 flex justify-end z-50">
        <div
          className="switch-holder"
          style={{
            color: theme.text
          }}
        >
          <div className="switch-label">
            <span>Color Change</span>
          </div>
          <div className="switch-toggle">
            <input
              type="checkbox"
              id="colorChange"
              checked={theme.adaptiveEnabled}
              onChange={() => theme.setAdaptiveEnabled(!theme.adaptiveEnabled)}
            />
            <label htmlFor="colorChange"></label>
          </div>
        </div>
      </div>


      {/* Section 1: Mood selector & recommendations */}
      <section
        className="rounded-2xl p-8 shadow-lg"
        style={{
          backgroundColor: theme.surface,
          color: theme.text,
          maxWidth: "100%",
          transition: "background-color 1.5s ease, color 1.5s ease"
        }}
      >
        <h1
          className="text-3xl font-bold mb-4"
          style={{ color: theme.text }}
        >
          How was your day?
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col items-center space-y-6">
          <div className="flex flex-wrap justify-center gap-6 mb-4">
            {emojiList.map((e, idx) => (
              <button
                key={e.label}
                type="button"
                className={`text-6xl transition-all ${mood === idx + 1
                  ? "scale-125 drop-shadow-[0_0_10px_rgba(78,205,196,0.8)]"
                  : "opacity-60"
                  }`}
                aria-label={e.label}
                onClick={() => {
                  setMood(idx + 1);
                  setSubmitted(false);
                  setActivities(""); // reset activities
                }}
              >
                {e.symbol}
              </button>
            ))}
          </div>

          <button className="px-8 py-2 rounded-lg bg-neon-teal text-dark-bg font-bold hover:bg-neon-coral hover:text-white transition">
            Submit Mood
          </button>
        </form>

        {/*Modification*/}
        {submitted && (
          <>
            {loadingActivities && (
              <div className="text-center my-6">
                <p className="text-lg font-semibold" style={{ color: "#ffffff" }}>
                  Recommending activities for you...
                </p>

                <div className="mt-4 flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
                </div>

                <p className="text-sm mt-3" style={{ color: "#ffffff" }}>
                  Personalizing suggestions based on your mood and budget.
                </p>
              </div>
            )}

            {!loadingActivities && activities && (
              <>
                <h2 className="text-xl font-semibold mb-2" style={{ color: theme.text }}>
                  Recommended Activities for You
                </h2>
                <div
                  className="p-4 rounded-lg shadow mb-6"
                  style={{ backgroundColor: theme.accentSoft, color: "#020617" }}
                >
                  {activities}
                </div>
              </>
            )}
          </>
        )}


        {submitted && loadingRecs && (
          <div className="text-center my-6 text-lg" style={{ color: theme.text }}>
            Loading your recommendations...
          </div>
        )}


        {submitted && !loadingRecs && (
          <>
            {youtubeRecs.length > 0 && (
              <>
                <h2 className="text-xl font-semibold mb-2" style={{ color: theme.text }}>
                  Try Not to Laugh
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-4">
                  {youtubeRecs.map(yt => (
                    <VideoCard key={yt.id} yt={yt} />
                  ))}
                </div>
              </>
            )}

            {calmMusic.length > 0 && (
              <>
                <h2 className="text-xl font-semibold mt-8 mb-2" style={{ color: theme.text }}>
                  Calm Music
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-4">
                  {calmMusic.map(yt => (
                    <VideoCard key={yt.id} yt={yt} />
                  ))}
                </div>
              </>
            )}

            {lofiMusic.length > 0 && (
              <>
                <h2 className="text-xl font-semibold mt-8 mb-2" style={{ color: theme.text }}>
                  Lofi Songs
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-4">
                  {lofiMusic.map(yt => (
                    <VideoCard key={yt.id} yt={yt} />
                  ))}
                </div>
              </>
            )}

            {danceMusic.length > 0 && (
              <>
                <h2 className="text-xl font-semibold mt-8 mb-2" style={{ color: theme.text }}>
                  Music Make You Dance
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-4">
                  {danceMusic.map(yt => (
                    <VideoCard key={yt.id} yt={yt} />
                  ))}
                </div>
              </>
            )}

            {movies.length > 0 && (
              <>
                <h2 className="text-xl font-semibold mt-8 mb-2" style={{ color: theme.text }}>
                  Recommended Movies
                </h2>
                <div
                  className="wrapper"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                    gap: 20
                  }}
                >
                  {movies.map(movie => (
                    <MovieCard key={movie.id} movie={movie} />
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </section>



      <section
        className="rounded-2xl p-8 shadow-lg"
        style={{
          backgroundColor: theme.surface,
          color: theme.text,
          maxWidth: "100%",
          transition: "background-color 1.5s ease, color 1.5s ease"
        }}
      >
        <h2
          className="text-2xl font-bold mb-6 text-center"
          style={{ color: theme.text }}
        >
          Do you need some psychological support?
        </h2>

        <div className="flex flex-wrap gap-4 justify-center mb-6">
          {supportTypes.map(s => (
            <button
              key={s.id}
              className="px-6 py-3 rounded-lg text-lg font-bold transition"
              style={{
                backgroundColor: support === s.id ? "#29fff7" : "#eaf8fc",
                color: "#020617"
              }}
              onClick={() => setSupport(s.id)}
            >
              {s.label}
            </button>
          ))}
        </div>

        {loadingVideos && (
          <div className="text-center my-10 text-lg" style={{ color: theme.text }}>
            Loading videos...
          </div>
        )}

        {!loadingVideos && support && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-3">
            {videoList.map(vid => (
              <div
                key={vid}
                className="rounded-xl shadow-lg overflow-hidden cursor-pointer transition"
                style={{ backgroundColor: "#ffffff" }}
                onClick={() => handleVideoClick(vid)}
                tabIndex={0}
              >
                <img
                  src={`https://img.youtube.com/vi/${vid}/hqdefault.jpg`}
                  alt="Video thumbnail"
                  className="w-full h-40 object-cover"
                />
                <div className="p-3">
                  <div className="font-semibold text-base text-black line-clamp-2">
                    {videoInfos[vid]?.title || "YouTube Video"}
                  </div>
                  <div className="text-xs mt-1" style={{ color: "#7c55c8" }}>
                    Watch on YouTube
                  </div>
                </div>
              </div>
            ))}

            {videoList.length === 0 && (
              <div className="col-span-2 text-center" style={{ color: theme.text }}>
                No videos available.
              </div>
            )}
          </div>
        )}
      </section>

    </div>
  );
}
