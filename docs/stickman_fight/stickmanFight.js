const canvas = document.getElementById('fightCanvas');
const ctx = canvas.getContext('2d');

let player = { x: 100, y: 300, color: 'black', health: 100, canAttack: true, weapon: { range: 60, damage: 15 }, velocityY: 0, isJumping: false };
let npc = { x: 700, y: 300, color: 'red', health: 100, canAttack: true, weapon: { range: 60, damage: 10 } };
let keys = {};
const gravity = 0.5; // Gravity effect
const jumpStrength = -10; // Jump strength
const attackCooldown = 1000; // 1 second cooldown

// Load sword image
const swordImage = new Image();
swordImage.src = 'sword.png'; // Ensure this path is correct

// Debugging sword image loading
swordImage.onload = function() {
    console.log('Sword image loaded successfully.');
};
swordImage.onerror = function() {
    console.error('Failed to load sword image.');
};

function drawStickman(x, y, color, isPlayer) {
    console.log(`Drawing stickman at (${x}, ${y}) with color ${color}`);
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.arc(x, y - 20, 20, 0, Math.PI * 2, true); // Head
    ctx.moveTo(x, y);
    ctx.lineTo(x, y + 50); // Body
    ctx.moveTo(x, y + 50);
    ctx.lineTo(x - 20, y + 100); // Left leg
    ctx.moveTo(x, y + 50);
    ctx.lineTo(x + 20, y + 100); // Right leg
    ctx.moveTo(x, y + 20);
    ctx.lineTo(x - 20, y + 50); // Left arm
    ctx.moveTo(x, y + 20);
    ctx.lineTo(x + 20, y + 50); // Right arm
    ctx.stroke();

    // Draw sword image
    if (isPlayer) {
        ctx.drawImage(swordImage, x + 15, y + 10, 50, 50); // Adjust position and size as needed
    } else {
        ctx.drawImage(swordImage, x - 65, y + 10, 50, 50); // Adjust position and size as needed
    }
}

function drawHealthBar(x, y, health, color) {
    console.log(`Drawing health bar at (${x}, ${y}) with health ${health}`);
    ctx.fillStyle = color;
    ctx.fillRect(x - 50, y - 60, 100, 10);
    ctx.fillStyle = 'green';
    ctx.fillRect(x - 50, y - 60, health, 10);
}

function update() {
    console.log('Updating game state');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Check if either stickman is dead
    if (player.health <= 0 || npc.health <= 0) {
        ctx.fillStyle = 'black';
        ctx.font = '30px Arial';
        if (player.health <= 0) {
            ctx.fillText('You Lose!', canvas.width / 2 - 70, canvas.height / 2);
        } else {
            ctx.fillText('You Win!', canvas.width / 2 - 70, canvas.height / 2);
        }
        console.log('Game over');
        return; // Stop the game loop
    }

    drawStickman(player.x, player.y, player.color, true);
    drawStickman(npc.x, npc.y, npc.color, false);
    drawHealthBar(player.x, player.y, player.health, 'black');
    drawHealthBar(npc.x, npc.y, npc.health, 'red');

    // Player controls
    if (keys['ArrowLeft'] && player.x > 0) {
        player.x -= 2;
        console.log(`Player moves left to (${player.x}, ${player.y})`);
    }
    if (keys['ArrowRight'] && player.x < canvas.width) {
        player.x += 2;
        console.log(`Player moves right to (${player.x}, ${player.y})`);
    }
    if (keys['ArrowUp'] && !player.isJumping) {
        player.velocityY = jumpStrength;
        player.isJumping = true;
    }

    // Apply gravity
    player.velocityY += gravity;
    player.y += player.velocityY;

    // Check if player is on the ground
    if (player.y >= 300) { // Assuming 300 is the ground level
        player.y = 300;
        player.velocityY = 0;
        player.isJumping = false;
    }

    // Simple NPC AI: move towards the player horizontally only
    if (npc.x > player.x) {
        npc.x -= 1;
        console.log(`NPC moves left to (${npc.x}, ${npc.y})`);
    } else if (npc.x < player.x) {
        npc.x += 1;
        console.log(`NPC moves right to (${npc.x}, ${npc.y})`);
    }

    // Player attack
    if (keys[' '] && player.canAttack) {
        if (Math.abs(player.x - npc.x) < player.weapon.range && Math.abs(player.y - npc.y) < player.weapon.range) {
            console.log('Player attacks NPC');
            npc.health -= player.weapon.damage;
            console.log(`NPC Health: ${npc.health}`);
            player.canAttack = false;
            setTimeout(() => player.canAttack = true, attackCooldown);
        }
    }

    // NPC attack
    if (npc.canAttack && Math.abs(npc.x - player.x) < npc.weapon.range && Math.abs(npc.y - player.y) < npc.weapon.range) {
        console.log('NPC attacks Player');
        player.health -= npc.weapon.damage;
        console.log(`Player Health: ${player.health}`);
        npc.canAttack = false;
        setTimeout(() => npc.canAttack = true, attackCooldown);
    }

    requestAnimationFrame(update);
}

window.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    console.log(`Key down: ${e.key}`);
});

window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
    console.log(`Key up: ${e.key}`);
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

