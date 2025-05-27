// Game Stats
let xp = Number(localStorage.getItem("xp")) || 0;
let level = Number(localStorage.getItem("level")) || 1;
let health = Number(localStorage.getItem("health")) || 100;
let zenCoins = Number(localStorage.getItem("zenCoins")) || 0;

const xpProgress = document.querySelector("#xp-progress");
const healthProgress = document.querySelector("#health-progress");
const levelDisplay = document.querySelector("#level");
const zenCoinsDisplay = document.querySelector("#zen-coins-count");

const dailyQuestList = document.querySelector("#daily-quest-list");
const habitList = document.querySelector("#habit-list");
const mainQuestList = document.querySelector("#main-quest-list");
const sideQuestList = document.querySelector("#side-quest-list");

function saveStats() {
  localStorage.setItem("xp", xp);
  localStorage.setItem("level", level);
  localStorage.setItem("health", health);
  localStorage.setItem("zenCoins", zenCoins);
}

// Update XP
function updateXP(amount) {
  showXPMessage(amount);
  xp += amount;
  if (xp >= 100) {
    xp = 0;
    level++;
    levelDisplay.textContent = level;
    localStorage.setItem("level", level);
    showLevelUpMessage(level);
    health = 100; 
    healthProgress.style.width = `${health}%`;
    localStorage.setItem("health", health);
    showHPMessage("+100");
  }
  xpProgress.style.width = `${xp}%`;
  localStorage.setItem("xp", xp);
  let newLevel = Math.floor(xp / 100) + 1;
  updateLevel(newLevel);
  saveStats();
  updateHUD();
}

// Update Health
function updateHealth(amount) {
  health += amount;
  if (health > 100) health = 100;
  if (health < 0) health = 0;
  healthProgress.style.width = `${health}%`;
  localStorage.setItem("health", health);
  showHPMessage(amount);
  saveStats();
  updateHUD();
}

// Update HUD on load
function updateHUD() {
  xpProgress.style.width = `${xp}%`;
  healthProgress.style.width = `${health}%`;
  levelDisplay.textContent = level;
  if (zenCoinsDisplay) zenCoinsDisplay.textContent = zenCoins;
}

// Save quests to localStorage
function saveQuests() {
  // Save the master list of daily quests
  if (dailyQuestList) {
    const masterDailies = JSON.parse(localStorage.getItem("dailyQuestMaster")) || [
      "Wash dishes",
      "30 mins of physical activity",
      "Drink enough water",
      "15 mins of meditation",
      "Make bed",
    ];
    // Only update master if a new quest was added
    const currentDailies = [...dailyQuestList.querySelectorAll("span")].map(span => span.textContent);
    if (currentDailies.length > masterDailies.length) {
      localStorage.setItem("dailyQuestMaster", JSON.stringify(currentDailies));
    }
  }
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
function addQuest(inputField, list, type = null, dueDate = null) {
  const questText = inputField.value.trim();
  if (questText === "") return;

  const li = document.createElement("li");
  li.className = "quest-item";
  if (type) li.classList.add(type);

  // Create a container for the quest text and due date
  let questContent = `<span contenteditable="true">${questText}</span>`;
  if (list === mainQuestList && dueDate) {
    questContent += `<div class="due-date-label">📅 ${dueDate}</div>`;
  }

  const buttonLabel = type === "positive" || type === "negative" ? "+" : "✔";
  // Use a flex layout: left = text+date (column), right = button
  li.innerHTML = `
    <div class="quest-main">
      ${questContent}
    </div>
    <button class="complete-btn">${buttonLabel}</button>
  `;
  list.appendChild(li);
  inputField.value = "";
  if (list === dailyQuestList) {
    const masterDailies = [...dailyQuestList.querySelectorAll("span")].map(span => span.textContent);
    localStorage.setItem("dailyQuestMaster", JSON.stringify(masterDailies));
  }
  saveQuests();
}

function saveDailyQuestMaster() {
  const masterDailies = [...dailyQuestList.querySelectorAll("span")].map(span => span.textContent);
  localStorage.setItem("dailyQuestMaster", JSON.stringify(masterDailies));
}

function renderDailyQuests(completed = []) {
  const quests = JSON.parse(localStorage.getItem("dailyQuestMaster")) || [
    "Wash dishes",
    "30 mins of physical activity",
    "Drink enough water",
    "15 mins of meditation",
    "Make bed",
  ];
  dailyQuestList.innerHTML = quests
    .map(quest => {
      const completedClass = completed.includes(quest) ? "completed" : "";
      return `<li class="quest-item ${completedClass}"><span contenteditable="true">${quest}</span> <button class="complete-btn">✔</button></li>`;
    })
    .join("");
}

function getCompletedDailies() {
  const today = new Date().toDateString();
  return JSON.parse(localStorage.getItem("completedDailies_" + today)) || [];
}

function setCompletedDailies(completed) {
  const today = new Date().toDateString();
  localStorage.setItem("completedDailies_" + today, JSON.stringify(completed));
}

function resetDailyQuests() {
  setCompletedDailies([]); // Clear completed for today
  renderDailyQuests([]);
  localStorage.setItem("lastReset", new Date().toDateString());
}


// Check if a daily reset is needed
function checkDailyReset() {
  const lastReset = localStorage.getItem("lastReset");
  const today = new Date().toDateString();
  if (lastReset !== today) {
    resetDailyQuests();
  } else {
    renderDailyQuests(getCompletedDailies());
  }
}

// Add Event Listeners for Adding Quests
document.querySelector("#add-daily-quest-btn").addEventListener("click", () => {
  addQuest(document.querySelector("#daily-quest-input"), dailyQuestList);
});

document.querySelector("#add-habit-btn").addEventListener("click", () => {
  const habitType = document.querySelector("#habit-type").value;
  addQuest(document.querySelector("#habit-input"), habitList, habitType);
});

document.querySelector("#add-main-quest-btn").addEventListener("click", () => {
  const questInput = document.querySelector("#main-quest-input");
  const dateInput = document.querySelector("#main-quest-date");
  addQuest(questInput, mainQuestList, null, dateInput.value);
  dateInput.value = "";
});

document.querySelector("#add-side-quest-btn").addEventListener("click", () => {
  addQuest(document.querySelector("#side-quest-input"), sideQuestList);
});

// Allow removing quests by clearing the text and blurring the span
document.addEventListener("blur", function(e) {
  if (e.target.matches(".quest-item span[contenteditable]")) {
    if (e.target.textContent.trim() === "") {
      const li = e.target.closest(".quest-item");
      if (li) {
        li.remove();
        saveQuests();
      }
    } else {
      // Save edits to quest text
      saveQuests();
    }
  }
}, true);

// Handle Quest Completion
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("complete-btn")) {
    const item = e.target.parentElement;
    if (item.parentElement === dailyQuestList) {
      // Mark as completed for today
      item.classList.add("completed");
      const questText = item.querySelector("span").textContent;
      const completed = getCompletedDailies();
      if (!completed.includes(questText)) {
        completed.push(questText);
        setCompletedDailies(completed);
      }
      maybeAwardZenCoins();
      updateXP(15);
    } 
    else if (item.classList.contains("positive")) {
      maybeAwardZenCoins();
      updateXP(5);
    } 
    else if (item.classList.contains("negative")) {
      updateHealth(-15);
    } 
    else {
      // For main and side quests
      item.remove();
      saveQuests();
      maybeAwardZenCoins();
      updateXP(15);
    }
    saveQuests();
  }
});

// Set background image based on time of day
function setBackgroundByTime() {
  const hour = new Date().getHours();
  const body = document.body;
  if (hour >= 6 && hour <18) {
    // Daytime: 6am to 6pm
    body.style.backgroundImage = "url('images/default_bg.jpg')";
  } else {
    // Nighttime: 6pm to 6am
    body.style.backgroundImage = "url('images/defaultnight_bg.jpg')";
  }
}

// Pomodoro Timer Logic
const POMODORO_STATES = {
  FOCUS: { time: 25, xp: 50 },
  SHORT_BREAK: { time: 5, xp: 5 },
  LONG_BREAK: { time: 15, xp: 15 }
};

let currentState = 'FOCUS';
let pomodoroTime = POMODORO_STATES[currentState].time * 60;
let pomodoroInterval = null;
let isPomodoroRunning = false;
let totalFocusTime = Number(localStorage.getItem('totalFocusTime')) || 0;
let sessionCount = Number(localStorage.getItem('sessionCount')) || 0;

function updatePomodoroDisplay() {
  const min = String(Math.floor(pomodoroTime / 60)).padStart(2, '0');
  const sec = String(pomodoroTime % 60).padStart(2, '0');
  document.getElementById('pomodoro-time').textContent = `${min}:${sec}`;

  // Update progress circle
  const circle = document.querySelector('.pomodoro-progress');
  const radius = circle.r.baseVal.value;
  const circumference = radius * 2 * Math.PI;
  const progress = pomodoroTime / (POMODORO_STATES[currentState].time * 60);
  const offset = circumference * (1 - progress);
  circle.style.strokeDasharray = `${circumference} ${circumference}`;
  circle.style.strokeDashoffset = offset;
}

function updateStats() {
  const hours = Math.floor(totalFocusTime / 3600);
  const minutes = Math.floor((totalFocusTime % 3600) / 60);
  document.getElementById('focus-time').textContent = `${hours}h ${minutes}m`;
  document.getElementById('session-count').textContent = sessionCount;
  localStorage.setItem('totalFocusTime', totalFocusTime);
  localStorage.setItem('sessionCount', sessionCount);
}

// Add event listeners for timer type buttons
document.querySelectorAll('.pomodoro-type').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelector('.pomodoro-type.active').classList.remove('active');
    btn.classList.add('active');
    pomodoroTime = parseInt(btn.dataset.time) * 60;
    updatePomodoroDisplay();
  });
});

function startPomodoro() {
  if (!isPomodoroRunning && pomodoroTime > 0) {
    isPomodoroRunning = true;
    
    // Add running animation
    const circle = document.querySelector('.pomodoro-circle');
    circle.style.animation = 'timer-pulse 4s infinite';
    
    pomodoroInterval = setInterval(() => {
      pomodoroTime--;
      updatePomodoroDisplay();
      
      if (pomodoroTime === 0) {
        clearInterval(pomodoroInterval);
        isPomodoroRunning = false;
        
        // Complete animation
        circle.style.animation = 'timer-complete 1s';
        
        if (currentState === 'FOCUS') {
          sessionCount++;
          totalFocusTime += POMODORO_STATES.FOCUS.time * 60;
          updateXP(POMODORO_STATES.FOCUS.xp);
          maybeAwardZenCoins();
        }
        updateStats();
        
      }
    }, 1000);
  }
}

function pausePomodoro() {
  if (isPomodoroRunning) {
    clearInterval(pomodoroInterval);
    isPomodoroRunning = false;
    
    // Add pause animation
    const circle = document.querySelector('.pomodoro-circle');
    circle.style.animation = 'timer-pause 0.7s';
    setTimeout(() => circle.style.animation = '', 300);
  }
}

function resetPomodoro() {
  clearInterval(pomodoroInterval);
  pomodoroTime = POMODORO_STATES[currentState].time * 60;
  isPomodoroRunning = false;
  
  // Add reset animation
  const circle = document.querySelector('.pomodoro-circle');
  circle.style.animation = 'timer-reset 0.7s';
  setTimeout(() => circle.style.animation = '', 500);
  
  updatePomodoroDisplay();
}

document.getElementById('pomodoro-start').addEventListener('click', startPomodoro);
document.getElementById('pomodoro-pause').addEventListener('click', pausePomodoro);
document.getElementById('pomodoro-reset').addEventListener('click', resetPomodoro);

function updateDailyResetTimer() {
  const timerElem = document.getElementById("daily-reset-timer");
  if (!timerElem) return;
  const now = new Date();
  const nextReset = new Date();
  nextReset.setHours(24, 0, 0, 0); // midnight tonight
  const diff = nextReset - now;
  const hours = String(Math.floor(diff / (1000 * 60 * 60))).padStart(2, "0");
  const mins = String(Math.floor((diff / (1000 * 60)) % 60)).padStart(2, "0");
  const secs = String(Math.floor((diff / 1000) % 60)).padStart(2, "0");
  timerElem.textContent = `⏳ Daily quests reset in ${hours}:${mins}:${secs}`;
}
setInterval(updateDailyResetTimer, 1000);
updateDailyResetTimer();

function maybeAwardZenCoins() {
  if (Math.random() < 0.5) { // 50% chance
    const coins = Math.floor(Math.random() * 16) + 5; // random between 5 and 20
    zenCoins += coins;
    saveStats();
    updateHUD();
    showZenCoinMessage(coins);
  }
}

// Show level up message
function showLevelUpMessage(level) {
  const msg = document.createElement("div");
  msg.textContent = `Level Up! You are now Level ${level}!`;
  msg.style.position = "fixed";
  msg.style.left = "50%";
  msg.style.top = "44%";
  msg.style.transform = "translate(-50%, 0)";
  msg.style.background = "#232323";
  msg.style.color = "#fff";
  msg.style.padding = "12px 28px";
  msg.style.borderRadius = "5px";
  msg.style.fontFamily = "'Minecraft', 'PixelCraft', monospace";
  msg.style.fontSize = "1.3em";
  msg.style.zIndex = 9999;
  msg.style.boxShadow = "0 2px 12px #000a";
  msg.style.opacity = "0.97";
  msg.style.border = "2px rgb(190, 190, 190) solid";
  document.body.appendChild(msg);
  setTimeout(() => {
    msg.style.transition = "all 0.8s";
    msg.style.opacity = "0";
    msg.style.top = "10%";
  }, 900);
  setTimeout(() => msg.remove(), 3000);
}

const notyf = new Notyf({
  duration: 1500,
  position: { x: 'left', y: 'top' },
  types: [
    {
      type: 'xp',
      background: '#232323',
      icon: false,
      className: 'notyf-xp'
    },
    {
      type: 'hp-plus',
      background: '#232323',
      icon: false,
      className: 'notyf-hp-plus'
    },
    {
      type: 'hp-minus',
      background: '#232323',
      icon: false,
      className: 'notyf-hp-minus'
    },
    {
      type: 'zen-coin',
      background: '#232323',
      icon: false,
      className: 'notyf-zen-coin'
    }
  ]
});

function showXPMessage(amount) {
  notyf.open({
    type: 'xp',
    message: (amount > 0 ? "⭐ +" : "⭐ ") + amount + " XP"
  });
}

function showHPMessage(amount) {
  notyf.open({
    type: amount > 0 ? 'hp-plus' : 'hp-minus',
    message: (amount > 0 ? "❤️ " : "💔 ") + amount + " HP"
  });
}

function showZenCoinMessage(amount) {
  notyf.open({
    type: 'zen-coin',
    message: `🪙 +${amount} Zen Coins!`
  });
}

// On page load
window.addEventListener("DOMContentLoaded", () => {
  setBackgroundByTime();
  loadQuests();
  checkDailyReset();
  updateHUD();
  renderDailyQuests(getCompletedDailies());
});
