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
        this.updateHUD();
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
        const stats = this.loadStats();
        
        // Update main health bar and text
        const healthProgress = document.getElementById('health-progress');
        const healthText = document.querySelector('.health-text');
        if (healthProgress) {
            const healthPercent = (stats.health / stats.maxHealth) * 100;
            healthProgress.style.width = `${healthPercent}%`;
            if (healthText) {
                healthText.textContent = `[${stats.health}/${stats.maxHealth}]`;
            }
        }

        // Update main XP bar and text
        const xpProgress = document.getElementById('xp-progress');
        const xpText = document.querySelector('.xp-text');
        if (xpProgress) {
            const xpNeeded = Math.round(100+(stats.level-1)*(10 ** 1.2));
            const xpPercent = (stats.xp / xpNeeded) * 100;
            xpProgress.style.width = `${xpPercent}%`;
            if (xpText) {
                xpText.textContent = `[${stats.xp}/${xpNeeded}]`;
            }
        }

        // Update mini HUD stats
        const miniHealthProgress = document.getElementById('mini-health-progress');
        if (miniHealthProgress) {
            const healthPercent = (stats.health / stats.maxHealth) * 100;
            miniHealthProgress.style.width = `${healthPercent}%`;
        }

        const miniXpProgress = document.getElementById('mini-xp-progress');
        if (miniXpProgress) {
            const xpNeeded = Math.round(100+(stats.level-1)*(10 ** 1.2));
            const xpPercent = (stats.xp / xpNeeded) * 100;
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
      number: { value: 40, density: { enable: true, value_area: 500 } },
      line_linked: {
        enable: false
      },
      color: { value: "#ffffff" },
      shape: { type: "circle" },
      opacity: {
        value: 0.5,
        random: true,
        animation: { enable: true, speed: 0.8 }
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
        opacity: 0.5, 
        y: 30 
      },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power2.out",
        scrollTrigger: {
          trigger: section,
          start: "top 80%",
          toggleActions: "play none none reverse"
        }
      }
    );
  });
}


// Initialize mini HUD on page load
document.addEventListener('DOMContentLoaded', () => {
    gameStats.initMiniHUD();
    gameStats.updateHUD();
    setInterval(() => gameStats.updateHUD(), 300);
    initParticleEffects();
    initProgressiveLoading();
});