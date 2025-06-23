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
  const xpNeeded = Math.round(100 + (level - 1) * (10 ** 1.2));

  // Check for level up
  if (xp >= xpNeeded) {
    xp = xp - xpNeeded; // Keep excess XP
    level++;
    levelDisplay.textContent = level;
    localStorage.setItem("level", level);
    showLevelUpMessage(level);

    // Heal on level up
    health = 100;
    healthProgress.style.width = `${health}%`;
    localStorage.setItem("health", health);
    showHPMessage("+100");
  }
  // Calculate percentage for XP bar
  const xpPercent = (xp / xpNeeded) * 100;
  xpProgress.style.width = `${xpPercent}%`;
  localStorage.setItem("xp", xp);
}

// Update Health
function updateHealth(amount) {
  health += amount;
  if (health > 100) health = 100;
  if (health <= 0) {
    handleDeath();
    return;
  }
  healthProgress.style.width = `${health}%`;
  localStorage.setItem("health", health);
  showHPMessage(amount);
  saveStats();
  updateHUD();
}

function handleDeath() {
  // Calculate penalties
  level = Math.max(1, level - 1); // Prevent level from going below 1
  const coinPenalty = Math.floor(zenCoins * 0.1); // 10% coin loss
  zenCoins = Math.max(0, zenCoins - coinPenalty);
  health = 100; // Reset health to max

  // Update displays
  levelDisplay.textContent = level;
  healthProgress.style.width = '100%';

  // Create death notification using Notyf
  const iconImg = '<img src="images/icons/death.png" style="height: 40px; width: 40px; vertical-align: middle;">';
  notyf.open({
    type: 'death',
    message: `${iconImg}\nYOU DIED!\nLevel -1\n-${coinPenalty} Zen Coins`,
  });

  // Save updated stats
  saveStats();
  updateHUD();
}

function maybeAwardZenCoins() {
  const baseChance = 0.5; // 50% base chance
  const levelBonus = Math.min(level * 0.01, 0.5); // 1% per level, max 50% bonus
  const totalChance = baseChance + levelBonus;
  if (Math.random() < totalChance) { // 50% chance
    const baseCoins = Math.floor(Math.random() * 6) + 3; // Base random between 3 and 8
    const scaledCoins = Math.round(baseCoins * ((Math.log(level + 1)) ** 1.05));
    zenCoins += scaledCoins;
    showZenCoinMessage(scaledCoins);
    saveStats();

  }
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


/**
 * Quest Due Date Validation
 * Ensures due dates can only be today or in the future
 */
document.addEventListener('DOMContentLoaded', function() {
  // Find all due date inputs
  const dueDateInputs = document.querySelectorAll('input[type="date"][id*="due"], input[type="date"][name*="due"]');
  
  // Apply validation to each date input
  dueDateInputs.forEach(input => {
    // Set the minimum date to today
    setMinimumDate(input);
    
    // Update min date if the page stays open for multiple days
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        setMinimumDate(input);
      }
    });
    
    // Add validation on change/input
    input.addEventListener('change', validateDueDate);
    input.addEventListener('input', validateDueDate);
    
    // Also validate any parent form before submission
    const form = input.closest('form');
    if (form) {
      form.addEventListener('submit', function(event) {
        if (!validateDueDate({target: input})) {
          event.preventDefault();
        }
      });
    }
  });
});

/**
 * Sets the minimum date attribute to today's date
 */
function setMinimumDate(inputElement) {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const formattedDate = `${year}-${month}-${day}`;
  
  inputElement.setAttribute('min', formattedDate);
  
  // If input already has a value, validate it
  if (inputElement.value) {
    validateDueDate({target: inputElement});
  }
}

/**
 * Validates that the selected date is today or in the future
 */
function validateDueDate(event) {
  const input = event.target;
  const selectedDate = new Date(input.value);
  const today = new Date();
  
  // Reset time portion for accurate date comparison
  today.setHours(0, 0, 0, 0);
  
  if (selectedDate < today) {
    input.setCustomValidity('Due date must be today or a future date');
    addErrorMessage(input);
    return false;
  } else {
    input.setCustomValidity('');
    removeErrorMessage(input);
    return true;
  }
}


/**
 * Adds an error message after the input
 */
function addErrorMessage(input) {
  // Remove any existing error message
  removeErrorMessage(input);
  
  // Create and add the error message
  const errorMessage = document.createElement('div');
  errorMessage.className = 'date-error-message';
  errorMessage.textContent = 'Please select a future date';
  errorMessage.style.color = '#ff6b6b';
  errorMessage.style.fontSize = '0.7em';
  errorMessage.style.marginTop = '2px';
  
  input.parentNode.insertBefore(errorMessage, input.nextSibling);
  
  // Highlight the input field
  input.style.borderColor = '#ff6b6b';
}

/**
 * Removes the error message if it exists
 */
function removeErrorMessage(input) {
  const existingError = input.parentNode.querySelector('.date-error-message');
  if (existingError) {
    existingError.remove();
  }
  
  // Remove highlight
  input.style.borderColor = '';
}

document.addEventListener('DOMContentLoaded', function() {
    const addButton = document.getElementById('add-main-quest-btn');
    
    // Watch for error messages
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            // If error message exists, disable button
            const errorMsg = document.querySelector('.date-error-message');
            addButton.disabled = !!errorMsg;
            addButton.style.opacity = errorMsg ? '0.5' : '1';
        });
    });
    
    // Watch the entire document for added/removed error messages
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
});


const sortableLists = [
  dailyQuestList,
  habitList,
  mainQuestList,
  sideQuestList
];

sortableLists.forEach(listEl => {
  Sortable.create(listEl, {
    animation: 150,           // smooth animation
    ghostClass: 'dragging',   // CSS class on the dragged item
    onEnd: saveQuests         // re-save order on drop
  });
});


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
      updateXP(5);
      maybeAwardZenCoins();

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
  const isDesktop = window.innerWidth >= 1200;
  if (hour >= 6 && hour < 18) {
    // Daytime: 6am to 6pm
    body.style.backgroundImage = `url('images/backgrounds/${isDesktop ? 'default_bg_desktop.png' : 'default_bg.jpg'}')`;
  } else {
    // Nighttime: 6pm to 6am
    body.style.backgroundImage = `url('images/backgrounds/${isDesktop ? 'defaultnight_bg_desktop.png' : 'defaultnight_bg.jpg'}')`;
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

// Show level up message
function showLevelUpMessage(level) {
  const iconImg = '<img src="images/icons/levelup.png" style="height: 40px; width: 40px; vertical-align: middle;">';
  notyf.open({
    type: 'levelup',
    message: `${iconImg}\nLevel Up!\nYou are now level ${level}!\nZen Coin gain increased.`
  });
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
    },
    {
      type: 'levelup',
      background: '#232323',
      className: 'notyf-levelup pixel-corners-small',
      dismissible: true,
      duration: 100000
    },
    {
      type: 'death',
      background: '#232323',
      icon: false,
      className: 'notyf-death pixel-corners-small',
      duration: 100000,
      dismissible: true
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
  renderDailyQuests(getCompletedDailies());
  updatePomodoroDisplay();
  updatePomodoroStats();

});

