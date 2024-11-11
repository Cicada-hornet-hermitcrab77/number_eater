const gridSize = 5;
let grid, totalNumbers, playerPos, playerColor, totalSum, numbersEatenCount;
let gameOver = false; // Flag to track if the game is over
let bombPos; // Position of the bomb

function initializeGame() {
    grid = Array.from({ length: gridSize }, () => Array(gridSize).fill(' '));
    playerPos = [0, 0];
    playerColor = 'red'; // Default player color
    totalSum = 0;
    numbersEatenCount = 0;
    gameOver = false; // Reset game over flag

    // Get the total number of numbers from the input
    totalNumbers = parseInt(document.getElementById('numberInput').value, 10);
    console.log(`Total numbers to place: ${totalNumbers}`); // Debug: Log the total numbers

    // Place numbers randomly on the grid
    let placedNumbers = 0;
    while (placedNumbers < totalNumbers) {
        let x = Math.floor(Math.random() * gridSize);
        let y = Math.floor(Math.random() * gridSize);
        if (grid[x][y] === ' ') { // Ensure a number is placed in an empty spot
            grid[x][y] = Math.floor(Math.random() * 9) + 1;
            placedNumbers++;
            console.log(`Placed number ${grid[x][y]} at position (${x}, ${y})`); // Debug: Log each number placement
        }
    }

    console.log("Grid after placing numbers:", JSON.stringify(grid)); // Debug: Log the grid to check number placement

    // Place a bomb randomly on the grid
    do {
        bombPos = [Math.floor(Math.random() * gridSize), Math.floor(Math.random() * gridSize)];
    } while (grid[bombPos[0]][bombPos[1]] !== ' ' || (bombPos[0] === 0 && bombPos[1] === 0));
    grid[bombPos[0]][bombPos[1]] = 'B'; // Represent the bomb with 'B'
    console.log(`Placed bomb at position (${bombPos[0]}, ${bombPos[1]})`); // Debug: Log bomb placement

    renderGrid();
    displayMessage('Game started! Use arrow keys or buttons to move.');
}

function renderGrid() {
    const gridElement = document.getElementById('grid');
    if (!gridElement) {
        console.error("Grid element not found!"); // Debug: Check if grid element exists
        return;
    }
    gridElement.innerHTML = '';
    for (let x = 0; x < gridSize; x++) {
        for (let y = 0; y < gridSize; y++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            const cellContent = document.createElement('div');
            if (x === playerPos[0] && y === playerPos[1]) {
                cellContent.classList.add('player');
                cellContent.textContent = 'P'; // Represent the player with a 'P'
                cellContent.style.backgroundColor = playerColor; // Apply stored player color
            } else if (grid[x][y] === 'B') {
                cellContent.classList.add('bomb');
                cellContent.textContent = '💣'; // Represent the bomb with an emoji
            } else if (typeof grid[x][y] === 'number') {
                cellContent.classList.add('number');
                cellContent.textContent = grid[x][y];
            }
            cell.appendChild(cellContent);
            gridElement.appendChild(cell);
        }
    }
    console.log("Rendered grid"); // Debug: Confirm grid rendering
}

function eatNumber() {
    let [x, y] = playerPos;
    console.log(`Attempting to eat number at position: (${x}, ${y})`);
    if (grid[x][y] === 'B') {
        displayMessage('Boom! You hit a bomb. Game over!');
        gameOver = true;
        return;
    }
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
    if (!messageElement) {
        console.error("Message element not found!"); // Debug: Check if message element exists
        return;
    }
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

// Add event listeners for control buttons
document.getElementById('upButton').addEventListener('click', () => movePlayer('up'));
document.getElementById('downButton').addEventListener('click', () => movePlayer('down'));
document.getElementById('leftButton').addEventListener('click', () => movePlayer('left'));
document.getElementById('rightButton').addEventListener('click', () => movePlayer('right'));

// Add event listener for reset button
document.getElementById('resetButton').addEventListener('click', initializeGame);

// Automatically initialize the game when the number input changes
document.getElementById('numberInput').addEventListener('change', initializeGame);

// Disable double-click on buttons
document.querySelectorAll('button').forEach(button => {
    button.addEventListener('dblclick', (event) => {
        event.preventDefault();
    });
});

// Initialize the game on page load
initializeGame();