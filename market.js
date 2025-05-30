const MARKET_ITEMS = {
    weapons: [
        {
            id: 'weapon1',
            name: 'Echoes of Nirvana',
            description: 'To be added',
            image: 'images/zen_sword.png',
            price: 99999,
            stats: 'To be added',
            category: 'weapons'
        },
        {
            id: 'weapon2',
            name: 'Dragon Bone Cleaver',
            description: 'To be added',
            image: 'images/cleaver.png',
            price: 1000,
            stats: 'To be added',
            category: 'weapons'
        },
        {
            id: 'weapon3',
            name: 'Dagger of the Serene Spirit',
            description: 'To be added',
            image: 'images/dagger.png',
            price: 1000,
            stats: 'To be added',
            category: 'weapons'
        },
        {
            id: 'weapon4',
            name: 'Zen Archer\'\s Oath',
            description: 'To be added',
            image: 'images/bow.png',
            price: 1000,
            stats: 'To be added',
            category: 'weapons'
        },
        {
            id: 'weapon5',
            name: 'Mace of the Wandering Star',
            description: 'To be added',
            image: 'images/mace.png',
            price: 1000,
            stats: 'To be added',
            category: 'weapons'
        },
        {
            id: 'weapon6',
            name: 'Staff of Flowing Tranquility',
            description: 'To be added',
            image: 'images/staff.png',
            price: 1000,
            stats: 'To be added',
            category: 'weapons'
        },
        {
            id: 'weapon7',
            name: 'Wand of Eternal Stillness',
            description: 'To be added',
            image: 'images/wand.png',
            price: 1000,
            stats: 'To be added',
            category: 'weapons'
        },
        {
            id: 'weapon8',
            name: 'Rapier of the Slumbering Crane',
            description: 'To be added',
            image: 'images/rapier.png',
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
            image: 'images/s_hp_potion.png',
            price: 1,
            stats: 'To be added',
            category: 'potions'
        },
        {
            id: 'potion2',
            name: 'Health Potion',
            description: 'To be added',
            image: 'images/hp_potion.png',
            price: 50,
            stats: 'To be added',
            category: 'potions'
        },
        {
            id: 'potion3',
            name: 'XP Potion',
            description: 'To be added',
            image: 'images/xp_potion.png',
            price: 50,
            stats: 'To be added',
            category: 'potions'
        },
        {
            id: 'potion4',
            name: 'Max HP Potion',
            description: 'To be added',
            image: 'images/max_hp_potion.png',
            price: 50,
            stats: 'To be added',
            category: 'potions'
        },
        {
            id: 'potion5',
            name: 'Honey',
            description: 'To be added',
            image: 'images/honey.png',
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
            image: 'images/healing_totem.png',
            price: 1000,
            stats: 'To be added',
            category: 'equipment'
        },
        {
            id: 'equipment2',
            name: 'Armor of the Zenith Dragon',
            description: 'To be added',
            image: 'images/gold_armor.png',
            price: 1000,
            stats: 'To be added',
            category: 'equipment'
        },
        {
            id: 'equipment3',
            name: 'Aegis of Inner Peace',
            description: 'To be added',
            image: 'images/shield.png',
            price: 1000,
            stats: 'To be added',
            category: 'equipment'
        },
        {
            id: 'equipment4',
            name: 'Amulet of the Tranquil Mind',
            description: 'To be added',
            image: 'images/necklace.png',
            price: 1000,
            stats: 'To be added',
            category: 'equipment'
        },
    {
            id: 'equipment5',
            name: 'Ring of the Gilded Sun',
            description: 'To be added',
            image: 'images/ring.png',
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

    MARKET_ITEMS[category].forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'market-item pixel-corners';
        itemElement.innerHTML = `
            <img src="${item.image}" alt="${item.name}" class="item-image">
            <h3 class="item-name">${item.name}</h3>
            <p class="item-description">${item.description}</p>
            <p class="item-stats">${item.stats}</p>
            <div class="price">
                <img src="images/coin.png" width="25px" height="25px" display="inline-block">
                <span>${item.price}</span>
            </div>
            <button class="buy-btn pixel-corners-small" onclick="buyItem('${item.id}')">
                Purchase
            </button>
        `;
        marketItems.appendChild(itemElement);
    });
}

// Initialize market page
document.addEventListener('DOMContentLoaded', () => {
    gameStats.updateHUD();
    renderMarketItems('weapons');
});

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
        
        // Add item to inventory
        const inventory = JSON.parse(localStorage.getItem('inventory')) || [];
        inventory.push(item);
        localStorage.setItem('inventory', JSON.stringify(inventory));
        
        // Show success message and update HUD
        showMessage(`Purchased ${item.name}!`);
        gameStats.updateHUD();
    } else {
        showMessage('Not enough Zen Coins!', 'error');
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