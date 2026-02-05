import { useEffect, useRef, useState } from "react";
import "./App.css";

function App() {
  const [songs, setSongs] = useState([]);
  const [currentSong, setCurrentSong] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(1);
const [search, setSearch] = useState("");
const [favorites, setFavorites] = useState([]);
const [selected, setSelected] = useState([]);
const [sortBy, setSortBy] = useState("title");
const [page, setPage] = useState(1);
const perPage = 6;


  const audioRef = useRef();

  const API_URL = "https://wp0mgfo32a.execute-api.us-east-1.amazonaws.com/dev/songs";
  const MUSIC_URL = "https://d5w1fxxp0f1oc.cloudfront.net/";
  const downloadSong = (song) => {
  const link = document.createElement("a");
  link.href = `${MUSIC_URL}${song.s3Key}`;
  link.download = song.s3Key;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};


  // Fetch songs
  useEffect(() => {
    fetch(API_URL)
      .then(res => res.json())
      .then(data => setSongs(data))
      .catch(err => console.error(err));
  }, []);

  // Update progress bar
  const updateProgress = () => {
    const audio = audioRef.current;
    if (!audio) return;
    setProgress((audio.currentTime / audio.duration) * 100 || 0);
  };

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (playing) audio.pause();
    else audio.play();

    setPlaying(!playing);
  };

  const selectSong = song => {
    setCurrentSong(song);
    setPlaying(true);
    setTimeout(() => audioRef.current.play(), 200);
  };

  const changeProgress = e => {
    const audio = audioRef.current;
    const newTime = (e.target.value / 100) * audio.duration;
    audio.currentTime = newTime;
    setProgress(e.target.value);
  };

  const changeVolume = e => {
    const v = e.target.value;
    audioRef.current.volume = v;
    setVolume(v);
  };
  // ---- PLAYER HELPERS ----

const nextSong = () => {
  const index = songs.findIndex(s => s.songId === currentSong.songId);
  const next = songs[(index + 1) % songs.length];
  selectSong(next);
};

const prevSong = () => {
  const index = songs.findIndex(s => s.songId === currentSong.songId);
  const prev = songs[(index - 1 + songs.length) % songs.length];
  selectSong(prev);
};

const seek = seconds => {
  const audio = audioRef.current;
  audio.currentTime += seconds;
};

const toggleMute = () => {
  const audio = audioRef.current;
  audio.muted = !audio.muted;
};

// Format time mm:ss
const formatTime = t => {
  if (!t) return "0:00";
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60);
  return `${m}:${s.toString().padStart(2,"0")}`;
};

const [time, setTime] = useState({current:0,duration:0});

const updateTime = () => {
  const audio = audioRef.current;
  setTime({
    current: audio.currentTime,
    duration: audio.duration
  });
};

const filteredSongs = songs.filter(song =>
  song.title.toLowerCase().includes(search.toLowerCase()) ||
  song.artist.toLowerCase().includes(search.toLowerCase())
);

// SEARCH FILTER
let filtered = songs.filter(song =>
  song.title.toLowerCase().includes(search.toLowerCase()) ||
  song.artist.toLowerCase().includes(search.toLowerCase())
);

// SORT
filtered.sort((a,b) => {
  if(sortBy === "artist")
    return a.artist.localeCompare(b.artist);
  return a.title.localeCompare(b.title);
});

// PAGINATION
const start = (page - 1) * perPage;
const paginatedSongs = filtered.slice(start, start + perPage);

const toggleFav = (id) => {
  setFavorites(prev =>
    prev.includes(id)
      ? prev.filter(x => x !== id)
      : [...prev, id]
  );
};



  return (
    <div className="app">

      {/* Sidebar */}
      <div className="sidebar">
        <h2>🎧 Spotify</h2>
        <p>Home</p>
        <p>Search</p>
        <p>Your Library</p>

        <h4>Playlists</h4>
        {songs.slice(0, 5).map(s => (
          <div
            key={s.songId}
            className="playlistItem"
            onClick={() => selectSong(s)}
          >
            {s.title}
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="main">
        <h1>Browse Songs</h1>
        <input
  className="search"
  placeholder="Search songs or artists..."
  value={search}
  onChange={e => setSearch(e.target.value)}
/>


        <div className="grid">
          {filteredSongs.map(song => (
            <div
              key={song.songId}
              className={`card ${currentSong?.songId === song.songId ? "active" : ""}`}
              onClick={() => selectSong(song)}
            >
              <img
                src={`https://picsum.photos/200?random=${song.songId}`}
                alt="cover"
              />
              <h3>{song.title}</h3>
              <p>{song.artist}</p>
              <button
  className="downloadBtn"
  onClick={(e) => {
    e.stopPropagation();
    downloadSong(song);
  }}
>
  ⬇ Download
</button>

            </div>
          ))}
        </div>
      </div>

      {/* Player */}
      {currentSong && (
        <div className="player">

          <div className="player-info">
            <img
              src={`https://picsum.photos/60?random=${currentSong.songId}`}
              alt="cover"
            />
            <div>
              <strong>{currentSong.title}</strong>
              <div>{currentSong.artist}</div>
            </div>
          </div>

          {/* Controls */}
         <div className="controls">

  <button onClick={prevSong}>⏮</button>

  <button onClick={() => seek(-10)}>⏪ 10s</button>

  <button onClick={togglePlay}>
    {playing ? "⏸" : "▶"}
  </button>

  <button onClick={() => seek(10)}>10s ⏩</button>

  <button onClick={nextSong}>⏭</button>

  <button onClick={toggleMute}>🔇</button>

  {/* Progress Bar */}
  <input
    type="range"
    value={progress}
    onChange={changeProgress}
  />

  {/* Time Display */}
  <div className="time">
    {formatTime(time.current)} / {formatTime(time.duration)}
  </div>

</div>


          {/* Volume */}
          <div>
            🔊
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={changeVolume}
            />
          </div>

          <audio
  ref={audioRef}
  src={`${MUSIC_URL}${currentSong.s3Key}`}
  onTimeUpdate={() => {
    updateProgress();
    updateTime();
  }}
/>

        </div>
      )}
    </div>
  );
}

export default App;
