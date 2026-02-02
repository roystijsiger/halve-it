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
    document.getElementById('showHighscoresBtn').addEventListener('click', showHighscores);
    document.getElementById('closeHighscoresBtn').addEventListener('click', closeHighscores);
    
    // Reset buttons
    document.getElementById('resetHighscoresBtn').addEventListener('click', resetHighscores);
    document.getElementById('resetNamesBtn').addEventListener('click', resetPlayerNames);
    
    // Close highscores modal when clicking outside
    document.getElementById('highscoreModal').addEventListener('click', (e) => {
        if (e.target.id === 'highscoreModal') {
            closeHighscores();
        }
    });
    
    // Setup screen
    document.getElementById('playerCount').addEventListener('input', updatePlayerNameInputs);
    document.getElementById('startGameBtn').addEventListener('click', showMissionPreview);
    document.getElementById('showRulesBtn').addEventListener('click', showRulesModal);
    document.getElementById('closeRulesBtn').addEventListener('click', closeRulesModal);
    
    // Mission preview screen
    document.getElementById('backToSetupBtn').addEventListener('click', backToSetup);
    document.getElementById('regenerateMissionsBtn').addEventListener('click', regenerateMissions);
    document.getElementById('confirmMissionsBtn').addEventListener('click', startGame);
    
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

function showMissionPreview() {
    const count = parseInt(document.getElementById('playerCount').value);
    const playerNames = [];
    
    for (let i = 1; i <= count; i++) {
        let name = '';
        const select = document.getElementById(`player${i}Select`);
        const input = document.getElementById(`player${i}Name`);
        
        if (select) {
            if (select.value === '__new__' || select.value === '') {
                name = input ? input.value.trim() : '';
                if (!name) name = `Speler ${i}`;
            } else {
                name = select.value;
            }
        } else if (input) {
            name = input.value.trim() || `Speler ${i}`;
        } else {
            name = `Speler ${i}`;
        }
        
        playerNames.push(name);
    }
    
    const difficulty = document.getElementById('difficulty').value;
    
    // Initialiseer het spel tijdelijk om opdrachten te genereren
    game.initGame(playerNames, difficulty);
    
    // Toon de opdrachten
    displayMissionPreview();
    
    // Ga naar preview scherm
    showScreen('missionPreviewScreen');
}

function displayMissionPreview() {
    const missions = game.specialMissions;
    
    document.getElementById('mission1Preview').textContent = formatMissionText(missions[0]);
    document.getElementById('mission2Preview').textContent = formatMissionText(missions[1]);
    document.getElementById('mission3Preview').textContent = formatMissionText(missions[2]);
}

function formatMissionText(mission) {
    switch(mission.type) {
        case 'odd':
            return `Gooi alleen oneven nummers (1,3,5,7,9,11,13,15,17,19)`;
        case 'even':
            return `Gooi alleen even nummers (2,4,6,8,10,12,14,16,18,20)`;
        case 'color':
            const colorNames = { white: 'wit', black: 'zwart', green: 'groen', red: 'rood' };
            return `Gooi minimaal 1x ${colorNames[mission.color]}`;
        case 'sequence':
            const colors = mission.sequence.map(c => {
                const names = { white: 'wit', black: 'zwart', green: 'groen', red: 'rood' };
                return names[c];
            });
            return `Gooi in volgorde: ${colors.join(' → ')}`;
        case 'doubles':
            return `Gooi ${mission.count} dubbel${mission.count > 1 ? 's' : ''}`;
        case 'triples':
            return `Gooi ${mission.count} triple${mission.count > 1 ? 's' : ''}`;
        case 'specific_double':
            return `Gooi dubbel ${mission.number}`;
        case 'specific_triple':
            return `Gooi triple ${mission.number}`;
        case 'total_score':
            return `Gooi precies ${mission.target} punten`;
        case 'ascending':
            return `Gooi oplopend (elke worp hoger dan vorige)`;
        case 'descending':
            return `Gooi aflopend (elke worp lager dan vorige)`;
        default:
            return mission.name || 'Onbekende opdracht';
    }
}

function regenerateMissions() {
    // Genereer nieuwe opdrachten
    game.generateSpecialMissions();
    
    // Update de preview
    displayMissionPreview();
    
    // Toon toast
    showToast('🔄 Nieuwe opdrachten gegenereerd!', 'info');
}

function backToSetup() {
    showScreen('setupScreen');
}

function startGame() {
    // Game is al geinitialiseerd in showMissionPreview
    // Spelersnamen opslaan
    const playerNames = game.players.map(p => p.name);
    playerNames.forEach(name => {
        if (name && !name.startsWith('Speler ')) {
            savePlayerName(name);
        }
    });
    
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
        roundTitle = `Ronde ${game.currentRoundIndex + 1}`;
    } else if (round.type === 'special') {
        roundTitle = round.name;
    } else if (round.type === 'bull') {
        roundTitle = 'Ronde 15';
    }
    document.getElementById('currentRoundTitle').textContent = roundTitle;
    
    // Update mission displays
    const specialMissionDiv = document.getElementById('specialMission');
    const normalMissionDiv = document.getElementById('normalMission');
    
    if (round.type === 'special') {
        const mission = game.getCurrentSpecialMission();
        specialMissionDiv.textContent = `🎯 ${mission.description}`;
        specialMissionDiv.classList.remove('hidden');
        normalMissionDiv.classList.add('hidden');
    } else if (round.type === 'normal') {
        normalMissionDiv.textContent = `🎯 Gooi ${round.number}`;
        normalMissionDiv.classList.remove('hidden');
        specialMissionDiv.classList.add('hidden');
    } else if (round.type === 'bull') {
        normalMissionDiv.textContent = `🎯 Bull & Double Bull`;
        normalMissionDiv.classList.remove('hidden');
        specialMissionDiv.classList.add('hidden');
    }
    
    // Update throw buttons voor bull ronde
    const throwButtonsContainer = document.querySelector('.throw-buttons');
    if (round.type === 'bull') {
        throwButtonsContainer.innerHTML = `
            <button class="btn-throw" data-value="0">Miss</button>
            <button class="btn-throw" data-value="25">Bull</button>
            <button class="btn-throw" data-value="50">D-Bull</button>
        `;
        // Re-attach event listeners
        throwButtonsContainer.querySelectorAll('.btn-throw').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const value = parseInt(e.target.getAttribute('data-value'));
                addThrow(value);
            });
        });
    } else if (round.type === 'normal') {
        throwButtonsContainer.innerHTML = `
            <button class="btn-throw" data-value="0">Miss</button>
            <button class="btn-throw" data-value="1">Single</button>
            <button class="btn-throw" data-value="2">Double</button>
            <button class="btn-throw" data-value="3">Triple</button>
        `;
        // Re-attach event listeners
        throwButtonsContainer.querySelectorAll('.btn-throw').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const value = parseInt(e.target.getAttribute('data-value'));
                addThrow(value);
            });
        });
    }
    
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
    
    // Update next round preview
    updateNextRoundPreview();
}

function updateNextRoundPreview() {
    const nextRoundPreview = document.getElementById('nextRoundPreview');
    const nextRoundInfo = document.getElementById('nextRoundInfo');
    
    // Check if there is a next round
    if (game.currentRoundIndex < game.rounds.length - 1) {
        const nextRound = game.rounds[game.currentRoundIndex + 1];
        let nextRoundText = '';
        
        if (nextRound.type === 'normal') {
            nextRoundText = `Ronde ${game.currentRoundIndex + 2}: Gooi ${nextRound.number}`;
        } else if (nextRound.type === 'special') {
            const nextMissionIndex = game.specialMissions.findIndex(m => 
                m.round === game.currentRoundIndex + 1
            );
            if (nextMissionIndex !== -1) {
                const mission = game.specialMissions[nextMissionIndex];
                nextRoundText = `${mission.name}: ${mission.description}`;
            } else {
                nextRoundText = nextRound.name;
            }
        } else if (nextRound.type === 'bull') {
            nextRoundText = 'Bull Ronde: Gooi Bull (25) of Double Bull (50)';
        }
        
        nextRoundInfo.textContent = nextRoundText;
        nextRoundPreview.classList.remove('hidden');
    } else {
        nextRoundPreview.classList.add('hidden');
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
                else if (currentThrows[i] === 25) displayValue = '25';
                else if (currentThrows[i] === 50) displayValue = '50';
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
    
    // Process all throws for this player (null = miss)
    currentThrows.forEach(multiplier => {
        // Behandel null als 0 (miss)
        const throwValue = multiplier !== null ? multiplier : 0;
        if (throwValue > 0) {
            allMisses = false;
        }
        lastResult = game.processThrow(throwValue);
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
    
    const container = document.getElementById('specialNumberInputs');
    container.innerHTML = '';
    
    // Array to store throw values
    window.specialThrows = [null, null, null];
    
    // Container voor 3 worpen naast elkaar
    const throwsContainer = document.createElement('div');
    throwsContainer.className = 'special-throws-grid';
    
    // Maak 3 display vakken
    for (let i = 0; i < 3; i++) {
        const div = document.createElement('div');
        div.className = 'special-throw-box';
        div.innerHTML = `
            <div class="special-throw-label">Worp ${i + 1}</div>
            <div class="special-throw-display" id="specialDisplay${i}" data-throw="${i}">-</div>
        `;
        throwsContainer.appendChild(div);
    }
    
    container.appendChild(throwsContainer);
    
    // Add click listeners to open keyboard modal
    document.querySelectorAll('.special-throw-display').forEach(display => {
        display.addEventListener('click', (e) => {
            const throwIndex = parseInt(e.target.getAttribute('data-throw'));
            showSpecialKeyboard(mission, throwIndex);
        });
    });
}

function showSpecialKeyboard(mission, throwIndex) {
    // Bepaal welke worpen nog ingevuld moeten worden
    const emptyThrows = [];
    for (let i = 0; i < 3; i++) {
        if (window.specialThrows[i] === null) {
            emptyThrows.push(i + 1);
        }
    }
    
    let remainingText = '';
    
    // Voor total_score: bereken restant en check haalbaarheid
    if (mission.type === 'total_score') {
        const currentTotal = window.specialThrows.reduce((sum, t) => sum + ((t && t.points) || 0), 0);
        const remaining = mission.target - currentTotal;
        const throwsLeft = window.specialThrows.filter(t => t === null).length;
        
        if (remaining <= 0) {
            remainingText = `✅ Doel bereikt: ${currentTotal} punten`;
        } else if (!isPossibleScore(remaining, throwsLeft)) {
            remainingText = `❌ ONMOGELIJK! ${remaining} is niet haalbaar met ${throwsLeft} ${throwsLeft === 1 ? 'pijl' : 'pijlen'}`;
        } else {
            remainingText = `🎯 Nog ${remaining} punten over (${throwsLeft} ${throwsLeft === 1 ? 'pijl' : 'pijlen'} over)`;
        }
    } else {
        // Voor andere opdrachten: toon welke worpen nog ingevuld moeten
        remainingText = emptyThrows.length > 0 
            ? `Nog in te vullen: Worp ${emptyThrows.join(', ')}` 
            : 'Alle worpen ingevuld!';
    }
    
    // Create modal
    const modal = document.createElement('div');
    modal.className = 'keyboard-modal active';
    modal.innerHTML = `
        <div class="keyboard-modal-content">
            <div class="keyboard-modal-header">
                <h3>Worp ${throwIndex + 1}</h3>
                <button class="btn-close" onclick="closeSpecialKeyboard()">✕</button>
            </div>
            <div style="padding: 10px 20px; background: rgba(255,255,255,0.1); text-align: center; font-size: 0.9em; color: #FFD700;">
                ${remainingText}
            </div>
            <div class="keyboard-modal-body">
                ${generateKeyboardHTML(mission, throwIndex)}
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add event listeners to ALL keyboard buttons
    modal.querySelectorAll('.special-key, .keyboard-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const value = parseInt(e.target.getAttribute('data-value'));
            const label = e.target.getAttribute('data-label') || e.target.textContent.trim();
            
            // Parse number and multiplier from label and value
            let number = 0;
            let multiplier = 1;
            
            if (value === 0 || label === 'Miss') {
                number = 0;
                multiplier = 0;
            } else if (label.startsWith('D')) {
                // Double
                number = value / 2;
                multiplier = 2;
            } else if (label.startsWith('T')) {
                // Triple
                number = value / 3;
                multiplier = 3;
            } else {
                // Single
                number = value;
                multiplier = 1;
            }
            
            // Store full throw data
            window.specialThrows[throwIndex] = {
                number: number,
                multiplier: multiplier,
                points: value
            };
            document.getElementById(`specialDisplay${throwIndex}`).textContent = label;
            
            // Sluit popup meteen
            closeSpecialKeyboard();
            
            // Check if all throws are filled
            checkAllThrowsFilled();
        });
    });
    
    // Close on background click
    modal.addEventListener('click', (e) => {
        if (e.target.classList.contains('keyboard-modal')) {
            closeSpecialKeyboard();
        }
    });
}

function isPossibleScore(remaining, throwsLeft) {
    if (throwsLeft === 0) return remaining === 0;
    if (remaining < 0) return false;
    if (remaining > throwsLeft * 60) return false; // Max is T20 per worp
    
    // Alle mogelijke single throw waarden op dartboard
    const possibleThrows = new Set();
    possibleThrows.add(0); // Miss
    for (let i = 1; i <= 20; i++) possibleThrows.add(i); // Singles 1-20
    for (let i = 1; i <= 20; i++) possibleThrows.add(i * 2); // Doubles 2,4,6...40
    for (let i = 1; i <= 20; i++) possibleThrows.add(i * 3); // Triples 3,6,9...60
    possibleThrows.add(25); // Bull
    possibleThrows.add(50); // D-Bull
    
    if (throwsLeft === 1) {
        // Check of exact die waarde kan worden gegooid
        return possibleThrows.has(remaining);
    }
    
    if (throwsLeft === 2) {
        // Check of er een combinatie van 2 worpen bestaat
        for (let throw1 of possibleThrows) {
            const throw2 = remaining - throw1;
            if (possibleThrows.has(throw2)) {
                return true;
            }
        }
        return false;
    }
    
    // Voor 3 pijlen: bijna alles 0-180 is mogelijk, behalve een paar hoge scores
    // Onmogelijke scores met 3 darts: 172, 173, 175, 176, 178, 179
    const impossible3Darts = new Set([172, 173, 175, 176, 178, 179]);
    if (impossible3Darts.has(remaining)) return false;
    
    // Alle andere scores 0-180 zijn mogelijk met 3 darts
    return remaining >= 0 && remaining <= 180;
}

function closeSpecialKeyboard() {
    const modal = document.querySelector('.keyboard-modal');
    if (modal) {
        modal.remove();
    }
}

function generateKeyboardHTML(mission, throwIndex) {
    let keys = [];
    
    // Helper functies voor kleuren
    const whiteSingles = [1, 4, 5, 6, 9, 11, 15, 16, 17, 19];
    const greenDoubleTriple = [1, 4, 5, 6, 9, 11, 15, 16, 17, 19];
    
    const getSingleColor = (n) => whiteSingles.includes(n) ? '#ddd' : '#333';
    const getSingleTextColor = (n) => whiteSingles.includes(n) ? '#000' : '#fff';
    const getDoubleTripleColor = (n) => greenDoubleTriple.includes(n) ? '#4CAF50' : '#f44336';
    
    switch(mission.type) {
        case 'odd':
            // Oneven: links 1-9, rechts 11-19 in 3 kolommen (1 D1 T1 | 11 D11 T11)
            let htmlOdd = '<div style="display: flex; flex-direction: column; gap: 5px; padding: 10px;">';
            const oddLeft = [1,3,5,7,9];
            const oddRight = [11,13,15,17,19];
            
            // Maak rijen met links en rechts
            for (let i = 0; i < Math.max(oddLeft.length, oddRight.length); i++) {
                htmlOdd += '<div style="display: grid; grid-template-columns: repeat(6, 1fr); gap: 5px;">';
                if (i < oddLeft.length) {
                    htmlOdd += `<button class="keyboard-btn" data-value="${oddLeft[i]}" style="background: ${getSingleColor(oddLeft[i])}; color: ${getSingleTextColor(oddLeft[i])}">${oddLeft[i]}</button>`;
                    htmlOdd += `<button class="keyboard-btn" data-value="${oddLeft[i]*2}" style="background: ${getDoubleTripleColor(oddLeft[i])};">D${oddLeft[i]}</button>`;
                    htmlOdd += `<button class="keyboard-btn" data-value="${oddLeft[i]*3}" style="background: ${getDoubleTripleColor(oddLeft[i])};">T${oddLeft[i]}</button>`;
                } else {
                    htmlOdd += '<div></div><div></div><div></div>';
                }
                if (i < oddRight.length) {
                    htmlOdd += `<button class="keyboard-btn" data-value="${oddRight[i]}" style="background: ${getSingleColor(oddRight[i])}; color: ${getSingleTextColor(oddRight[i])}">${oddRight[i]}</button>`;
                    htmlOdd += `<button class="keyboard-btn" data-value="${oddRight[i]*2}" style="background: ${getDoubleTripleColor(oddRight[i])};">D${oddRight[i]}</button>`;
                    htmlOdd += `<button class="keyboard-btn" data-value="${oddRight[i]*3}" style="background: ${getDoubleTripleColor(oddRight[i])};">T${oddRight[i]}</button>`;
                } else {
                    htmlOdd += '<div></div><div></div><div></div>';
                }
                htmlOdd += '</div>';
            }
            
            // Miss knop onderaan
            htmlOdd += '<div style="display: flex; justify-content: center; margin-top: 10px;">';
            htmlOdd += '<button class="keyboard-btn" data-value="0" style="background: #666;">Miss</button>';
            htmlOdd += '</div></div>';
            return htmlOdd;
            
        case 'even':
            // Even: links 2-10, rechts 12-20 in 3 kolommen (2 D2 T2 | 12 D12 T12)
            let htmlEven = '<div style="display: flex; flex-direction: column; gap: 5px; padding: 10px;">';
            const evenLeft = [2,4,6,8,10];
            const evenRight = [12,14,16,18,20];
            
            // Maak rijen met links en rechts
            for (let i = 0; i < Math.max(evenLeft.length, evenRight.length); i++) {
                htmlEven += '<div style="display: grid; grid-template-columns: repeat(6, 1fr); gap: 5px;">';
                if (i < evenLeft.length) {
                    htmlEven += `<button class="keyboard-btn" data-value="${evenLeft[i]}" style="background: ${getSingleColor(evenLeft[i])}; color: ${getSingleTextColor(evenLeft[i])}">${evenLeft[i]}</button>`;
                    htmlEven += `<button class="keyboard-btn" data-value="${evenLeft[i]*2}" style="background: ${getDoubleTripleColor(evenLeft[i])};">D${evenLeft[i]}</button>`;
                    htmlEven += `<button class="keyboard-btn" data-value="${evenLeft[i]*3}" style="background: ${getDoubleTripleColor(evenLeft[i])};">T${evenLeft[i]}</button>`;
                } else {
                    htmlEven += '<div></div><div></div><div></div>';
                }
                if (i < evenRight.length) {
                    htmlEven += `<button class="keyboard-btn" data-value="${evenRight[i]}" style="background: ${getSingleColor(evenRight[i])}; color: ${getSingleTextColor(evenRight[i])}">${evenRight[i]}</button>`;
                    htmlEven += `<button class="keyboard-btn" data-value="${evenRight[i]*2}" style="background: ${getDoubleTripleColor(evenRight[i])};">D${evenRight[i]}</button>`;
                    htmlEven += `<button class="keyboard-btn" data-value="${evenRight[i]*3}" style="background: ${getDoubleTripleColor(evenRight[i])};">T${evenRight[i]}</button>`;
                } else {
                    htmlEven += '<div></div><div></div><div></div>';
                }
                htmlEven += '</div>';
            }
            
            // Miss knop onderaan
            htmlEven += '<div style="display: flex; justify-content: center; margin-top: 10px;">';
            htmlEven += '<button class="keyboard-btn" data-value="0" style="background: #666;">Miss</button>';
            htmlEven += '</div></div>';
            return htmlEven;
            
        case 'total_score':
            // Compact layout: 6 kolommen (1 D1 T1 10 D10 T10) met kleuren
            let html = '<div style="display: flex; flex-direction: column; gap: 5px; padding: 10px;">';
            
            // Nummers 1-20 in 6 kolommen: links 1-10, rechts 11-20 (1 D1 T1 11 D11 T11), etc.
            for (let n = 1; n <= 10; n++) {
                html += '<div style="display: grid; grid-template-columns: repeat(6, 1fr); gap: 5px;">';
                html += `<button class="keyboard-btn" data-value="${n}" style="background: ${getSingleColor(n)}; color: ${getSingleTextColor(n)}">${n}</button>`;
                html += `<button class="keyboard-btn" data-value="${n*2}" style="background: ${getDoubleTripleColor(n)};">D${n}</button>`;
                html += `<button class="keyboard-btn" data-value="${n*3}" style="background: ${getDoubleTripleColor(n)};">T${n}</button>`;
                html += `<button class="keyboard-btn" data-value="${n+10}" style="background: ${getSingleColor(n+10)}; color: ${getSingleTextColor(n+10)}">${n+10}</button>`;
                html += `<button class="keyboard-btn" data-value="${(n+10)*2}" style="background: ${getDoubleTripleColor(n+10)};">D${n+10}</button>`;
                html += `<button class="keyboard-btn" data-value="${(n+10)*3}" style="background: ${getDoubleTripleColor(n+10)};">T${n+10}</button>`;
                html += '</div>';
            }
            
            // Bull, Miss en D-Bull op 1 rij
            html += '<div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 5px; margin-top: 5px;">';
            html += '<button class="keyboard-btn" data-value="25" style="background: #4CAF50;">Bull</button>';
            html += '<button class="keyboard-btn" data-value="0" style="background: #666;">Miss</button>';
            html += '<button class="keyboard-btn" data-value="50" style="background: #f44336;">D-Bull</button>';
            html += '</div>';
            
            html += '</div>';
            return html;
        
        case 'color':
            if (mission.color === 'white') {
                // Wit singles: links 1-10, rechts 11-20
                let htmlWhite = '<div style="display: flex; flex-direction: column; gap: 5px; padding: 10px;">';
                const whiteLeft = [1,4,5,6,9];  // 1-10
                const whiteRight = [11,15,16,17,19];  // 11-20
                
                for (let i = 0; i < Math.max(whiteLeft.length, whiteRight.length); i++) {
                    htmlWhite += '<div style="display: grid; grid-template-columns: repeat(6, 1fr); gap: 5px;">';
                    if (i < whiteLeft.length) {
                        htmlWhite += `<button class="keyboard-btn" data-value="${whiteLeft[i]}" style="background: #ddd; color: #000;">${whiteLeft[i]}</button>`;
                    } else {
                        htmlWhite += '<div></div>';
                    }
                    htmlWhite += '<div style="grid-column: span 2;"></div>';
                    if (i < whiteRight.length) {
                        htmlWhite += `<button class="keyboard-btn" data-value="${whiteRight[i]}" style="background: #ddd; color: #000;">${whiteRight[i]}</button>`;
                    } else {
                        htmlWhite += '<div></div>';
                    }
                    htmlWhite += '<div style="grid-column: span 2;"></div>';
                    htmlWhite += '</div>';
                }
                
                htmlWhite += '<div style="display: flex; justify-content: center; margin-top: 10px;">';
                htmlWhite += '<button class="keyboard-btn" data-value="0" style="background: #666;">Miss</button>';
                htmlWhite += '</div></div>';
                return htmlWhite;
            } else if (mission.color === 'black') {
                // Zwart singles: links 1-10, rechts 11-20
                let htmlBlack = '<div style="display: flex; flex-direction: column; gap: 5px; padding: 10px;">';
                const blackLeft = [2,3,7,8,10];  // 1-10
                const blackRight = [12,13,14,18,20];  // 11-20
                
                for (let i = 0; i < Math.max(blackLeft.length, blackRight.length); i++) {
                    htmlBlack += '<div style="display: grid; grid-template-columns: repeat(6, 1fr); gap: 5px;">';
                    if (i < blackLeft.length) {
                        htmlBlack += `<button class="keyboard-btn" data-value="${blackLeft[i]}" style="background: #333; color: #fff;">${blackLeft[i]}</button>`;
                    } else {
                        htmlBlack += '<div></div>';
                    }
                    htmlBlack += '<div style="grid-column: span 2;"></div>';
                    if (i < blackRight.length) {
                        htmlBlack += `<button class="keyboard-btn" data-value="${blackRight[i]}" style="background: #333; color: #fff;">${blackRight[i]}</button>`;
                    } else {
                        htmlBlack += '<div></div>';
                    }
                    htmlBlack += '<div style="grid-column: span 2;"></div>';
                    htmlBlack += '</div>';
                }
                
                htmlBlack += '<div style="display: flex; justify-content: center; margin-top: 10px;">';
                htmlBlack += '<button class="keyboard-btn" data-value="0" style="background: #666;">Miss</button>';
                htmlBlack += '</div></div>';
                return htmlBlack;
            } else if (mission.color === 'green') {
                // Groen: doubles/triples links 1-9, rechts 11-19
                let html = '<div style="display: flex; flex-direction: column; gap: 5px; padding: 10px;">';
                const greenLeft = [1, 4, 5, 6, 9];
                const greenRight = [11, 15, 16, 17, 19];
                
                for (let i = 0; i < Math.max(greenLeft.length, greenRight.length); i++) {
                    html += '<div style="display: grid; grid-template-columns: repeat(6, 1fr); gap: 5px;">';
                    if (i < greenLeft.length) {
                        html += `<button class="keyboard-btn" data-value="${greenLeft[i]*2}" style="background: #4CAF50;">D${greenLeft[i]}</button>`;
                        html += `<button class="keyboard-btn" data-value="${greenLeft[i]*3}" style="background: #4CAF50;">T${greenLeft[i]}</button>`;
                    } else {
                        html += '<div></div><div></div>';
                    }
                    html += '<div></div>';
                    if (i < greenRight.length) {
                        html += `<button class="keyboard-btn" data-value="${greenRight[i]*2}" style="background: #4CAF50;">D${greenRight[i]}</button>`;
                        html += `<button class="keyboard-btn" data-value="${greenRight[i]*3}" style="background: #4CAF50;">T${greenRight[i]}</button>`;
                    } else {
                        html += '<div></div><div></div>';
                    }
                    html += '<div></div>';
                    html += '</div>';
                }
                
                // Bull en Miss
                html += '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 5px; margin-top: 10px;">';
                html += '<button class="keyboard-btn" data-value="25" style="background: #4CAF50;">Bull</button>';
                html += '<button class="keyboard-btn" data-value="0" style="background: #666;">Miss</button>';
                html += '</div></div>';
                return html;
            } else if (mission.color === 'red') {
                // Rood: doubles/triples links 2-10, rechts 12-20
                let html = '<div style="display: flex; flex-direction: column; gap: 5px; padding: 10px;">';
                const redLeft = [2, 3, 7, 8, 10];
                const redRight = [12, 13, 14, 18, 20];
                
                for (let i = 0; i < Math.max(redLeft.length, redRight.length); i++) {
                    html += '<div style="display: grid; grid-template-columns: repeat(6, 1fr); gap: 5px;">';
                    if (i < redLeft.length) {
                        html += `<button class="keyboard-btn" data-value="${redLeft[i]*2}" style="background: #f44336;">D${redLeft[i]}</button>`;
                        html += `<button class="keyboard-btn" data-value="${redLeft[i]*3}" style="background: #f44336;">T${redLeft[i]}</button>`;
                    } else {
                        html += '<div></div><div></div>';
                    }
                    html += '<div></div>';
                    if (i < redRight.length) {
                        html += `<button class="keyboard-btn" data-value="${redRight[i]*2}" style="background: #f44336;">D${redRight[i]}</button>`;
                        html += `<button class="keyboard-btn" data-value="${redRight[i]*3}" style="background: #f44336;">T${redRight[i]}</button>`;
                    } else {
                        html += '<div></div><div></div>';
                    }
                    html += '<div></div>';
                    html += '</div>';
                }
                
                // D-Bull en Miss
                html += '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 5px; margin-top: 10px;">';
                html += '<button class="keyboard-btn" data-value="50" style="background: #f44336;">D-Bull</button>';
                html += '<button class="keyboard-btn" data-value="0" style="background: #666;">Miss</button>';
                html += '</div></div>';
                return html;
            }
            break;
            
        case 'sequence':
            const color = mission.sequence[throwIndex];
            if (color === 'white') {
                // Wit singles: links 1-10, rechts 11-20
                let htmlWhite = '<div style="display: flex; flex-direction: column; gap: 5px; padding: 10px;">';
                const whiteLeft = [1,4,5,6,9];  // 1-10
                const whiteRight = [11,15,16,17,19];  // 11-20
                
                for (let i = 0; i < Math.max(whiteLeft.length, whiteRight.length); i++) {
                    htmlWhite += '<div style="display: grid; grid-template-columns: repeat(6, 1fr); gap: 5px;">';
                    if (i < whiteLeft.length) {
                        htmlWhite += `<button class="keyboard-btn" data-value="${whiteLeft[i]}">${whiteLeft[i]}</button>`;
                    } else {
                        htmlWhite += '<div></div>';
                    }
                    htmlWhite += '<div style="grid-column: span 2;"></div>';
                    if (i < whiteRight.length) {
                        htmlWhite += `<button class="keyboard-btn" data-value="${whiteRight[i]}">${whiteRight[i]}</button>`;
                    } else {
                        htmlWhite += '<div></div>';
                    }
                    htmlWhite += '<div style="grid-column: span 2;"></div>';
                    htmlWhite += '</div>';
                }
                
                htmlWhite += '<div style="display: flex; justify-content: center; margin-top: 10px;">';
                htmlWhite += '<button class="keyboard-btn" data-value="0" style="background: #666;">Miss</button>';
                htmlWhite += '</div></div>';
                return htmlWhite;
            } else if (color === 'black') {
                // Zwart singles: links 1-10, rechts 11-20
                let htmlBlack = '<div style="display: flex; flex-direction: column; gap: 5px; padding: 10px;">';
                const blackLeft = [2,3,7,8,10];  // 1-10
                const blackRight = [12,13,14,18,20];  // 11-20
                
                for (let i = 0; i < Math.max(blackLeft.length, blackRight.length); i++) {
                    htmlBlack += '<div style="display: grid; grid-template-columns: repeat(6, 1fr); gap: 5px;">';
                    if (i < blackLeft.length) {
                        htmlBlack += `<button class="keyboard-btn" data-value="${blackLeft[i]}">${blackLeft[i]}</button>`;
                    } else {
                        htmlBlack += '<div></div>';
                    }
                    htmlBlack += '<div style="grid-column: span 2;"></div>';
                    if (i < blackRight.length) {
                        htmlBlack += `<button class="keyboard-btn" data-value="${blackRight[i]}">${blackRight[i]}</button>`;
                    } else {
                        htmlBlack += '<div></div>';
                    }
                    htmlBlack += '<div style="grid-column: span 2;"></div>';
                    htmlBlack += '</div>';
                }
                
                htmlBlack += '<div style="display: flex; justify-content: center; margin-top: 10px;">';
                htmlBlack += '<button class="keyboard-btn" data-value="0" style="background: #666;">Miss</button>';
                htmlBlack += '</div></div>';
                return htmlBlack;
            } else if (color === 'green') {
                // Groen: doubles/triples links 1-9, rechts 11-19
                let html = '<div style="display: flex; flex-direction: column; gap: 5px; padding: 10px;">';
                const greenLeft = [1, 4, 5, 6, 9];
                const greenRight = [11, 15, 16, 17, 19];
                
                for (let i = 0; i < Math.max(greenLeft.length, greenRight.length); i++) {
                    html += '<div style="display: grid; grid-template-columns: repeat(6, 1fr); gap: 5px;">';
                    if (i < greenLeft.length) {
                        html += `<button class="keyboard-btn" data-value="${greenLeft[i]*2}" style="background: #4CAF50;">D${greenLeft[i]}</button>`;
                        html += `<button class="keyboard-btn" data-value="${greenLeft[i]*3}" style="background: #4CAF50;">T${greenLeft[i]}</button>`;
                    } else {
                        html += '<div></div><div></div>';
                    }
                    html += '<div></div><div></div>';
                    if (i < greenRight.length) {
                        html += `<button class="keyboard-btn" data-value="${greenRight[i]*2}" style="background: #4CAF50;">D${greenRight[i]}</button>`;
                        html += `<button class="keyboard-btn" data-value="${greenRight[i]*3}" style="background: #4CAF50;">T${greenRight[i]}</button>`;
                    } else {
                        html += '<div></div><div></div>';
                    }
                    html += '</div>';
                }
                
                // Bull en Miss
                html += '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 5px; margin-top: 10px;">';
                html += '<button class="keyboard-btn" data-value="25" style="background: #4CAF50;">Bull</button>';
                html += '<button class="keyboard-btn" data-value="0" style="background: #666;">Miss</button>';
                html += '</div></div>';
                return html;
            } else if (color === 'red') {
                // Rood: doubles/triples links 2-10, rechts 12-20
                let html = '<div style="display: flex; flex-direction: column; gap: 5px; padding: 10px;">';
                const redLeft = [2, 3, 7, 8, 10];
                const redRight = [12, 13, 14, 18, 20];
                
                for (let i = 0; i < Math.max(redLeft.length, redRight.length); i++) {
                    html += '<div style="display: grid; grid-template-columns: repeat(6, 1fr); gap: 5px;">';
                    if (i < redLeft.length) {
                        html += `<button class="keyboard-btn" data-value="${redLeft[i]*2}" style="background: #f44336;">D${redLeft[i]}</button>`;
                        html += `<button class="keyboard-btn" data-value="${redLeft[i]*3}" style="background: #f44336;">T${redLeft[i]}</button>`;
                    } else {
                        html += '<div></div><div></div>';
                    }
                    html += '<div></div><div></div>';
                    if (i < redRight.length) {
                        html += `<button class="keyboard-btn" data-value="${redRight[i]*2}" style="background: #f44336;">D${redRight[i]}</button>`;
                        html += `<button class="keyboard-btn" data-value="${redRight[i]*3}" style="background: #f44336;">T${redRight[i]}</button>`;
                    } else {
                        html += '<div></div><div></div>';
                    }
                    html += '</div>';
                }
                
                // D-Bull en Miss
                html += '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 5px; margin-top: 10px;">';
                html += '<button class="keyboard-btn" data-value="50" style="background: #f44336;">D-Bull</button>';
                html += '<button class="keyboard-btn" data-value="0" style="background: #666;">Miss</button>';
                html += '</div></div>';
                return html;
            }
            break;
            
        case 'doubles':
        case 'specific_double':
            // Doubles: links D1-D10, rechts D11-D20 met kleuren
            let htmlDoubles = '<div style="display: flex; flex-direction: column; gap: 5px; padding: 10px;">';
            
            for (let n = 1; n <= 10; n++) {
                htmlDoubles += '<div style="display: grid; grid-template-columns: repeat(6, 1fr); gap: 5px;">';
                // Links: Dn
                htmlDoubles += `<button class="keyboard-btn" data-value="${n*2}" style="background: ${getDoubleTripleColor(n)};">D${n}</button>`;
                htmlDoubles += '<div></div><div></div>';
                // Rechts: D(n+10)
                htmlDoubles += `<button class="keyboard-btn" data-value="${(n+10)*2}" style="background: ${getDoubleTripleColor(n+10)};">D${n+10}</button>`;
                htmlDoubles += '<div></div><div></div>';
                htmlDoubles += '</div>';
            }
            
            // Miss knop onderaan
            htmlDoubles += '<div style="display: flex; justify-content: center; margin-top: 10px;">';
            htmlDoubles += '<button class="keyboard-btn" data-value="0" style="background: #666;">Miss</button>';
            htmlDoubles += '</div></div>';
            return htmlDoubles;
            
        case 'ascending':
        case 'descending':
            // Alle mogelijke scores: links 1-10, rechts 11-20 (singles, doubles, triples) met kleuren
            let htmlAsc = '<div style="display: flex; flex-direction: column; gap: 5px; padding: 10px;">';
            
            for (let n = 1; n <= 10; n++) {
                htmlAsc += '<div style="display: grid; grid-template-columns: repeat(6, 1fr); gap: 5px;">';
                // Links: n, Dn, Tn
                htmlAsc += `<button class="keyboard-btn" data-value="${n}" style="background: ${getSingleColor(n)}; color: ${getSingleTextColor(n)}">${n}</button>`;
                htmlAsc += `<button class="keyboard-btn" data-value="${n*2}" style="background: ${getDoubleTripleColor(n)};">D${n}</button>`;
                htmlAsc += `<button class="keyboard-btn" data-value="${n*3}" style="background: ${getDoubleTripleColor(n)};">T${n}</button>`;
                // Rechts: n+10, D(n+10), T(n+10)
                htmlAsc += `<button class="keyboard-btn" data-value="${n+10}" style="background: ${getSingleColor(n+10)}; color: ${getSingleTextColor(n+10)}">${n+10}</button>`;
                htmlAsc += `<button class="keyboard-btn" data-value="${(n+10)*2}" style="background: ${getDoubleTripleColor(n+10)};">D${n+10}</button>`;
                htmlAsc += `<button class="keyboard-btn" data-value="${(n+10)*3}" style="background: ${getDoubleTripleColor(n+10)};">T${n+10}</button>`;
                htmlAsc += '</div>';
            }
            
            // Bull, D-Bull en Miss
            htmlAsc += '<div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 5px; margin-top: 10px;">';
            htmlAsc += '<button class="keyboard-btn" data-value="25" style="background: #4CAF50;">Bull</button>';
            htmlAsc += '<button class="keyboard-btn" data-value="50" style="background: #f44336;">D-Bull</button>';
            htmlAsc += '<button class="keyboard-btn" data-value="0" style="background: #666;">Miss</button>';
            htmlAsc += '</div></div>';
            return htmlAsc;
            
        case 'triples':
        case 'specific_triple':
            // Triples: links T1-T10, rechts T11-T20 met kleuren
            let htmlTriples = '<div style="display: flex; flex-direction: column; gap: 5px; padding: 10px;">';
            
            for (let n = 1; n <= 10; n++) {
                htmlTriples += '<div style="display: grid; grid-template-columns: repeat(6, 1fr); gap: 5px;">';
                // Links: Tn
                htmlTriples += `<button class="keyboard-btn" data-value="${n*3}" style="background: ${getDoubleTripleColor(n)};">T${n}</button>`;
                htmlTriples += '<div></div><div></div>';
                // Rechts: T(n+10)
                htmlTriples += `<button class="keyboard-btn" data-value="${(n+10)*3}" style="background: ${getDoubleTripleColor(n+10)};">T${n+10}</button>`;
                htmlTriples += '<div></div><div></div>';
                htmlTriples += '</div>';
            }
            
            // Miss knop onderaan
            htmlTriples += '<div style="display: flex; justify-content: center; margin-top: 10px;">';
            htmlTriples += '<button class="keyboard-btn" data-value="0" style="background: #666;">Miss</button>';
            htmlTriples += '</div></div>';
            return htmlTriples;
    }
    
    return `<div class="special-keyboard-grid">
        ${keys.map(k => 
            `<button class="special-key" data-value="${k.value}" data-label="${k.label}">${k.label}</button>`
        ).join('')}
    </div>`;
}

function generateKeyboard(mission, throwIndex) {
    let keys = [];
    
    switch(mission.type) {
        case 'color':
            if (mission.color === 'white') {
                // Wit: singles van 1, 4, 5, 6, 9, 11, 15, 16, 17, 19 in 3-koloms layout
                let htmlWhite = '<div style="display: flex; flex-direction: column; gap: 5px; padding: 10px;">';
                const whiteNums = [1,4,5,6,9,11,15,16,17,19];
                
                for (let i = 0; i < whiteNums.length; i += 2) {
                    htmlWhite += '<div style="display: grid; grid-template-columns: repeat(6, 1fr); gap: 5px;">';
                    htmlWhite += `<button class="keyboard-btn" data-value="${whiteNums[i]}" style="background: #ddd; color: #000;">${whiteNums[i]}</button>`;
                    htmlWhite += '<div style="grid-column: span 2;"></div>';
                    if (i + 1 < whiteNums.length) {
                        htmlWhite += `<button class="keyboard-btn" data-value="${whiteNums[i+1]}" style="background: #ddd; color: #000;">${whiteNums[i+1]}</button>`;
                        htmlWhite += '<div style="grid-column: span 2;"></div>';
                    }
                    htmlWhite += '</div>';
                }
                
                htmlWhite += '<div style="display: flex; justify-content: center; margin-top: 10px;">';
                htmlWhite += '<button class="keyboard-btn" data-value="0" style="background: #666;">Miss</button>';
                htmlWhite += '</div></div>';
                return htmlWhite;
            } else if (mission.color === 'black') {
                // Zwart: singles van 2, 3, 7, 8, 10, 12, 13, 14, 18, 20 in 3-koloms layout
                let htmlBlack = '<div style="display: flex; flex-direction: column; gap: 5px; padding: 10px;">';
                const blackNums = [2,3,7,8,10,12,13,14,18,20];
                
                for (let i = 0; i < blackNums.length; i += 2) {
                    htmlBlack += '<div style="display: grid; grid-template-columns: repeat(6, 1fr); gap: 5px;">';
                    htmlBlack += `<button class="keyboard-btn" data-value="${blackNums[i]}" style="background: #333; color: #fff;">${blackNums[i]}</button>`;
                    htmlBlack += '<div style="grid-column: span 2;"></div>';
                    if (i + 1 < blackNums.length) {
                        htmlBlack += `<button class="keyboard-btn" data-value="${blackNums[i+1]}" style="background: #333; color: #fff;">${blackNums[i+1]}</button>`;
                        htmlBlack += '<div style="grid-column: span 2;"></div>';
                    }
                    htmlBlack += '</div>';
                }
                
                htmlBlack += '<div style="display: flex; justify-content: center; margin-top: 10px;">';
                htmlBlack += '<button class="keyboard-btn" data-value="0" style="background: #666;">Miss</button>';
                htmlBlack += '</div></div>';
                return htmlBlack;
            } else if (mission.color === 'green') {
                // Groen: doubles/triples links 1-9, rechts 11-19
                let html = '<div style="display: flex; flex-direction: column; gap: 5px; padding: 10px;">';
                const greenLeft = [1, 4, 5, 6, 9];
                const greenRight = [11, 15, 16, 17, 19];
                
                for (let i = 0; i < Math.max(greenLeft.length, greenRight.length); i++) {
                    html += '<div style="display: grid; grid-template-columns: repeat(6, 1fr); gap: 5px;">';
                    if (i < greenLeft.length) {
                        html += `<button class="keyboard-btn" data-value="${greenLeft[i]*2}" style="background: #4CAF50;">D${greenLeft[i]}</button>`;
                        html += `<button class="keyboard-btn" data-value="${greenLeft[i]*3}" style="background: #4CAF50;">T${greenLeft[i]}</button>`;
                    } else {
                        html += '<div></div><div></div>';
                    }
                    html += '<div></div>';
                    if (i < greenRight.length) {
                        html += `<button class="keyboard-btn" data-value="${greenRight[i]*2}" style="background: #4CAF50;">D${greenRight[i]}</button>`;
                        html += `<button class="keyboard-btn" data-value="${greenRight[i]*3}" style="background: #4CAF50;">T${greenRight[i]}</button>`;
                    } else {
                        html += '<div></div><div></div>';
                    }
                    html += '<div></div>';
                    html += '</div>';
                }
                
                // Bull en Miss
                html += '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 5px; margin-top: 10px;">';
                html += '<button class="keyboard-btn" data-value="25" style="background: #4CAF50;">Bull</button>';
                html += '<button class="keyboard-btn" data-value="0" style="background: #666;">Miss</button>';
                html += '</div></div>';
                return html;
            } else if (mission.color === 'red') {
                // Rood: doubles/triples links 2-10, rechts 12-20
                let html = '<div style="display: flex; flex-direction: column; gap: 5px; padding: 10px;">';
                const redLeft = [2, 3, 7, 8, 10];
                const redRight = [12, 13, 14, 18, 20];
                
                for (let i = 0; i < Math.max(redLeft.length, redRight.length); i++) {
                    html += '<div style="display: grid; grid-template-columns: repeat(6, 1fr); gap: 5px;">';
                    if (i < redLeft.length) {
                        html += `<button class="keyboard-btn" data-value="${redLeft[i]*2}" style="background: #f44336;">D${redLeft[i]}</button>`;
                        html += `<button class="keyboard-btn" data-value="${redLeft[i]*3}" style="background: #f44336;">T${redLeft[i]}</button>`;
                    } else {
                        html += '<div></div><div></div>';
                    }
                    html += '<div></div>';
                    if (i < redRight.length) {
                        html += `<button class="keyboard-btn" data-value="${redRight[i]*2}" style="background: #f44336;">D${redRight[i]}</button>`;
                        html += `<button class="keyboard-btn" data-value="${redRight[i]*3}" style="background: #f44336;">T${redRight[i]}</button>`;
                    } else {
                        html += '<div></div><div></div>';
                    }
                    html += '<div></div>';
                    html += '</div>';
                }
                
                // D-Bull en Miss
                html += '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 5px; margin-top: 10px;">';
                html += '<button class="keyboard-btn" data-value="50" style="background: #f44336;">D-Bull</button>';
                html += '<button class="keyboard-btn" data-value="0" style="background: #666;">Miss</button>';
                html += '</div></div>';
                return html;
            }
            break;
            
        case 'sequence':
            // Voor volgorde: laat zien welke kleur deze worp moet zijn
            const color = mission.sequence[throwIndex];
            if (color === 'white') {
                // Wit singles: links 1-10, rechts 11-20
                let htmlWhite = '<div style="display: flex; flex-direction: column; gap: 5px; padding: 10px;">';
                const whiteLeft = [1,4,5,6,9];  // 1-10
                const whiteRight = [11,15,16,17,19];  // 11-20
                
                for (let i = 0; i < Math.max(whiteLeft.length, whiteRight.length); i++) {
                    htmlWhite += '<div style="display: grid; grid-template-columns: repeat(6, 1fr); gap: 5px;">';
                    if (i < whiteLeft.length) {
                        htmlWhite += `<button class="keyboard-btn" data-value="${whiteLeft[i]}" style="background: #ddd; color: #000;">${whiteLeft[i]}</button>`;
                    } else {
                        htmlWhite += '<div></div>';
                    }
                    htmlWhite += '<div style="grid-column: span 2;"></div>';
                    if (i < whiteRight.length) {
                        htmlWhite += `<button class="keyboard-btn" data-value="${whiteRight[i]}" style="background: #ddd; color: #000;">${whiteRight[i]}</button>`;
                    } else {
                        htmlWhite += '<div></div>';
                    }
                    htmlWhite += '<div style="grid-column: span 2;"></div>';
                    htmlWhite += '</div>';
                }
                
                htmlWhite += '<div style="display: flex; justify-content: center; margin-top: 10px;">';
                htmlWhite += '<button class="keyboard-btn" data-value="0" style="background: #666;">Miss</button>';
                htmlWhite += '</div></div>';
                return htmlWhite;
            } else if (color === 'black') {
                // Zwart singles: links 1-10, rechts 11-20
                let htmlBlack = '<div style="display: flex; flex-direction: column; gap: 5px; padding: 10px;">';
                const blackLeft = [2,3,7,8,10];  // 1-10
                const blackRight = [12,13,14,18,20];  // 11-20
                
                for (let i = 0; i < Math.max(blackLeft.length, blackRight.length); i++) {
                    htmlBlack += '<div style="display: grid; grid-template-columns: repeat(6, 1fr); gap: 5px;">';
                    if (i < blackLeft.length) {
                        htmlBlack += `<button class="keyboard-btn" data-value="${blackLeft[i]}" style="background: #333; color: #fff;">${blackLeft[i]}</button>`;
                    } else {
                        htmlBlack += '<div></div>';
                    }
                    htmlBlack += '<div style="grid-column: span 2;"></div>';
                    if (i < blackRight.length) {
                        htmlBlack += `<button class="keyboard-btn" data-value="${blackRight[i]}" style="background: #333; color: #fff;">${blackRight[i]}</button>`;
                    } else {
                        htmlBlack += '<div></div>';
                    }
                    htmlBlack += '<div style="grid-column: span 2;"></div>';
                    htmlBlack += '</div>';
                }
                
                htmlBlack += '<div style="display: flex; justify-content: center; margin-top: 10px;">';
                htmlBlack += '<button class="keyboard-btn" data-value="0" style="background: #666;">Miss</button>';
                htmlBlack += '</div></div>';
                return htmlBlack;
            } else if (color === 'green') {
                // Groen: doubles/triples links 1-9, rechts 11-19
                let html = '<div style="display: flex; flex-direction: column; gap: 5px; padding: 10px;">';
                const greenLeft = [1, 4, 5, 6, 9];
                const greenRight = [11, 15, 16, 17, 19];
                
                for (let i = 0; i < Math.max(greenLeft.length, greenRight.length); i++) {
                    html += '<div style="display: grid; grid-template-columns: repeat(6, 1fr); gap: 5px;">';
                    if (i < greenLeft.length) {
                        html += `<button class="keyboard-btn" data-value="${greenLeft[i]*2}" style="background: #4CAF50;">D${greenLeft[i]}</button>`;
                        html += `<button class="keyboard-btn" data-value="${greenLeft[i]*3}" style="background: #4CAF50;">T${greenLeft[i]}</button>`;
                    } else {
                        html += '<div></div><div></div>';
                    }
                    html += '<div></div>';
                    if (i < greenRight.length) {
                        html += `<button class="keyboard-btn" data-value="${greenRight[i]*2}" style="background: #4CAF50;">D${greenRight[i]}</button>`;
                        html += `<button class="keyboard-btn" data-value="${greenRight[i]*3}" style="background: #4CAF50;">T${greenRight[i]}</button>`;
                    } else {
                        html += '<div></div><div></div>';
                    }
                    html += '<div></div>';
                    html += '</div>';
                }
                
                // Bull en Miss
                html += '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 5px; margin-top: 10px;">';
                html += '<button class="keyboard-btn" data-value="25" style="background: #4CAF50;">Bull</button>';
                html += '<button class="keyboard-btn" data-value="0" style="background: #666;">Miss</button>';
                html += '</div></div>';
                return html;
            } else if (color === 'red') {
                // Rood: doubles/triples links 2-10, rechts 12-20
                let html = '<div style="display: flex; flex-direction: column; gap: 5px; padding: 10px;">';
                const redLeft = [2, 3, 7, 8, 10];
                const redRight = [12, 13, 14, 18, 20];
                
                for (let i = 0; i < Math.max(redLeft.length, redRight.length); i++) {
                    html += '<div style="display: grid; grid-template-columns: repeat(6, 1fr); gap: 5px;">';
                    if (i < redLeft.length) {
                        html += `<button class="keyboard-btn" data-value="${redLeft[i]*2}" style="background: #f44336;">D${redLeft[i]}</button>`;
                        html += `<button class="keyboard-btn" data-value="${redLeft[i]*3}" style="background: #f44336;">T${redLeft[i]}</button>`;
                    } else {
                        html += '<div></div><div></div>';
                    }
                    html += '<div></div>';
                    if (i < redRight.length) {
                        html += `<button class="keyboard-btn" data-value="${redRight[i]*2}" style="background: #f44336;">D${redRight[i]}</button>`;
                        html += `<button class="keyboard-btn" data-value="${redRight[i]*3}" style="background: #f44336;">T${redRight[i]}</button>`;
                    } else {
                        html += '<div></div><div></div>';
                    }
                    html += '<div></div>';
                    html += '</div>';
                }
                
                // D-Bull en Miss
                html += '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 5px; margin-top: 10px;">';
                html += '<button class="keyboard-btn" data-value="50" style="background: #f44336;">D-Bull</button>';
                html += '<button class="keyboard-btn" data-value="0" style="background: #666;">Miss</button>';
                html += '</div></div>';
                return html;
            }
            break;
            
        case 'doubles':
        case 'specific_double':
            // Alle dubbels: links 1-10, rechts 11-20
            let htmlDoubles = '<div style="display: flex; flex-direction: column; gap: 5px; padding: 10px;">';
            
            for (let n = 1; n <= 10; n++) {
                htmlDoubles += '<div style="display: grid; grid-template-columns: repeat(6, 1fr); gap: 5px;">';
                htmlDoubles += `<button class="keyboard-btn" data-value="${n*2}">D${n}</button>`;
                htmlDoubles += '<div></div><div></div>';
                htmlDoubles += `<button class="keyboard-btn" data-value="${(n+10)*2}">D${n+10}</button>`;
                htmlDoubles += '<div></div><div></div>';
                htmlDoubles += '</div>';
            }
            
            htmlDoubles += '<div style="display: flex; justify-content: center; margin-top: 10px;">';
            htmlDoubles += '<button class="keyboard-btn" data-value="0" style="background: #666;">Miss</button>';
            htmlDoubles += '</div></div>';
            return htmlDoubles;
            
        case 'triples':
        case 'specific_triple':
            // Alle triples: links 1-10, rechts 11-20
            let htmlTriples = '<div style="display: flex; flex-direction: column; gap: 5px; padding: 10px;">';
            
            for (let n = 1; n <= 10; n++) {
                htmlTriples += '<div style="display: grid; grid-template-columns: repeat(6, 1fr); gap: 5px;">';
                htmlTriples += `<button class="keyboard-btn" data-value="${n*3}">T${n}</button>`;
                htmlTriples += '<div></div><div></div>';
                htmlTriples += `<button class="keyboard-btn" data-value="${(n+10)*3}">T${n+10}</button>`;
                htmlTriples += '<div></div><div></div>';
                htmlTriples += '</div>';
            }
            
            htmlTriples += '<div style="display: flex; justify-content: center; margin-top: 10px;">';
            htmlTriples += '<button class="keyboard-btn" data-value="0" style="background: #666;">Miss</button>';
            htmlTriples += '</div></div>';
            return htmlTriples;
    }
    
    return '';
}

function checkAllThrowsFilled() {
    const allFilled = window.specialThrows.every(t => t !== null);
    if (allFilled) {
        // Auto-enable success/fail buttons or show a visual indicator
        document.getElementById('successSpecialBtn').style.opacity = '1';
        document.getElementById('failSpecialBtn').style.opacity = '1';
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
    const mission = game.getCurrentSpecialMission();
    const player = game.getCurrentPlayer();
    const oldScore = player.score;
    
    // Bij mislukt: halveer score direct en ga door
    if (!success) {
        const newScore = Math.floor(oldScore / 2);
        player.score = newScore;
        showToast(`❌ Opdracht mislukt! Score gehalveerd: ${oldScore} → ${newScore}`, 'error');
        
        const result = game.nextPlayer();
        if (result.gameOver) {
            endGame();
        } else {
            updateGameScreen();
        }
        return;
    }
    
    // Bij succes: check of alle worpen zijn ingevuld
    const throws = window.specialThrows || [null, null, null];
    if (throws.some(t => t === null)) {
        alert('❌ Vul alle 3 de worpen in!');
        return;
    }
    
    // Process through game logic (this handles success/fail and calls nextPlayer)
    const result = game.processSpecialMission(throws, mission);
    
    // Show result and continue
    if (result.gameOver) {
        endGame();
    } else {
        updateGameScreen();
    }
}

function validateMission(mission, throws) {
    // throws = array van 3 nummers (0 = miss)
    
    switch(mission.type) {
        case 'odd':
            // Minimaal 1 hit van een oneven basis nummer
            const oddHits = throws.filter(t => {
                if (t === 0) return false;
                // Check basis nummer (single, dubbel, triple)
                if (t >= 1 && t <= 20) return [1,3,5,7,9,11,13,15,17,19].includes(t);
                if (t >= 2 && t <= 40 && t % 2 === 0) return [1,3,5,7,9,11,13,15,17,19].includes(t / 2);
                if (t >= 3 && t <= 60 && t % 3 === 0) return [1,3,5,7,9,11,13,15,17,19].includes(t / 3);
                return false;
            });
            return oddHits.length >= 1;
            
        case 'even':
            // Minimaal 1 hit van een even basis nummer
            const evenHits = throws.filter(t => {
                if (t === 0) return false;
                // Check basis nummer (single, dubbel, triple)
                if (t >= 1 && t <= 20) return [2,4,6,8,10,12,14,16,18,20].includes(t);
                if (t >= 2 && t <= 40 && t % 2 === 0) return [2,4,6,8,10,12,14,16,18,20].includes(t / 2);
                if (t >= 3 && t <= 60 && t % 3 === 0) return [2,4,6,8,10,12,14,16,18,20].includes(t / 3);
                return false;
            });
            return evenHits.length >= 1;
            
        case 'total_score':
            // Check of het totaal exact overeenkomt met de target
            const total = throws.reduce((sum, t) => sum + t, 0);
            return total === mission.target;
        
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
            
        case 'ascending':
            // Van laag naar hoog: elke worp moet hoger zijn dan de vorige (geen misses)
            if (throws[0] === 0 || throws[1] === 0 || throws[2] === 0) return false;
            return throws[0] < throws[1] && throws[1] < throws[2];
            
        case 'descending':
            // Van hoog naar laag: elke worp moet lager zijn dan de vorige (geen misses)
            if (throws[0] === 0 || throws[1] === 0 || throws[2] === 0) return false;
            return throws[0] > throws[1] && throws[1] > throws[2];
            
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
    // Wit singles: 1, 4, 5, 6, 9, 11, 15, 16, 17, 19
    // Zwart singles: 2, 3, 7, 8, 10, 12, 13, 14, 18, 20
    // Groen doubles/triples: van 1, 4, 5, 6, 9, 11, 15, 16, 17, 19
    // Rood doubles/triples: van 2, 3, 7, 8, 10, 12, 13, 14, 18, 20
    // Bull: 25 = groen, 50 (D-Bull) = rood
    
    const whiteNumbers = [1, 4, 5, 6, 9, 11, 15, 16, 17, 19];
    const blackNumbers = [2, 3, 7, 8, 10, 12, 13, 14, 18, 20];
    const redNumbers = [2, 3, 7, 8, 10, 12, 13, 14, 18, 20];
    const greenNumbers = [1, 4, 5, 6, 9, 11, 15, 16, 17, 19];
    
    // Singles 1-20: wit of zwart
    if (number >= 1 && number <= 20) {
        if (color === 'white') return whiteNumbers.includes(number);
        if (color === 'black') return blackNumbers.includes(number);
        return false;
    } else if (number >= 2 && number <= 40 && number % 2 === 0) {
        // Dubbel (2-40, even getallen)
        const baseNumber = number / 2;
        if (color === 'green') {
            return greenNumbers.includes(baseNumber);
        }
        if (color === 'red') {
            return redNumbers.includes(baseNumber);
        }
    } else if (number >= 3 && number <= 60 && number % 3 === 0) {
        // Triple (3-60, deelbaar door 3)
        const baseNumber = number / 3;
        if (color === 'green') {
            return greenNumbers.includes(baseNumber);
        }
        if (color === 'red') {
            return redNumbers.includes(baseNumber);
        }
    } else if (number === 25) {
        // Bull is groen
        return color === 'green';
    } else if (number === 50) {
        // D-Bull is rood
        return color === 'red';
    }
    
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
    
    // Save highscores
    saveHighscores(results);
    
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

function saveHighscores(results) {
    // Get existing highscores
    let highscores = JSON.parse(localStorage.getItem('halfItHighscores')) || [];
    
    // Add all players from this game
    results.forEach(player => {
        highscores.push({
            name: player.name,
            score: player.score,
            date: new Date().toISOString()
        });
    });
    
    // Sort by score (highest first) and keep top 20
    highscores.sort((a, b) => b.score - a.score);
    highscores = highscores.slice(0, 20);
    
    // Save back to localStorage
    localStorage.setItem('halfItHighscores', JSON.stringify(highscores));
}

function showHighscores() {
    const highscores = JSON.parse(localStorage.getItem('halfItHighscores')) || [];
    const modal = document.getElementById('highscoreModal');
    const container = document.getElementById('highscoreList');
    
    container.innerHTML = '';
    
    if (highscores.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #ccc;">Nog geen highscores!</p>';
    } else {
        highscores.forEach((entry, index) => {
            const date = new Date(entry.date).toLocaleDateString('nl-NL');
            const div = document.createElement('div');
            div.className = 'highscore-entry';
            if (index < 3) div.classList.add(`rank-${index + 1}`);
            div.innerHTML = `
                <span class="rank">${index + 1}</span>
                <span class="name">${entry.name}</span>
                <span class="score">${entry.score}</span>
                <span class="date">${date}</span>
            `;
            container.appendChild(div);
        });
    }
    
    modal.classList.add('active');
}

function closeHighscores() {
    document.getElementById('highscoreModal').classList.remove('active');
}

function resetHighscores() {
    if (confirm('Weet je zeker dat je alle highscores wilt verwijderen?')) {
        localStorage.removeItem('halfItHighscores');
        showToast('Highscores gewist!');
    }
}

function resetPlayerNames() {
    if (confirm('Weet je zeker dat je alle opgeslagen spelersnamen wilt verwijderen?')) {
        localStorage.removeItem('halfItPlayerNames');
        showToast('Spelersnamen gewist!');
    }
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
