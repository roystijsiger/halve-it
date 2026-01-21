// Half-It Darts App Controller

let game = null;
let currentColorSequenceInput = [];
let savedPlayerNames = [];
let currentThrows = [null, null, null];
let currentThrowIndex = 0;

// Load saved player names from localStorage
function loadSavedNames() {
    const saved = localStorage.getItem('halfItPlayerNames');
    console.log('Loading saved names from localStorage:', saved);
    if (saved) {
        try {
            savedPlayerNames = JSON.parse(saved);
            console.log('Parsed saved names:', savedPlayerNames);
        } catch (e) {
            console.error('Error parsing saved names:', e);
            savedPlayerNames = [];
        }
    }
}

// Save player name to localStorage
function savePlayerName(name) {
    if (!name || name.trim() === '') return;
    
    const trimmedName = name.trim();
    
    // Check if name already exists (case insensitive)
    const exists = savedPlayerNames.some(n => n.toLowerCase() === trimmedName.toLowerCase());
    
    if (!exists) {
        savedPlayerNames.push(trimmedName);
        // Keep only last 20 names
        if (savedPlayerNames.length > 20) {
            savedPlayerNames = savedPlayerNames.slice(-20);
        }
        localStorage.setItem('halfItPlayerNames', JSON.stringify(savedPlayerNames));
    }
}

// Wacht tot device ready is
document.addEventListener('deviceready', onDeviceReady, false);

function onDeviceReady() {
    console.log('Running cordova-' + cordova.platformId + '@' + cordova.version);
    initApp();
}

// Als Cordova niet laadt (browser test), gebruik normale load
if (typeof cordova === 'undefined') {
    window.addEventListener('load', initApp);
}

function initApp() {
    game = new HalfItGame();
    loadSavedNames();
    setupEventListeners();
    updatePlayerNameInputs();
}

function setupEventListeners() {
    // Game selection screen
    document.getElementById('selectHalfItBtn').addEventListener('click', selectHalfIt);
    document.getElementById('backToSelectionBtn').addEventListener('click', () => showScreen('gameSelectionScreen'));
    
    // Setup screen
    document.getElementById('playerCount').addEventListener('input', updatePlayerNameInputs);
    document.getElementById('startGameBtn').addEventListener('click', startGame);
    document.getElementById('showRulesBtn').addEventListener('click', showRulesModal);
    document.getElementById('closeRulesBtn').addEventListener('click', closeRulesModal);
    
    // Close rules modal when clicking outside
    document.getElementById('rulesModal').addEventListener('click', (e) => {
        if (e.target.id === 'rulesModal') {
            closeRulesModal();
        }
    });
    
    // Game screen
    document.querySelectorAll('.btn-throw').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const value = parseInt(e.target.getAttribute('data-value'));
            addThrow(value);
        });
    });
    
    document.querySelectorAll('.throw-box').forEach(box => {
        box.addEventListener('click', (e) => {
            const throwIndex = parseInt(e.currentTarget.getAttribute('data-throw'));
            selectThrowBox(throwIndex);
        });
    });
    
    document.getElementById('confirmThrowsBtn').addEventListener('click', confirmThrows);
    document.getElementById('successSpecialBtn').addEventListener('click', () => processSpecialResult(true));
    document.getElementById('failSpecialBtn').addEventListener('click', () => processSpecialResult(false));
    document.getElementById('nextPlayerBtn').addEventListener('click', continueToNextPlayer);
    document.getElementById('quitGameBtn').addEventListener('click', quitGame);
    document.getElementById('showScoresBtn').addEventListener('click', showScoreModal);
    document.getElementById('closeScoreModal').addEventListener('click', closeScoreModal);
    
    // Close modal when clicking outside
    document.getElementById('scoreModal').addEventListener('click', (e) => {
        if (e.target.id === 'scoreModal') {
            closeScoreModal();
        }
    });
    
    // Results screen
    document.getElementById('newGameBtn').addEventListener('click', () => showScreen('gameSelectionScreen'));
}

function updatePlayerNameInputs() {
    const count = parseInt(document.getElementById('playerCount').value);
    const container = document.getElementById('playerNameInputs');
    container.innerHTML = '';
    
    console.log('Updating player inputs, saved names:', savedPlayerNames);
    
    for (let i = 1; i <= count; i++) {
        const div = document.createElement('div');
        div.className = 'player-name-input';
        
        // Always show dropdown if there are saved names, otherwise show input
        if (savedPlayerNames && savedPlayerNames.length > 0) {
            // Show dropdown with saved names + option for new name
            let options = '<option value="">-- Kies speler --</option>';
            savedPlayerNames.forEach(name => {
                options += `<option value="${name}">${name}</option>`;
            });
            options += '<option value="__new__">✚ Nieuwe speler...</option>';
            
            div.innerHTML = `
                <select id="player${i}Select" class="player-select">
                    ${options}
                </select>
                <input type="text" id="player${i}Name" class="player-name-custom" placeholder="Naam van nieuwe speler" style="display: none;">
            `;
            
            // Add event listener for select change
            setTimeout(() => {
                const select = document.getElementById(`player${i}Select`);
                const input = document.getElementById(`player${i}Name`);
                
                if (select && input) {
                    select.addEventListener('change', function() {
                        if (this.value === '__new__') {
                            input.style.display = 'block';
                            input.focus();
                        } else {
                            input.style.display = 'none';
                            input.value = this.value;
                        }
                    });
                }
            }, 0);
        } else {
            // No saved names, show regular input with default value
            div.innerHTML = `
                <input type="text" id="player${i}Name" class="player-name-text" placeholder="Speler ${i}" value="Speler ${i}">
            `;
        }
        
        container.appendChild(div);
    }
}

function startGame() {
    const count = parseInt(document.getElementById('playerCount').value);
    const playerNames = [];
    
    for (let i = 1; i <= count; i++) {
        let name = '';
        const select = document.getElementById(`player${i}Select`);
        const input = document.getElementById(`player${i}Name`);
        
        if (select) {
            // Using dropdown
            if (select.value === '__new__' || select.value === '') {
                // New player or no selection - use input field
                name = input ? input.value.trim() : '';
                if (!name) name = `Speler ${i}`;
            } else {
                name = select.value;
            }
        } else if (input) {
            // Using regular input (no dropdown)
            name = input.value.trim() || `Speler ${i}`;
        } else {
            name = `Speler ${i}`;
        }
        
        playerNames.push(name);
        
        // Save the name if it's not a default name
        if (name && !name.startsWith('Speler ')) {
            savePlayerName(name);
        }
    }
    
    const difficulty = document.getElementById('difficulty').value;
    
    game.initGame(playerNames, difficulty);
    showScreen('gameScreen');
    updateGameScreen();
}

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
}
function selectHalfIt() {
    showScreen('setupScreen');
}
function updateGameScreen() {
    const round = game.getCurrentRound();
    const player = game.getCurrentPlayer();
    
    // Reset throws
    currentThrows = [null, null, null];
    currentThrowIndex = 0;
    updateThrowDisplay();
    
    // Update ronde titel
    let roundTitle = '';
    if (round.type === 'normal') {
        roundTitle = `Ronde ${game.currentRoundIndex + 1}: ${round.number}`;
    } else if (round.type === 'special') {
        roundTitle = round.name;
    } else if (round.type === 'bull') {
        roundTitle = 'Bull & Double Bull';
    }
    document.getElementById('currentRoundTitle').textContent = roundTitle;
    
    // Update speciale opdracht banner
    const specialMissionDiv = document.getElementById('specialMission');
    if (round.type === 'special') {
        const mission = game.getCurrentSpecialMission();
        specialMissionDiv.textContent = `🎯 Opdracht: ${mission.description}`;
        specialMissionDiv.classList.remove('hidden');
    } else {
        specialMissionDiv.classList.add('hidden');
    }
    
    // Update scoreboard
    updateScoreboard();
    
    // Update huidige speler
    document.getElementById('currentPlayerName').textContent = player.name;
    document.getElementById('currentPlayerScore').textContent = player.score;
    
    // Toon correcte input sectie
    if (round.type === 'special') {
        document.getElementById('throwInput').style.display = 'none';
        document.getElementById('specialInput').style.display = 'block';
        document.getElementById('nextPlayerBtn').style.display = 'none';
        setupSpecialMissionInput();
    } else {
        document.getElementById('throwInput').style.display = 'block';
        document.getElementById('specialInput').style.display = 'none';
        document.getElementById('nextPlayerBtn').style.display = 'none';
    }
}

function updateScoreboard() {
    const container = document.getElementById('playersScore');
    container.innerHTML = '';
    
    game.players.forEach((player, index) => {
        const div = document.createElement('div');
        div.className = 'player-score';
        if (index === game.currentPlayerIndex) {
            div.classList.add('active');
        }
        div.innerHTML = `
            <span class="player-name">${player.name}</span>
            <span class="score">${player.score}</span>
        `;
        container.appendChild(div);
    });
}

function updateThrowDisplay() {
    const round = game.getCurrentRound();
    
    for (let i = 0; i < 3; i++) {
        const box = document.getElementById(`throw${i + 1}`);
        const valueDiv = box.querySelector('.throw-value');
        
        if (currentThrows[i] !== null) {
            let displayValue = '';
            if (round.type === 'normal') {
                const points = round.number * currentThrows[i];
                displayValue = points > 0 ? points : 'Miss';
            } else if (round.type === 'bull') {
                if (currentThrows[i] === 0) displayValue = 'Miss';
                else if (currentThrows[i] === 1) displayValue = '25';
                else if (currentThrows[i] === 2) displayValue = '50';
            }
            valueDiv.textContent = displayValue;
            box.classList.add('filled');
        } else {
            valueDiv.textContent = '-';
            box.classList.remove('filled');
        }
        
        // Highlight active throw
        if (i === currentThrowIndex) {
            box.classList.add('active');
        } else {
            box.classList.remove('active');
        }
    }
    
    // Show confirm button when all throws are done
    const allFilled = currentThrows.every(t => t !== null);
    document.getElementById('confirmThrowsBtn').style.display = allFilled ? 'block' : 'none';
}

function addThrow(multiplier) {
    if (currentThrowIndex < 3) {
        currentThrows[currentThrowIndex] = multiplier;
        currentThrowIndex++;
        updateThrowDisplay();
    }
}

function selectThrowBox(throwIndex) {
    // Allow user to change a throw by clicking on it
    if (currentThrows[throwIndex] !== null) {
        currentThrowIndex = throwIndex;
        updateThrowDisplay();
    }
}

function confirmThrows() {
    // Get current player BEFORE processing throws
    const player = game.getCurrentPlayer();
    const round = game.getCurrentRound();
    const oldScore = player.score;
    
    let lastResult = null;
    let allMisses = true;
    
    // Process all throws for this player
    currentThrows.forEach(multiplier => {
        if (multiplier !== null) {
            if (multiplier > 0) {
                allMisses = false;
            }
            lastResult = game.processThrow(multiplier);
        }
    });
    
    // Check if player missed all throws - halve their score!
    if (allMisses && (round.type === 'normal' || round.type === 'bull')) {
        const newScore = Math.floor(oldScore / 2);
        player.score = newScore;
        showToast(`❌ Alle worpen gemist! Score gehalveerd: ${oldScore} → ${newScore}`, 'error');
    }
    
    // Check the result from the last throw
    // processThrow already calls nextPlayer after 3 throws
    if (lastResult && lastResult.gameOver) {
        showResults();
    } else if (lastResult && lastResult.nextRound) {
        updateGameScreen();
    } else if (lastResult && lastResult.nextPlayer) {
        updateGameScreen();
    } else {
        // Not done yet, just update display
        updateScoreboard();
        updateThrowDisplay();
    }
}

function handleThrow(multiplier) {
    const result = game.processThrow(multiplier);
    
    if (result.gameOver) {
        showResults();
    } else if (result.nextRound) {
        updateGameScreen();
    } else if (result.nextPlayer) {
        // Toon "volgende speler" knop
        document.getElementById('nextPlayerBtn').style.display = 'block';
    } else {
        // Update alleen scores
        updateScoreboard();
        document.getElementById('currentPlayerScore').textContent = game.getCurrentPlayer().score;
    }
}

function setupSpecialMissionInput() {
    const mission = game.getCurrentSpecialMission();
    document.getElementById('specialMissionText').textContent = mission.description;
    
    const container = document.getElementById('specialNumberInputs');
    container.innerHTML = '';
    
    // Maak 3 input vakjes voor de worpen
    for (let i = 0; i < 3; i++) {
        const div = document.createElement('div');
        div.className = 'special-number-box';
        div.innerHTML = `
            <div class="special-number-label">Worp ${i + 1}</div>
            <input type="number" 
                   id="specialNumber${i}" 
                   min="0" 
                   max="60" 
                   placeholder="0=miss" 
                   inputmode="numeric">
        `;
        container.appendChild(div);
    }
}

function getColorName(color) {
    const names = {
        'red': 'Rood',
        'green': 'Groen',
        'white': 'Wit',
        'black': 'Zwart'
    };
    return names[color];
}

function selectColor(throwIndex, color, buttonsContainer) {
    currentColorSequenceInput[throwIndex] = color;
    
    // Update visual selection
    buttonsContainer.querySelectorAll('.btn-color').forEach(btn => {
        btn.classList.remove('selected');
    });
    buttonsContainer.querySelector(`[data-color="${color}"]`).classList.add('selected');
}

function processSpecialResult(success) {
    const player = game.getCurrentPlayer();
    const oldScore = player.score;
    const mission = game.getCurrentSpecialMission();
    
    if (success) {
        // Valideer de worpen
        const throws = [];
        for (let i = 0; i < 3; i++) {
            const input = document.getElementById(`specialNumber${i}`);
            const value = parseInt(input.value) || 0;
            
            if (value < 0 || value > 60) {
                alert('❌ Vul geldige nummers in (0-60, 0=miss)!');
                return;
            }
            throws.push(value);
        }
        
        // Check of opdracht gelukt is
        const isValid = validateMission(mission, throws);
        
        if (!isValid) {
            alert('❌ Deze worpen voldoen niet aan de opdracht!');
            return;
        }
        
        // Add points: som van wat je daadwerkelijk gooit
        const totalPoints = throws.reduce((sum, num) => sum + num, 0);
        player.score += totalPoints;
    } else {
        // Failed - halve the score
        player.score = Math.floor(player.score / 2);
    }
    
    // Immediately go to next player/turn
    const result = game.nextPlayer();
    handleNextTurn(result);
}

function validateMission(mission, throws) {
    // throws = array van 3 nummers (0 = miss)
    
    switch(mission.type) {
        case 'color':
            // Minimaal 1 hit van die kleur
            const colorHits = throws.filter(t => t > 0 && isNumberColor(t, mission.color));
            return colorHits.length >= 1;
            
        case 'sequence':
            // Alle worpen moeten in de juiste volgorde en kleuren zijn (geen misses)
            for (let i = 0; i < 3; i++) {
                if (throws[i] === 0) return false; // Mag niet missen
                if (!isNumberColor(throws[i], mission.sequence[i])) return false;
            }
            return true;
            
        case 'doubles':
            // Tel aantal dubbels (even getallen 2-40)
            const doubles = throws.filter(t => t >= 2 && t <= 40 && t % 2 === 0 && isDartDouble(t));
            return doubles.length >= mission.count;
            
        case 'triples':
            // Tel aantal triples (deelbaar door 3, 3-60)
            const triples = throws.filter(t => t >= 3 && t <= 60 && t % 3 === 0 && isDartTriple(t));
            return triples.length >= mission.count;
            
        case 'specific_double':
            // Check of specifieke dubbel er is
            const targetDouble = mission.number * 2;
            return throws.includes(targetDouble);
            
        case 'specific_triple':
            // Check of specifieke triple er is
            const targetTriple = mission.number * 3;
            return throws.includes(targetTriple);
    }
    
    return false;
}

function isDartDouble(number) {
    // Dubbels zijn 2, 4, 6, ..., 40 (2x nummer 1-20)
    const base = number / 2;
    return number % 2 === 0 && base >= 1 && base <= 20;
}

function isDartTriple(number) {
    // Triples zijn 3, 6, 9, ..., 60 (3x nummer 1-20)
    const base = number / 3;
    return number % 3 === 0 && base >= 1 && base <= 20;
}

function isNumberColor(number, color) {
    // Dartbord kleuren volgens echte dartbord
    // Singles 1-20: wit = oneven, zwart = even
    // Dubbels/Triples: groen = van oneven nummers, rood = van even nummers
    
    const oddNumbers = [1, 3, 5, 7, 9, 11, 13, 15, 17, 19];
    const evenNumbers = [2, 4, 6, 8, 10, 12, 14, 16, 18, 20];
    
    // Bepaal wat voor worp het is
    if (number >= 1 && number <= 20) {
        // Single
        if (color === 'white') {
            return oddNumbers.includes(number);
        }
        if (color === 'black') {
            return evenNumbers.includes(number);
        }
    } else if (number >= 2 && number <= 40 && number % 2 === 0) {
        // Dubbel (2-40, even getallen)
        const baseNumber = number / 2;
        if (color === 'green') {
            return oddNumbers.includes(baseNumber);
        }
        if (color === 'red') {
            return evenNumbers.includes(baseNumber);
        }
    } else if (number >= 3 && number <= 60 && number % 3 === 0) {
        // Triple (3-60, deelbaar door 3)
        const baseNumber = number / 3;
        if (color === 'green') {
            return oddNumbers.includes(baseNumber);
        }
        if (color === 'red') {
            return evenNumbers.includes(baseNumber);
        }
    }
    
    return false;
}

function validateColorNumber(color, number) {
    // Dartboard color layout
    const redNumbers = [1, 3, 5, 7, 9, 11, 13, 15, 17, 19];
    const greenNumbers = [2, 4, 6, 8, 10, 12, 14, 16, 18, 20];
    const whiteNumbers = [6, 13, 4, 18, 1, 20, 5, 12, 9, 14]; // Outer single (even segments top)
    const blackNumbers = [10, 15, 2, 17, 3, 19, 7, 16, 8, 11]; // Outer single (odd segments top)
    
    // Simplified: Red and Green are the double/triple colors
    // White and Black are alternating single sections
    if (color === 'red') return redNumbers.includes(number);
    if (color === 'green') return greenNumbers.includes(number);
    if (color === 'white') return whiteNumbers.includes(number);
    if (color === 'black') return blackNumbers.includes(number);
    
    return falser.score;
    
    // Process the special mission (this halves score if failed)
    if (!success) {
        player.score = Math.floor(player.score / 2);
    }
    
    // Show message
    if (success) {
        alert('✅ Gelukt! Score blijft intact: ' + player.score);
    } else {
        alert(`❌ Mislukt! Score gehalveerd van ${oldScore} naar ${player.score}`);
    }
    
    // Update scoreboard to show new score
    updateScoreboard();
    
    // Move to next player
    const result = game.nextPlayer();
    handleNextTurn(result);
}

function validateColorNumber(color, number) {
    // Dartboard color layout
    const redNumbers = [1, 3, 5, 7, 9, 11, 13, 15, 17, 19];
    const greenNumbers = [2, 4, 6, 8, 10, 12, 14, 16, 18, 20];
    const whiteNumbers = [6, 13, 4, 18, 1, 20, 5, 12, 9, 14]; // Outer single (even segments top)
    const blackNumbers = [10, 15, 2, 17, 3, 19, 7, 16, 8, 11]; // Outer single (odd segments top)
    
    // Simplified: Red and Green are the double/triple colors
    // White and Black are alternating single sections
    if (color === 'red') return redNumbers.includes(number);
    if (color === 'green') return greenNumbers.includes(number);
    if (color === 'white') return whiteNumbers.includes(number);
    if (color === 'black') return blackNumbers.includes(number);
    
    return false;
}

function handleNextTurn(result) {
    if (result.gameOver) {
        showResults();
    } else {
        // Always update game screen immediately
        updateGameScreen();
    }
}

function continueToNextPlayer() {
    document.getElementById('nextPlayerBtn').style.display = 'none';
    updateGameScreen();
}

function showResults() {
    const results = game.getResults();
    const container = document.getElementById('finalScores');
    container.innerHTML = '';
    
    results.forEach((player, index) => {
        const div = document.createElement('div');
        div.className = 'final-player';
        if (index === 0) {
            div.classList.add('winner');
            div.innerHTML = `
                <span>🏆 ${player.name}</span>
                <span>${player.score} punten</span>
            `;
        } else {
            div.innerHTML = `
                <span>${index + 1}. ${player.name}</span>
                <span>${player.score} punten</span>
            `;
        }
        container.appendChild(div);
    });
    
    showScreen('resultsScreen');
}

function quitGame() {
    if (confirm('Weet je zeker dat je wilt stoppen?')) {
        game.reset();
        showScreen('gameSelectionScreen');
    }
}

function showScoreModal() {
    const modal = document.getElementById('scoreModal');
    const container = document.getElementById('scoreOverview');
    
    // Get current standings sorted by score
    const sortedPlayers = [...game.players].sort((a, b) => b.score - a.score);
    
    container.innerHTML = '';
    sortedPlayers.forEach((player, index) => {
        const div = document.createElement('div');
        div.className = 'player-score';
        
        let position = '';
        if (index === 0) position = '🥇 ';
        else if (index === 1) position = '🥈 ';
        else if (index === 2) position = '🥉 ';
        else position = `${index + 1}. `;
        
        div.innerHTML = `
            <span class="player-name">${position}${player.name}</span>
            <span class="score">${player.score}</span>
        `;
        container.appendChild(div);
    });
    
    modal.classList.add('active');
}

function closeScoreModal() {
    document.getElementById('scoreModal').classList.remove('active');
}

function showRulesModal() {
    document.getElementById('rulesModal').classList.add('active');
}

function closeRulesModal() {
    document.getElementById('rulesModal').classList.remove('active');
}

function showToast(message, type = 'info') {
    // Remove existing toast if any
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }
    
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    // Trigger animation
    setTimeout(() => toast.classList.add('show'), 10);
    
    // Remove after delay
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}
