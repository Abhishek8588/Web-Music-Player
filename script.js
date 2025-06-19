// IndexedDB setup
let db;
const request = indexedDB.open("MusicPlayerDB", 1);
request.onupgradeneeded = function (event) {
  db = event.target.result;
  const objectStore = db.createObjectStore("songs", { keyPath: "name" });
};
request.onsuccess = function (event) {
  db = event.target.result;
  loadSongsFromDB();
};
request.onerror = function (event) {
  console.error("IndexedDB error:", event.target.errorCode);
};

// DOM elements
const dropArea = document.getElementById("drop-area");
const fileInput = document.getElementById("fileInput");
const songList = document.getElementById("songList");
const audioPlayer = document.getElementById("audioPlayer");
const loopBtn = document.getElementById("loopBtn");
const volumeSlider = document.getElementById("volumeSlider");

// Load saved settings
window.addEventListener('DOMContentLoaded', () => {
  const savedLoop = localStorage.getItem('loopEnabled') === 'true';
  const savedVolume = parseFloat(localStorage.getItem('volumeLevel'));

  if (!isNaN(savedVolume)) {
    audioPlayer.volume = savedVolume;
    volumeSlider.value = savedVolume;
  }

  audioPlayer.loop = savedLoop;
  loopBtn.textContent = savedLoop ? "Disable Loop" : "Enable Loop";
  loopBtn.style.background = savedLoop ? "#f44336" : "#4caf50";
});

// Loop toggle
loopBtn.addEventListener('click', () => {
  audioPlayer.loop = !audioPlayer.loop;
  loopBtn.textContent = audioPlayer.loop ? "Disable Loop" : "Enable Loop";
  loopBtn.style.background = audioPlayer.loop ? "#f44336" : "#4caf50";
  localStorage.setItem('loopEnabled', audioPlayer.loop);
});

// Volume control
volumeSlider.addEventListener('input', () => {
  audioPlayer.volume = volumeSlider.value;
  localStorage.setItem('volumeLevel', volumeSlider.value);
});

// File drag and drop
dropArea.addEventListener("dragover", (e) => {
  e.preventDefault();
  dropArea.classList.add("dragover");
});
dropArea.addEventListener("dragleave", () => {
  dropArea.classList.remove("dragover");
});
dropArea.addEventListener("drop", (e) => {
  e.preventDefault();
  dropArea.classList.remove("dragover");
  handleFiles(e.dataTransfer.files);
});
dropArea.addEventListener("click", () => fileInput.click());
fileInput.addEventListener("change", () => handleFiles(fileInput.files));

function handleFiles(files) {
  Array.from(files).forEach((file) => {
    if (!file.type.startsWith("audio/")) return;

    const reader = new FileReader();
    reader.onload = function (e) {
      const transaction = db.transaction(["songs"], "readwrite");
      const objectStore = transaction.objectStore("songs");
      objectStore.put({ name: file.name, data: e.target.result });
      transaction.oncomplete = loadSongsFromDB;
    };
    reader.readAsDataURL(file);
  });
}

function loadSongsFromDB() {
  const transaction = db.transaction(["songs"], "readonly");
  const objectStore = transaction.objectStore("songs");
  const request = objectStore.getAll();

  request.onsuccess = function () {
    songList.innerHTML = "";
    request.result.forEach((song) => {
      const li = document.createElement("li");
      li.textContent = song.name;

      const playBtn = document.createElement("button");
      playBtn.innerHTML = "▶️";
      playBtn.onclick = () => {
        audioPlayer.src = song.data;
        audioPlayer.play();
      };

      const deleteBtn = document.createElement("button");
      deleteBtn.innerHTML = "🗑️";
      deleteBtn.onclick = () => {
        const delTx = db.transaction(["songs"], "readwrite");
        const store = delTx.objectStore("songs");
        store.delete(song.name);
        delTx.oncomplete = loadSongsFromDB;
      };

      li.appendChild(playBtn);
      li.appendChild(deleteBtn);
      songList.appendChild(li);
    });
  };
}
