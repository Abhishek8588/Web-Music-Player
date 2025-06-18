const uploadForm = document.getElementById("uploadForm");
const songList = document.getElementById("songList");
const audioPlayer = document.getElementById("audioPlayer");

let playlist = [];

uploadForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const file = uploadForm.querySelector('input[type="file"]').files[0];
  if (!file) return;

  const fileRef = storage.ref(`songs/${Date.now()}-${file.name}`);
  await fileRef.put(file);
  const url = await fileRef.getDownloadURL();

  await db.collection("songs").add({
    name: file.name,
    url,
    timestamp: firebase.firestore.FieldValue.serverTimestamp()
  });

  uploadForm.reset();
  loadSongs();
});

async function loadSongs() {
  const snap = await db.collection("songs").orderBy("timestamp", "desc").get();

  songList.innerHTML = '';
  playlist = [];

  snap.forEach((doc, index) => {
    const song = doc.data();
    const id = doc.id;
    playlist.push({ name: song.name, url: song.url });

    const li = document.createElement("li");
    li.className = "song-item";

    const nameSpan = document.createElement("span");
    nameSpan.textContent = song.name;
    nameSpan.className = "song-name";
    nameSpan.onclick = () => playSong(index);

    const delBtn = document.createElement("button");
    delBtn.className = "delete-btn";
    delBtn.textContent = "🗑️";
    delBtn.onclick = async () => {
      if (confirm(`Delete "${song.name}"?`)) {
        await storage.refFromURL(song.url).delete();
        await db.collection("songs").doc(id).delete();
        loadSongs();
      }
    };

    li.appendChild(nameSpan);
    li.appendChild(delBtn);
    songList.appendChild(li);
  });
}

function playSong(index) {
  if (!playlist[index]) return;
  audioPlayer.src = playlist[index].url;
  audioPlayer.load();
  audioPlayer.play();
}

// Drag and Drop support
document.body.addEventListener("dragover", e => e.preventDefault());
document.body.addEventListener("drop", async e => {
  e.preventDefault();
  const file = e.dataTransfer.files[0];
  if (!file) return;
  const fileRef = storage.ref(`songs/${Date.now()}-${file.name}`);
  await fileRef.put(file);
  const url = await fileRef.getDownloadURL();
  await db.collection("songs").add({
    name: file.name,
    url,
    timestamp: firebase.firestore.FieldValue.serverTimestamp()
  });
  loadSongs();
});

window.onload = loadSongs;
