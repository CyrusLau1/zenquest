const gameStats = {
    loadStats() {
        return {
            health: parseInt(localStorage.getItem('health')) || 100,
            maxHealth: parseInt(localStorage.getItem('maxHealth')) || 100,
            xp: parseInt(localStorage.getItem('xp')) || 0,
            level: parseInt(localStorage.getItem('level')) || 1,
            zenCoins: parseInt(localStorage.getItem('zenCoins')) || 0
        };
    },

    saveStats(stats) {
        localStorage.setItem('health', stats.health);
        localStorage.setItem('maxHealth', stats.maxHealth);
        localStorage.setItem('xp', stats.xp);
        localStorage.setItem('level', stats.level);
        localStorage.setItem('zenCoins', stats.zenCoins);

    },

    updateHUD() {
        const stats = this.loadStats();
        
        // Update health bar
        const healthProgress = document.getElementById('health-progress');
        if (healthProgress) {
            const healthPercent = (stats.health / stats.maxHealth) * 100;
            healthProgress.style.width = `${healthPercent}%`;
        }

        // Update XP bar
        const xpProgress = document.getElementById('xp-progress');
        if (xpProgress) {
            xpProgress.style.width = `${stats.xp}%`;
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
    };
    
    localStorage.setItem('gameState', JSON.stringify(gameState));
}