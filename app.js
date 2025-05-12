// Game Stats
let xp = 0;
let level = 1;
let health = 100;

const xpProgress = document.querySelector("#xp-progress");
const healthProgress = document.querySelector("#health-progress");
const levelDisplay = document.querySelector("#level");

const dailyQuestList = document.querySelector("#daily-quest-list");
const habitList = document.querySelector("#habit-list");
const mainQuestList = document.querySelector("#main-quest-list");
const sideQuestList = document.querySelector("#side-quest-list");

// Update XP
function updateXP(amount) {
  xp += amount;
  if (xp >= 100) {
    xp = 0;
    level++;
    levelDisplay.textContent = level;
  }
  xpProgress.style.width = `${xp}%`;
}

// Update Health
function updateHealth(amount) {
  health += amount;
  if (health > 100) health = 100;
  if (health < 0) health = 0;
  healthProgress.style.width = `${health}%`;
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
}

// Daily Quests Reset at Midnight
function resetDailyQuests() {
  const quests = JSON.parse(localStorage.getItem("dailyQuests")) || [
    "Wash dishes",
    "30 mins of physical activity",
    "Drink enough water",
    "Meditate for 15 mins",
    "Make bed",
  ];

  dailyQuestList.innerHTML = quests
    .map(
      (quest) =>
        `<li class="quest-item"><span contenteditable="true">${quest}</span> <button class="complete-btn">✔</button></li>`
    )
    .join("");
  localStorage.setItem("lastReset", new Date().toDateString());
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
      updateXP(10);
    } else if (item.classList.contains("negative")) {
      // Negative Habit: Lose HP
      updateHealth(-10);
    } else {
      // Other Quests: Earn XP
      updateXP(5);
      item.remove();
    }
  }
});