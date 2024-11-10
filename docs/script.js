const gridSize = 5;
let grid, totalNumbers, playerPos, playerColor, totalSum, numbersEatenCount;
let gameOver = false; // Flag to track if the game is over

function initializeGame() {
    grid = Array.from({ length: gridSize }, () => Array(gridSize).fill(' '));
    totalNumbers = 0;
    playerPos = [0, 0];
    playerColor = 'red'; // Default player color
    totalSum = 0;
    numbersEatenCount = 0;
    gameOver = false; // Reset game over flag

    // Place numbers randomly on the grid
    for (let i = 0; i < 5; i++) {
        let x = Math.floor(Math.random() * gridSize);
        let y = Math.floor(Math.random() * gridSize);
        if (grid[x][y] === ' ') { // Ensure a number is placed in an empty spot
            grid[x][y] = Math.floor(Math.random() * 9) + 1;
            totalNumbers++; // Increment totalNumbers for each number placed
        }
    }

    renderGrid();
    displayMessage('Game started! Use arrow keys to move.');
}

function renderGrid() {
    const gridElement = document.getElementById('grid');
    gridElement.innerHTML = '';
    for (let x = 0; x < gridSize; x++) {
        for (let y = 0; y < gridSize; y++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            if (x === playerPos[0] && y === playerPos[1]) {
                cell.classList.add('player');
                cell.textContent = 'P'; // Represent the player with a 'P'
                cell.style.backgroundColor = playerColor; // Apply stored player color
            } else if (typeof grid[x][y] === 'number') {
                cell.classList.add('number');
                cell.textContent = grid[x][y];
            }
            gridElement.appendChild(cell);
        }
    }
}

function eatNumber() {
    let [x, y] = playerPos;
    console.log(`Attempting to eat number at position: (${x}, ${y})`);
    if (typeof grid[x][y] === 'number') {
        const numberEaten = grid[x][y];
        displayMessage(`Number ${numberEaten} eaten!`);
        totalSum += numberEaten;
        numbersEatenCount++;
        grid[x][y] = ' ';
        
        // Change player color based on the number eaten
        if (numberEaten === 1 || numberEaten === 2) {
            console.log('Changing player color to red for numbers 1 and 2');
            playerColor = 'red';
        } else if (numberEaten === 3 || numberEaten === 4 || numberEaten === 6) {
            console.log('Changing player color to blue for numbers 3, 4, and 6');
            playerColor = 'blue';
        } else if (numberEaten === 5) {
            console.log('Changing player color to black for number 5');
            playerColor = 'black';
        } else if (numberEaten === 7 || numberEaten === 8) {
            console.log('Changing player color to yellow for numbers 7 and 8');
            playerColor = 'yellow';
        } else if (numberEaten === 9) {
            console.log('Changing player color to green for number 9');
            playerColor = 'green';
        } else {
            console.log(`Changing player color to: ${playerColors[currentColorIndex]}`);
            playerColor = playerColors[currentColorIndex];
            // Update color index
            currentColorIndex = (currentColorIndex + 1) % playerColors.length;
        }
        
        // Check if all numbers are eaten
        if (numbersEatenCount === totalNumbers) {
            displayMessage(`Game over! Total sum of numbers eaten: ${totalSum}`);
            gameOver = true; // Set game over flag
        }
        
        // Render the grid to update the player's position
        renderGrid();
    } else {
        console.log('No number to eat at the player position.');
    }
}

function displayMessage(message) {
    const messageElement = document.getElementById('message');
    messageElement.textContent = message;
}

function movePlayer(direction) {
    if (gameOver) return; // Prevent movement if the game is over

    let [x, y] = playerPos;
    if (direction === 'up' && x > 0) {
        playerPos[0]--;
    } else if (direction === 'down' && x < gridSize - 1) {
        playerPos[0]++;
    } else if (direction === 'left' && y > 0) {
        playerPos[1]--;
    } else if (direction === 'right' && y < gridSize - 1) {
        playerPos[1]++;
    }
    eatNumber();
    renderGrid();
}

// Add event listener for arrow keys
document.addEventListener('keydown', (event) => {
    switch (event.key) {
        case 'ArrowUp':
            movePlayer('up');
            break;
        case 'ArrowDown':
            movePlayer('down');
            break;
        case 'ArrowLeft':
            movePlayer('left');
            break;
        case 'ArrowRight':
            movePlayer('right');
            break;
    }
});

// Add event listener for reset button
document.getElementById('resetButton').addEventListener('click', initializeGame);

// Initialize the game on page load
initializeGame();

renderGrid();