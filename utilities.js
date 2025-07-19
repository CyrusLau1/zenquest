const gameStats = {
    loadStats() {
        const level = parseInt(localStorage.getItem('level')) || 1;
        const xp = parseInt(localStorage.getItem('xp')) || 0;
        const xpToNext = Math.round(100 + (level - 1) * (10 ** 1.2));
        
        return {
            currentHP: parseInt(localStorage.getItem('health')) || 100,
            maxHP: parseInt(localStorage.getItem('maxHP')) || 100,
            xp: xp,
            level: level,
            zenCoins: parseInt(localStorage.getItem('zenCoins')) || 0,
            xpToNext: xpToNext
        };
    },

    saveStats(stats) {
        localStorage.setItem('health', stats.currentHP);
        localStorage.setItem('maxHP', stats.maxHP);
        localStorage.setItem('xp', stats.xp);
        localStorage.setItem('level', stats.level);
        localStorage.setItem('zenCoins', stats.zenCoins);
        this.updateHUD();
    },

    // Get total stats including bonuses from equipment
    getTotalStats() {
        const baseStats = this.loadStats();
        const ownedBonuses = JSON.parse(localStorage.getItem('totalOwnedBonuses') || '{}');
        const equippedBonuses = JSON.parse(localStorage.getItem('totalEquippedBonuses') || '{}');
        const activeBoosts = this.getActiveBoosts();
        
        return {
            ...baseStats,
            maxHP: baseStats.maxHP + (ownedBonuses.maxHP || 0) + (equippedBonuses.maxHP || 0),
            xpGainBonus: (ownedBonuses.xpGain || 0) + (equippedBonuses.xpGain || 0) + (activeBoosts.xpBoost || 0),
            coinGainBonus: (ownedBonuses.coinGain || 0) + (equippedBonuses.coinGain || 0) + (activeBoosts.coinBoost || 0),
            criticalChance: (ownedBonuses.criticalChance || 0) + (equippedBonuses.criticalChance || 0)
        };
    },

    // Get active temporary boosts
    getActiveBoosts() {
        const boosts = JSON.parse(localStorage.getItem('activeBoosts') || '{}');
        const now = Date.now();
        const activeBoosts = {};
        
        Object.entries(boosts).forEach(([type, boost]) => {
            if (boost.endTime > now) {
                activeBoosts[type] = boost.value;
            }
        });
        
        // Clean expired boosts
        const validBoosts = {};
        Object.entries(boosts).forEach(([type, boost]) => {
            if (boost.endTime > now) {
                validBoosts[type] = boost;
            }
        });
        localStorage.setItem('activeBoosts', JSON.stringify(validBoosts));
        
        return activeBoosts;
    },

    // Award XP with bonuses and critical chance
    awardXP(baseAmount) {
        const totalStats = this.getTotalStats();
        let finalAmount = baseAmount;
        
        // Apply XP gain bonus
        if (totalStats.xpGainBonus > 0) {
            finalAmount = Math.floor(baseAmount * (1 + totalStats.xpGainBonus / 100));
        }
        
        // Check for critical hit
        if (totalStats.criticalChance > 0) {
            const random = Math.random() * 100;
            if (random < totalStats.criticalChance) {
                finalAmount *= 2;
                if (typeof notyf !== 'undefined') {
                    notyf.open({
                        type: 'critical-xp',
                        message: `💥 CRITICAL! +${finalAmount} XP`
                    });
                }
            }
        }
        
        // Use the original app.js updateXP function for proper level calculations
        if (typeof updateXP === 'function') {
            updateXP(finalAmount);
        } else {
            // Fallback: just add the XP
            const stats = this.loadStats();
            stats.xp += finalAmount;
            this.saveStats(stats);
        }
        
        return finalAmount;
    },

    // Award coins with bonuses and critical chance
    awardCoins(baseAmount) {
        const totalStats = this.getTotalStats();
        let finalAmount = baseAmount;
        
        // Apply coin gain bonus
        if (totalStats.coinGainBonus > 0) {
            finalAmount = Math.floor(baseAmount * (1 + totalStats.coinGainBonus / 100));
        }
        
        // Check for critical hit
        if (totalStats.criticalChance > 0) {
            const random = Math.random() * 100;
            if (random < totalStats.criticalChance) {
                finalAmount *= 2;
                if (typeof notyf !== 'undefined') {
                    notyf.open({
                        type: 'critical-coin',
                        message: `💥 CRITICAL! +${finalAmount} Zen Coins`
                    });
                }
            }
        }
        
        // Update using original localStorage system
        let zenCoins = parseInt(localStorage.getItem("zenCoins")) || 0;
        zenCoins += finalAmount;
        localStorage.setItem("zenCoins", zenCoins);
        this.updateHUD();
        return finalAmount;
    },

    initMiniHUD() {
        const miniHud = document.createElement('div');
        miniHud.className = 'mini-hud';
        miniHud.innerHTML = `
            <div class="hud-item">
                <img class="hud-icon" src="images/icons/hp.png">
                <div class="health-bar pixel-corners-small">
                    <div id="mini-health-progress" class="pixel-corners-small"></div>
                </div>
            </div>
            <div class="hud-item">
                <img class="hud-icon" src="images/icons/xp.png">
                <div class="xp-bar pixel-corners-small">
                    <div id="mini-xp-progress" class="pixel-corners-small"></div>
                </div>
            </div>
            <div class="hud-item">
                <div class="level-badge pixel-corners-small">
                    <span id="mini-level" class="level-number">1</span>
                </div>
            </div>
            <div class="hud-item">
                <div class="zen-coins-bar pixel-corners-small">
                    <img class="hud-icon" src="images/icons/coin.png">
                    <span id="mini-zen-coins-count">0</span>
                </div>
            </div>
        `;
        document.body.appendChild(miniHud);

        // Set up visibility observer
        const mainHud = document.querySelector('.hud');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                miniHud.classList.toggle('visible', !entry.isIntersecting);
            });
        }, { threshold: 0 });

        if (mainHud) observer.observe(mainHud);
    },

    updateHUD() {
        const stats = this.getTotalStats(); // Use total stats including bonuses
        
        // Update main health bar and text
        const healthProgress = document.getElementById('health-progress');
        const healthText = document.querySelector('.health-text');
        if (healthProgress) {
            const healthPercent = (stats.currentHP / stats.maxHP) * 100;
            healthProgress.style.width = `${healthPercent}%`;
            if (healthText) {
                healthText.textContent = `[${stats.currentHP}/${stats.maxHP}]`;
            }
        }

        // Update main XP bar and text
        const xpProgress = document.getElementById('xp-progress');
        const xpText = document.querySelector('.xp-text');
        if (xpProgress) {
            const xpPercent = (stats.xp / stats.xpToNext) * 100;
            xpProgress.style.width = `${xpPercent}%`;
            if (xpText) {
                xpText.textContent = `[${stats.xp}/${stats.xpToNext}]`;
            }
        }

        // Update mini HUD stats
        const miniHealthProgress = document.getElementById('mini-health-progress');
        if (miniHealthProgress) {
            const healthPercent = (stats.currentHP / stats.maxHP) * 100;
            miniHealthProgress.style.width = `${healthPercent}%`;
        }

        const miniXpProgress = document.getElementById('mini-xp-progress');
        if (miniXpProgress) {
            const xpPercent = (stats.xp / stats.xpToNext) * 100;
            miniXpProgress.style.width = `${xpPercent}%`;
        }

        // Update level displays
        ['level', 'mini-level'].forEach(id => {
            const elem = document.getElementById(id);
            if (elem) elem.textContent = stats.level;
        });

        // Update zen coins displays
        ['zen-coins-count', 'mini-zen-coins-count'].forEach(id => {
            const elem = document.getElementById(id);
            if (elem) elem.textContent = stats.zenCoins;
        });
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



// Create the scroll effect element
const scrollEffect = document.createElement('div');
scrollEffect.className = 'scroll-effect';
document.body.appendChild(scrollEffect);

// Update background effect on scroll
window.addEventListener('scroll', () => {
  const scrolled = window.pageYOffset;
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const scrollProgress = scrolled / maxScroll;
  
  // Calculate blur and scale based on scroll position
  const blur = Math.min(scrollProgress * 5, 10); // Max 10px blur
  const scale = 1 + (scrollProgress * 0.25); // Max 10% zoom
  
  scrollEffect.style.filter = `blur(${blur}px)`;
  scrollEffect.style.transform = `scale(${scale})`;
});


// Copy the current background image to the effect layer
window.addEventListener('load', () => {
  const bg = getComputedStyle(document.body).backgroundImage;
  scrollEffect.style.backgroundImage = bg;
});



// Background particle effects
function initParticleEffects() {
  const particlesConfig = {
    particles: {
      number: { value: 40, density: { enable: true, value_area: 400 } },
      line_linked: {
        enable: false
      },
      color: { value: "#ffffff" },
      shape: { type: ["edge","polygon"] },
      opacity: {
        value: 0.55,
        random: true,
        animation: { enable: true, speed: 0.55, sync: false }
      },
      size: {
        value: 3,
        random: true
      },
      move: {
        enable: true,
        speed: 0.8,
        direction: "top",
        random: true,
        straight: false,
        outModes: { default: "out" }
      }
    }
  };

  // Create particle container
  const particlesDiv = document.createElement('div');
  particlesDiv.id = 'particles-js';
  particlesDiv.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: -1;
    pointer-events: none;
  `;
  document.body.prepend(particlesDiv);
  
  particlesJS('particles-js', particlesConfig);
}



function initProgressiveLoading() {
  gsap.registerPlugin(ScrollTrigger);
  
  const sections = document.querySelectorAll('.game-section');
  sections.forEach((section, i) => {
    gsap.fromTo(section, 
      { 
        opacity: 0.1, 
        y: 30 
      },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power2.out",
        scrollTrigger: {
          trigger: section,
          start: "top 110%",
          end: "top 50%",
          toggleActions: "play none none reverse",
          once: true
        }
      }
    );
  });
}


// Simple and reliable header state management
(function() {
  // Immediately apply header state on page load (before DOM is fully ready)
  const headerHidden = localStorage.getItem('headerHidden') === 'true';
  if (headerHidden) {
    document.documentElement.classList.add('header-hidden');
  }
  
  // Set up toggle functionality when DOM is ready
  document.addEventListener('DOMContentLoaded', function() {
    const mainHeader = document.querySelector('.main-header');
    const toggleBtn = document.getElementById('toggleHeader');
    
    if (!mainHeader || !toggleBtn) {
      console.error('Header elements not found');
      return;
    }
    
    // Apply initial state
    if (headerHidden) {
      mainHeader.classList.add('hidden');
      updateButtonState(toggleBtn, true);
    }
    
    // Set up toggle click handler
    toggleBtn.addEventListener('click', function() {
      // Toggle state
      const isNowHidden = !mainHeader.classList.contains('hidden');
      
      // Update UI
      mainHeader.classList.toggle('hidden');
      updateButtonState(toggleBtn, isNowHidden);
      
      // Save state - use a simple boolean value for reliability
      localStorage.setItem('headerHidden', isNowHidden);
      console.log('Header hidden state saved:', isNowHidden);
    });
  });
  
  // Helper function to update button appearance
  function updateButtonState(button, isHidden) {
    const icon = button.querySelector('.toggle-icon');
    const text = button.querySelector('.toggle-text');
    
    if (icon) icon.textContent = isHidden ? '▲' : '▼';
    if (text) text.textContent = isHidden ? 'Show Header' : 'Hide Header';
  }
})();


// Initialize mini HUD on page load
document.addEventListener('DOMContentLoaded', () => {
    gameStats.initMiniHUD();
    gameStats.updateHUD();
    setInterval(() => gameStats.updateHUD(), 300);
    initParticleEffects();
    initProgressiveLoading();
});


