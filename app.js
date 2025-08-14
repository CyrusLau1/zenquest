// Game Stats - now using centralized gameStats system
// These functions get current values from the centralized system
function getCurrentStats() {
    return gameStats.loadStats();
}

function getCurrentXP() {
    return gameStats.loadStats().xp;
}

function getCurrentLevel() {
    return gameStats.loadStats().level;
}

function getCurrentHealth() {
    return gameStats.loadStats().currentHP;
}

function getCurrentZenCoins() {
    return gameStats.loadStats().zenCoins;
}


const xpProgress = document.querySelector("#xp-progress");
const healthProgress = document.querySelector("#health-progress");
const levelDisplay = document.querySelector("#level");
const zenCoinsDisplay = document.querySelector("#zen-coins-count");

const dailyQuestList = document.querySelector("#daily-quest-list");
const habitList = document.querySelector("#habit-list");
const mainQuestList = document.querySelector("#main-quest-list");
const sideQuestList = document.querySelector("#side-quest-list");

function saveStats() {
  // This function keeps the original variable names for compatibility
  gameStats.updateHUD();
}

// Update XP - with bonuses applied
function updateXP(amount) {
  showXPMessage(amount);
  
  // Get current stats (but don't use centralized level calculation)
  let xp = parseInt(localStorage.getItem("xp")) || 0;
  let level = parseInt(localStorage.getItem("level")) || 1;
  let health = parseInt(localStorage.getItem("health")) || 100;
  
  xp += amount;
  const xpNeeded = Math.round(100 + (level - 1) * (10 ** 1.2));

  // Check for level up
  if (xp >= xpNeeded) {
    xp = xp - xpNeeded; // Keep excess XP
    level++;
    if (levelDisplay) levelDisplay.textContent = level;
    localStorage.setItem("level", level);
    showLevelUpMessage(level);

    // Heal to max HP on level up 
    const currentStats = gameStats.loadStats();
    const totalStats = gameStats.getTotalStats(); // Get stats with equipment bonuses
    health = totalStats.maxHP; // Heal to actual max HP including bonuses
    if (healthProgress) {
      const healthPercent = (health / totalStats.maxHP) * 100;
      healthProgress.style.width = `${healthPercent}%`;
    }
    localStorage.setItem("health", health);
    showHPMessage(`+${totalStats.maxHP - currentStats.currentHP}`); // Show actual healing amount
  }
  
  // Calculate percentage for XP bar
  const xpPercent = (xp / xpNeeded) * 100;
  if (xpProgress) xpProgress.style.width = `${xpPercent}%`;
  localStorage.setItem("xp", xp);
  
  // Also update the centralized system for compatibility
  const stats = gameStats.loadStats();
  stats.xp = xp;
  stats.level = level;
  stats.currentHP = health;
  // Don't override maxHP here - let it be calculated properly with equipment bonuses
  gameStats.saveStats(stats);
}

// Update Health
function updateHealth(amount) {
  const stats = gameStats.loadStats();
  const totalStats = gameStats.getTotalStats(); // Get stats with equipment bonuses
  const newHealth = stats.currentHP + amount;
  
  // Use the actual total maxHP including bonuses instead of base maxHP
  stats.currentHP = Math.max(0, Math.min(newHealth, totalStats.maxHP));
  
  if (stats.currentHP <= 0) {
    handleDeath();
    return;
  }
  
  gameStats.saveStats(stats);
  showHPMessage(amount);
  gameStats.updateHUD();
}

function handleDeath() {
  // Calculate penalties
  let level = parseInt(localStorage.getItem("level")) || 1;
  let zenCoins = parseInt(localStorage.getItem("zenCoins")) || 0;
  
  level = Math.max(1, level - 1); // Prevent level from going below 1
  const coinPenalty = Math.floor(zenCoins * 0.1); // 10% coin loss
  zenCoins = Math.max(0, zenCoins - coinPenalty);

  // Restore to full HP (use actual maxHP including bonuses)
  const totalStats = gameStats.getTotalStats();
  const health = totalStats.maxHP;

  // Update displays
  if (levelDisplay) levelDisplay.textContent = level;
  if (healthProgress) {
    const healthPercent = (health / totalStats.maxHP) * 100;
    healthProgress.style.width = `${healthPercent}%`;
  }
  
  // Save to localStorage
  localStorage.setItem("level", level);
  localStorage.setItem("zenCoins", zenCoins);
  localStorage.setItem("health", health);

  // Create death notification using Notyf
  const iconImg = '<img src="images/icons/death.png" style="height: 40px; width: 40px; vertical-align: middle;">';
  const xpIcon = '<img src="images/icons/xp.png" style="height: 20px; width: 20px; vertical-align: middle; margin-right: 4px;">';
  const coinIcon = '<img src="images/icons/coin.png" style="height: 20px; width: 20px; vertical-align: middle; margin-right: 4px;">';
  notyf.open({
    type: 'death',
    message: `${iconImg}\nYOU DIED!\n${xpIcon}Level -1\n${coinIcon}-${coinPenalty} Zen Coins`,
  });

  // Save updated stats
  saveStats();
  gameStats.updateHUD();
}

function maybeAwardZenCoins() {
  const baseChance = 0.5; // 50% base chance
  const stats = gameStats.loadStats();
  const levelBonus = Math.min(stats.level * 0.01, 0.5); // 1% per level, max 50% bonus
  const totalChance = baseChance + levelBonus;
  if (Math.random() < totalChance) { // 50% chance
    const baseCoins = Math.floor(Math.random() * 6) + 3; // Base random between 3 and 8
    const scaledCoins = Math.round(baseCoins * ((Math.log(stats.level + 1)) ** 1.05));
    const result = gameStats.awardCoins(scaledCoins);
    
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
  // Save habits with IDs and content
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

  // Load habits with completion counts
  if (localStorage.getItem("habitData")) {
    const habitData = JSON.parse(localStorage.getItem("habitData"));

    // Reconstruct habits
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

  // Load main and side quests 
  if (localStorage.getItem("mainQuests")) {
    mainQuestList.innerHTML = localStorage.getItem("mainQuests");
  }
  if (localStorage.getItem("sideQuests")) {
    sideQuestList.innerHTML = localStorage.getItem("sideQuests");
  }
  
  // Update due date priority classes after loading
  setTimeout(() => {
    updateDueDatePriorities();
  }, 100);
}

/**
 * Update Due Date Priority Classes for Existing Quests
 * Refreshes the color coding for all due date labels and quest item borders
 */
function updateDueDatePriorities() {
  const dueDateLabels = document.querySelectorAll('.due-date-label');
  
  dueDateLabels.forEach(label => {
    // Extract date from the label text (format: "�️ YYYY-MM-DD")
    const labelText = label.textContent.trim();
    const dateMatch = labelText.match(/(\d{4}-\d{2}-\d{2})/);
    
    if (dateMatch) {
      const dueDate = dateMatch[1];
      const priorityClass = getDueDatePriority(dueDate);
      const questItem = label.closest('.quest-item');
      
      // Update due date label classes
      label.classList.remove('overdue', 'urgent', 'soon', 'upcoming', 'distant');
      label.classList.add(priorityClass);
      
      // Update quest item border classes
      if (questItem) {
        questItem.classList.remove('due-overdue', 'due-urgent', 'due-soon', 'due-upcoming', 'due-distant');
        questItem.classList.add(`due-${priorityClass}`);
      }
    }
  });
  
  // Also check quest items without due date labels (should have grey border)
  const questItems = document.querySelectorAll('.quest-item');
  questItems.forEach(item => {
    const hasDateLabel = item.querySelector('.due-date-label');
    if (!hasDateLabel) {
      item.classList.remove('due-overdue', 'due-urgent', 'due-soon', 'due-upcoming', 'due-distant');
      item.classList.add('due-distant'); // Grey border for no due date
    }
  });
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

/**
 * Calculate Due Date Priority Class
 * Returns CSS class based on how close the due date is
 */
function getDueDatePriority(dueDate) {
  if (!dueDate) return 'distant';
  
  const today = new Date();
  const due = new Date(dueDate);
  
  // Reset time components to compare dates only
  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);
  
  const diffTime = due.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) {
    return 'overdue'; // Red - past due
  } else if (diffDays <= 1) {
    return 'urgent'; // Orange - due today or tomorrow
  } else if (diffDays <= 7) {
    return 'soon'; // Yellow - within a week
  } else if (diffDays <= 30) {
    return 'upcoming'; // Green - within a month
  } else {
    return 'distant'; // Grey - over a month away
  }
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
                ${dueDate ? `<div class="due-date-label ${getDueDatePriority(dueDate)}"><img src="images/icons/calendar.png" alt="Calendar" style="width: 14px; height: 14px; vertical-align: middle; margin-right: 3px;">${dueDate}</div>` : ''}
            </div>
            <button class="complete-btn pixel-corners-small">✔</button>
        `;
    
    // Add due date priority class to the quest item if there's a due date
    if (dueDate) {
      li.classList.add(`due-${getDueDatePriority(dueDate)}`);
    }
  }

  li.innerHTML = questContent;

  const buttonLabel = type === "positive" || type === "negative" ? "+" : "✔";

  li.style.opacity = "0";
  li.style.transform = "translateY(-20px)";
  
  // Insert main quests in due date order, but preserve existing quest order
  if (list === mainQuestList && dueDate) {
    const existingQuests = Array.from(list.children);
    let insertPosition = null;
    
    for (let i = 0; i < existingQuests.length; i++) {
      const existingQuestDueLabel = existingQuests[i].querySelector('.due-date-label');
      
      if (existingQuestDueLabel) {
        const existingDateMatch = existingQuestDueLabel.textContent.match(/(\d{4}-\d{2}-\d{2})/);
        if (existingDateMatch) {
          const existingDueDate = existingDateMatch[1];
          
          // If new quest is due before this existing quest, insert here
          if (dueDate < existingDueDate) {
            insertPosition = existingQuests[i];
            break;
          }
        }
      } else {
        // If existing quest has no due date, insert new quest before it
        insertPosition = existingQuests[i];
        break;
      }
    }
    
    if (insertPosition) {
      list.insertBefore(li, insertPosition);
    } else {
      list.appendChild(li);
    }
  } else {
    list.appendChild(li);
  }

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

// Update daily quest progress indicator
function updateDailyProgress() {
  const completed = getCompletedDailies();
  const total = dailyQuestList.children.length;
  const completedCount = completed.length;
  const progressPercent = total > 0 ? (completedCount / Math.max(total, 5)) * 100 : 0;
  
  const progressFill = document.getElementById('daily-progress-fill');
  const progressText = document.getElementById('daily-progress-text');
  
  if (progressFill) {
    progressFill.style.width = `${Math.min(progressPercent, 100)}%`;
  }
  
  if (progressText) {
    progressText.textContent = `${completedCount}/${Math.max(total, 5)} daily quests completed`;
    if (completedCount >= 5) {
      progressText.textContent += ' ';
      const starIcon = document.createElement('img');
      starIcon.src = 'images/icons/star.png';
      starIcon.style.width = '16px';
      starIcon.style.height = '16px';
      starIcon.style.verticalAlign = 'middle';
      starIcon.style.marginLeft = '4px';
      starIcon.alt = 'Star';
      progressText.appendChild(starIcon);
      const bonusText = document.createTextNode(' Bonus achieved!');
      progressText.appendChild(bonusText);
      progressText.style.color = '#4caf50';
    } else {
      progressText.style.color = '';
    }
  }
}

// Add quest analytics
function getQuestStats() {
  const dailyCompleted = getCompletedDailies().length;
  const dailyTotal = dailyQuestList.children.length;
  const habitsCompleted = document.querySelectorAll('#habit-list .quest-item').length;
  const mainQuests = mainQuestList.children.length;
  const sideQuests = sideQuestList.children.length;
  
  return {
    daily: { completed: dailyCompleted, total: dailyTotal },
    habits: { total: habitsCompleted },
    main: { total: mainQuests },
    side: { total: sideQuests }
  };
}

// Quest statistics tracking functions
function initializeQuestStatistics() {
  if (!localStorage.getItem('questStatistics')) {
    const initialStats = {
      mainCompleted: 0,
      sideCompleted: 0,
      mainXPEarned: 0,
      sideXPEarned: 0,
      pomodoroCompleted: 0,
      focusXPEarned: 0
    };
    localStorage.setItem('questStatistics', JSON.stringify(initialStats));
  }
}

// Function to increment quest completion stats
function incrementQuestStatistic(type, xpEarned = 0) {
  const stats = JSON.parse(localStorage.getItem('questStatistics')) || {
    mainCompleted: 0,
    sideCompleted: 0,
    mainXPEarned: 0,
    sideXPEarned: 0,
    pomodoroCompleted: 0,
    focusXPEarned: 0
  };
  
  switch(type) {
    case 'main':
      stats.mainCompleted++;
      stats.mainXPEarned += xpEarned;
      break;
    case 'side':
      stats.sideCompleted++;
      stats.sideXPEarned += xpEarned;
      break;
    case 'pomodoro':
      stats.pomodoroCompleted++;
      stats.focusXPEarned += xpEarned;
      break;
  }
  
  localStorage.setItem('questStatistics', JSON.stringify(stats));
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

// Set up periodic due date priority updates
document.addEventListener('DOMContentLoaded', function() {
    // Update priorities on load
    updateDueDatePriorities();
    
    // Update every 10 minutes to catch date changes
    setInterval(updateDueDatePriorities, 10 * 60 * 1000);
    
    // Update at midnight each day
    const now = new Date();
    const msUntilMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0) - now;
    setTimeout(() => {
        updateDueDatePriorities();
        // Then update daily
        setInterval(updateDueDatePriorities, 24 * 60 * 60 * 1000);
    }, msUntilMidnight);
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
  // Check for daily completion rewards/penalties before resetting
  checkDailyCompletionRewards();
  
  setCompletedDailies([]); // Clear completed for today
  renderDailyQuests([]);
  localStorage.setItem("lastReset", new Date().toDateString());
}

// Check daily completion and apply penalties only (rewards are handled in real-time)
function checkDailyCompletionRewards() {
  // Only check if it's not the first day (to avoid penalty on first load)
  const lastReset = localStorage.getItem("lastReset");
  if (!lastReset) return;
  
  // Get yesterday's completion status
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = yesterday.toDateString();
  
  const completed = JSON.parse(localStorage.getItem("completedDailies_" + yesterdayKey)) || [];
  const completedCount = completed.length;
  const requiredCount = 5;
  
  // Only apply penalty if requirements not met for yesterday
  if (completedCount < requiredCount) {
    // Penalty: HP drops by 25 + 5% of max HP
    const totalStats = gameStats.getTotalStats();
    const penalty = 25 + Math.floor(totalStats.maxHP * 0.05);
    
    updateHealth(-penalty);
    
    const iconHP = '<img src="images/icons/hp.png" style="height: 20px; width: 20px; vertical-align: middle; margin-right: 4px;">';
    const warningIcon = '<img src="images/icons/warning.png" style="height: 20px; width: 20px; vertical-align: middle; margin-right: 4px;">';
    
    notyf.open({
      type: 'death',
      message: `${warningIcon} DAILY GOALS INCOMPLETE!\n${iconHP}-${penalty} HP\nComplete ${requiredCount}+ daily quests to avoid this penalty!`,
      duration: 100000,
      dismissible: true
    });
  }
  // No else clause needed - rewards are now handled in real-time when 5th quest is completed
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

    // Add completion animation
    gsap.to(e.target, {
      scale: 1.3,
      rotation: 360,
      duration: 0.3,
      ease: "back.out(1.7)",
      onComplete: () => {
        gsap.to(e.target, { scale: 1, rotation: 0, duration: 0.2 });
      }
    });

    if (item.parentElement === dailyQuestList) {
      // Mark as completed for today
      item.classList.add("completed");
      const questText = item.querySelector("span").textContent;
      const completed = getCompletedDailies();
      const newCount = incrementCompletionCount(questId, 'daily');
      if (countDisplay) countDisplay.textContent = `⇆ ${newCount}`;
      
      // Check if this was a new completion (not already in the list)
      let wasNewCompletion = false;
      if (!completed.includes(questText)) {
        completed.push(questText);
        setCompletedDailies(completed);
        wasNewCompletion = true;
      }
      
      // Check if this completion triggers the 5-quest bonus
      if (wasNewCompletion && completed.length === 5) {
        showDailyQuestBonusMessage();
      }
      
      updateDailyProgress();
      maybeAwardZenCoins();
      gameStats.awardXP(15);
    }
    else if (item.classList.contains("positive")) {
      const newCount = incrementCompletionCount(questId, 'habit');
      if (countDisplay) countDisplay.textContent = `⇆ ${newCount}`;
      gameStats.awardXP(5);
      maybeAwardZenCoins();

    }
    else if (item.classList.contains("negative")) {
      const newCount = incrementCompletionCount(questId, 'habit');
      if (countDisplay) countDisplay.textContent = `⇆ ${newCount}`;
      updateHealth(-15);
    }
    else {
      // For main and side quests - track completion before removal
      const isMainQuest = item.parentElement.id === 'main-quest-list';
      const isSideQuest = item.parentElement.id === 'side-quest-list';
      
      // Track quest completion immediately
      if (isMainQuest) {
        incrementQuestStatistic('main', 15);
      } else if (isSideQuest) {
        incrementQuestStatistic('side', 15);
      }
      
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
          gameStats.awardXP(15);
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

    document.getElementById('pomodoro-start').textContent = '...';

    // FOCUS message
    const message = document.getElementById('pomodoro-message');

    if (currentState === 'FOCUS') {
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

  const message = document.getElementById('pomodoro-message');
  message.textContent = 'SPELL ENDED!';
  message.style.color = '#4CAF50';

  if (currentState === 'FOCUS') {
    sessionCount++;
    totalFocusTime += POMODORO_STATES.FOCUS.time * 60;

    updatePomodoroStats();
    
    // Award XP and coins with critical chance
    const xpResult = gameStats.awardXP(POMODORO_STATES.FOCUS.xp);
    const coinResult = maybeAwardZenCoins();
    
    // Award random potion for completing focus session
    const randomPotion = getRandomPotion();
    addToInventory(randomPotion);
    
    // Show pomodoro completion toast
    showPomodoroCompletionMessage(xpResult, coinResult, randomPotion);
    
    // Track Pomodoro completion statistics immediately
    incrementQuestStatistic('pomodoro', POMODORO_STATES.FOCUS.xp);
  }


}

// Get random potion from available potions in market
function getRandomPotion() {
  const potions = [
    {
      id: 'potion1',
      name: 'Small Health Potion',
      description: 'A gentle healing elixir that restores vitality. Made from mountain spring water and healing herbs.',
      image: 'images/items/s_hp_potion.png',
      price: 50,
      effect: 'heal',
      value: 20,
      category: 'potions'
    },
    {
      id: 'potion2',
      name: 'Health Potion',
      description: 'A potent healing potion that rapidly restores health. Brewed by master alchemists using ancient recipes.',
      image: 'images/items/hp_potion.png',
      price: 175,
      effect: 'heal',
      value: 75,
      category: 'potions'
    },
    {
      id: 'potion3',
      name: 'XP Potion',
      description: 'A mystical brew that accelerates learning and growth. The liquid wisdom of countless masters. XP gain scales with stats.',
      image: 'images/items/xp_potion.png',
      price: 500,
      effect: 'xp',
      value: 100,
      category: 'potions'
    },
    {
      id: 'potion4',
      name: 'Max HP Potion',
      description: 'A transformative elixir that permanently strengthens your life force. Changes you at a cellular level.',
      image: 'images/items/max_hp_potion.png',
      price: 1500,
      effect: 'maxHP',
      value: 5,
      category: 'potions'
    }
  ];
  
  const randomIndex = Math.floor(Math.random() * potions.length);
  return potions[randomIndex];
}

// Add item to inventory (ensure this exists in app.js)
function addToInventory(item) {
  const inventory = JSON.parse(localStorage.getItem('inventory')) || [];
  const existingItem = inventory.find(invItem => invItem.id === item.id);
  
  if (existingItem) {
    // Increment quantity if item exists
    existingItem.quantity = (existingItem.quantity || 1) + 1;
  } else {
    // Add new item with quantity 1
    inventory.push({
      ...item,
      quantity: 1
    });
  }
  
  localStorage.setItem('inventory', JSON.stringify(inventory));
}

// Show pomodoro completion message with rewards
function showPomodoroCompletionMessage(xpResult, coinResult, potion) {
  const pomodoroIcon = '<img src="images/icons/pomodoro.png" style="height: 32px; width: 32px; vertical-align: middle;">';
  const xpIcon = '<img src="images/icons/xp.png" style="height: 24px; width: 24px; vertical-align: middle;">';
  const coinIcon = '<img src="images/icons/coin.png" style="height: 24px; width: 24px; vertical-align: middle;">';
  const potionIcon = `<img src="${potion.image}" style="height: 24px; width: 24px; vertical-align: middle;">`;
  
  let xpText = `${xpIcon} +${xpResult.xpGained} XP`;
  if (xpResult.isCritical) {
    xpText += ' (CRITICAL!)';
  }
  
  let coinText = '';
  if (coinResult.coinsGained > 0) {
    coinText = `\n${coinIcon} +${coinResult.coinsGained} Zen Coins`;
    if (coinResult.isCritical) {
      coinText += ' (CRITICAL!)';
    }
  } else {
    coinText = '\nNo coins this time';
  }
  
  notyf.open({
    type: 'success',
    message: `${pomodoroIcon} Focus Session Complete!\n${xpText}${coinText}\n${potionIcon} Found: ${potion.name}`,
    duration: 4000
  });
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
  timerElem.innerHTML = `<img src="images/icons/hourglass.png" alt="Hourglass" style="width: 18px; height: 18px; vertical-align: middle; margin-right: 3px;">Daily quests reset in ${hours}:${mins}:${secs}`;
}
setInterval(updateDailyResetTimer, 1000);
updateDailyResetTimer();

// Show level up message
function showLevelUpMessage(level) {
  const iconImg = '<img src="images/icons/levelup.png" style="height: 40px; width: 40px; vertical-align: middle;">';
  
  // Add honey and elixir potions to inventory on level up
  const honeyPotion = {
    id: 'potion5',
    name: 'Honey of Enlightenment',
    description: 'Sacred honey that provides sustained focus and energy. Increases XP gain for a limited time. Duration and effects do not stack (max duration is 2 hours).',
    image: 'images/items/honey.png',
    price: 750,
    effect: 'xpBoost',
    value: 25,
    duration: 7200000, // 2 hours in milliseconds
    category: 'potions'
  };
  
  const elixirPotion = {
    id: 'potion6',
    name: 'Elixir of Prosperity',
    description: 'A shimmering potion that attracts abundance. Increases coin gain for a limited time. Duration and effects do not stack (max duration is 2 hours).',
    image: 'images/items/elixir.png',
    price: 1000,
    effect: 'coinBoost',
    value: 30,
    duration: 7200000, // 2 hours
    category: 'potions'
  };
  
  addToInventory(honeyPotion);
  addToInventory(elixirPotion);
  
  const honeyIcon = '<img src="images/items/honey.png" style="height: 24px; width: 24px; vertical-align: middle;">';
  const elixirIcon = '<img src="images/items/elixir.png" style="height: 24px; width: 24px; vertical-align: middle;">';
  
  notyf.open({
    type: 'levelup',
    message: `${iconImg}\nLevel Up!\nYou are now level ${level}!\nZen Coin gain & chance increased.\n\nBonus rewards:\n${honeyIcon} Honey of Enlightenment\n${elixirIcon} Elixir of Prosperity`
  });
}

// Show daily quest bonus message
function showDailyQuestBonusMessage() {
  // Award the bonus rewards
  const baseXpReward = 50;
  const baseCoinReward = 100;
  
  const xpResult = gameStats.awardXP(baseXpReward);
  const coinResult = gameStats.awardCoins(baseCoinReward);
  
  const iconImg = '<img src="images/icons/quest.png" style="height: 40px; width: 40px; vertical-align: middle;">';
  const xpIcon = '<img src="images/icons/xp.png" style="height: 20px; width: 20px; vertical-align: middle; margin-right: 4px;">';
  const coinIcon = '<img src="images/icons/coin.png" style="height: 20px; width: 20px; vertical-align: middle; margin-right: 4px;">';
  const starIcon = '<img src="images/icons/star.png" style="height: 20px; width: 20px; vertical-align: middle; margin: 0 4px;">';
  
  notyf.open({
    type: 'levelup',
    message: `${iconImg}\n${starIcon} DAILY QUEST BONUS! ${starIcon}\n${xpIcon}+${xpResult.amount} XP\n${coinIcon}+${coinResult.amount} Zen Coins\nExcellent work today!`
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
      type: 'critical-xp',
      background: '#232323',
      icon: false,
      className: 'notyf-critical-xp pixel-corners-small'
    },
    {
      type: 'critical-coin',
      background: '#232323',
      icon: false,
      className: 'notyf-critical-coin pixel-corners-small'
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
  initializeQuestStatistics(); // Initialize quest stats tracking
  loadQuests();
  checkDailyReset();
  renderDailyQuests(getCompletedDailies());
  updatePomodoroDisplay();
  updatePomodoroStats();
  updateDailyProgress();
  setupRandomSideQuestGenerator();
  initializeQuestSystem();
});

// Initialize quest system with enhanced features
function initializeQuestSystem() {
  // Initialize quest statistics tracking
  initializeQuestStatistics();
  
  // Auto-save every 30 seconds
  setInterval(saveQuests, 30000);
}

// Generate random side quest functionality
function generateRandomSideQuest() {
  const sideQuestPrompts = [
    "Organize one drawer or closet space",
    "Call or text a friend I haven't spoken to in a while",
    "Try a new recipe or cooking technique",
    "Take photos of something beautiful I notice today",
    "Write in a journal for 10 minutes",
    "Do a random act of kindness for someone",
    "Learn one new fact about a topic that interests me",
    "Clean and organize your digital desktop/photos",
    "Spend 15 minutes outdoors without my phone",
    "Practice a skill I want to improve for 20 minutes",
    "Declutter 5 items I no longer need",
    "Listen to a new song or album from a different genre",
    "Do 50 jumping jacks or quick exercise",
    "Send an appreciation message to someone important",
    "Research and plan a future trip or activity",
    "Try a 5-minute breathing or mindfulness exercise",
    "Rearrange or decorate a small space in my room",
    "Watch an educational video about something new",
    "Write down 3 things I'm grateful for today",
    "Explore a new walking route in my neighborhood",
    "Practice drawing or sketching for 15 minutes",
    "Create a playlist for different moods or activities",
    "Read one article about current events or science",
    "Do a puzzle, brain teaser, or play a strategy game",
    "Plan and prep healthy snacks for tomorrow"
  ];
  
  const randomIndex = Math.floor(Math.random() * sideQuestPrompts.length);
  return sideQuestPrompts[randomIndex];
}

function setupRandomSideQuestGenerator() {
  const randomBtn = document.getElementById('random-side-quest-btn');
  const sideQuestInput = document.getElementById('side-quest-input');
  
  if (randomBtn && sideQuestInput) {
    randomBtn.addEventListener('click', () => {
      const randomQuest = generateRandomSideQuest();
      sideQuestInput.value = randomQuest;
      sideQuestInput.focus();
      
      // Add a subtle animation to indicate the quest was generated
      randomBtn.style.transform = 'scale(0.9)';
      setTimeout(() => {
        randomBtn.style.transform = 'scale(1)';
      }, 150);
    });
  }
}

