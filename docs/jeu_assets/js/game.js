document.addEventListener("DOMContentLoaded", () => {
  const music = document.getElementById("music");
  music.volume = 0.3;

  let musicStarted = false;
  const overlay = document.getElementById("musicOverlay");
  const startBtn = document.getElementById("startMusicBtn");

  function startMusic() {
    if (!musicStarted) {
      music.play().then(() => {
        musicStarted = true;
        overlay.classList.add("hide"); // disparition fluide
        setTimeout(() => overlay.style.display = "none", 500);
        console.log("🎵 Musique démarrée !");
      }).catch(err => {
        console.log("❌ Impossible de jouer la musique :", err);
      });
    }
  }

  // Clique sur le bouton pour démarrer la musique
  startBtn.addEventListener("click", startMusic);

  // Si l'utilisateur n'a pas cliqué, cacher le bouton après le premier mot
  function hideOverlayAfterFirstGame() {
    if (!musicStarted) {
      overlay.classList.add("hide");
      setTimeout(() => overlay.style.display = "none", 500);
    }
    // Retirer le listener pour ne pas répéter
    document.removeEventListener("checkWord1Done", hideOverlayAfterFirstGame);
  }

  // Custom event pour savoir quand le premier mot est validé
  document.addEventListener("checkWord1Done", hideOverlayAfterFirstGame);

  // Fonction checkWord1 modifiée pour déclencher l'event
  window.checkWord1 = function() {
    const value = normalize(document.getElementById("word1").value);
    if (value === "omelette") {
      vibrate(100);
      showStep("step2");
    } else {
      vibrate([50, 30, 50]);
      showAlert("❌ FLOP !");
    }
    // Déclenchement de l'événement custom
    document.dispatchEvent(new Event("checkWord1Done"));
  };
});

overlay.classList.add("hide");
setTimeout(() => overlay.style.display = "none", 500);

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
  vibrate([50, 30, 50]);
  showAlert("🎅 FLOP !");
}

function success() {
  vibrate([100, 50, 100, 50, 200]);
  showStep("success");
  sessionStorage.setItem("unlocked", "true");
}

function checkWord2() {
  const value = normalize(document.getElementById("word2").value);
  if (value === "norvege") {
    vibrate(100);
    showStep("step3");
  } else {
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

