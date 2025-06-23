const MARKET_ITEMS = {
    weapons: [
        {
            id: 'weapon1',
            name: 'Echoes of Nirvana',
            description: 'To be added',
            image: 'images/items/zen_sword.png',
            price: 99999,
            stats: 'To be added',
            category: 'weapons'
        },
        {
            id: 'weapon2',
            name: 'Dragon Bone Cleaver',
            description: 'To be added',
            image: 'images/items/cleaver.png',
            price: 2,
            stats: 'To be added',
            category: 'weapons'
        },
        {
            id: 'weapon3',
            name: 'Dagger of the Serene Spirit',
            description: 'To be added',
            image: 'images/items/dagger.png',
            price: 1000,
            stats: 'To be added',
            category: 'weapons'
        },
        {
            id: 'weapon4',
            name: 'Zen Archer\'\s Oath',
            description: 'To be added',
            image: 'images/items/bow.png',
            price: 1000,
            stats: 'To be added',
            category: 'weapons'
        },
        {
            id: 'weapon5',
            name: 'Mace of the Wandering Star',
            description: 'To be added',
            image: 'images/items/mace.png',
            price: 1000,
            stats: 'To be added',
            category: 'weapons'
        },
        {
            id: 'weapon6',
            name: 'Staff of Flowing Tranquility',
            description: 'To be added',
            image: 'images/items/staff.png',
            price: 1000,
            stats: 'To be added',
            category: 'weapons'
        },
        {
            id: 'weapon7',
            name: 'Wand of Eternal Stillness',
            description: 'To be added',
            image: 'images/items/wand.png',
            price: 1000,
            stats: 'To be added',
            category: 'weapons'
        },
        {
            id: 'weapon8',
            name: 'Rapier of the Slumbering Crane',
            description: 'To be added',
            image: 'images/items/rapier.png',
            price: 1000,
            stats: 'To be added',
            category: 'weapons'
        },
        // Add more weapons
    ],
    potions: [
        {
            id: 'potion1',
            name: 'Small Health Potion',
            description: 'To be added',
            image: 'images/items/s_hp_potion.png',
            price: 2,
            stats: 'To be added',
            category: 'potions'
        },
        {
            id: 'potion2',
            name: 'Health Potion',
            description: 'To be added',
            image: 'images/items/hp_potion.png',
            price: 50,
            stats: 'To be added',
            category: 'potions'
        },
        {
            id: 'potion3',
            name: 'XP Potion',
            description: 'To be added',
            image: 'images/items/xp_potion.png',
            price: 50,
            stats: 'To be added',
            category: 'potions'
        },
        {
            id: 'potion4',
            name: 'Max HP Potion',
            description: 'To be added',
            image: 'images/items/max_hp_potion.png',
            price: 50,
            stats: 'To be added',
            category: 'potions'
        },
        {
            id: 'potion5',
            name: 'Honey',
            description: 'To be added',
            image: 'images/items/honey.png',
            price: 50,
            stats: 'To be added',
            category: 'potions'
        },
        // Add more potions
    ],
    equipment: [
        {
            id: 'equipment1',
            name: 'Healing Totem of Peace',
            description: 'To be added',
            image: 'images/items/healing_totem.png',
            price: 2,
            stats: 'To be added',
            category: 'equipment'
        },
        {
            id: 'equipment2',
            name: 'Armor of the Zenith Dragon',
            description: 'To be added',
            image: 'images/items/gold_armor.png',
            price: 1000,
            stats: 'To be added',
            category: 'equipment'
        },
        {
            id: 'equipment3',
            name: 'Aegis of Inner Peace',
            description: 'To be added',
            image: 'images/items/shield.png',
            price: 1000,
            stats: 'To be added',
            category: 'equipment'
        },
        {
            id: 'equipment4',
            name: 'Amulet of the Tranquil Mind',
            description: 'To be added',
            image: 'images/items/necklace.png',
            price: 1000,
            stats: 'To be added',
            category: 'equipment'
        },
    {
            id: 'equipment5',
            name: 'Ring of the Gilded Sun',
            description: 'To be added',
            image: 'images/items/ring.png',
            price: 1000,
            stats: 'To be added',
            category: 'equipment'
        },
        // Add more equipment
    ]
};

function renderMarketItems(category) {
    const marketItems = document.querySelector('.market-items');
    marketItems.innerHTML = '';

    // Show the selected section
    const currentSection = document.getElementById(category);
    if (currentSection) {
        currentSection.style.display = 'block';
    }

    if (category === 'others') {
        // Show custom rewards section
        displayCustomRewards();
        return;
    }

    MARKET_ITEMS[category].forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'market-item pixel-corners';
        itemElement.innerHTML = `
            <img src="${item.image}" alt="${item.name}" class="item-image">
            <h3 class="item-name">${item.name}</h3>
            <p class="item-description">${item.description}</p>
            <p class="item-stats">${item.stats}</p>
            <div class="price">
                <img src="images/icons/coin.png" width="25px" height="25px" display="inline-block">
                <span>${item.price}</span>
            </div>
            <button class="buy-btn pixel-corners-small" onclick="buyItem('${item.id}')">
                Purchase
            </button>
        `;
        marketItems.appendChild(itemElement);
    });
}


function buyItem(itemId) {
    const stats = gameStats.loadStats();
    const item = Object.values(MARKET_ITEMS)
        .flat()
        .find(i => i.id === itemId);
    
    if (!item) return;
    
    if (stats.zenCoins >= item.price) {
        // Deduct coins
        stats.zenCoins -= item.price;
        gameStats.saveStats(stats);
        
        // Add or update item in inventory
        const inventory = JSON.parse(localStorage.getItem('inventory')) || [];
        const existingItem = inventory.find(i => i.id === itemId);
        
        if (existingItem) {
            // Increment quantity if item exists
            existingItem.quantity = (existingItem.quantity || 1) + 1;
            localStorage.setItem('inventory', JSON.stringify(inventory));
            notyf.success(`Added another ${item.name}! (${existingItem.quantity})`);
        } else {
            // Add new item with quantity 1
            inventory.push({
                ...item,
                quantity: 1
            });
            localStorage.setItem('inventory', JSON.stringify(inventory));
            notyf.success(`Purchased ${item.name}!`);
        }
        
        gameStats.updateHUD();
    } else {
        notyf.error('Not enough Zen Coins!');
    }
}

// Add event listeners for category tabs
document.querySelectorAll('.market-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelector('.market-tab.active').classList.remove('active');
        tab.classList.add('active');
        renderMarketItems(tab.dataset.category);
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
        <div class="market-item pixel-corners-small">
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
