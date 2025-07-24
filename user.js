// User page functionality for displaying comprehensive stats and bonuses
function updateUserStats() {
    const stats = gameStats.loadStats();
    const totalStats = gameStats.getTotalStats();
    
    // Base Stats
    document.getElementById('user-level').textContent = stats.level;
    document.getElementById('base-max-hp').textContent = stats.maxHP;
    document.getElementById('current-hp').textContent = stats.currentHP;
    document.getElementById('user-zen-coins').textContent = stats.zenCoins;
    
    // Calculate item bonuses (owned + equipped)
    const ownedBonuses = JSON.parse(localStorage.getItem('totalOwnedBonuses')) || {
        xpGain: 0, coinGain: 0, maxHP: 0, criticalChance: 0
    };
    const equippedBonuses = JSON.parse(localStorage.getItem('totalEquippedBonuses')) || {
        xpGain: 0, coinGain: 0, maxHP: 0, criticalChance: 0
    };
    
    // Equipment bonuses (owned + equipped)
    const totalEquipmentXP = ownedBonuses.xpGain + equippedBonuses.xpGain;
    const totalEquipmentCoin = ownedBonuses.coinGain + equippedBonuses.coinGain;
    const totalEquipmentHP = ownedBonuses.maxHP + equippedBonuses.maxHP;
    const totalEquipmentCritical = ownedBonuses.criticalChance + equippedBonuses.criticalChance;
    
    document.getElementById('equipment-xp-gain').textContent = `+${totalEquipmentXP}%`;
    document.getElementById('equipment-coin-gain').textContent = `+${totalEquipmentCoin}%`;
    document.getElementById('equipment-max-hp').textContent = `+${totalEquipmentHP}`;
    document.getElementById('equipment-critical').textContent = `+${totalEquipmentCritical % 1 === 0 ? totalEquipmentCritical : totalEquipmentCritical.toFixed(3).replace(/\.?0+$/, '')}%`;
    
    // Level bonuses for coins
    const levelCoinGain = Math.min(stats.level * 2, 100); // 2% per level, max 100%
    const baseCoinChance = 50; // 50% base chance
    const levelCoinChance = Math.min(baseCoinChance + (stats.level * 1), 100); // +1% per level, max 100%
    
    document.getElementById('level-coin-gain').textContent = `+${levelCoinGain}%`;
    document.getElementById('level-coin-chance').textContent = `${levelCoinChance}%`;
    
    // Total stats (from gameStats.getTotalStats())
    document.getElementById('total-max-hp').textContent = totalStats.maxHP;
    
    // Display XP gain with potion multiplier if active
    let xpGainDisplay = `+${totalStats.xpGainBonus}%`;
    if (totalStats.activeBoosts && totalStats.activeBoosts.xpBoost) {
        const multiplier = (1 + (totalStats.activeBoosts.xpBoost / 100)).toFixed(2);
        xpGainDisplay += ` (x${multiplier})`;
    }
    document.getElementById('total-xp-gain').textContent = xpGainDisplay;
    
    document.getElementById('total-critical').textContent = `${totalStats.criticalChance % 1 === 0 ? totalStats.criticalChance : totalStats.criticalChance.toFixed(3).replace(/\.?0+$/, '')}%`;
    
    // Total coin gain with potion multiplier if active
    const baseTotalCoinGain = totalEquipmentCoin + levelCoinGain;
    let coinGainDisplay = `+${totalStats.coinGainBonus}%`;
    if (totalStats.activeBoosts && totalStats.activeBoosts.coinBoost) {
        const multiplier = (1 + (totalStats.activeBoosts.coinBoost / 100)).toFixed(2);
        coinGainDisplay += ` (x${multiplier})`;
    }
    document.getElementById('total-coin-gain').textContent = coinGainDisplay;
}

// Calculate and display quest statistics
function updateQuestStats() {
    // Get current quest data
    const today = new Date().toDateString();
    const completedToday = JSON.parse(localStorage.getItem("completedDailies_" + today)) || [];
    
    // Daily quest stats
    const dailyQuests = JSON.parse(localStorage.getItem("dailyQuestMaster")) || [];
    const dailyCompletionCounts = JSON.parse(localStorage.getItem('dailyCompletionCounts') || '{}');
    const totalDailyCompletions = Object.values(dailyCompletionCounts).reduce((sum, count) => sum + count, 0);
    
    document.getElementById('daily-completed-today').textContent = completedToday.length;
    document.getElementById('daily-total').textContent = dailyQuests.length;
    document.getElementById('daily-all-time').textContent = totalDailyCompletions;
    
    // Calculate daily completion rate (completed today / total available)
    const dailyRate = dailyQuests.length > 0 ? (completedToday.length / dailyQuests.length * 100).toFixed(1) : 0;
    document.getElementById('daily-completion-rate').textContent = `${dailyRate}%`;
    
    // Habit stats - get from localStorage
    const habitQuestsHTML = localStorage.getItem("habitQuests") || '';
    let totalHabits = 0, positiveHabits = 0, negativeHabits = 0;
    
    if (habitQuestsHTML && habitQuestsHTML.trim() !== '') {
        // Parse HTML to count habits
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = habitQuestsHTML;
        const habits = tempDiv.querySelectorAll('.quest-item');
        totalHabits = habits.length;
        positiveHabits = tempDiv.querySelectorAll('.quest-item.positive').length;
        negativeHabits = tempDiv.querySelectorAll('.quest-item.negative').length;
    }
    
    const habitCompletionCounts = JSON.parse(localStorage.getItem('habitCompletionCounts') || '{}');
    const totalHabitCompletions = Object.values(habitCompletionCounts).reduce((sum, count) => sum + count, 0);
    
    document.getElementById('habits-total').textContent = totalHabits;
    document.getElementById('habits-positive').textContent = positiveHabits;
    document.getElementById('habits-negative').textContent = negativeHabits;
    document.getElementById('habits-all-time').textContent = totalHabitCompletions;
    
    // Main and side quest stats - get from localStorage
    const mainQuestsHTML = localStorage.getItem("mainQuests") || '';
    const sideQuestsHTML = localStorage.getItem("sideQuests") || '';
    
    let activeMainQuests = 0, activeSideQuests = 0;
    
    if (mainQuestsHTML && mainQuestsHTML.trim() !== '') {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = mainQuestsHTML;
        activeMainQuests = tempDiv.querySelectorAll('.quest-item').length;
    }
    
    if (sideQuestsHTML && sideQuestsHTML.trim() !== '') {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = sideQuestsHTML;
        activeSideQuests = tempDiv.querySelectorAll('.quest-item').length;
    }
    
    // Get completed quest counts from localStorage
    const questStats = JSON.parse(localStorage.getItem('questStatistics')) || {
        mainCompleted: 0,
        sideCompleted: 0,
        mainXPEarned: 0,
        sideXPEarned: 0,
        pomodoroCompleted: 0,
        focusXPEarned: 0
    };
    
    document.getElementById('main-active').textContent = activeMainQuests;
    document.getElementById('main-completed').textContent = questStats.mainCompleted;
    document.getElementById('main-xp-earned').textContent = questStats.mainXPEarned;
    
    document.getElementById('side-active').textContent = activeSideQuests;
    document.getElementById('side-completed').textContent = questStats.sideCompleted;
    document.getElementById('side-xp-earned').textContent = questStats.sideXPEarned;
    
    // Overall stats
    const totalCompleted = questStats.mainCompleted + questStats.sideCompleted + totalDailyCompletions + totalHabitCompletions;
    const totalQuestXP = questStats.mainXPEarned + questStats.sideXPEarned + (totalDailyCompletions * 15) + (totalHabitCompletions * 5);
    
    document.getElementById('total-quests-completed').textContent = totalCompleted;
    document.getElementById('total-quest-xp').textContent = totalQuestXP;
    document.getElementById('pomodoro-completed').textContent = questStats.pomodoroCompleted;
    document.getElementById('focus-xp-earned').textContent = questStats.focusXPEarned;
}

// Initialize quest statistics tracking if not already present
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

// Function to add some test data for demonstration
function addTestQuestData() {
    // Test data temporarily disabled - will show real data
    console.log('Quest statistics will show real data from your actual quests and completions');
}

// Function to increment quest completion statistics
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
    
    // Update display if we're on the user page
    if (document.getElementById('quest-stats')) {
        updateQuestStats();
    }
}

// Calculate equipment stats from inventory
function calculateEquipmentStats() {
    const inventory = JSON.parse(localStorage.getItem('inventory')) || [];
    const equipped = JSON.parse(localStorage.getItem('equippedItems')) || {};
    
    let totalOwnedBonuses = {
        xpGain: 0,
        coinGain: 0,
        maxHP: 0,
        criticalChance: 0
    };
    
    let totalEquippedBonuses = {
        xpGain: 0,
        coinGain: 0,
        maxHP: 0,
        criticalChance: 0
    };
    
    // Calculate owned stats from all items in inventory
    inventory.forEach(item => {
        if (item.ownedStats && (item.category === 'weapons' || item.category === 'equipment')) {
            const level = item.quantity || 1;
            Object.entries(item.ownedStats).forEach(([stat, value]) => {
                totalOwnedBonuses[stat] = (totalOwnedBonuses[stat] || 0) + (value * level);
            });
        }
    });
    
    // Calculate equipped stats from equipped items
    Object.values(equipped).forEach(item => {
        if (item.equippedStats && (item.category === 'weapons' || item.category === 'equipment')) {
            Object.entries(item.equippedStats).forEach(([stat, value]) => {
                totalEquippedBonuses[stat] = (totalEquippedBonuses[stat] || 0) + value;
            });
        }
    });
    
    // Store for use by other systems
    localStorage.setItem('totalOwnedBonuses', JSON.stringify(totalOwnedBonuses));
    localStorage.setItem('totalEquippedBonuses', JSON.stringify(totalEquippedBonuses));
    
    return { totalOwnedBonuses, totalEquippedBonuses };
}

// Add some visual enhancements with GSAP animations
function animateStatsOnLoad() {
    if (typeof gsap !== 'undefined') {
        // Check if we're on desktop (1200px+)
        const isDesktop = window.innerWidth >= 1200;
        
        // Animate stat categories with stagger (no stagger on desktop for grid layout)
        gsap.from('.stat-category', {
            y: 30,
            opacity: 0,
            duration: 0.6,
            stagger: isDesktop ? 0 : 0.1, // No stagger on desktop
            ease: "power2.out"
        });
        
        // Animate instruction categories
        gsap.from('.instruction-category', {
            y: 20,
            opacity: 0,
            duration: 0.5,
            stagger: isDesktop ? 0 : 0.05, // No stagger on desktop
            delay: 0.3,
            ease: "power2.out"
        });
        
        // Add hover animations to stat items
        document.querySelectorAll('.stat-item.highlight').forEach(item => {
            item.addEventListener('mouseenter', () => {
                gsap.to(item, {
                    scale: 1.02,
                    duration: 0.2,
                    ease: "power1.out"
                });
            });
            
            item.addEventListener('mouseleave', () => {
                gsap.to(item, {
                    scale: 1,
                    duration: 0.2,
                    ease: "power1.out"
                });
            });
        });
    }
}

// Auto-refresh stats periodically
function startStatsRefresh() {
    // Initialize quest statistics tracking
    initializeQuestStatistics();
    
    // Update immediately
    calculateEquipmentStats();
    updateUserStats();
    updateQuestStats();
    
    // Update every 5 seconds to keep stats current
    setInterval(() => {
        calculateEquipmentStats();
        updateUserStats();
        updateQuestStats();
    }, 5000);
}


// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    console.log('User page DOM loaded, starting initialization...');
    
    // Initialize game stats HUD (this will update both main and mini HUD)
    if (typeof gameStats !== 'undefined') {
        gameStats.updateHUD();
        console.log('Game stats HUD updated');
    }
    
    // Calculate and display all stats
    startStatsRefresh();
    
    // Add visual enhancements
    animateStatsOnLoad();
    
    console.log('User page initialized successfully - main HUD hidden, mini HUD visible');
});
