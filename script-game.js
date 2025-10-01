// Parse URL parameters
const urlParams = new URLSearchParams(window.location.search);
const playersParam = urlParams.get('players');
const roundsParam = urlParams.get('rounds');

if (!playersParam || !roundsParam) {
    alert('Invalid game data. Please start from the input page.');
    window.location.href = 'index.html';
}

const players = playersParam.split(',');
const rounds = parseInt(roundsParam);

// Game variables
let currentRound = 1;
let selectedPlayers = [];
let playerPoints = {};
let canvas, ctx;
let wheelRadius = 200;
let isSpinning = false;
let spinAngle = 0;
let spinSpeed = 0;
let deceleration = 0.98;
let selectedIndex = -1;

// DOM elements
const gameDiv = document.getElementById('game');
const spinButton = document.getElementById('spinButton');
const leaderboardList = document.getElementById('leaderboardList');
const selectedPlayerDiv = document.getElementById('selectedPlayer');
const selectedName = document.getElementById('selectedName');
const summaryDiv = document.getElementById('summary');
const summaryList = document.getElementById('summaryList');
const restartButton = document.getElementById('restartGame');
const backButton = document.getElementById('backButton');

// Initialize players
players.forEach(player => {
    playerPoints[player] = 20;
});

// Initialize canvas
function initCanvas() {
    canvas = document.getElementById('wheel');
    ctx = canvas.getContext('2d');
    canvas.width = 400;
    canvas.height = 400;
    drawWheel();
    updateLeaderboard();
}

// Draw the wheel
function drawWheel() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const anglePerPlayer = (2 * Math.PI) / players.length;

    players.forEach((player, index) => {
        const startAngle = index * anglePerPlayer + spinAngle;
        const endAngle = (index + 1) * anglePerPlayer + spinAngle;

        // Draw sector
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, wheelRadius, startAngle, endAngle);
        ctx.closePath();

        // Color sectors
        const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA726', '#AB47BC', '#66BB6A', '#EF5350', '#42A5F5'];
        ctx.fillStyle = colors[index % colors.length];
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw text
        const textAngle = startAngle + anglePerPlayer / 2;
        const textX = centerX + Math.cos(textAngle) * (wheelRadius * 0.7);
        const textY = centerY + Math.sin(textAngle) * (wheelRadius * 0.7);

        ctx.save();
        ctx.translate(textX, textY);
        ctx.rotate(textAngle + Math.PI / 2);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(player, 0, 0);
        ctx.restore();
    });

    // Draw pointer
    ctx.beginPath();
    ctx.moveTo(centerX, centerY - wheelRadius - 20);
    ctx.lineTo(centerX - 15, centerY - wheelRadius);
    ctx.lineTo(centerX + 15, centerY - wheelRadius);
    ctx.closePath();
    ctx.fillStyle = '#333';
    ctx.fill();
}

// Spin the wheel
spinButton.addEventListener('click', () => {
    if (isSpinning) return;

    // Get available players for this round
    const availablePlayers = players.filter(player => !selectedPlayers.includes(player));

    if (availablePlayers.length === 0) {
        // All players selected, start new round
        if (currentRound >= rounds) {
            showSummary();
            return;
        }
        currentRound++;
        selectedPlayers = [];
        alert(`Round ${currentRound} starts!`);
        return;
    }

    isSpinning = true;
    spinSpeed = Math.random() * 0.5 + 0.5; // Random initial speed
    selectedIndex = Math.floor(Math.random() * availablePlayers.length);

    // Calculate target angle
    const targetAngle = (players.indexOf(availablePlayers[selectedIndex]) * (2 * Math.PI / players.length)) + Math.PI / players.length;

    animateSpin(targetAngle);
});

// Animate spin
function animateSpin(targetAngle) {
    spinAngle += spinSpeed;
    spinSpeed *= deceleration;

    if (spinSpeed > 0.01) {
        requestAnimationFrame(() => animateSpin(targetAngle));
    } else {
        // Spin finished
        isSpinning = false;
        const selectedPlayer = players[Math.floor((Math.PI * 2 - (spinAngle % (Math.PI * 2))) / (Math.PI * 2 / players.length)) % players.length];
        const availablePlayers = players.filter(player => !selectedPlayers.includes(player));

        if (availablePlayers.includes(selectedPlayer)) {
            selectedPlayers.push(selectedPlayer);
            showSelectedPlayer(selectedPlayer);
        } else {
            // If selected player already chosen, pick another
            const remaining = availablePlayers[Math.floor(Math.random() * availablePlayers.length)];
            selectedPlayers.push(remaining);
            showSelectedPlayer(remaining);
        }
    }

    drawWheel();
}

// Show selected player
function showSelectedPlayer(player) {
    selectedName.textContent = player;
    selectedPlayerDiv.classList.remove('hidden');
    selectedPlayerDiv.style.animation = 'none';
    setTimeout(() => selectedPlayerDiv.style.animation = '', 10);
}

// Update leaderboard
function updateLeaderboard() {
    leaderboardList.innerHTML = '';
    const sortedPlayers = Object.entries(playerPoints).sort((a, b) => b[1] - a[1]);

    sortedPlayers.forEach(([player, points], index) => {
        const li = document.createElement('li');
        if (index === 0) li.classList.add('leader');

        li.innerHTML = `
            <span>${player}: ${points} points</span>
            <button class="add-points" data-player="${player}">+20</button>
        `;

        leaderboardList.appendChild(li);
    });

    // Add event listeners to +20 buttons
    document.querySelectorAll('.add-points').forEach(button => {
        button.addEventListener('click', (e) => {
            const player = e.target.dataset.player;
            playerPoints[player] += 20;
            updateLeaderboard();
        });
    });
}

// Show summary
function showSummary() {
    summaryList.innerHTML = '';
    const sortedPlayers = Object.entries(playerPoints).sort((a, b) => b[1] - a[1]);

    sortedPlayers.forEach(([player, points]) => {
        const li = document.createElement('li');
        li.textContent = `${player}: ${points} points`;
        summaryList.appendChild(li);
    });

    selectedPlayerDiv.classList.add('hidden');
    summaryDiv.classList.remove('hidden');
}

// Restart game
restartButton.addEventListener('click', () => {
    window.location.href = 'index.html';
});

// Back button
backButton.addEventListener('click', () => {
    window.location.href = 'index.html';
});

// Initialize
initCanvas();
