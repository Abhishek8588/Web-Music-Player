const audio = document.createElement("audio");
audio.setAttribute("preload", "auto");
audio.style.display = "none";
document.body.appendChild(audio);

const progress = document.getElementById("progress");
const volume = document.getElementById("volume");
const playBtn = document.getElementById("play");
const loopBtn = document.getElementById("loop");
const uploadBtn = document.getElementById("upload");
const fileInput = document.getElementById("fileInput");
const songTitle = document.getElementById("song-title");
const albumArt = document.getElementById("album-art");
const themeToggle = document.getElementById("themeToggle");

const forwardBtn = document.getElementById("forward");
const backwardBtn = document.getElementById("backward");

// State
let isLooping = JSON.parse(localStorage.getItem("loopEnabled")) || false;
let theme = localStorage.getItem("theme") || "dark";
audio.loop = isLooping;
loopBtn.style.color = isLooping ? "cyan" : "white";
themeToggle.checked = theme === "light";
document.body.style.background = theme === "light" ? "#f0f0f0" : "linear-gradient(135deg, #0f0c29, #302b63, #24243e)";
document.body.style.color = theme === "light" ? "#222" : "white";

// Play/Pause
playBtn.onclick = () => {
  if (audio.paused) {
    audio.play();
    playBtn.textContent = "⏸️";
  } else {
    audio.pause();
    playBtn.textContent = "▶️";
  }
};

// Upload & Load
uploadBtn.onclick = () => fileInput.click();
fileInput.onchange = () => {
  const file = fileInput.files[0];
  if (!file) return;
  const url = URL.createObjectURL(file);
  audio.src = url;
  audio.play();
  playBtn.textContent = "⏸️";
  songTitle.textContent = file.name;
  albumArt.src = "album.jpg"; // Optional fallback
};

// Loop toggle
loopBtn.onclick = () => {
  isLooping = !isLooping;
  audio.loop = isLooping;
  loopBtn.style.color = isLooping ? "cyan" : "white";
  localStorage.setItem("loopEnabled", isLooping);
};

// Theme toggle
themeToggle.onchange = () => {
  theme = themeToggle.checked ? "light" : "dark";
  localStorage.setItem("theme", theme);
  document.body.style.background = theme === "light" ? "#f0f0f0" : "linear-gradient(135deg, #0f0c29, #302b63, #24243e)";
  document.body.style.color = theme === "light" ? "#222" : "white";
};

// Progress update
audio.ontimeupdate = () => {
  if (audio.duration) {
    progress.value = (audio.currentTime / audio.duration) * 100;
  }
};
progress.oninput = () => {
  audio.currentTime = (progress.value / 100) * audio.duration;
};

// Volume
volume.oninput = () => {
  audio.volume = parseFloat(volume.value);
};
volume.value = 0.8;
audio.volume = 0.8;

// Forward / Backward
forwardBtn.onclick = () => {
  audio.currentTime = Math.min(audio.currentTime + 10, audio.duration);
};
backwardBtn.onclick = () => {
  audio.currentTime = Math.max(audio.currentTime - 10, 0);
};
