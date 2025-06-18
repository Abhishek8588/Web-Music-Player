const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const authSection = document.getElementById('authSection');
const playerSection = document.getElementById('playerSection');
const welcomeMsg = document.getElementById('welcomeMsg');
const uploadForm = document.getElementById('uploadForm');
const songList = document.getElementById('songList');
const audioPlayer = document.getElementById('audioPlayer');

let currentUser = null;
let playlist = [];

auth.onAuthStateChanged((user) => {
  if (user) {
    currentUser = user;
    authSection.classList.add('hidden');
    playerSection.classList.remove('hidden');
    welcomeMsg.textContent = `Welcome, ${user.displayName}`;
    loadSongs();
  } else {
    currentUser = null;
    authSection.classList.remove('hidden');
    playerSection.classList.add('hidden');
  }
});

loginBtn.onclick = () => {
  const provider = new firebase.auth.GoogleAuthProvider();
  auth.signInWithPopup(provider);
};

logoutBtn.onclick = () => auth.signOut();

// Upload
uploadForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const file = uploadForm.querySelector('input[type="file"]').files[0];
  if (!file || !currentUser) return;

  const fileRef = storage.ref(`users/${currentUser.uid}/songs/${Date.now()}-${file.name}`);
  await fileRef.put(file);
  const url = await fileRef.getDownloadURL();

  await db.collection('songs').add({
    uid: currentUser.uid,
    name: file.name,
    url,
    timestamp: firebase.firestore.FieldValue.serverTimestamp()
  });

  uploadForm.reset();
  loadSongs();
});

// Load songs for this user
async function loadSongs() {
  const snap = await db.collection('songs')
    .where('uid', '==', currentUser.uid)
    .orderBy('timestamp', 'desc')
    .get();

  songList.innerHTML = '';
  playlist = [];

  snap.forEach((doc, index) => {
    const song = doc.data();
    const id = doc.id;
    playlist.push({ name: song.name, url: song.url });

    const li = document.createElement('li');
    li.className = 'song-item';

    const nameSpan = document.createElement('span');
    nameSpan.textContent = song.name;
    nameSpan.className = 'song-name';
    nameSpan.onclick = () => playSong(index);

    const delBtn = document.createElement('button');
    delBtn.className = 'delete-btn';
    delBtn.textContent = '🗑️';
    delBtn.onclick = async () => {
      if (confirm(`Delete "${song.name}"?`)) {
        await storage.refFromURL(song.url).delete();
        await db.collection('songs').doc(id).delete();
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

// Drag and Drop
document.body.addEventListener('dragover', e => e.preventDefault());
document.body.addEventListener('drop', async e => {
  e.preventDefault();
  const file = e.dataTransfer.files[0];
  if (!file || !currentUser) return;
  const fileRef = storage.ref(`users/${currentUser.uid}/songs/${Date.now()}-${file.name}`);
  await fileRef.put(file);
  const url = await fileRef.getDownloadURL();
  await db.collection('songs').add({
    uid: currentUser.uid,
    name: file.name,
    url,
    timestamp: firebase.firestore.FieldValue.serverTimestamp()
  });
  loadSongs();
});
