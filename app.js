// Game Stats
let xp = Number(localStorage.getItem("xp")) || 0;
let level = Number(localStorage.getItem("level")) || 1;
let health = Number(localStorage.getItem("health")) || 100;

const xpProgress = document.querySelector("#xp-progress");
const healthProgress = document.querySelector("#health-progress");
const levelDisplay = document.querySelector("#level");

const dailyQuestList = document.querySelector("#daily-quest-list");
const habitList = document.querySelector("#habit-list");
const mainQuestList = document.querySelector("#main-quest-list");
const sideQuestList = document.querySelector("#side-quest-list");

function saveStats() {
  localStorage.setItem("xp", xp);
  localStorage.setItem("level", level);
  localStorage.setItem("health", health);
}

// Update XP
function updateXP(amount) {
  xp += amount;
  if (xp >= 100) {
    xp = 0;
    level++;
    levelDisplay.textContent = level;
    localStorage.setItem("level", level);
  }
  xpProgress.style.width = `${xp}%`;
  localStorage.setItem("xp", xp);
  saveStats();
}

// Update Health
function updateHealth(amount) {
  health += amount;
  if (health > 100) health = 100;
  if (health < 0) health = 0;
  healthProgress.style.width = `${health}%`;
  localStorage.setItem("health", health);
  saveStats();
}

// Update HUD on load
function updateHUD() {
  xpProgress.style.width = `${xp}%`;
  healthProgress.style.width = `${health}%`;
  levelDisplay.textContent = level;
}

// Save quests to localStorage
function saveQuests() {
  // Save all current daily quests (including user-added)
  localStorage.setItem(
    "dailyQuests",
    JSON.stringify([...dailyQuestList.querySelectorAll("span")].map(span => span.textContent))
  );
  localStorage.setItem("habitQuests", habitList.innerHTML);
  localStorage.setItem("mainQuests", mainQuestList.innerHTML);
  localStorage.setItem("sideQuests", sideQuestList.innerHTML);
}

// Load quests from localStorage
function loadQuests() {
  // Load daily quests from localStorage if present
  const savedDaily = JSON.parse(localStorage.getItem("dailyQuests"));
  if (savedDaily && Array.isArray(savedDaily)) {
    dailyQuestList.innerHTML = savedDaily
      .map(
        quest =>
          `<li class="quest-item"><span contenteditable="true">${quest}</span> <button class="complete-btn">✔</button></li>`
      )
      .join("");
  }
  if (localStorage.getItem("habitQuests")) habitList.innerHTML = localStorage.getItem("habitQuests");
  if (localStorage.getItem("mainQuests")) mainQuestList.innerHTML = localStorage.getItem("mainQuests");
  if (localStorage.getItem("sideQuests")) sideQuestList.innerHTML = localStorage.getItem("sideQuests");
}

// Add New Quest
function addQuest(inputField, list, type = null) {
  const questText = inputField.value.trim();
  if (questText === "") return;

  const li = document.createElement("li");
  li.className = "quest-item";
  if (type) li.classList.add(type);

  const buttonLabel = type === "positive" || type === "negative" ? "+" : "✔";
  li.innerHTML = `<span contenteditable="true">${questText}</span> <button class="complete-btn">${buttonLabel}</button>`;
  list.appendChild(li);
  inputField.value = "";
  saveQuests();
}

// Daily Quests Reset at Midnight
function resetDailyQuests() {
  // Use default quests only if there are no saved daily quests
  const quests = JSON.parse(localStorage.getItem("dailyQuests")) || [
    "Wash dishes",
    "30 mins of physical activity",
    "Drink enough water",
    "15 mins of meditation",
    "Make bed",
  ];

  dailyQuestList.innerHTML = quests
    .map(
      quest =>
        `<li class="quest-item"><span contenteditable="true">${quest}</span> <button class="complete-btn">✔</button></li>`
    )
    .join("");
  localStorage.setItem("lastReset", new Date().toDateString());
  // Save the current daily quests to localStorage
  saveQuests();
}


// Check if a daily reset is needed
function checkDailyReset() {
  const lastReset = localStorage.getItem("lastReset");
  const today = new Date().toDateString();

  if (lastReset !== today) {
    resetDailyQuests();
  }
}

// Initialize Daily Quests
checkDailyReset();

// Add Event Listeners for Adding Quests
document.querySelector("#add-daily-quest-btn").addEventListener("click", () => {
  addQuest(document.querySelector("#daily-quest-input"), dailyQuestList);
});

document.querySelector("#add-habit-btn").addEventListener("click", () => {
  const habitType = document.querySelector("#habit-type").value;
  addQuest(document.querySelector("#habit-input"), habitList, habitType);
});

document.querySelector("#add-main-quest-btn").addEventListener("click", () => {
  addQuest(document.querySelector("#main-quest-input"), mainQuestList);
});

document.querySelector("#add-side-quest-btn").addEventListener("click", () => {
  addQuest(document.querySelector("#side-quest-input"), sideQuestList);
});

// Handle Quest Completion
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("complete-btn")) {
    const item = e.target.parentElement;

    if (item.classList.contains("positive")) {
      // Positive Habit: Earn XP
      updateXP(5);
    } else if (item.classList.contains("negative")) {
      // Negative Habit: Lose HP
      updateHealth(-15);
    } else {
      // Other Quests: Earn XP
      updateXP(15);
      item.remove();
    }
    saveQuests();
  }
});

// Set background image based on time of day
function setBackgroundByTime() {
  const hour = new Date().getHours();
  const body = document.body;
  if (hour >= 6 && hour < 18) {
    // Daytime: 6am to 6pm
    body.style.backgroundImage = "url('images/default_bg.jpg')";
  } else {
    // Nighttime: 6pm to 6am
    body.style.backgroundImage = "url('images/defaultnight_bg.jpg')";
  }
}

window.addEventListener("DOMContentLoaded", () => {
  setBackgroundByTime();
  updateHUD();
  loadQuests();
});