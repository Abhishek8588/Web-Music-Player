const form = document.getElementById("linkForm");
const input = document.getElementById("youtubeLink");
const playlistEl = document.getElementById("playlist");
const player = document.getElementById("player");
const playerContainer = document.getElementById("playerContainer");

let playlist = [];

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const url = input.value.trim();
  const videoId = extractYouTubeID(url);

  if (videoId) {
    playlist.push(videoId);
    renderPlaylist();
    input.value = "";
  } else {
    alert("Invalid YouTube link.");
  }
});

function renderPlaylist() {
  playlistEl.innerHTML = "";

  playlist.forEach((id, index) => {
    const li = document.createElement("li");
    li.textContent = `Song ${index + 1}`;
    li.onclick = () => playVideo(id);
    playlistEl.appendChild(li);
  });
}

function playVideo(id) {
  const embedURL = `https://www.youtube.com/embed/${id}?autoplay=1`;
  player.src = embedURL;
  playerContainer.style.display = "block";
}

function extractYouTubeID(url) {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtube.com") && u.searchParams.get("v")) {
      return u.searchParams.get("v");
    }
    if (u.hostname === "youtu.be") {
      return u.pathname.slice(1);
    }
    return null;
  } catch {
    return null;
  }
}
