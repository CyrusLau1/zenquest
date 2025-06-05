// Game Stats
let xp = parseInt(localStorage.getItem("xp")) || 0;
let level = parseInt(localStorage.getItem("level")) || 1;
let health = parseInt(localStorage.getItem("health")) || 100;
let zenCoins = parseInt(localStorage.getItem("zenCoins")) || 0;


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
    const currentDailies = [...dailyQuestList.querySelectorAll("span")].map(span => {
      const questText = span.textContent.trim();
      const questId = span.closest('.quest-item').dataset.questId;
      // Save questId mapping
      localStorage.setItem(`daily_${questText}_id`, questId);
      return questText;
    }).filter(text => text !== "");

    localStorage.setItem("dailyQuestMaster", JSON.stringify(currentDailies));
  }
  // Save habits with their IDs and content
  if (habitList) {
    // Save full HTML content of habits
    localStorage.setItem("habitQuests", habitList.innerHTML);

    // Save habit IDs and completion counts separately
    const habitData = [...habitList.querySelectorAll('.quest-item')].map(item => {
      const questText = item.querySelector('span').textContent.trim();
      const questId = item.dataset.questId;
      const type = item.classList.contains('positive') ? 'positive' : 'negative';
      return { questText, questId, type };
    });
    localStorage.setItem("habitData", JSON.stringify(habitData));
  }

  // Save main and side quests normally
  localStorage.setItem("mainQuests", mainQuestList.innerHTML);
  localStorage.setItem("sideQuests", sideQuestList.innerHTML);
}
// Load quests from localStorage
function loadQuests() {

  // Load habits with their completion counts
  if (localStorage.getItem("habitData")) {
    const habitData = JSON.parse(localStorage.getItem("habitData"));

    // Reconstruct habits HTML
    habitList.innerHTML = habitData.map(habit => {
      const count = getCompletionCount(null, 'habit', habit.questId);
      return `
                <li class="quest-item pixel-corners-small ${habit.type}" data-quest-id="${habit.questId}">
                    <div class="quest-main">
                        <span contenteditable="true">${habit.questText}</span>
                        <small class="completion-counter">⇆ ${count}</small>
                    </div>
                    <button class="complete-btn pixel-corners-small">+</button>
                </li>`;
    }).join('');
  }

  // Load main and side quests normally
  if (localStorage.getItem("mainQuests")) {
    mainQuestList.innerHTML = localStorage.getItem("mainQuests");
  }
  if (localStorage.getItem("sideQuests")) {
    sideQuestList.innerHTML = localStorage.getItem("sideQuests");
  }
}

// Count completions for quests
function generateQuestId(questText, type) {
  const timestamp = Date.now();
  return `${type}_${questText}_${timestamp}`;
}

function getCompletionCount(questText, type, questId = null) {
  const counts = JSON.parse(localStorage.getItem(`${type}CompletionCounts`) || '{}');
  if (questId && counts[questId] !== undefined) {
    return counts[questId];
  }
  return 0;
}

function incrementCompletionCount(questId, type) {
  const counts = JSON.parse(localStorage.getItem(`${type}CompletionCounts`) || '{}');
  counts[questId] = (counts[questId] || 0) + 1;
  localStorage.setItem(`${type}CompletionCounts`, JSON.stringify(counts));
  return counts[questId];
}

// Add New Quest
function addQuest(inputField, list, type = null, dueDate = null) {
  const questText = inputField.value.trim();
  if (questText === "") return;

  const li = document.createElement("li");
  li.className = "quest-item pixel-corners-small";
  if (type) li.classList.add(type);

  const questId = generateQuestId(questText, type || 'quest');
  li.dataset.questId = questId;

  // Create a container for the quest text and due date
  if (type === "positive" || type === "negative") {
    questContent = `
            <div class="quest-main">
                <span contenteditable="true">${questText}</span>
                <small class="completion-counter">⇆ 0</small>
            </div>
            <button class="complete-btn pixel-corners-small">+</button>
        `;
  } else if (list === dailyQuestList) {
    questContent = `
            <div class="quest-main">
                <span contenteditable="true" data-original-text="${questText}">${questText}</span>
                <small class="completion-counter">⇆ 0</small>
            </div>
            <button class="complete-btn pixel-corners-small">✔</button>
        `;
  } else {
    questContent = `
            <div class="quest-main">
                <span contenteditable="true">${questText}</span>
                ${dueDate ? `<div class="due-date-label">📅 ${dueDate}</div>` : ''}
            </div>
            <button class="complete-btn pixel-corners-small">✔</button>
        `;
  }

  li.innerHTML = questContent;

  const buttonLabel = type === "positive" || type === "negative" ? "+" : "✔";

  li.style.opacity = "0";
  li.style.transform = "translateY(-20px)";
  list.appendChild(li);

  gsap.fromTo(li,
    {
      opacity: 0,
      y: -10,
      scale: 0.7,
      filter: "brightness(0.1)"
    },
    {
      opacity: 1,
      y: 0,
      scale: 1,
      filter: "brightness(1)",
      duration: 0.5,
      ease: "steps(30)",
      clearProps: "all",
      onComplete: () => {
        if (type === "positive" || type === "negative") {
          notyf.open({
            type: 'add-quest',
            message: 'Habit added!'
          });
        } else {
          notyf.open({
            type: 'add-quest',
            message: 'Quest added!'
          });
        }
      }
    }
  );




  inputField.value = "";
  if (list === dailyQuestList) {
    const masterDailies = [...dailyQuestList.querySelectorAll("span")].map(span => span.textContent);
    localStorage.setItem("dailyQuestMaster", JSON.stringify(masterDailies));
  }
  if (list === dailyQuestList) {
    questContent = `<span contenteditable="true" data-original-text="${questText}">${questText}</span>`;
  } else {
    questContent = `<span contenteditable="true">${questText}</span>`;
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
      const questId = localStorage.getItem(`daily_${quest}_id`) || generateQuestId(quest, 'daily');
      const count = getCompletionCount(null, 'daily', questId);

      return `
        <li class="quest-item pixel-corners-small ${completedClass}" data-quest-id="${questId}">
          <div class="quest-main">
            <span contenteditable="true" data-original-text="${quest}">${quest}</span>
            <small class="completion-counter">⇆ ${count}</small>
          </div>
          <button class="complete-btn pixel-corners-small">✔</button>
        </li>`;
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
document.addEventListener("blur", function (e) {
  if (e.target.matches(".quest-item span")) {
    const questItem = e.target.closest(".quest-item");
    const questList = questItem.parentElement;

    // If content is empty, remove the quest
    if (e.target.textContent.trim() === "") {
      if (questList === dailyQuestList) {
        // Remove from master list if it's a daily quest
        const masterDailies = JSON.parse(localStorage.getItem("dailyQuestMaster") || "[]");
        const originalText = questItem.querySelector("span").dataset.originalText;
        const updatedMasterDailies = masterDailies.filter(quest => quest !== originalText);
        localStorage.setItem("dailyQuestMaster", JSON.stringify(updatedMasterDailies));

        // Also remove from completed if it exists there
        const completed = getCompletedDailies();
        const updatedCompleted = completed.filter(quest => quest !== originalText);
        setCompletedDailies(updatedCompleted);
      }
      questItem.remove();

      if (questItem.classList.contains('positive') || questItem.classList.contains('negative')) {
        notyf.open({
          type: 'remove-quest',
          message: 'Habit deleted'
        });
      } else {
        notyf.open({
          type: 'remove-quest',
          message: 'Quest deleted'
        });
      }

      saveQuests();
    } else {
      // Update master list if text changed for daily quest
      if (questList === dailyQuestList) {
        const masterDailies = JSON.parse(localStorage.getItem("dailyQuestMaster") || "[]");
        const originalText = questItem.querySelector("span").dataset.originalText;
        const newText = e.target.textContent.trim();
        const index = masterDailies.indexOf(originalText);
        if (index !== -1) {
          masterDailies[index] = newText;
          localStorage.setItem("dailyQuestMaster", JSON.stringify(masterDailies));
        }
        // Update dataset for future reference
        questItem.querySelector("span").dataset.originalText = newText;
      }
      saveQuests();
    }

  }
}, true);

// Handle Quest Completion
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("complete-btn")) {
    const item = e.target.parentElement;
    const questId = item.dataset.questId;
    const countDisplay = item.querySelector(".completion-counter");

    if (item.parentElement === dailyQuestList) {
      // Mark as completed for today
      item.classList.add("completed");
      const questText = item.querySelector("span").textContent;
      const completed = getCompletedDailies();
      const newCount = incrementCompletionCount(questId, 'daily');
      if (countDisplay) countDisplay.textContent = `⇆ ${newCount}`;
      if (!completed.includes(questText)) {
        
        completed.push(questText);
        setCompletedDailies(completed);
      }
      maybeAwardZenCoins();
      updateXP(15);

    }
    else if (item.classList.contains("positive")) {
      const newCount = incrementCompletionCount(questId, 'habit');
      if (countDisplay) countDisplay.textContent = `⇆ ${newCount}`;
      maybeAwardZenCoins();
      updateXP(5);

    }
    else if (item.classList.contains("negative")) {
      const newCount = incrementCompletionCount(questId, 'habit');
      if (countDisplay) countDisplay.textContent = `⇆ ${newCount}`;
      updateHealth(-15);
    }
    else {
      // For main and side quests
      gsap.to(item, {
        scale: 0.65,
        filter: "brightness(0.2)",
        opacity: 0,
        duration: 0.5,
        ease: "steps(50)",
        onComplete: () => {
          item.remove();
          saveQuests();
          maybeAwardZenCoins();
          updateXP(15);
        }
      });
      return;
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
    body.style.backgroundImage = "url('images/backgrounds/default_bg.jpg')";
  } else {
    // Nighttime: 6pm to 6am
    body.style.backgroundImage = "url('images/backgrounds/defaultnight_bg.jpg')";
  }
}

// Pomodoro Timer Logic
const POMODORO_STATES = {
  FOCUS: { time: 25, xp: 50 },
  SHORT_BREAK: { time: 5 },
  LONG_BREAK: { time: 15 }
};

let currentState = 'FOCUS';
let pomodoroTime = POMODORO_STATES[currentState].time * 60;
let pomodoroInterval = null;
let isPomodoroRunning = false;
let totalFocusTime = parseInt(localStorage.getItem('totalFocusTime')) || 0;
let sessionCount = parseInt(localStorage.getItem('sessionCount')) || 0;

function updatePomodoroDisplay() {
  const min = String(Math.floor(pomodoroTime / 60)).padStart(2, '0');
  const sec = String(pomodoroTime % 60).padStart(2, '0');
  document.getElementById('pomodoro-time').textContent = `${min}:${sec}`;

  // Update progress circle - always use the current mode's full time for progress
  const circle = document.querySelector('.pomodoro-progress');
  const radius = circle.r.baseVal.value;
  const circumference = radius * 2 * Math.PI;
  // Calculate progress based on current time / current mode's total time
  const currentModeTime = parseInt(document.querySelector('.pomodoro-type.active').dataset.time) * 60;
  const progress = pomodoroTime / currentModeTime;
  const offset = circumference * (1 - progress);
  circle.style.strokeDasharray = `${circumference} ${circumference}`;
  circle.style.strokeDashoffset = offset;
}

function updatePomodoroStats() {
  localStorage.setItem('totalFocusTime', totalFocusTime.toString());
  localStorage.setItem('sessionCount', sessionCount.toString());
  document.getElementById('focus-time').textContent =
    `${Math.floor(totalFocusTime / 3600)}h ${Math.floor((totalFocusTime % 3600) / 60)}m`;
  document.getElementById('session-count').textContent = sessionCount;
}

// Add event listeners for timer type buttons
// Update event listeners for timer type buttons
document.querySelectorAll('.pomodoro-type').forEach(btn => {
  btn.addEventListener('click', () => {
    // Only allow mode change if timer is not running
    if (!isPomodoroRunning) {
      // Remove active class from current button
      document.querySelector('.pomodoro-type.active').classList.remove('active');
      btn.classList.add('active');

      // Update state and reset timer
      currentState = btn.dataset.type;
      pomodoroTime = parseInt(btn.dataset.time) * 60;

      // Clear any existing interval
      clearInterval(pomodoroInterval);
      isPomodoroRunning = false;

      // Reset UI elements
      document.getElementById('pomodoro-start').textContent = 'Start';
      document.getElementById('pomodoro-message').textContent = '';

      // Update circle animation
      const circle = document.querySelector('.pomodoro-circle');
      circle.style.animation = 'timer-reset 0.7s';
      setTimeout(() => circle.style.animation = '', 500);

      // Update GIF to match new mode
      const gif = document.querySelector('.pomodoro-gif');
      gif.src = currentState === 'FOCUS' ? 'images/animations/work.gif' : 'images/animations/sleep.gif';
      gif.style.display = 'none';

      // Update timer display
      updatePomodoroDisplay();
    }
  });
});

function startPomodoro() {
  if (!isPomodoroRunning && pomodoroTime > 0) {
    isPomodoroRunning = true;

    document.querySelector('.pomodoro-timer').classList.add('running');

    // Running animation
    const circle = document.querySelector('.pomodoro-circle');
    circle.style.animation = 'timer-pulse 4s infinite';

    // Start GIF animation
    const currentMode = document.querySelector('.pomodoro-type.active').dataset.type;
    const gif = document.querySelector('.pomodoro-gif');
    gif.src = currentMode === 'FOCUS' ? 'images/animations/work.gif' : 'images/animations/sleep.gif';
    gif.style.display = 'block';

    document.getElementById('pomodoro-start').textContent = '...';

    // FOCUS message
    const message = document.getElementById('pomodoro-message');

    if (currentMode === 'FOCUS') {
      message.textContent = 'FOCUS SPELL CASTED!';
      message.style.color = '#19A8E6';
    } else {
      message.textContent = 'REST SPELL CASTED!';
      message.style.color = '#4caf50';
    }

    pomodoroInterval = setInterval(() => {
      pomodoroTime--;
      updatePomodoroDisplay();

      if (pomodoroTime === 0) {
        completePomodoro();

      }
    }, 1000);
  }
}

function completePomodoro() {
  clearInterval(pomodoroInterval);
  isPomodoroRunning = false;

  // Remove running class to hide flame
  document.querySelector('.pomodoro-timer').classList.remove('running');

  const circle = document.querySelector('.pomodoro-circle');
  circle.style.animation = 'timer-complete 1s';
  setTimeout(() => circle.style.animation = '', 1000);

  // Hide GIF when completed
  const gif = document.querySelector('.pomodoro-gif');
  gif.style.display = 'none';

  const message = document.getElementById('pomodoro-message');
  message.textContent = 'SPELL ENDED!';
  message.style.color = '#4CAF50';

  if (currentState === 'FOCUS') {
    sessionCount++;
    totalFocusTime += POMODORO_STATES.FOCUS.time * 60;

    updatePomodoroStats();
    updateXP(POMODORO_STATES.FOCUS.xp);
    maybeAwardZenCoins();
  }


}

function pausePomodoro() {
  if (isPomodoroRunning) {
    clearInterval(pomodoroInterval);
    isPomodoroRunning = false;

    document.querySelector('.pomodoro-timer').classList.remove('running');

    // Add pause animation
    const circle = document.querySelector('.pomodoro-circle');
    circle.style.animation = 'timer-pause 0.7s';
    setTimeout(() => circle.style.animation = '', 300);

    // Hide GIF when paused
    const gif = document.querySelector('.pomodoro-gif');
    gif.style.display = 'none';

    document.getElementById('pomodoro-start').textContent = 'Resume';

    // PAUSED message
    const message = document.getElementById('pomodoro-message');
    message.textContent = 'PAUSED';
    message.style.color = '#E65719';
  }
}

function resetPomodoro() {
  clearInterval(pomodoroInterval);

  document.querySelector('.pomodoro-timer').classList.remove('running');

  // Get currently selected mode from active button
  const activeButton = document.querySelector('.pomodoro-type.active');
  if (activeButton) {
    currentState = activeButton.dataset.type || 'FOCUS'; // Fallback to FOCUS if no type set
    pomodoroTime = POMODORO_STATES[currentState].time * 60;
  } else {
    // Fallback to FOCUS mode if no active button found
    currentState = 'FOCUS';
    pomodoroTime = POMODORO_STATES.FOCUS.time * 60;
  }

  isPomodoroRunning = false;

  // Add reset animation
  const circle = document.querySelector('.pomodoro-circle');
  circle.style.animation = 'timer-reset 0.7s';
  setTimeout(() => circle.style.animation = '', 500);

  // Hide GIF on reset
  const gif = document.querySelector('.pomodoro-gif');
  gif.style.display = 'none';

  document.getElementById('pomodoro-start').textContent = 'Start';

  document.getElementById('pomodoro-message').textContent = '';

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
  msg.classList.add('pixel-corners-small');
  msg.style.position = "fixed";
  msg.style.left = "50%";
  msg.style.top = "44%";
  msg.style.transform = "translate(-50%, 0)";
  msg.style.background = "#232323";
  msg.style.color = "#fff";
  msg.style.padding = "12px 28px";
  msg.style.fontFamily = "'Minecraft', 'PixelCraft', monospace";
  msg.style.fontSize = "1.3em";
  msg.style.zIndex = 9999;
  msg.style.boxShadow = "0 2px 12px #000a";
  msg.style.opacity = "0.97";
  msg.style.border = "4px rgb(190, 190, 190) solid";
  document.body.appendChild(msg);
  setTimeout(() => {
    msg.style.transition = "all 1.2s";
    msg.style.opacity = "0";
    msg.style.top = "10%";
  }, 900);
  setTimeout(() => msg.remove(), 5000);
}

const notyf = new Notyf({
  duration: 1500,
  position: { x: 'left', y: 'top' },
  types: [
    {
      type: 'xp',
      background: '#232323',
      icon: false,
      className: 'notyf-xp pixel-corners-small'
    },
    {
      type: 'hp-plus',
      background: '#232323',
      icon: false,
      className: 'notyf-hp-plus pixel-corners-small'
    },
    {
      type: 'hp-minus',
      background: '#232323',
      icon: false,
      className: 'notyf-hp-minus pixel-corners-small'
    },
    {
      type: 'zen-coin',
      background: '#232323',
      icon: false,
      className: 'notyf-zen-coin pixel-corners-small'
    },
    {
      type: 'add-quest',
      background: '#232323',
      icon: false,
      className: 'notyf-success pixel-corners-small'
    },
    {
      type: 'remove-quest',
      background: '#232323',
      icon: false,
      className: 'notyf-error pixel-corners-small'
    }
  ]
});

function showXPMessage(amount) {
  const iconImg = '<img src="images/icons/xp.png" style="height: 18px; width: 18px; vertical-align: middle; margin-right: 4px;">';
  notyf.open({
    type: 'xp',
    message: `${iconImg}${amount > 0 ? "+" : ""}${amount} XP`
  });
}

function showHPMessage(amount) {
  const iconImg = '<img src="images/icons/hp.png" style="height: 18px; width: 18px; vertical-align: middle; margin-right: 4px;">';
  notyf.open({
    type: amount > 0 ? 'hp-plus' : 'hp-minus',
    message: `${iconImg}${amount} HP`
  });
}

function showZenCoinMessage(amount) {
  const iconImg = '<img src="images/icons/coin.png" style="height: 18px; width: 18px; vertical-align: middle; margin-right: 4px;">';
  notyf.open({
    type: 'zen-coin',
    message: `${iconImg}+${amount} Zen Coins!`
  });
}

// On page load
window.addEventListener("DOMContentLoaded", () => {
  setBackgroundByTime();
  loadQuests();
  checkDailyReset();
  updateHUD();
  renderDailyQuests(getCompletedDailies());
  updatePomodoroDisplay();
  updatePomodoroStats();
});
