const canvas = document.getElementById('fightCanvas');
const ctx = canvas.getContext('2d');

let player = { x: 100, y: 300, color: 'black', health: 100, canAttack: true, weapon: { range: 60, damage: 15 } };
let npc = { x: 700, y: 300, color: 'red', health: 100, canAttack: true, weapon: { range: 60, damage: 10 } };
let keys = {};
const attackCooldown = 1000; // 1 second cooldown

function drawStickman(x, y, color, isPlayer) {
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

    // Draw sword
    ctx.strokeStyle = 'gray'; // Sword color
    ctx.lineWidth = 2; // Sword thickness
    ctx.beginPath();
    if (isPlayer) {
        // Sword for player
        ctx.moveTo(x + 20, y + 20); // Hilt start
        ctx.lineTo(x + 25, y + 20); // Hilt end
        ctx.moveTo(x + 22.5, y + 18); // Guard start
        ctx.lineTo(x + 22.5, y + 22); // Guard end
        ctx.moveTo(x + 25, y + 20); // Blade start
        ctx.lineTo(x + 60, y + 15); // Blade end
    } else {
        // Sword for NPC
        ctx.moveTo(x - 20, y + 20); // Hilt start
        ctx.lineTo(x - 25, y + 20); // Hilt end
        ctx.moveTo(x - 22.5, y + 18); // Guard start
        ctx.lineTo(x - 22.5, y + 22); // Guard end
        ctx.moveTo(x - 25, y + 20); // Blade start
        ctx.lineTo(x - 60, y + 15); // Blade end
    }
    ctx.stroke();
    ctx.lineWidth = 1; // Reset line width
}

function drawHealthBar(x, y, health, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x - 50, y - 60, 100, 10);
    ctx.fillStyle = 'green';
    ctx.fillRect(x - 50, y - 60, health, 10);
}

function update() {
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
        return; // Stop the game loop
    }

    drawStickman(player.x, player.y, player.color, true);
    drawStickman(npc.x, npc.y, npc.color, false);
    drawHealthBar(player.x, player.y, player.health, 'black');
    drawHealthBar(npc.x, npc.y, npc.health, 'red');

    // Player controls
    if (keys['ArrowLeft'] && player.x > 0) {
        player.x -= 2;
    }
    if (keys['ArrowRight'] && player.x < canvas.width) {
        player.x += 2;
    }
    if (keys['ArrowUp'] && player.y > 0) {
        player.y -= 2;
    }
    if (keys['ArrowDown'] && player.y < canvas.height) {
        player.y += 2;
    }

    // Simple NPC AI: move towards the player
    if (npc.x > player.x) {
        npc.x -= 1;
    } else if (npc.x < player.x) {
        npc.x += 1;
    }
    if (npc.y > player.y) {
        npc.y -= 1;
    } else if (npc.y < player.y) {
        npc.y += 1;
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
    console.log(`Key down: ${e.key}`); // Log key presses
});

window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
    console.log(`Key up: ${e.key}`); // Log key releases
});

update();

