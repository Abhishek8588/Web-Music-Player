let db;
const songList = document.getElementById('songList');
const audioPlayer = document.getElementById('audioPlayer');
const dropArea = document.getElementById('drop-area');
const fileInput = document.getElementById('fileInput');

// IndexedDB setup
const request = indexedDB.open("musicDB", 1);

request.onerror = () => console.error("Failed to open IndexedDB.");
request.onsuccess = () => {
  db = request.result;
  loadSongs();
};
request.onupgradeneeded = (e) => {
  db = e.target.result;
  db.createObjectStore("songs", { keyPath: "id", autoIncrement: true });
};

// Load and display songs
function loadSongs() {
  const tx = db.transaction("songs", "readonly");
  const store = tx.objectStore("songs");
  const getAll = store.getAll();

  getAll.onsuccess = () => {
    songList.innerHTML = '';
    getAll.result.forEach(song => {
      const li = document.createElement('li');
      li.innerHTML = `
        <span>${song.name}</span>
        <div>
          <button onclick="playSong(${song.id})">▶</button>
          <button onclick="deleteSong(${song.id})">🗑</button>
        </div>`;
      songList.appendChild(li);
    });
  };
}

// Play song
function playSong(id) {
  const tx = db.transaction("songs", "readonly");
  const store = tx.objectStore("songs");
  const get = store.get(id);

  get.onsuccess = () => {
    const song = get.result;
    const blob = new Blob([song.file], { type: song.type });
    audioPlayer.src = URL.createObjectURL(blob);
    audioPlayer.play();
  };
}

// Delete song
function deleteSong(id) {
  const tx = db.transaction("songs", "readwrite");
  const store = tx.objectStore("songs");
  store.delete(id).onsuccess = loadSongs;
}

// Upload files
dropArea.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', (e) => handleFiles(e.target.files));
dropArea.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropArea.style.background = '#444';
});
dropArea.addEventListener('dragleave', () => {
  dropArea.style.background = '#222';
});
dropArea.addEventListener('drop', (e) => {
  e.preventDefault();
  dropArea.style.background = '#222';
  handleFiles(e.dataTransfer.files);
});

function handleFiles(files) {
  [...files].forEach(file => {
    if (!['audio/mpeg', 'audio/ogg', 'audio/wav'].includes(file.type)) {
      alert('Only MP3, OGG, WAV supported.');
      return;
    }

    const reader = new FileReader();
    reader.onload = function () {
      const tx = db.transaction("songs", "readwrite");
      const store = tx.objectStore("songs");
      store.add({ name: file.name, file: reader.result, type: file.type }).onsuccess = loadSongs;
    };
    reader.readAsArrayBuffer(file);
  });
}
