// Half-It Darts Game Logic

class HalfItGame {
    constructor() {
        this.players = [];
        this.currentPlayerIndex = 0;
        this.currentRoundIndex = 0;
        this.difficulty = 'easy';
        
        // Rondes volgorde volgens de regels
        this.rounds = [
            { number: 20, type: 'normal' },
            { number: 19, type: 'normal' },
            { number: 18, type: 'normal' },
            { number: null, type: 'special', name: 'Speciale Opdracht 1' },
            { number: 17, type: 'normal' },
            { number: 16, type: 'normal' },
            { number: 15, type: 'normal' },
            { number: null, type: 'special', name: 'Speciale Opdracht 2' },
            { number: 14, type: 'normal' },
            { number: 13, type: 'normal' },
            { number: 12, type: 'normal' },
            { number: null, type: 'special', name: 'Speciale Opdracht 3' },
            { number: 11, type: 'normal' },
            { number: 10, type: 'normal' },
            { number: 'bull', type: 'bull', name: 'Bull & Double Bull' }
        ];

        this.specialMissions = [];
    }

    // Initialiseer spel met spelers en moeilijkheidsgraad
    initGame(playerNames, difficulty) {
        this.difficulty = difficulty;
        this.players = playerNames.map(name => ({
            name: name,
            score: 0,
            throwsThisRound: 0
        }));
        this.currentPlayerIndex = 0;
        this.currentRoundIndex = 0;
        this.generateSpecialMissions();
    }

    // Genereer speciale opdrachten gebaseerd op moeilijkheidsgraad
    generateSpecialMissions() {
        this.specialMissions = [];
        
        for (let i = 0; i < 3; i++) {
            const mission = this.generateSpecialMission();
            this.specialMissions.push(mission);
        }
    }

    generateSpecialMission() {
        // Alle mogelijke opdrachten met type, beschrijving en punten
        const allMissions = [
            // Kleur opdrachten
            { type: 'color', color: 'white', description: 'Gooi wit', points: 10 },
            { type: 'color', color: 'black', description: 'Gooi zwart', points: 10 },
            { type: 'color', color: 'green', description: 'Gooi groen', points: 15 },
            { type: 'color', color: 'red', description: 'Gooi rood', points: 15 },
            
            // Zwart-wit volgorde
            { type: 'sequence', sequence: ['white', 'white', 'white'], description: 'Gooi wit-wit-wit', points: 18 },
            { type: 'sequence', sequence: ['black', 'black', 'black'], description: 'Gooi zwart-zwart-zwart', points: 18 },
            { type: 'sequence', sequence: ['black', 'white', 'black'], description: 'Gooi zwart-wit-zwart', points: 20 },
            { type: 'sequence', sequence: ['white', 'black', 'white'], description: 'Gooi wit-zwart-wit', points: 20 },
            
            // Dubbel
            { type: 'doubles', count: 1, description: 'Gooi 1 dubbel', points: 20 },
            { type: 'doubles', count: 2, description: 'Gooi 2 dubbels', points: 35 },
            { type: 'doubles', count: 3, description: 'Gooi 3 dubbels', points: 50 },
            
            // Triple
            { type: 'triples', count: 1, description: 'Gooi 1 triple', points: 25 },
            { type: 'triples', count: 2, description: 'Gooi 2 triples', points: 40 },
            { type: 'triples', count: 3, description: 'Gooi 3 triples', points: 60 },
            
            // Rood-groen volgorde
            { type: 'sequence', sequence: ['red', 'green', 'red'], description: 'Gooi rood-groen-rood', points: 30 },
            { type: 'sequence', sequence: ['green', 'red', 'green'], description: 'Gooi groen-rood-groen', points: 30 },
            { type: 'sequence', sequence: ['red', 'red', 'red'], description: 'Gooi rood-rood-rood', points: 35 },
            { type: 'sequence', sequence: ['green', 'green', 'green'], description: 'Gooi groen-groen-groen', points: 35 },
        ];
        
        // Specifieke dubbels en triples (D10-D20, T10-T20)
        for (let num = 10; num <= 20; num++) {
            allMissions.push({
                type: 'specific_double',
                number: num,
                description: `Gooi dubbel ${num}`,
                points: num * 2
            });
            allMissions.push({
                type: 'specific_triple',
                number: num,
                description: `Gooi triple ${num}`,
                points: num * 3
            });
        }
        
        // Filter opdrachten op basis van difficulty
        const maxPoints = {
            easy: [20, 18, 15],      // Opdracht 1, 2, 3
            medium: [35, 30, 25],
            hard: [50, 42, 35],
            expert: [60, 50, 40]
        };
        
        const limits = maxPoints[this.difficulty];
        const missionIndex = this.specialMissions.length; // Welke speciale opdracht (0, 1, of 2)
        const maxPointsForThisMission = limits[missionIndex];
        
        // Filter opdrachten die passen binnen de limiet
        const availableMissions = allMissions.filter(m => m.points <= maxPointsForThisMission);
        
        // Kies random opdracht
        const mission = availableMissions[Math.floor(Math.random() * availableMissions.length)];
        
        return mission;
    }

    getMissionDescription(sequence) {
        const colorNames = {
            'red': 'Rood',
            'green': 'Groen',
            'white': 'Wit',
            'black': 'Zwart'
        };
        
        return sequence.map(c => colorNames[c]).join(' → ');
    }

    // Huidige ronde info
    getCurrentRound() {
        return this.rounds[this.currentRoundIndex];
    }

    // Huidige speler
    getCurrentPlayer() {
        return this.players[this.currentPlayerIndex];
    }

    // Huidige speciale opdracht
    getCurrentSpecialMission() {
        const specialRoundIndices = [3, 7, 11]; // Indices van speciale rondes
        const specialMissionIndex = specialRoundIndices.indexOf(this.currentRoundIndex);
        return specialMissionIndex !== -1 ? this.specialMissions[specialMissionIndex] : null;
    }

    // Verwerk normale worp (niet speciale opdracht)
    processThrow(multiplier) {
        const player = this.getCurrentPlayer();
        const round = this.getCurrentRound();
        
        if (round.type === 'normal') {
            const points = round.number * multiplier;
            player.score += points;
            player.throwsThisRound++;
            
            // Na 3 worpen, volgende speler
            if (player.throwsThisRound >= 3) {
                return this.nextPlayer();
            }
            
            return { continue: true, player: player };
        } else if (round.type === 'bull') {
            // Bull ronde: single bull = 25, double bull = 50
            let points = 0;
            if (multiplier === 1) points = 25; // Single bull
            if (multiplier === 2) points = 50; // Double bull
            
            player.score += points;
            player.throwsThisRound++;
            
            if (player.throwsThisRound >= 3) {
                return this.nextPlayer();
            }
            
            return { continue: true, player: player };
        }
    }

    // Verwerk speciale opdracht resultaat
    processSpecialMission(success) {
        const player = this.getCurrentPlayer();
        
        if (!success) {
            // Halveer score bij mislukken
            player.score = Math.floor(player.score / 2);
        }
        // Bij succes gebeurt er niets met de score (geen punten erbij)
        
        return this.nextPlayer();
    }

    // Ga naar volgende speler
    nextPlayer() {
        this.players[this.currentPlayerIndex].throwsThisRound = 0;
        this.currentPlayerIndex++;
        
        // Als alle spelers deze ronde hebben gehad, ga naar volgende ronde
        if (this.currentPlayerIndex >= this.players.length) {
            this.currentPlayerIndex = 0;
            this.currentRoundIndex++;
            
            // Check of spel voorbij is
            if (this.currentRoundIndex >= this.rounds.length) {
                return { gameOver: true };
            }
            
            return { nextRound: true };
        }
        
        return { nextPlayer: true };
    }

    // Krijg eindresultaten
    getResults() {
        const sortedPlayers = [...this.players].sort((a, b) => b.score - a.score);
        return sortedPlayers;
    }

    // Reset spel
    reset() {
        this.players = [];
        this.currentPlayerIndex = 0;
        this.currentRoundIndex = 0;
        this.specialMissions = [];
    }
}

// Export voor gebruik in app.js
window.HalfItGame = HalfItGame;
