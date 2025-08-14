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
        
        // Calculate level bonuses
        const levelCoinGain = Math.min(baseStats.level * 2, 100); // 2% per level, max 100%
        
        // Calculate base bonuses (equipment + level bonuses, without potions)
        const baseXpGainBonus = (ownedBonuses.xpGain || 0) + (equippedBonuses.xpGain || 0);
        const baseCoinGainBonus = (ownedBonuses.coinGain || 0) + (equippedBonuses.coinGain || 0) + levelCoinGain;
        
        // Apply potion multipliers on top of base bonuses
        let finalXpGainBonus = baseXpGainBonus;
        let finalCoinGainBonus = baseCoinGainBonus;
        
        if (activeBoosts.xpBoost) {
            // Convert 25% boost to 1.25x multiplier, apply to total bonus
            const multiplier = 1 + (activeBoosts.xpBoost / 100);
            finalXpGainBonus = Math.floor((100 + baseXpGainBonus) * multiplier) - 100;
        }
        
        if (activeBoosts.coinBoost) {
            // Convert 30% boost to 1.30x multiplier, apply to total bonus
            const multiplier = 1 + (activeBoosts.coinBoost / 100);
            finalCoinGainBonus = Math.floor((100 + baseCoinGainBonus) * multiplier) - 100;
        }
        
        return {
            ...baseStats,
            maxHP: baseStats.maxHP + (ownedBonuses.maxHP || 0) + (equippedBonuses.maxHP || 0),
            xpGainBonus: finalXpGainBonus,
            coinGainBonus: finalCoinGainBonus,
            baseXpGainBonus: baseXpGainBonus, // Store base bonus for display
            baseCoinGainBonus: baseCoinGainBonus, // Store base bonus for display
            criticalChance: (ownedBonuses.criticalChance || 0) + (equippedBonuses.criticalChance || 0),
            activeBoosts: activeBoosts // Store active boosts for display
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
        let isCritical = false;
        
        // Apply XP gain bonus
        if (totalStats.xpGainBonus > 0) {
            finalAmount = Math.floor(baseAmount * (1 + totalStats.xpGainBonus / 100));
        }
        
        // Check for critical hit
        if (totalStats.criticalChance > 0) {
            const random = Math.random() * 100;
            if (random < totalStats.criticalChance) {
                finalAmount *= 2;
                isCritical = true;
                if (typeof notyf !== 'undefined') {
                    const criticalIcon = '<img src="images/icons/critical.png" style="height: 18px; width: 18px; vertical-align: middle; margin-right: 4px;">';
                    notyf.open({
                        type: 'critical-xp',
                        message: `${criticalIcon}CRITICAL! +${finalAmount} XP`
                    });
                }
            }
        }
        
        // If it's not a critical hit, show normal XP message
        if (!isCritical && typeof showXPMessage === 'function') {
            showXPMessage(finalAmount);
        }
        
        // Use the original app.js updateXP function for proper level calculations, but skip the message
        if (typeof updateXP === 'function') {
            // Temporarily replace showXPMessage to prevent duplicate notification
            const originalShowXPMessage = typeof showXPMessage !== 'undefined' ? showXPMessage : null;
            if (originalShowXPMessage) {
                window.showXPMessage = () => {}; // Temporarily disable
            }
            updateXP(finalAmount);
            // Restore original function
            if (originalShowXPMessage) {
                window.showXPMessage = originalShowXPMessage;
            }
        } else {
            // Fallback: just add the XP
            const stats = this.loadStats();
            stats.xp += finalAmount;
            this.saveStats(stats);
        }
        
        return { amount: finalAmount, isCritical };
    },

    // Award coins with bonuses and critical chance
    awardCoins(baseAmount) {
        const totalStats = this.getTotalStats();
        let finalAmount = baseAmount;
        let isCritical = false;
        
        // Apply coin gain bonus
        if (totalStats.coinGainBonus > 0) {
            finalAmount = Math.floor(baseAmount * (1 + totalStats.coinGainBonus / 100));
        }
        
        // Check for critical hit
        if (totalStats.criticalChance > 0) {
            const random = Math.random() * 100;
            if (random < totalStats.criticalChance) {
                finalAmount *= 2;
                isCritical = true;
                if (typeof notyf !== 'undefined') {
                    const criticalIcon = '<img src="images/icons/critical.png" style="height: 18px; width: 18px; vertical-align: middle; margin-right: 4px;">';
                    notyf.open({
                        type: 'critical-coin',
                        message: `${criticalIcon}CRITICAL! +${finalAmount} Zen Coins`
                    });
                }
            }
        }
        
        // If it's not a critical hit, show normal coin message
        if (!isCritical && typeof showZenCoinMessage === 'function') {
            showZenCoinMessage(finalAmount);
        }
        
        // Update using original localStorage system
        let zenCoins = parseInt(localStorage.getItem("zenCoins")) || 0;
        zenCoins += finalAmount;
        localStorage.setItem("zenCoins", zenCoins);
        this.updateHUD();
        return { amount: finalAmount, isCritical };
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
        
        // Create desktop HUD layout if it doesn't exist
        this.createDesktopHUD();
        
        // Update main health bar and text (for mobile)
        const healthProgress = document.getElementById('health-progress');
        const healthText = document.querySelector('.health-text');
        if (healthProgress) {
            const healthPercent = (stats.currentHP / stats.maxHP) * 100;
            healthProgress.style.width = `${healthPercent}%`;
            if (healthText) {
                healthText.textContent = `[${stats.currentHP}/${stats.maxHP}]`;
            }
        }

        // Update desktop health bar and text
        const desktopHealthProgress = document.getElementById('desktop-health-progress');
        const desktopHealthText = document.querySelector('.desktop-health-text');
        if (desktopHealthProgress) {
            const healthPercent = (stats.currentHP / stats.maxHP) * 100;
            desktopHealthProgress.style.width = `${healthPercent}%`;
            if (desktopHealthText) {
                desktopHealthText.textContent = `[${stats.currentHP}/${stats.maxHP}]`;
            }
        }

        // Update main XP bar and text (for mobile)
        const xpProgress = document.getElementById('xp-progress');
        const xpText = document.querySelector('.xp-text');
        if (xpProgress) {
            const xpPercent = (stats.xp / stats.xpToNext) * 100;
            xpProgress.style.width = `${xpPercent}%`;
            if (xpText) {
                xpText.textContent = `[${stats.xp}/${stats.xpToNext}]`;
            }
        }

        // Update desktop XP bar and text
        const desktopXpProgress = document.getElementById('desktop-xp-progress');
        const desktopXpText = document.querySelector('.desktop-xp-text');
        if (desktopXpProgress) {
            const xpPercent = (stats.xp / stats.xpToNext) * 100;
            desktopXpProgress.style.width = `${xpPercent}%`;
            if (desktopXpText) {
                desktopXpText.textContent = `[${stats.xp}/${stats.xpToNext}]`;
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
        ['level', 'mini-level', 'desktop-level'].forEach(id => {
            const elem = document.getElementById(id);
            if (elem) elem.textContent = stats.level;
        });

        // Update zen coins displays
        ['zen-coins-count', 'mini-zen-coins-count', 'desktop-zen-coins-count'].forEach(id => {
            const elem = document.getElementById(id);
            if (elem) elem.textContent = stats.zenCoins;
        });
    },

    createDesktopHUD() {
        // Only create desktop HUD on desktop screens (1200px and up)
        if (window.innerWidth < 1200) return;
        
        const hud = document.querySelector('.hud:not(.mini-hud)');
        if (!hud || hud.querySelector('.hud-item-level')) return; // Already created

        // Get current stats to set initial values
        const stats = this.getTotalStats();
        const healthPercent = (stats.currentHP / stats.maxHP) * 100;
        const xpPercent = (stats.xp / stats.xpToNext) * 100;

        // Create level section
        const levelSection = document.createElement('div');
        levelSection.className = 'hud-item-level';
        levelSection.innerHTML = `
            <div class="level-badge pixel-corners-small">
                <span class="level-label">Level</span>
                <span id="desktop-level" class="level-number pixel-corners-small">${stats.level}</span>
            </div>
        `;

        // Create progress section with HP and XP
        const progressSection = document.createElement('div');
        progressSection.className = 'hud-item-progress';
        progressSection.innerHTML = `
            <div class="progress-item">
                <p><img class="hud-icon" src="images/icons/hp.png" alt="Health"> Health: <span class="desktop-health-text">[${stats.currentHP}/${stats.maxHP}]</span></p>
                <div class="health-bar pixel-corners-small">
                    <div id="desktop-health-progress" style="width: ${healthPercent}%;" class="pixel-corners-small"></div>
                </div>
            </div>
            <div class="progress-item">
                <p><img class="hud-icon" src="images/icons/xp.png" alt="Experience"> XP: <span class="desktop-xp-text">[${stats.xp}/${stats.xpToNext}]</span></p>
                <div class="xp-bar pixel-corners-small">
                    <div id="desktop-xp-progress" style="width: ${xpPercent}%;" class="pixel-corners-small"></div>
                </div>
            </div>
        `;

        // Create coins section
        const coinsSection = document.createElement('div');
        coinsSection.className = 'hud-item-coins';
        coinsSection.innerHTML = `
            <span class="zen-coins-bar pixel-corners-small">
                <img class="hud-icon" src="images/icons/coin.png" alt="Zen Coins"> <span id="desktop-zen-coins-count">${stats.zenCoins}</span>
            </span>
        `;

        // Add sections to HUD
        hud.appendChild(levelSection);
        hud.appendChild(progressSection);
        hud.appendChild(coinsSection);
    },

    removeDesktopHUD() {
        const hud = document.querySelector('.hud:not(.mini-hud)');
        if (!hud) return;

        // Remove desktop-specific elements
        const levelSection = hud.querySelector('.hud-item-level');
        const progressSection = hud.querySelector('.hud-item-progress');
        const coinsSection = hud.querySelector('.hud-item-coins');

        if (levelSection) levelSection.remove();
        if (progressSection) progressSection.remove();
        if (coinsSection) coinsSection.remove();
    },

    handleResize() {
        if (window.innerWidth >= 1200) {
            // Desktop - create desktop HUD if it doesn't exist
            this.createDesktopHUD();
        } else {
            // Mobile/Tablet - remove desktop HUD if it exists
            this.removeDesktopHUD();
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

    // Handle hash navigation on page load (for focus button from other pages)
    const hash = window.location.hash;
    if (hash === '#pomodoro') {
        setTimeout(() => {
            const pomodoroSection = document.getElementById('pomodoro');
            if (pomodoroSection) {
                pomodoroSection.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'start' 
                });
            }
        }, 100); // Small delay to ensure page is fully loaded
    }
});

function navigateToPage(page) {
    // Save any necessary state before navigation
    saveGameState();
    
    // Special handling for focus button - scroll to pomodoro section if on index page
    if (page === 'focus') {
        const currentPage = window.location.pathname;
        const isOnIndex = currentPage.endsWith('index.html') || currentPage === '/' || currentPage.endsWith('/');
        
        if (isOnIndex) {
            // Scroll to pomodoro section
            const pomodoroSection = document.getElementById('pomodoro');
            if (pomodoroSection) {
                pomodoroSection.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'start' 
                });
                return; // Don't navigate away
            }
        } else {
            // If not on index page, navigate to index and then scroll
            window.location.href = 'index.html#pomodoro';
            return;
        }
    }
    
    // Navigate to the new page for other buttons
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


// Boost Indicator Management
const BoostIndicator = {
    updateInterval: null,

    init() {
        this.updateBoostIndicator();
        // Update every second
        this.updateInterval = setInterval(() => {
            this.updateBoostIndicator();
        }, 1000);
    },

    updateBoostIndicator() {
        const boosts = JSON.parse(localStorage.getItem('activeBoosts') || '{}');
        const now = Date.now();
        const indicator = document.getElementById('boost-indicator');
        const boostContent = document.getElementById('boost-content');

        if (!indicator || !boostContent) return; // Exit if indicator doesn't exist on this page

        // Find all active boosts
        const activeBoosts = [];
        Object.entries(boosts).forEach(([type, boost]) => {
            const timeLeft = boost.endTime - now;
            if (timeLeft > 0) {
                activeBoosts.push({ type, ...boost, timeLeft });
            }
        });

        if (activeBoosts.length > 0) {
            // Show the indicator
            indicator.style.display = 'block';
            
            // Clear existing content
            boostContent.innerHTML = '';
            
            // Add each active boost
            activeBoosts.forEach(boost => {
                const boostItem = document.createElement('div');
                boostItem.className = 'boost-item';
                
                const icon = document.createElement('img');
                icon.className = 'boost-icon';
                
                if (boost.type === 'xpBoost') {
                    icon.src = 'images/items/honey.png';
                    icon.alt = 'XP Boost Active';
                } else if (boost.type === 'coinBoost') {
                    icon.src = 'images/items/elixir.png';
                    icon.alt = 'Coin Boost Active';
                }
                
                const timer = document.createElement('div');
                timer.className = 'boost-timer';
                
                // Format and display the remaining time
                const minutes = Math.floor(boost.timeLeft / 60000);
                const seconds = Math.floor((boost.timeLeft % 60000) / 1000);
                timer.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
                
                boostItem.appendChild(icon);
                boostItem.appendChild(timer);
                boostContent.appendChild(boostItem);
            });
        } else {
            // Hide the indicator if no active boosts
            indicator.style.display = 'none';
        }
    },

    destroy() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    }
};

// Initialize mini HUD on page load
document.addEventListener('DOMContentLoaded', () => {
    // Initialize HUD based on screen size
    gameStats.handleResize();
    gameStats.initMiniHUD();
    gameStats.updateHUD();
    setInterval(() => gameStats.updateHUD(), 300);
    
    // Add resize listener to handle screen size changes
    window.addEventListener('resize', () => {
        gameStats.handleResize();
        gameStats.updateHUD();
    });
    
    initParticleEffects();
    initProgressiveLoading();
    
    // Initialize boost indicator
    BoostIndicator.init();
});

// Clean up when page unloads
window.addEventListener('beforeunload', () => {
    BoostIndicator.destroy();
});

