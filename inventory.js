function renderInventory(category) {
    const inventoryGrid = document.querySelector('.inventory-grid');
    const inventory = JSON.parse(localStorage.getItem('inventory')) || [];
    
    // Filter items by category
    const categoryItems = inventory.filter(item => item.category === category);
    
    if (categoryItems.length === 0) {
        inventoryGrid.innerHTML = `
            <div class="empty-inventory">
                <p>No ${category} found in inventory</p>
                <small>Visit the market to purchase items</small>
            </div>
        `;
        return;
    }
    
    // Clear grid before adding new items
    inventoryGrid.innerHTML = '';

    // Add items one by one
    categoryItems.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'inventory-item pixel-corners';
        itemElement.dataset.id = item.id;

        itemElement.innerHTML = `
            <div class="item-icon">
                <img src="${item.image}"  alt="${item.name}">
            </div>
            <h3 class="item-name">${item.name}</h3>
            ${item.quantity > 1 ? `<div class="item-quantity pixel-corners-small">x${item.quantity}</div>` : ''}
            <p class="item-description">${item.description || ''}</p>
            ${item.stats ? `<p class="item-stats">${item.stats}</p>` : ''}
            <div class="item-buttons">
                <button class="use-btn pixel-corners-small" onclick="useItem('${item.id}')">
                    ${getButtonText(item.category)}
                </button>
                <button class="sell-btn pixel-corners-small" onclick="sellItem('${item.id}')">
                    Sell
                </button>
            </div>
        `;
        
        inventoryGrid.appendChild(itemElement);
    });
    
}

async function sellItem(itemId) {
    const inventory = JSON.parse(localStorage.getItem('inventory')) || [];
    const itemIndex = inventory.findIndex(i => i.id === itemId);
    
    if (itemIndex === -1) return;
    
    const item = inventory[itemIndex];
    const sellPrice = Math.floor(item.price * 0.5); // Sell for 50% of purchase price
    
    try {
        // Update zen coins
        const stats = gameStats.loadStats();
        stats.zenCoins += sellPrice;
        gameStats.saveStats(stats);

        // Remove item or decrease quantity
        if (item.quantity > 1) {
            item.quantity--;
            localStorage.setItem('inventory', JSON.stringify(inventory));
        } else {
            inventory.splice(itemIndex, 1);
            localStorage.setItem('inventory', JSON.stringify(inventory));
        }
        
        // Show success message
        notyf.success(`Sold ${item.name} for ${sellPrice} Zen Coins!`);
        
        // Re-render inventory immediately
        renderInventory(document.querySelector('.inventory-tab.active').dataset.category);
        
        // Update HUD
        gameStats.updateHUD();
        
    } catch (error) {
        notyf.error('Error selling item');
        console.error('Error selling item:', error);
    }
}

function getButtonText(category) {
    switch(category) {
        case 'weapons': return 'Equip';
        case 'potions': return 'Use';
        case 'equipment': return 'Equip';
        default: return 'Use';
    }
}

function useItem(itemId) {
    const inventory = JSON.parse(localStorage.getItem('inventory')) || [];
    const itemIndex = inventory.findIndex(i => i.id === itemId);
    
    if (itemIndex === -1) return;
    
    const item = inventory[itemIndex];
    
    switch(item.category) {
        case 'potions':
            usePotion(item);
            if (item.quantity > 1) {
                item.quantity--;
            } else {
                inventory.splice(itemIndex, 1);
            }
            break;
        case 'weapons':
        case 'equipment':
            equipItem(item);
            break;
    }
    
    localStorage.setItem('inventory', JSON.stringify(inventory));
    renderInventory(item.category);
}

function usePotion(item) {
    const stats = gameStats.loadStats();
    
    if (item.effect.health) {
        const newHealth = Math.min(stats.health + item.effect.health, stats.maxHealth);
        const healedAmount = newHealth - stats.health;
        stats.health = newHealth;
        gameStats.saveStats(stats);
        notyf.success(`Restored ${healedAmount} HP!`);
        removeFromInventory(item.id);
    }
}

function equipItem(item) {
    const equipped = JSON.parse(localStorage.getItem('equippedItems')) || {};
    
    // Unequip current item in same slot if exists
    if (equipped[item.category]) {
        const oldItem = equipped[item.category];
        notyf.success(`Unequipped ${oldItem.name}`);
    }
    
    equipped[item.category] = item;
    localStorage.setItem('equippedItems', JSON.stringify(equipped));
    notyf.success(`Equipped ${item.name}`);
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
    
    gameStats.updateHUD();

    // Add category tab listeners
    document.querySelectorAll('.inventory-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelector('.inventory-tab.active').classList.remove('active');
            tab.classList.add('active');
            renderInventory(tab.dataset.category);
        });
    });
});