// DOM elements
const playersTextarea = document.getElementById('players');
const roundsInput = document.getElementById('rounds');
const startButton = document.getElementById('startGame');

console.log('Script loaded, elements:', playersTextarea, roundsInput, startButton);

// Start game
startButton.addEventListener('click', () => {
    console.log('Start button clicked');
    const playerNames = playersTextarea.value.trim().split('\n').filter(name => name.trim() !== '');
    const rounds = parseInt(roundsInput.value);

    console.log('Player names:', playerNames, 'Rounds:', rounds);

    if (playerNames.length < 2) {
        alert('BRO HOW CAN YOU PLAY WITH FEW PEOPLE');
        return;
    }

    if (rounds < 1) {
        alert('PUT A ROUND HOMIE');
        return;
    }

    // Navigate to game page with data
    const playersParam = encodeURIComponent(playerNames.join(','));
    console.log('Navigating to:', `game.html?players=${playersParam}&rounds=${rounds}`);
    window.location.href = `game.html?players=${playersParam}&rounds=${rounds}`;
});
