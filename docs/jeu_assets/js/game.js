let musicStarted = false;

function startMusic() {
  const music = document.getElementById("music");
  music.volume = 0.3;

  if (!musicStarted) {
    music.play().then(() => {
      musicStarted = true;
      // Masquer l'overlay immédiatement
      const overlay = document.getElementById("musicOverlay");
      overlay.style.display = "none";
      console.log("🎵 Musique démarrée !");
    }).catch(err => {
      console.log("❌ Impossible de jouer la musique :", err);
    });
  }
}

function playTemporaryAudio(tempAudioId, tempVolume = 1.0) {
  const mainMusic = document.getElementById("music");
  const tempAudio = document.getElementById(tempAudioId);

  // Stop musique principale
  mainMusic.pause();
  // mainMusic.currentTime = 0; // repartir du début si besoin

  // Régler le volume de la musique temporaire
  tempAudio.volume = tempVolume; // valeur entre 0.0 et 1.0

  // Jouer la musique temporaire
  tempAudio.currentTime = 0;
  tempAudio.play();

  // Quand elle se termine, reprendre la musique principale
  tempAudio.onended = () => {
    mainMusic.play();
  };
}

function showStep(id) {
  document.querySelectorAll(".step").forEach(step => {
    step.classList.remove("active");
  });
  document.getElementById(id).classList.add("active");
}

function normalize(str) {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function showAlert(message, duration = 2000) {
  const alertBox = document.getElementById("customAlert");
  const alertText = document.getElementById("alertText");

  alertText.textContent = message;
  alertBox.classList.remove("hidden");
  alertBox.classList.add("show");

  setTimeout(() => {
    alertBox.classList.remove("show");
    setTimeout(() => {
      alertBox.classList.add("hidden");
    }, 300);
  }, duration);
}

function vibrate(pattern = 50) {
  if ("vibrate" in navigator) {
    navigator.vibrate(pattern);
  }
}

function wrong() {
  playTemporaryAudio("musicFailFinal"); // joue la musique d’échec
  vibrate([50, 30, 50]);
  showAlert("🎅 FLOP !");
}

function success() {
  playTemporaryAudio("musicSuccFinal"); // joue la musique d’échec
  vibrate([100, 50, 100, 50, 200]);
  showStep("success");
  sessionStorage.setItem("unlocked", "true");
}

// Après la validation du premier mot
function checkWord1() {
  const value = normalize(document.getElementById("word1").value)
                .replace(/\s+/g, ""); // supprime tous les espaces;
  if (value === "omelette") {
    vibrate(100);
    showStep("step2");
  } else {
    vibrate([50, 30, 50]);
    showAlert("❌ FLOP !");
  }

  // Masquer le bouton musique si il est encore visible
  const overlay = document.getElementById("musicOverlay");
  if (overlay && overlay.style.display !== "none") {
    overlay.style.display = "none";
  }
}

function checkWord2() {
  const value = normalize(document.getElementById("word2").value)
                .replace(/\s+/g, ""); // supprime tous les espaces ;
  if (value === "norvege") {
    playTemporaryAudio("musicSucc2"); // joue la musique d’échec
    vibrate(100);
    showStep("step3");
  } else {
    playTemporaryAudio("musicFail2"); // joue la musique d’échec
    vibrate([50, 30, 50]);
    showAlert("❌ FLOP !");
  }
}

/* ❄️ NEIGE ANIMÉE RESPONSIVE */
const canvas = document.getElementById("snow");
const ctx = canvas.getContext("2d");

let width, height;
let flakes = [];

function resizeSnow() {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeSnow);
resizeSnow();

function createFlakes(count) {
  flakes = [];
  for (let i = 0; i < count; i++) {
    flakes.push({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 3 + 1,
      d: Math.random() + 0.5
    });
  }
}

createFlakes(window.innerWidth < 600 ? 40 : 80);

function drawSnow() {
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "rgba(255,255,255,0.8)";
  ctx.beginPath();
  flakes.forEach(flake => {
    ctx.moveTo(flake.x, flake.y);
    ctx.arc(flake.x, flake.y, flake.r, 0, Math.PI * 2);
  });
  ctx.fill();
  moveSnow();
}

function moveSnow() {
  flakes.forEach(flake => {
    flake.y += flake.d;
    if (flake.y > height) {
      flake.y = 0;
      flake.x = Math.random() * width;
    }
  });
}

function animateSnow() {
  drawSnow();
  requestAnimationFrame(animateSnow);
}

animateSnow();

