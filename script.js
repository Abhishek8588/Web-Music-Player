const audio = document.getElementById("audio-player");
const progress = document.getElementById("progress");
const playBtn = document.getElementById("play");
const loopBtn = document.getElementById("loop");
const uploadBtn = document.getElementById("upload");
const fileInput = document.getElementById("fileInput");
const songTitle = document.getElementById("song-title");
const albumArt = document.getElementById("album-art");
const themeToggle = document.getElementById("themeToggle");

// State
let isLooping = JSON.parse(localStorage.getItem("loopEnabled")) || false;
let theme = localStorage.getItem("theme") || "dark";

// Apply initial settings
loopBtn.style.color = isLooping ? "cyan" : "white";
themeToggle.checked = theme === "light";
document.body.style.background = theme === "light" ? "#f0f0f0" : "linear-gradient(135deg, #0f0c29, #302b63, #24243e)";
document.body.style.color = theme === "light" ? "#222" : "white";

loopBtn.onclick = () => {
  isLooping = !isLooping;
  audio.loop = isLooping;
  loopBtn.style.color = isLooping ? "cyan" : "white";
  localStorage.setItem("loopEnabled", isLooping);
};

themeToggle.onchange = () => {
  theme = themeToggle.checked ? "light" : "dark";
  localStorage.setItem("theme", theme);
  document.body.style.background = theme === "light" ? "#f0f0f0" : "linear-gradient(135deg, #0f0c29, #302b63, #24243e)";
  document.body.style.color = theme === "light" ? "#222" : "white";
};

uploadBtn.onclick = () => fileInput.click();

fileInput.onchange = () => {
  const file = fileInput.files[0];
  if (!file) return;

  const url = URL.createObjectURL(file);
  audio.src = url;
  songTitle.textContent = file.name;
  albumArt.src = "album.jpg"; // Replace with a proper default or generated one
  audio.play();
};

playBtn.onclick = () => {
  if (audio.paused) {
    audio.play();
    playBtn.textContent = "⏸️";
  } else {
    audio.pause();
    playBtn.textContent = "▶️";
  }
};

audio.ontimeupdate = () => {
  progress.value = (audio.currentTime / audio.duration) * 100 || 0;
};

progress.oninput = () => {
  audio.currentTime = (progress.value * audio.duration) / 100;
};
