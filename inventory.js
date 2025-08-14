// Sorting functionality for inventory
function sortInventoryItems(items, sortBy) {
    const sortedItems = [...items];
    
    switch (sortBy) {
        case 'price-low':
            return sortedItems.sort((a, b) => a.price - b.price);
        case 'price-high':
            return sortedItems.sort((a, b) => b.price - a.price);
        case 'level-low':
            return sortedItems.sort((a, b) => {
                const aLevel = getItemLevel(a);
                const bLevel = getItemLevel(b);
                return aLevel - bLevel;
            });
        case 'level-high':
            return sortedItems.sort((a, b) => {
                const aLevel = getItemLevel(a);
                const bLevel = getItemLevel(b);
                return bLevel - aLevel;
            });
        case 'quantity-low':
            return sortedItems.sort((a, b) => {
                const aQty = getItemQuantity(a);
                const bQty = getItemQuantity(b);
                return aQty - bQty;
            });
        case 'quantity-high':
            return sortedItems.sort((a, b) => {
                const aQty = getItemQuantity(a);
                const bQty = getItemQuantity(b);
                return bQty - aQty;
            });
        case 'name-az':
            return sortedItems.sort((a, b) => a.name.localeCompare(b.name));
        case 'name-za':
            return sortedItems.sort((a, b) => b.name.localeCompare(a.name));
        default:
            return sortedItems;
    }
}

// Helper functions for sorting
function getItemLevel(item) {
    if (item.category === 'potions') return 1; // Potions don't have levels
    
    // For weapons/equipment, use their actual quantity/level
    return item.quantity || 1;
}

function getItemQuantity(item) {
    if (item.category === 'potions') {
        return item.quantity || 1; // For potions, use actual quantity
    }
    
    // For non-potions, return 1 since they don't have meaningful quantity for sorting
    return 1;
}

function renderInventory(category) {
    const inventoryGrid = document.querySelector('.inventory-grid');
    const inventory = JSON.parse(localStorage.getItem('inventory')) || [];
    const equipped = JSON.parse(localStorage.getItem('equippedItems')) || {};
    
    // Filter items by category
    let categoryItems = inventory.filter(item => item.category === category);
    
    if (categoryItems.length === 0) {
        inventoryGrid.innerHTML = `
            <div class="empty-state">
                <p>No ${category} found in inventory :(</p>
                <small>Visit the market to purchase items!</small>
            </div>
        `;
        return;
    }
    
    // Apply sorting if a sort option is selected
    const sortSelect = document.getElementById('inventory-sort');
    if (sortSelect && sortSelect.value !== 'default') {
        categoryItems = sortInventoryItems(categoryItems, sortSelect.value);
    }
    
    // Clear grid before adding new items
    inventoryGrid.innerHTML = '';

    // Add items using item card layout
    categoryItems.forEach(item => {
        const itemCard = document.createElement('div');
        itemCard.className = 'item-card';
        itemCard.dataset.id = item.id;

        // Get player level for level capping
        const stats = gameStats.loadStats();
        const rawLevel = item.quantity || 1;
        const level = (category === 'weapons' || category === 'equipment') ? 
                     Math.min(rawLevel, stats.level) : rawLevel;
        const isLevelCapped = (category === 'weapons' || category === 'equipment') && rawLevel > stats.level;
        const isEquipped = equipped[item.category] && equipped[item.category].id === item.id;
        
        // Calculate proper sell/downgrade price
        let sellPrice;
        let buttonText;
        if ((category === 'weapons' || category === 'equipment') && level > 1) {
            // For weapons/equipment above level 1, calculate downgrade refund (half of current level cost)
            const currentLevelPrice = calculateItemPrice(item, level - 1); // Price to get to current level
            sellPrice = Math.floor(currentLevelPrice * 0.5);
            buttonText = 'Downgrade';
        } else {
            // Normal sell for level 1 items and potions
            sellPrice = Math.floor((item.price || 10) / 2);
            buttonText = 'Sell';
        }

        // Generate stats display
        let statsHTML = '';
        if (category === 'potions') {
            statsHTML = formatPotionStats(item);
        } else {
            statsHTML = generateInventoryStatsHTML(item, level, isEquipped);
        }

        itemCard.innerHTML = `
            ${isEquipped ? `<div class="equipped-badge pixel-corners-small">EQUIPPED</div>` : ''}
            <div class="item-image-container">
                <img src="${item.image || `images/items/${category}/${item.id}.png`}" alt="${item.name}" class="item-image">
                ${level > 1 ? 
                    (category === 'potions' ? 
                        `<div class="item-level pixel-corners-small">x${level}</div>` : 
                        `<div class="item-level pixel-corners-small">LV ${level}</div>`
                    ) : ''
                }
                ${isLevelCapped ? 
                    `<div class="level-capped pixel-corners-small">CAPPED AT LV ${stats.level}</div>` : ''
                }
            </div>
            <h3 class="item-name">${item.name}</h3>
            <p class="item-description">${item.description || ''}</p>
            ${statsHTML}
            <div class="item-price">
                <img src="images/icons/coin.png" alt="Sell price">
                ${sellPrice}
            </div>
            <div class="item-actions">
                <button class="use-btn pixel-corners-small ${isEquipped ? 'equipped' : ''}" data-id="${item.id}">
                    ${getButtonText(item.category, isEquipped)}
                </button>
                <button class="sell-btn pixel-corners-small" data-id="${item.id}">
                    ${buttonText}
                </button>
            </div>
        `;
        
        inventoryGrid.appendChild(itemCard);

        // Add event listeners
        const useBtn = itemCard.querySelector('.use-btn');
        useBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            console.log('Use button clicked for:', item.name, 'ID:', item.id);
            useItem(item.id);
        });
        
        const sellBtn = itemCard.querySelector('.sell-btn');
        sellBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            sellItem(item.id);
        });

        // Add animation with GSAP if available
        if (typeof gsap !== 'undefined') {
            gsap.from(itemCard, {
                y: 20,
                opacity: 0,
                duration: 0.5,
                delay: 0.05 * categoryItems.indexOf(item),
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

// Generate stats HTML for inventory display
function generateInventoryStatsHTML(item, level, isEquipped) {
    let html = '<div class="item-stats inventory-stats">';
    
    if (item.ownedStats) {
        html += '<div class="stats-section total-owned-stats">';
        html += '<h4><img src="images/icons/stats.png" alt="Total Owned Stats" style="width: 18px; height: 18px; vertical-align: middle;"> Total Owned Stats</h4>';
        html += '<div class="stats-list">';
        
        Object.entries(item.ownedStats).forEach(([stat, value]) => {
            const totalValue = value * level;
            const displayValue = stat === 'criticalChance' ? 
                (totalValue % 1 === 0 ? totalValue : totalValue.toFixed(3).replace(/\.?0+$/, '')) : 
                totalValue;
            html += `<div class="stat-item">
                ${getStatIcon(stat)} ${formatStatName(stat)}: +${displayValue}${getStatUnit(stat)}
            </div>`;
        });
        
        html += '</div></div>';
    }
    
    if (item.equippedStats && isEquipped) {
        html += '<div class="stats-section equipped-active-stats">';
        html += '<h4><img src="images/icons/equipstats.png" alt="Active Equipped Stats" style="width: 18px; height: 18px; vertical-align: middle;"> Active Equipped Stats</h4>';
        html += '<div class="stats-list">';
        
        Object.entries(item.equippedStats).forEach(([stat, value]) => {
            const displayValue = stat === 'criticalChance' ? 
                (value % 1 === 0 ? value : value.toFixed(3).replace(/\.?0+$/, '')) : 
                value;
            html += `<div class="stat-item equipped-active">
                ${getStatIcon(stat)} ${formatStatName(stat)}: +${displayValue}${getStatUnit(stat)}
            </div>`;
        });
        
        html += '</div></div>';
    } else if (item.equippedStats) {
        html += '<div class="stats-section equipped-stats">';
        html += '<h4><img src="images/icons/equipstats.png" alt="Equipped Stats" style="width: 18px; height: 18px; vertical-align: middle;"> Equipped Stats (when equipped)</h4>';
        html += '<div class="stats-list">';
        
        Object.entries(item.equippedStats).forEach(([stat, value]) => {
            const displayValue = stat === 'criticalChance' ? 
                (value % 1 === 0 ? value : value.toFixed(3).replace(/\.?0+$/, '')) : 
                value;
            html += `<div class="stat-item">
                ${getStatIcon(stat)} ${formatStatName(stat)}: +${displayValue}${getStatUnit(stat)}
            </div>`;
        });
        
        html += '</div></div>';
    }
    
    html += '</div>';
    return html;
}

// Format potion stats display (same as in market.js)
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

// Helper functions for stat formatting (same as in market.js)
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

// Calculate item price based on level (same as in market.js)
function calculateItemPrice(item, currentLevel) {
    if (item.category === 'potions') {
        return item.price; // Potions don't increase in price
    }
    
    // For weapons and equipment, price increases by 10% per level
    const basePrice = item.price;
    return Math.floor(basePrice * Math.pow(1.1, currentLevel));
}

async function sellItem(itemId) {
    const inventory = JSON.parse(localStorage.getItem('inventory')) || [];
    const itemIndex = inventory.findIndex(i => i.id === itemId);
    
    if (itemIndex === -1) return;
    
    const item = inventory[itemIndex];
    const currentLevel = item.quantity || 1;
    const category = item.category;
    
    let sellPrice;
    let actionText;
    
    // Determine if this is a downgrade or a sell
    if ((category === 'weapons' || category === 'equipment') && currentLevel > 1) {
        // Downgrade: refund half of what was paid to reach current level
        const currentLevelPrice = calculateItemPrice(item, currentLevel - 1);
        sellPrice = Math.floor(currentLevelPrice * 0.5);
        actionText = 'downgraded';
    } else {
        // Sell: traditional sell for 50% of base price
        sellPrice = Math.floor(item.price * 0.5);
        actionText = 'sold';
    }
    
    try {
        // Update zen coins
        gameStats.awardCoins(sellPrice);

        // Handle downgrade vs sell
        if ((category === 'weapons' || category === 'equipment') && currentLevel > 1) {
            // Downgrade: reduce level by 1
            item.quantity = currentLevel - 1;
            localStorage.setItem('inventory', JSON.stringify(inventory));
            notyf.success(`Downgraded ${item.name} to LV ${item.quantity} for ${sellPrice} Zen Coins!`);
        } else {
            // Sell: remove item completely or decrease quantity
            if (item.quantity > 1) {
                item.quantity--;
                localStorage.setItem('inventory', JSON.stringify(inventory));
            } else {
                inventory.splice(itemIndex, 1);
                localStorage.setItem('inventory', JSON.stringify(inventory));
            }
            notyf.success(`Sold ${item.name} for ${sellPrice} Zen Coins!`);
        }
        
        // Re-render inventory immediately
        renderInventory(document.querySelector('.inventory-tab.active').dataset.category);
        
        // Update HUD
        gameStats.updateHUD();
        
    } catch (error) {
        notyf.error('Error processing item');
        console.error('Error processing item:', error);
    }
}

function getButtonText(category, isEquipped = false) {
    switch(category) {
        case 'weapons': 
            return isEquipped ? 'Unequip' : 'Equip';
        case 'potions': 
            return 'Use';
        case 'equipment': 
            return isEquipped ? 'Unequip' : 'Equip';
        default: 
            return 'Use';
    }
}

function useItem(itemId) {
    console.log('useItem called with ID:', itemId);
    const inventory = JSON.parse(localStorage.getItem('inventory')) || [];
    const itemIndex = inventory.findIndex(i => i.id === itemId);
    
    if (itemIndex === -1) {
        console.log('Item not found in inventory');
        return;
    }
    
    const item = inventory[itemIndex];
    console.log('Using item:', item.name, 'Category:', item.category);
    
    switch(item.category) {
        case 'potions':
            console.log('Potion case - calling usePotion');
            const potionUsed = usePotion(item); // Check if potion was actually used
            console.log('Potion used result:', potionUsed);
            if (potionUsed !== false) { // Only consume if potion was used
                if (item.quantity > 1) {
                    item.quantity--;
                    console.log('Decreased quantity to:', item.quantity);
                } else {
                    inventory.splice(itemIndex, 1);
                    console.log('Removed item from inventory');
                }
                localStorage.setItem('inventory', JSON.stringify(inventory));
                
                // Delay the re-render to prevent interference with potion effects
                setTimeout(() => {
                    renderInventory(item.category);
                }, 100);
            }
            break;
        case 'weapons':
        case 'equipment':
            toggleEquipItem(item);
            renderInventory(item.category);
            break;
    }
}

function toggleEquipItem(item) {
    const equipped = JSON.parse(localStorage.getItem('equippedItems')) || {};
    
    // Check if this item is currently equipped
    const isCurrentlyEquipped = equipped[item.category] && equipped[item.category].id === item.id;
    
    if (isCurrentlyEquipped) {
        // Unequip the item
        delete equipped[item.category];
        localStorage.setItem('equippedItems', JSON.stringify(equipped));
        notyf.success(`Unequipped ${item.name}`);
    } else {
        // Unequip current item in same slot if exists
        if (equipped[item.category]) {
            const oldItem = equipped[item.category];
            notyf.success(`Unequipped ${oldItem.name}`);
        }
        
        // Equip the new item
        equipped[item.category] = item;
        localStorage.setItem('equippedItems', JSON.stringify(equipped));
        notyf.success(`Equipped ${item.name}`);
    }
    
    // Update game stats to reflect new equipment bonuses
    updateEquippedStats();
}

// Calculate and apply all equipped item bonuses
function updateEquippedStats() {
    const equipped = JSON.parse(localStorage.getItem('equippedItems')) || {};
    const inventory = JSON.parse(localStorage.getItem('inventory')) || [];
    
    // Reset equipped bonuses (this would need to be integrated with your game stats system)
    let totalEquippedBonuses = {
        xpGain: 0,
        coinGain: 0,
        maxHP: 0,
        criticalChance: 0
    };
    
    // Calculate owned stats bonuses from all items
    let totalOwnedBonuses = {
        xpGain: 0,
        coinGain: 0,
        maxHP: 0,
        criticalChance: 0
    };
    
    // Add owned stats from all items in inventory
    inventory.forEach(item => {
        if (item.ownedStats) {
            const level = item.quantity || 1;
            Object.entries(item.ownedStats).forEach(([stat, value]) => {
                totalOwnedBonuses[stat] = (totalOwnedBonuses[stat] || 0) + (value * level);
            });
        }
    });
    
    // Add equipped stats from equipped items
    Object.values(equipped).forEach(item => {
        if (item.equippedStats) {
            Object.entries(item.equippedStats).forEach(([stat, value]) => {
                totalEquippedBonuses[stat] = (totalEquippedBonuses[stat] || 0) + value;
            });
        }
    });
    
    // Store the bonuses for use by the game system
    localStorage.setItem('totalOwnedBonuses', JSON.stringify(totalOwnedBonuses));
    localStorage.setItem('totalEquippedBonuses', JSON.stringify(totalEquippedBonuses));
    
    // Update HUD if gameStats is available
    if (typeof gameStats !== 'undefined') {
        gameStats.updateHUD();
    }
}

function usePotion(item) {
    console.log('Using potion:', item.name, 'Effect:', item.effect);
    const stats = gameStats.loadStats();
    const totalStats = gameStats.getTotalStats(); // Get stats with equipment bonuses
    
    // Handle different potion effects
    switch(item.effect) {
        case 'heal':
            console.log('Healing potion - Current HP:', stats.currentHP, 'Max HP:', totalStats.maxHP);
            const newHealth = Math.min(stats.currentHP + item.value, totalStats.maxHP);
            const healedAmount = newHealth - stats.currentHP;
            
            if (healedAmount > 0) {
                stats.currentHP = newHealth;
                gameStats.saveStats(stats);
                console.log('Healed for:', healedAmount);
                notyf.success(`Restored ${healedAmount} HP!`);
            } else {
                console.log('Already at full health');
                notyf.error(`Already at full health!`);
                return false; // Return false to indicate potion was not consumed
            }
            break;
        case 'xp':
            console.log('XP potion - Adding XP:', item.value);
            // For XP potions, apply bonuses but no critical hits
            let finalXPAmount = item.value;
            
            // Apply XP gain bonus
            if (totalStats.xpGainBonus > 0) {
                finalXPAmount = Math.floor(item.value * (1 + totalStats.xpGainBonus / 100));
            }
            
            // Use the regular updateXP function to handle level ups
            const originalShowXPMessage = typeof showXPMessage !== 'undefined' ? showXPMessage : null;
            if (originalShowXPMessage) {
                window.showXPMessage = () => {}; // Temporarily disable to prevent duplicate notification
            }
            updateXP(finalXPAmount);
            // Restore original function
            if (originalShowXPMessage) {
                window.showXPMessage = originalShowXPMessage;
            }
            
            console.log('XP potion used, final amount:', finalXPAmount);
            notyf.success(`Gained ${finalXPAmount} XP!`);
            break;
        case 'maxHP':
            console.log('Max HP potion - Increasing max HP by:', item.value);
            stats.maxHP += item.value;
            stats.currentHP += item.value; // Also heal for the amount gained
            gameStats.saveStats(stats);
            console.log('Max HP increased, new max HP:', stats.maxHP);
            notyf.success(`Max HP increased by ${item.value}!`);
            break;
        case 'xpBoost':
        case 'coinBoost':
            applyTempBoost(item.effect, item.value, item.duration);
            break;
    }
    
    // Always update HUD after using any potion
    gameStats.updateHUD();
    return true; // Return true to indicate potion was consumed
}

// Apply temporary boosts (same as in market.js)
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
    
    // Update boost indicator immediately
    if (typeof BoostIndicator !== 'undefined' && BoostIndicator.updateBoostIndicator) {
        BoostIndicator.updateBoostIndicator();
    }
    
    // Set timeout to notify when boost expires
    setTimeout(() => {
        notyf.error(`${type === 'xpBoost' ? 'XP' : 'Coin'} boost expired!`);
        // Update boost indicator when boost expires
        if (typeof BoostIndicator !== 'undefined' && BoostIndicator.updateBoostIndicator) {
            BoostIndicator.updateBoostIndicator();
        }
    }, duration);
}

function removeFromInventory(itemId) {
    let inventory = JSON.parse(localStorage.getItem('inventory')) || [];
    inventory = inventory.filter(item => item.id !== itemId);
    localStorage.setItem('inventory', JSON.stringify(inventory));
    
    // Re-render current category
    const activeTab = document.querySelector('.inventory-tab.active');
    if (activeTab) {
        renderInventory(activeTab.dataset.category);
    }
}

function addToInventory(item) {
    const inventory = JSON.parse(localStorage.getItem('inventory')) || [];
    inventory.push(item);
    localStorage.setItem('inventory', JSON.stringify(inventory));
}

// Initialize Notyf
const notyf = new Notyf({
    duration: 2000,
    position: {x:'left',y:'top'},
    types: [
        {
            type: 'success',
            background: '#222',
            icon: false,
            className: 'notyf-success pixel-corners-small'
        },
        {
            type: 'error',
            background: '#222',
            icon: false,
            className: 'notyf-error pixel-corners-small'
        }
    ]
});

document.addEventListener('DOMContentLoaded', () => {
    // Initialize inventory display
    renderInventory('weapons'); // Show weapons by default
    
    // Update equipped stats on page load
    updateEquippedStats();
    
    gameStats.updateHUD();

    // Add category tab listeners
    document.querySelectorAll('.inventory-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelector('.inventory-tab.active').classList.remove('active');
            tab.classList.add('active');
            
            // Update sorting options based on category
            updateInventorySortingOptions(tab.dataset.category);
            
            renderInventory(tab.dataset.category);
        });
    });
    
    // Initialize with default category
    updateInventorySortingOptions('weapons');
    
    // Add event listener for sorting dropdown
    const sortSelect = document.getElementById('inventory-sort');
    if (sortSelect) {
        sortSelect.addEventListener('change', () => {
            const activeTab = document.querySelector('.inventory-tab.active');
            if (activeTab) {
                renderInventory(activeTab.dataset.category);
            }
        });
    }
    
    // Compact view toggle functionality for inventory
    const compactToggle = document.getElementById('inventory-compact-toggle');
    if (compactToggle) {
        let isCompact = localStorage.getItem('inventoryCompactView') === 'true';
        
        // Apply saved state
        if (isCompact) {
            document.querySelector('.inventory-container').classList.add('compact-view');
            compactToggle.innerHTML = '<img src="images/icons/nine_squares.png" alt="Nine Squares" style="width: 16px; height: 16px;">';
        } else {
            compactToggle.innerHTML = '<img src="images/icons/four_squares.png" alt="Four Squares" style="width: 16px; height: 16px;">';
        }
        
        compactToggle.addEventListener('click', () => {
            const inventoryContainer = document.querySelector('.inventory-container');
            isCompact = !isCompact;
            
            if (isCompact) {
                inventoryContainer.classList.add('compact-view');
                compactToggle.innerHTML = '<img src="images/icons/nine_squares.png" alt="Nine Squares" style="width: 16px; height: 16px;">';
                localStorage.setItem('inventoryCompactView', 'true');
            } else {
                inventoryContainer.classList.remove('compact-view');
                compactToggle.innerHTML = '<img src="images/icons/four_squares.png" alt="Four Squares" style="width: 16px; height: 16px;">';
                localStorage.setItem('inventoryCompactView', 'false');
            }
        });
    }
});

// Update sorting options based on inventory category
function updateInventorySortingOptions(category) {
    const sortSelect = document.getElementById('inventory-sort');
    if (!sortSelect) return;
    
    // Clear current options
    sortSelect.innerHTML = '';
    
    // Add default option
    sortSelect.innerHTML += '<option value="default">Default</option>';
    sortSelect.innerHTML += '<option value="price-low">Price (Low to High)</option>';
    sortSelect.innerHTML += '<option value="price-high">Price (High to Low)</option>';
    
    if (category === 'weapons' || category === 'equipment') {
        // Show level options for weapons and equipment
        sortSelect.innerHTML += '<option value="level-low">Level (Low to High)</option>';
        sortSelect.innerHTML += '<option value="level-high">Level (High to Low)</option>';
    } else if (category === 'potions') {
        // Show quantity options for potions
        sortSelect.innerHTML += '<option value="quantity-low">Quantity (Low to High)</option>';
        sortSelect.innerHTML += '<option value="quantity-high">Quantity (High to Low)</option>';
    }
    
    // Always show alphabetical options
    sortSelect.innerHTML += '<option value="name-az">Name (A-Z)</option>';
    sortSelect.innerHTML += '<option value="name-za">Name (Z-A)</option>';
}