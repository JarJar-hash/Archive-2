const music = document.getElementById("music");
music.volume = 0.3;

document.body.addEventListener("click", () => {
  if (music.paused) {
    music.play().catch(() => {});
  }
}, { once: true });

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

function checkWord1() {
  const value = normalize(document.getElementById("word1").value);
  if (value === "omelette") {
    showStep("step2");
  } else {
    alert("❌ Mauvais mot !");
  }
}

function checkWord2() {
  const value = normalize(document.getElementById("word2").value);
  if (value === "norvege") {
    showStep("step3");
  } else {
    alert("❌ Mauvais mot !");
  }
}

function wrong() {
  alert("🎅 Ce n’est pas la bonne réponse !");
}

function success() {
  showStep("success");
  localStorage.setItem("unlocked", "true");
}
