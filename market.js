const MARKET_ITEMS = {
    weapons: [
        {
            id: 'weapon1',
            name: 'Echoes of Nirvana',
            description: 'The legendary blade that resonates with the ultimate enlightenment. Forged from crystallized meditation energy and cosmic wisdom, this weapon transcends mortal understanding.',
            image: 'images/items/zen_sword.png',
            price: 50000,
            ownedStats: {
                xpGain: 3,
                coinGain: 3,
                maxHP: 15,
                criticalChance: 2
            },
            equippedStats: {
                xpGain: 15,
                coinGain: 15,
                maxHP: 50,
                criticalChance: 10
            },
            category: 'weapons'
        },
        {
            id: 'weapon2',
            name: 'Dragon Bone Cleaver',
            description: 'A massive cleaver carved from ancient dragon bones. Its weight reminds you that strength comes from facing your inner dragons.',
            image: 'images/items/cleaver.png',
            price: 2,
            ownedStats: {
                xpGain: 1,
                maxHP: 8,
                criticalChance: 1
            },
            equippedStats: {
                xpGain: 3,
                maxHP: 20,
                criticalChance: 5
            },
            category: 'weapons'
        },
        {
            id: 'weapon3',
            name: 'Dagger of the Serene Spirit',
            description: 'A swift blade that moves like flowing water. Perfect for those who prefer precision over power in their spiritual journey.',
            image: 'images/items/dagger.png',
            price: 100,
            ownedStats: {
                xpGain: 1,
                coinGain: 1,
                criticalChance: 2
            },
            equippedStats: {
                xpGain: 4,
                coinGain: 3,
                criticalChance: 8
            },
            category: 'weapons'
        },
        {
            id: 'weapon4',
            name: 'Zen Archer\'s Oath',
            description: 'A bow blessed by master archers who achieved perfect mindfulness. Each arrow shot is a meditation in motion.',
            image: 'images/items/bow.png',
            price: 1000,
            ownedStats: {
                xpGain: 2,
                coinGain: 1,
                criticalChance: 1
            },
            equippedStats: {
                xpGain: 6,
                coinGain: 4,
                criticalChance: 7
            },
            category: 'weapons'
        },
        {
            id: 'weapon5',
            name: 'Mace of the Wandering Star',
            description: 'A celestial mace that channels the power of distant stars. Its weight grounds you while its energy lifts your spirit.',
            image: 'images/items/mace.png',
            price: 800,
            ownedStats: {
                xpGain: 1,
                maxHP: 10,
                criticalChance: 1
            },
            equippedStats: {
                xpGain: 4,
                maxHP: 25,
                criticalChance: 6
            },
            category: 'weapons'
        },
        {
            id: 'weapon6',
            name: 'Staff of Flowing Tranquility',
            description: 'A mystical staff that emanates calm energy. Perfect for channeling inner peace into productive focus.',
            image: 'images/items/staff.png',
            price: 1200,
            ownedStats: {
                xpGain: 2,
                coinGain: 2,
                maxHP: 5
            },
            equippedStats: {
                xpGain: 7,
                coinGain: 6,
                maxHP: 15
            },
            category: 'weapons'
        },
        {
            id: 'weapon7',
            name: 'Wand of Eternal Stillness',
            description: 'A delicate wand that amplifies mental clarity. Those who wield it find their thoughts become crystal clear.',
            image: 'images/items/wand.png',
            price: 600,
            ownedStats: {
                xpGain: 2,
                criticalChance: 1
            },
            equippedStats: {
                xpGain: 8,
                criticalChance: 5
            },
            category: 'weapons'
        },
        {
            id: 'weapon8',
            name: 'Rapier of the Slumbering Crane',
            description: 'An elegant rapier that embodies grace and precision. Like a crane in meditation, it strikes with perfect timing.',
            image: 'images/items/rapier.png',
            price: 900,
            ownedStats: {
                xpGain: 1,
                coinGain: 2,
                criticalChance: 2
            },
            equippedStats: {
                xpGain: 5,
                coinGain: 7,
                criticalChance: 8
            },
            category: 'weapons'
        },
        // Add more weapons
    ],
    potions: [
        {
            id: 'potion1',
            name: 'Small Health Potion',
            description: 'A gentle healing elixir that restores vitality. Made from mountain spring water and healing herbs.',
            image: 'images/items/s_hp_potion.png',
            price: 10,
            effect: 'heal',
            value: 25,
            category: 'potions'
        },
        {
            id: 'potion2',
            name: 'Health Potion',
            description: 'A potent healing potion that rapidly restores health. Brewed by master alchemists using ancient recipes.',
            image: 'images/items/hp_potion.png',
            price: 50,
            effect: 'heal',
            value: 75,
            category: 'potions'
        },
        {
            id: 'potion3',
            name: 'XP Potion',
            description: 'A mystical brew that accelerates learning and growth. The liquid wisdom of countless masters.',
            image: 'images/items/xp_potion.png',
            price: 75,
            effect: 'xp',
            value: 100,
            category: 'potions'
        },
        {
            id: 'potion4',
            name: 'Max HP Potion',
            description: 'A transformative elixir that permanently strengthens your life force. Changes you at a cellular level.',
            image: 'images/items/max_hp_potion.png',
            price: 200,
            effect: 'maxHP',
            value: 20,
            category: 'potions'
        },
        {
            id: 'potion5',
            name: 'Honey of Enlightenment',
            description: 'Sacred honey that provides sustained focus and energy. Increases XP gain for a limited time.',
            image: 'images/items/honey.png',
            price: 100,
            effect: 'xpBoost',
            value: 25,
            duration: 1800000, // 30 minutes in milliseconds
            category: 'potions'
        },
        {
            id: 'potion6',
            name: 'Elixir of Prosperity',
            description: 'A shimmering potion that attracts abundance. Increases coin gain for a limited time.',
            image: 'images/items/elixir.png',
            price: 120,
            effect: 'coinBoost',
            value: 30,
            duration: 1800000, // 30 minutes
            category: 'potions'
        },
        // Add more potions
    ],
    equipment: [
        {
            id: 'equipment1',
            name: 'Healing Totem of Peace',
            description: 'A sacred totem that continuously channels healing energy. Provides passive regeneration and health bonuses.',
            image: 'images/items/healing_totem.png',
            price: 200,
            ownedStats: {
                maxHP: 12,
                xpGain: 1
            },
            equippedStats: {
                maxHP: 30,
                xpGain: 3
            },
            category: 'equipment'
        },
        {
            id: 'equipment2',
            name: 'Armor of the Zenith Dragon',
            description: 'Legendary armor forged from dragon scales that shimmer with inner light. Provides immense protection and spiritual power.',
            image: 'images/items/gold_armor.png',
            price: 5000,
            ownedStats: {
                maxHP: 20,
                xpGain: 2,
                coinGain: 2,
                criticalChance: 1
            },
            equippedStats: {
                maxHP: 60,
                xpGain: 8,
                coinGain: 6,
                criticalChance: 5
            },
            category: 'equipment'
        },
        {
            id: 'equipment3',
            name: 'Aegis of Inner Peace',
            description: 'A mystical shield that deflects not just physical attacks, but negative thoughts and distractions as well.',
            image: 'images/items/shield.png',
            price: 1500,
            ownedStats: {
                maxHP: 15,
                criticalChance: 1
            },
            equippedStats: {
                maxHP: 40,
                criticalChance: 6
            },
            category: 'equipment'
        },
        {
            id: 'equipment4',
            name: 'Amulet of the Tranquil Mind',
            description: 'An ancient amulet that clarifies thought and enhances mental focus. Worn by meditation masters throughout the ages.',
            image: 'images/items/necklace.png',
            price: 2000,
            ownedStats: {
                xpGain: 2,
                coinGain: 1,
                criticalChance: 2
            },
            equippedStats: {
                xpGain: 6,
                coinGain: 4,
                criticalChance: 7
            },
            category: 'equipment'
        },
        {
            id: 'equipment5',
            name: 'Ring of the Gilded Sun',
            description: 'A radiant ring that attracts prosperity and enlightenment. Its golden glow seems to draw good fortune.',
            image: 'images/items/ring.png',
            price: 3000,
            ownedStats: {
                coinGain: 3,
                xpGain: 1,
                criticalChance: 2
            },
            equippedStats: {
                coinGain: 10,
                xpGain: 4,
                criticalChance: 8
            },
            category: 'equipment'
        },
        // Add more equipment
    ]
};

// Enhanced renderMarketItems function
function renderMarketItems(category) {
    const container = document.querySelector(`#${category} .market-items`);
    if (!container) return;
    
    container.innerHTML = '';
    
    const items = MARKET_ITEMS[category] || [];
    
    if (items.length === 0) {
        container.innerHTML = '<div class="empty-state">No items available in this category</div>';
        return;
    }
    
    items.forEach(item => {
        const itemCard = document.createElement('div');
        itemCard.className = 'item-card';
        itemCard.dataset.id = item.id;
        
        // Get current level from inventory and player level
        const stats = gameStats.loadStats();
        const inventory = JSON.parse(localStorage.getItem('inventory')) || [];
        const existingItem = inventory.find(i => i.id === item.id);
        const currentLevel = existingItem ? existingItem.quantity || 1 : 0;
        const nextLevel = currentLevel + 1;
        const currentPrice = calculateItemPrice(item, currentLevel);
        
        // Check if level locked for weapons/equipment
        const isLevelLocked = (category === 'weapons' || category === 'equipment') && nextLevel > stats.level;
        
        let statsHTML = '';
        if (category === 'potions') {
            statsHTML = formatPotionStats(item);
        } else {
            statsHTML = formatItemStats(item, currentLevel);
        }
        
        itemCard.innerHTML = `
            <div class="item-image-container">
                <img src="${item.image || `images/items/${category}/${item.id}.png`}" alt="${item.name}" class="item-image">
                ${(currentLevel > 0 && category !== 'potions') ? 
                    `<div class="item-level pixel-corners-small">LV ${currentLevel}</div>` : ''
                }
                ${isLevelLocked ? 
                    `<div class="level-required pixel-corners-small">REQ LV ${nextLevel}</div>` : ''
                }
            </div>
            <h3 class="item-name">${item.name}</h3>
            <p class="item-description">${item.description}</p>
            ${statsHTML}
            <div class="item-price">
                <img src="images/icons/coin.png" alt="Zen Coins">
                ${currentPrice}
            </div>
            <button class="buy-btn pixel-corners-small ${isLevelLocked ? 'disabled' : ''}" data-id="${item.id}" data-category="${category}" ${isLevelLocked ? 'disabled' : ''}>
                ${isLevelLocked ? `LV ${nextLevel} Required` : 
                  (category === 'potions' ? 'Buy' : (currentLevel > 0 ? 'Upgrade' : 'Buy'))}
            </button>
        `;
        
        container.appendChild(itemCard);
        
        // Add event listener to the buy button
        const buyBtn = itemCard.querySelector('.buy-btn');
        buyBtn.addEventListener('click', function(e) {
            e.stopPropagation(); // Prevent card click
            buyItem(item, category);
        });
        
        // Add animation with GSAP if available
        if (typeof gsap !== 'undefined') {
            gsap.from(itemCard, {
                y: 20,
                opacity: 0,
                duration: 0.5,
                delay: 0.05 * items.indexOf(item),
                ease: "power2.out",
                clearProps: "all"
            });
        }
    });
    
    // Add hover animations for item cards
    if (typeof gsap !== 'undefined') {
        const itemCards = document.querySelectorAll('.item-card');
        itemCards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                gsap.to(card.querySelector('.item-image'), {
                    scale: 1.1,
                    duration: 0.3,
                    ease: "power1.out"
                });
            });
            
            card.addEventListener('mouseleave', () => {
                gsap.to(card.querySelector('.item-image'), {
                    scale: 1,
                    duration: 0.3,
                    ease: "power1.out"
                });
            });
        });
    }
}

// Helper function to calculate item price based on level
function calculateItemPrice(item, currentLevel) {
    if (item.category === 'potions') {
        return item.price; // Potions don't increase in price
    }
    
    // For weapons and equipment, price increases by 10% per level
    const basePrice = item.price;
    return Math.floor(basePrice * Math.pow(1.1, currentLevel));
}

// Helper function to format item stats display
function formatItemStats(item, currentLevel) {
    if (!item.ownedStats && !item.equippedStats) return '';
    
    const nextLevel = currentLevel + 1;
    
    let html = '<div class="item-stats">';
    
    if (item.ownedStats) {
        html += '<div class="stats-section owned-stats">';
        html += `<h4><img src="images/icons/stats.png" alt="Owned Stats" style="width: 18px; height: 18px; vertical-align: middle;"> Owned Stats (LV ${nextLevel})</h4>`;
        html += '<div class="stats-list">';
        
        Object.entries(item.ownedStats).forEach(([stat, value]) => {
            const totalValue = value * nextLevel;
            html += `<div class="stat-item">
                ${getStatIcon(stat)} ${formatStatName(stat)}: +${totalValue}${getStatUnit(stat)}
            </div>`;
        });
        
        html += '</div></div>';
    }
    
    if (item.equippedStats) {
        html += '<div class="stats-section equipped-stats">';
        html += '<h4><img src="images/icons/equipstats.png" alt="Equipped Stats" style="width: 18px; height: 18px; vertical-align: middle;"> Equipped Stats</h4>';
        html += '<div class="stats-list">';
        
        Object.entries(item.equippedStats).forEach(([stat, value]) => {
            html += `<div class="stat-item">
                ${getStatIcon(stat)} ${formatStatName(stat)}: +${value}${getStatUnit(stat)}
            </div>`;
        });
        
        html += '</div></div>';
    }
    
    html += '</div>';
    return html;
}

// Helper function to format potion stats
function formatPotionStats(item) {
    let html = '<div class="item-stats potion-stats">';
    html += '<div class="stats-section">';
    html += '<h4><img src="images/icons/potstats.png" alt="Effect" style="width: 18px; height: 18px; vertical-align: middle;"> Effect</h4>';
    html += '<div class="stats-list">';
    
    switch(item.effect) {
        case 'heal':
            html += `<div class="stat-item"><img src="images/icons/hp.png" alt="HP" style="width: 16px; height: 16px; vertical-align: middle;"> Restores ${item.value} HP</div>`;
            break;
        case 'xp':
            html += `<div class="stat-item"><img src="images/icons/xp.png" alt="XP" style="width: 16px; height: 16px; vertical-align: middle;"> Grants ${item.value} XP</div>`;
            break;
        case 'maxHP':
            html += `<div class="stat-item"><img src="images/icons/hp.png" alt="HP" style="width: 16px; height: 16px; vertical-align: middle;"> Increases Max HP by ${item.value}</div>`;
            break;
        case 'xpBoost':
            html += `<div class="stat-item"><img src="images/icons/xp.png" alt="XP" style="width: 16px; height: 16px; vertical-align: middle;"> +${item.value}% XP Gain</div>`;
            if (item.duration) {
                html += `<div class="stat-item"><img src="images/icons/pomodoro.png" alt="Duration" style="width: 16px; height: 16px; vertical-align: middle;"> Duration: ${item.duration / 60000} minutes</div>`;
            }
            break;
        case 'coinBoost':
            html += `<div class="stat-item"><img src="images/icons/coin.png" alt="Coin" style="width: 16px; height: 16px; vertical-align: middle;"> +${item.value}% Coin Gain</div>`;
            if (item.duration) {
                html += `<div class="stat-item"><img src="images/icons/pomodoro.png" alt="Duration" style="width: 16px; height: 16px; vertical-align: middle;"> Duration: ${item.duration / 60000} minutes</div>`;
            }
            break;
    }
    
    html += '</div></div></div>';
    return html;
}

// Helper functions for stat formatting
function getStatIcon(stat) {
    const icons = {
        xpGain: '<img src="images/icons/xp.png" alt="XP" style="width: 16px; height: 16px; vertical-align: middle;">',
        coinGain: '<img src="images/icons/coin.png" alt="Coin" style="width: 16px; height: 16px; vertical-align: middle;">',
        maxHP: '<img src="images/icons/hp.png" alt="HP" style="width: 16px; height: 16px; vertical-align: middle;">',
        criticalChance: '<img src="images/icons/critical.png" alt="Critical" style="width: 16px; height: 16px; vertical-align: middle;">'
    };
    return icons[stat] || '<img src="images/icons/stats.png" alt="Stat" style="width: 16px; height: 16px; vertical-align: middle;">';
}

function formatStatName(stat) {
    const names = {
        xpGain: 'XP Gain',
        coinGain: 'Coin Gain',
        maxHP: 'Max HP',
        criticalChance: 'Critical Chance'
    };
    return names[stat] || stat;
}

function getStatUnit(stat) {
    const units = {
        xpGain: '%',
        coinGain: '%',
        maxHP: '',
        criticalChance: '%'
    };
    return units[stat] || '';
}

function buyItem(item, category) {
    const stats = gameStats.loadStats();
    const inventory = JSON.parse(localStorage.getItem('inventory')) || [];
    const existingItem = inventory.find(i => i.id === item.id);
    const currentLevel = existingItem ? existingItem.quantity || 1 : 0;
    const nextLevel = currentLevel + 1;
    const actualPrice = calculateItemPrice(item, currentLevel);
    
    // For weapons and equipment, check if next level exceeds user's level
    if (category === 'weapons' || category === 'equipment') {
        if (nextLevel > stats.level) {
            notyf.error(`Requires level ${nextLevel}! You are level ${stats.level}.`);
            return;
        }
    }
    
    if (stats.zenCoins >= actualPrice) {
        // Deduct coins
        stats.zenCoins -= actualPrice;
        
        // Handle all items (including potions) by adding to inventory
        if (existingItem) {
            // Increment quantity if item exists
            existingItem.quantity = (existingItem.quantity || 1) + 1;
            localStorage.setItem('inventory', JSON.stringify(inventory));
            if (category === 'potions') {
                notyf.success(`Acquired ${item.name}! (Quantity: ${existingItem.quantity})`);
            } else {
                notyf.success(`Upgraded ${item.name} to LV ${existingItem.quantity}!`);
            }
        } else {
            // Add new item with quantity 1
            inventory.push({
                ...item,
                quantity: 1
            });
            localStorage.setItem('inventory', JSON.stringify(inventory));
            notyf.success(`Acquired ${item.name}!`);
        }
        
        gameStats.saveStats(stats);
        gameStats.updateHUD();
        // Re-render the market to update prices and levels
        renderMarketItems(category);
    } else {
        notyf.error('Not enough Zen Coins!');
    }
}

// Handle potion effects
function handlePotionEffect(potion, stats) {
    switch(potion.effect) {
        case 'heal':
            stats.currentHP = Math.min(stats.currentHP + potion.value, stats.maxHP);
            break;
        case 'xp':
            // Use the proper award system that handles bonuses and critical hits
            gameStats.awardXP(potion.value);
            return; // Don't save stats here since awardXP already does it
        case 'maxHP':
            stats.maxHP += potion.value;
            stats.currentHP += potion.value; // Also heal for the amount gained
            break;
        case 'xpBoost':
            applyTempBoost('xpBoost', potion.value, potion.duration);
            return; // Don't save stats for boosts
        case 'coinBoost':
            applyTempBoost('coinBoost', potion.value, potion.duration);
            return; // Don't save stats for boosts
    }
}

// Apply temporary boosts
function applyTempBoost(type, value, duration) {
    const boosts = JSON.parse(localStorage.getItem('activeBoosts') || '{}');
    const endTime = Date.now() + duration;
    
    boosts[type] = {
        value: value,
        endTime: endTime
    };
    
    localStorage.setItem('activeBoosts', JSON.stringify(boosts));
    
    const minutes = duration / 60000;
    notyf.success(`${type === 'xpBoost' ? 'XP' : 'Coin'} boost active for ${minutes} minutes!`);
    
    // Set timeout to notify when boost expires
    setTimeout(() => {
        notyf.error(`${type === 'xpBoost' ? 'XP' : 'Coin'} boost expired!`);
    }, duration);
}

// Add event listeners for category tabs
document.querySelectorAll('.market-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelector('.market-tab.active').classList.remove('active');
        tab.classList.add('active');
        // Hide all market sections
        document.querySelectorAll('.market-section').forEach(section => {
            section.style.display = 'none';
        });
        // Show the selected section
        const selectedSection = document.getElementById(tab.dataset.category);
        if (selectedSection) selectedSection.style.display = '';
        
        // Handle custom rewards section specially
        if (tab.dataset.category === 'others') {
            displayCustomRewards();
        } else {
            renderMarketItems(tab.dataset.category);
        }
    });
});

// Initial render
renderMarketItems('weapons');

// Custom Rewards Management
// Add this after your existing market initialization code
function initCustomRewards() {
    const addRewardBtn = document.querySelector('.add-reward-btn');
    if (!addRewardBtn) return;

    addRewardBtn.addEventListener('click', () => {
        const name = document.getElementById('reward-name').value.trim();
        const description = document.getElementById('reward-description').value.trim();
        const price = parseInt(document.getElementById('reward-price').value);

        if (!name || !description || !price) {
            notyf.error('Please fill in all fields');
            return;
        }

        const customRewards = JSON.parse(localStorage.getItem('customRewards') || '[]');
        customRewards.push({ name, description, price });
        localStorage.setItem('customRewards', JSON.stringify(customRewards));
        
        displayCustomRewards();
        
        // Clear form
        document.getElementById('reward-name').value = '';
        document.getElementById('reward-description').value = '';
        document.getElementById('reward-price').value = '';
        
        notyf.success('Custom reward added!');
    });

    displayCustomRewards(); // Show existing rewards
}

function displayCustomRewards() {
    const rewardsList = document.querySelector('.custom-rewards-list');
    if (!rewardsList) return;

    const customRewards = JSON.parse(localStorage.getItem('customRewards') || '[]');
    
    rewardsList.innerHTML = customRewards.map(reward => `
        <div class=" item-card pixel-corners-small">
            <h3 class="item-name">${reward.name}</h3>
            <p class="item-description">${reward.description}</p>
            <div class="price">
                <img src="images/icons/coin.png" alt="Zen Coins" width="20">
                ${reward.price}
            </div>
            <button class="buy-btn pixel-corners-small" onclick="buyCustomReward(${reward.price}, '${reward.name}')">Buy</button>
            <button class="delete-reward pixel-corners-small" onclick="deleteCustomReward('${reward.name}')">×</button>
        </div>
    `).join('');
}

function buyCustomReward(price, name) {
    const stats = gameStats.loadStats();
    if (stats.zenCoins >= price) {
        stats.zenCoins -= price;
        gameStats.saveStats(stats);
        gameStats.updateHUD();
        notyf.success(`Redeemed: ${name}`);
    } else {
        notyf.error('Not enough Zen Coins!');
    }
}

function deleteCustomReward(name) {
    let customRewards = JSON.parse(localStorage.getItem('customRewards') || '[]');
    customRewards = customRewards.filter(reward => reward.name !== name);
    localStorage.setItem('customRewards', JSON.stringify(customRewards));
    displayCustomRewards();
    notyf.success('Reward deleted');
}

const notyf = new Notyf({
    duration: 2500,
    position: { x: 'left', y: 'top' },
    types: [
        {
            type: 'success',
            background: '#222',
            icon: false,
            className: 'notyf-success pixel-corners-small',
            duration: 5000,
            dismissible: true
        },
        {
            type: 'error',
            background: '#222',
            icon: false,
            className: 'notyf-error pixel-corners-small'
        }
    ]
});

// Initialize market page
document.addEventListener('DOMContentLoaded', () => {
    gameStats.updateHUD();
    renderMarketItems('weapons');
    initCustomRewards();
});
