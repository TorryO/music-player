const audio = document.getElementById("audio");
const fileInput = document.getElementById("fileInput");
const playlistEl = document.getElementById("playlist");
const playPauseBtn = document.getElementById("playPause");
const prevBtn = document.getElementById("prev");
const nextBtn = document.getElementById("next");
const seekBar = document.getElementById("seek");
const volumeBar = document.getElementById("volume");
const trackTitle = document.getElementById("trackTitle");
const trackArtist = document.getElementById("trackArtist");
const currentTimeEl = document.getElementById("currentTime");
const durationEl = document.getElementById("duration");

let tracks = [];
let currentIndex = -1;
let seeking = false;

function formatTime(sec) {
  if (!isFinite(sec) || sec < 0) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function renderPlaylist() {
  playlistEl.innerHTML = "";
  tracks.forEach((track, i) => {
    const li = document.createElement("li");
    li.textContent = track.name;
    if (i === currentIndex) li.classList.add("active");
    li.addEventListener("click", () => loadTrack(i, true));
    playlistEl.appendChild(li);
  });
}

function loadTrack(index, autoplay) {
  if (index < 0 || index >= tracks.length) return;
  currentIndex = index;
  const track = tracks[index];
  audio.src = track.url;
  trackTitle.textContent = track.name.replace(/\.[^.]+$/, "");
  trackArtist.textContent = `${index + 1} of ${tracks.length}`;
  renderPlaylist();
  if (autoplay) play();
}

function play() {
  audio.play().catch(() => {});
}

function togglePlay() {
  if (currentIndex === -1 && tracks.length > 0) {
    loadTrack(0, true);
    return;
  }
  if (audio.paused) play();
  else audio.pause();
}

function nextTrack() {
  if (!tracks.length) return;
  loadTrack((currentIndex + 1) % tracks.length, true);
}

function prevTrack() {
  if (!tracks.length) return;
  loadTrack((currentIndex - 1 + tracks.length) % tracks.length, true);
}

fileInput.addEventListener("change", (e) => {
  const files = Array.from(e.target.files).filter((f) =>
    f.type.startsWith("audio/")
  );
  const start = tracks.length;
  files.forEach((f) =>
    tracks.push({ name: f.name, url: URL.createObjectURL(f) })
  );
  renderPlaylist();
  if (currentIndex === -1 && tracks.length > 0) loadTrack(start, false);
  fileInput.value = "";
});

playPauseBtn.addEventListener("click", togglePlay);
nextBtn.addEventListener("click", nextTrack);
prevBtn.addEventListener("click", prevTrack);

audio.addEventListener("play", () => {
  playPauseBtn.textContent = "⏸";
  playPauseBtn.title = "Pause";
});
audio.addEventListener("pause", () => {
  playPauseBtn.textContent = "▶";
  playPauseBtn.title = "Play";
});
audio.addEventListener("ended", nextTrack);

audio.addEventListener("timeupdate", () => {
  if (seeking) return;
  currentTimeEl.textContent = formatTime(audio.currentTime);
  durationEl.textContent = formatTime(audio.duration);
  seekBar.value = audio.duration
    ? (audio.currentTime / audio.duration) * 100
    : 0;
});

seekBar.addEventListener("input", () => {
  seeking = true;
});
seekBar.addEventListener("change", () => {
  if (audio.duration) {
    audio.currentTime = (seekBar.value / 100) * audio.duration;
  }
  seeking = false;
});

volumeBar.addEventListener("input", () => {
  audio.volume = parseFloat(volumeBar.value);
});
audio.volume = parseFloat(volumeBar.value);

document.addEventListener("keydown", (e) => {
  if (e.target.tagName === "INPUT") return;
  if (e.code === "Space") {
    e.preventDefault();
    togglePlay();
  } else if (e.code === "ArrowRight") {
    audio.currentTime = Math.min(audio.duration || 0, audio.currentTime + 5);
  } else if (e.code === "ArrowLeft") {
    audio.currentTime = Math.max(0, audio.currentTime - 5);
  }
});
