const gameStats = {
    loadStats() {
        return {
            hp: Number(localStorage.getItem('hp')) || 100,
            maxHp: Number(localStorage.getItem('maxHp')) || 100,
            xp: Number(localStorage.getItem('xp')) || 0,
            level: Number(localStorage.getItem('level')) || 1,
            zenCoins: Number(localStorage.getItem('zenCoins')) || 0
        };
    },

    saveStats(stats) {
        localStorage.setItem('hp', stats.hp);
        localStorage.setItem('maxHp', stats.maxHp);
        localStorage.setItem('xp', stats.xp);
        localStorage.setItem('level', stats.level);
        localStorage.setItem('zenCoins', stats.zenCoins);
    },

    updateHUD() {
        const stats = this.loadStats();
        
        // Update health bar
        const healthProgress = document.getElementById('health-progress');
        if (healthProgress) {
            const healthPercent = (stats.hp / stats.maxHp) * 100;
            healthProgress.style.width = `${healthPercent}%`;
        }

        // Update XP bar
        const xpProgress = document.getElementById('xp-progress');
        if (xpProgress) {
            const xpToNextLevel = stats.level * 100;
            const xpPercent = (stats.xp / xpToNextLevel) * 100;
            xpProgress.style.width = `${xpPercent}%`;
        }

        // Update level
        const levelElement = document.getElementById('level');
        if (levelElement) {
            levelElement.textContent = stats.level;
        }

        // Update zen coins
        const zenCoinsElement = document.getElementById('zen-coins-count');
        if (zenCoinsElement) {
            zenCoinsElement.textContent = stats.zenCoins;
        }
    }
};

// Navigation handler
document.addEventListener('DOMContentLoaded', () => {
    // Add click handlers to all nav buttons
    document.querySelectorAll('.nav-btn').forEach(button => {
        button.addEventListener('click', () => {
            const page = button.dataset.page;
            navigateToPage(page);
        });
    });

});

function navigateToPage(page) {
    // Save any necessary state before navigation
    saveGameState();
    
    // Navigate to the new page
    window.location.href = page === 'index' ? 'index.html' : `${page}.html`;
}

function saveGameState() {
    // Save any necessary state here
    const gameState = {
        timestamp: Date.now(),
        lastPage: window.location.pathname
        // Add any other state you need to persist
    };
    
    localStorage.setItem('gameState', JSON.stringify(gameState));
}