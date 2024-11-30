// stickmanFight.js

const canvas = document.getElementById('fightCanvas');
const ctx = canvas.getContext('2d');

let player = { x: 100, y: 300, color: 'black', health: 100, canAttack: true, weapon: null, velocityY: 0, isJumping: false, isHit: false, isAttacking: false, attackAngle: 0, limbAngle: 0, rotationAngle: 0, isThrowing: false, thrownWeapon: null };
let npc = { x: 700, y: 300, color: 'red', health: 100, canAttack: true, weapon: null, isHit: false, isAttacking: false, limbAngle: 0 };
let obstacles = [];
let keys = {};
const gravity = 0.5; // Gravity effect
const jumpStrength = -10; // Jump strength
const attackCooldown = 1000; // 1 second cooldown
const hitEffectDuration = 200; // Duration of the hit effect in milliseconds
const attackEffectDuration = 200; // Duration of the attack effect in milliseconds
const obstacleSpawnInterval = 2000; // Interval to spawn new obstacles
const obstacleSpeed = 2; // Speed at which obstacles fall
const obstacleDamage = 10; // Damage dealt by obstacles

// Define possible weapons with images
const weapons = [
    { name: 'Sword', range: 60, damage: 15, image: 'sword.png' },
    { name: 'Axe', range: 50, damage: 10, image: 'axe.png' },
    { name: 'Spear', range: 80, damage: 10, image: 'spear.png' },
    { name: 'Dagger', range: 40, damage: 25, image: 'dagger.png' },
    { name: 'Trident', range: 300, damage: 20, image: 'trident.png', throwable: true },
    { name: 'Hammer', range: 50, damage: 10, image: 'hammer.png' },
    { name: 'Light Saber', range: 70, damage: 21, image: 'lightsaber.png' },
    { name: 'Pickaxe', range: 55, damage: 12, image: 'pickaxe.png' },
    { name: 'Club', range: 45, damage: 8, image: 'club.jpg' }
];

// Load weapon images
const weaponImages = {};
weapons.forEach(weapon => {
    const img = new Image();
    img.src = weapon.image;
    img.onload = () => console.log(`${weapon.name} image loaded successfully.`);
    img.onerror = () => console.error(`Failed to load ${weapon.name} image.`);
    weaponImages[weapon.name] = img;
});

// Function to assign a random weapon
function assignRandomWeapon(character) {
    const randomIndex = Math.floor(Math.random() * weapons.length);
    character.weapon = weapons[randomIndex];
    console.log(`${character === player ? 'Player' : 'NPC'} received a ${character.weapon.name}`);
}

function drawStickman(x, y, color, isPlayer, limbAngle, rotationAngle) {
    ctx.save();
    ctx.translate(x, y); // Move the origin to the character's position
    ctx.rotate(rotationAngle); // Rotate for backflip effect
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.arc(0, -20, 20, 0, Math.PI * 2, true); // Head
    ctx.moveTo(0, 0);
    ctx.lineTo(0, 50); // Body

    // Legs
    ctx.moveTo(0, 50);
    ctx.lineTo(-20 * Math.cos(limbAngle), 100 + 20 * Math.sin(limbAngle)); // Left leg
    ctx.moveTo(0, 50);
    ctx.lineTo(20 * Math.cos(limbAngle), 100 - 20 * Math.sin(limbAngle)); // Right leg

    // Arms
    ctx.moveTo(0, 20);
    ctx.lineTo(-20 * Math.cos(limbAngle), 50 + 20 * Math.sin(limbAngle)); // Left arm
    ctx.moveTo(0, 20);
    ctx.lineTo(20 * Math.cos(limbAngle), 50 - 20 * Math.sin(limbAngle)); // Right arm
    ctx.stroke();

    // Draw weapon
    const character = isPlayer ? player : npc; // Reference to player or NPC
    if (character && character.weapon && !character.isThrowing) {
        const weaponImage = weaponImages[character.weapon.name];
        if (weaponImage) {
            ctx.save();
            ctx.translate(isPlayer ? 20 : -20, 10); // Move the origin to the character's hand
            if (!isPlayer) ctx.scale(-1, 1); // Flip the image horizontally for NPC
            ctx.rotate(character.attackAngle); // Rotate the weapon for attack effect
            ctx.drawImage(weaponImage, 0, 0, 50, 50); // Adjust position and size as needed
            ctx.restore();
        }
    }
    ctx.restore();
}

function drawThrownWeapon() {
    if (player.thrownWeapon) {
        const weaponImage = weaponImages[player.thrownWeapon.name];
        if (weaponImage) {
            ctx.drawImage(weaponImage, player.thrownWeapon.x, player.thrownWeapon.y, 50, 50);
        }
    }
}

function drawHealthBar(x, y, health, color) {
    const maxHealth = 100; // Maximum health value
    const barWidth = 100; // Maximum width of the health bar

    // Calculate the width of the health bar based on current health
    const healthWidth = (health / maxHealth) * barWidth;

    // Draw the background of the health bar
    ctx.fillStyle = 'gray';
    ctx.fillRect(x - barWidth / 2, y - 60, barWidth, 10);

    // Draw the current health
    ctx.fillStyle = 'green';
    ctx.fillRect(x - barWidth / 2, y - 60, healthWidth, 10);
}

function drawObstacles() {
    ctx.fillStyle = 'gray';
    obstacles.forEach(obstacle => {
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    });
}

function updateObstacles() {
    obstacles = obstacles.filter(obstacle => {
        obstacle.y += obstacleSpeed;

        // Check collision with player
        if (obstacle.x < player.x + 20 && obstacle.x + obstacle.width > player.x - 20 &&
            obstacle.y < player.y && obstacle.y + obstacle.height > player.y - 50) {
            player.health -= obstacleDamage;
            player.isHit = true;
            setTimeout(() => player.isHit = false, hitEffectDuration);
            console.log(`Player hit by obstacle! Health: ${player.health}`);
            return false; // Remove obstacle after collision
        }

        // Check collision with NPC
        if (obstacle.x < npc.x + 20 && obstacle.x + obstacle.width > npc.x - 20 &&
            obstacle.y < npc.y && obstacle.y + obstacle.height > npc.y - 50) {
            npc.health -= obstacleDamage;
            npc.isHit = true;
            setTimeout(() => npc.isHit = false, hitEffectDuration);
            console.log(`NPC hit by obstacle! Health: ${npc.health}`);
            return false; // Remove obstacle after collision
        }

        // Keep obstacle if no collision
        return obstacle.y < canvas.height;
    });
}

function spawnObstacle() {
    const width = 30;
    const height = 30;
    const x = Math.random() * (canvas.width - width);
    const y = -height; // Start above the canvas
    obstacles.push({ x, y, width, height });
}

function drawNPC() {
    drawStickman(npc.x, npc.y, npc.isHit ? 'yellow' : npc.color, false, npc.limbAngle, 0);
    drawHealthBar(npc.x, npc.y, npc.health, npc.color);
}

function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Check if either the player or NPC is dead
    if (player.health <= 0 || npc.health <= 0) {
        ctx.fillStyle = 'black';
        ctx.font = '30px Arial';
        if (player.health <= 0) {
            ctx.fillText('You Lose!', canvas.width / 2 - 70, canvas.height / 2);
        } else {
            ctx.fillText('You Win!', canvas.width / 2 - 70, canvas.height / 2);
        }
        return; // Stop the game loop
    }

    // Draw player
    drawStickman(player.x, player.y, player.isHit ? 'yellow' : player.color, true, player.limbAngle, player.rotationAngle);
    drawHealthBar(player.x, player.y, player.health, 'black');

    // Draw and update NPC
    drawNPC();

    // Draw and update obstacles
    drawObstacles();
    updateObstacles();

    // Draw thrown weapon
    drawThrownWeapon();
    if (player.thrownWeapon) {
        player.thrownWeapon.x += 5; // Move the thrown weapon

        // Check collision with NPC
        const tridentWidth = 50; // Assuming the trident's width
        const tridentHeight = 50; // Assuming the trident's height
        const npcWidth = 40; // Assuming the NPC's width
        const npcHeight = 100; // Assuming the NPC's height

        if (player.thrownWeapon.x < npc.x + npcWidth &&
            player.thrownWeapon.x + tridentWidth > npc.x &&
            player.thrownWeapon.y < npc.y + npcHeight &&
            player.thrownWeapon.y + tridentHeight > npc.y) {
            npc.health -= player.thrownWeapon.damage;
            npc.isHit = true;
            console.log(`NPC hit by thrown weapon! Health: ${npc.health}`);
            player.thrownWeapon = null; // Remove the thrown weapon after collision
        }
    }

    // Player controls
    if (keys['ArrowLeft'] && player.x > 0) {
        player.x -= 2;
    }
    if (keys['ArrowRight'] && player.x < canvas.width) {
        player.x += 2;
    }
    if (keys['ArrowUp'] && !player.isJumping) {
        player.velocityY = jumpStrength;
        player.isJumping = true;
    }

    // Apply gravity
    player.velocityY += gravity;
    player.y += player.velocityY;

    // Rotate for backflip if jumping
    if (player.isJumping) {
        player.rotationAngle += 0.1; // Adjust rotation speed for backflip
    } else {
        player.rotationAngle = 0; // Reset rotation when not jumping
    }

    // Check if player is on the ground
    if (player.y >= 300) { // Assuming 300 is the ground level
        player.y = 300;
        player.velocityY = 0;
        player.isJumping = false;
    }

    // Simple NPC AI: move towards the player horizontally only
    if (npc.x > player.x) {
        npc.x -= 1;
    } else if (npc.x < player.x) {
        npc.x += 1;
    }

    // NPC attack
    if (npc.canAttack && npc.weapon && Math.abs(npc.x - player.x) < npc.weapon.range && Math.abs(npc.y - player.y) < npc.weapon.range) {
        console.log('NPC attacks Player');
        player.health -= npc.weapon.damage;
        player.isHit = true;
        npc.isAttacking = true;
        setTimeout(() => {
            player.isHit = false;
            npc.isAttacking = false;
        }, attackEffectDuration);
        console.log(`Player Health: ${player.health}`);
        npc.canAttack = false;
        setTimeout(() => npc.canAttack = true, attackCooldown);
    }

    // Player attack
    if (keys[' '] && player.canAttack && player.weapon) { // Check if weapon is assigned
        player.isAttacking = true;
        player.attackAngle = -Math.PI / 4; // Start the sword swing
        setTimeout(() => {
            player.attackAngle = 0; // Reset the sword position
            player.isAttacking = false;
        }, attackEffectDuration);

        if (Math.abs(player.x - npc.x) < player.weapon.range && Math.abs(player.y - npc.y) < player.weapon.range) {
            console.log('Player attacks NPC');
            npc.health -= player.weapon.damage;
            npc.isHit = true;
            setTimeout(() => npc.isHit = false, hitEffectDuration);
            console.log(`NPC Health: ${npc.health}`);
        }

        player.canAttack = false;
        setTimeout(() => player.canAttack = true, attackCooldown);
    }

    requestAnimationFrame(update);
}

// Assign random weapons to player and NPC at the start
assignRandomWeapon(player);
assignRandomWeapon(npc);

// Spawn obstacles at regular intervals
setInterval(spawnObstacle, obstacleSpawnInterval);

window.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    console.log(`Key down: ${e.key}`); // Log key presses

    // Throw the trident with Shift key
    if (e.key === 'Shift' && player.weapon && player.weapon.name === 'Trident' && player.weapon.throwable && !player.isThrowing) {
        player.isThrowing = true;
        player.thrownWeapon = { ...player.weapon, x: player.x, y: player.y };
        setTimeout(() => {
            player.isThrowing = false;
            player.thrownWeapon = null;
        }, 2000); // Reset after 2 seconds
    }
});

window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
    console.log(`Key up: ${e.key}`); // Log key releases
});

// On-screen controls
document.getElementById('left').addEventListener('mousedown', () => {
    keys['ArrowLeft'] = true;
    console.log('Left button pressed');
});
document.getElementById('left').addEventListener('mouseup', () => {
    keys['ArrowLeft'] = false;
    console.log('Left button released');
});
document.getElementById('right').addEventListener('mousedown', () => {
    keys['ArrowRight'] = true;
    console.log('Right button pressed');
});
document.getElementById('right').addEventListener('mouseup', () => {
    keys['ArrowRight'] = false;
    console.log('Right button released');
});
document.getElementById('up').addEventListener('mousedown', () => {
    keys['ArrowUp'] = true;
    console.log('Up button pressed');
});
document.getElementById('up').addEventListener('mouseup', () => {
    keys['ArrowUp'] = false;
    console.log('Up button released');
});
document.getElementById('down').addEventListener('mousedown', () => {
    keys['ArrowDown'] = true;
    console.log('Down button pressed');
});
document.getElementById('down').addEventListener('mouseup', () => {
    keys['ArrowDown'] = false;
    console.log('Down button released');
});

update();