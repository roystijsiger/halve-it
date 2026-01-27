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
            // Even/Oneven opdrachten
            { type: 'odd', description: 'Gooi oneven', points: 10 },
            { type: 'even', description: 'Gooi even', points: 10 },
            
            // Van laag naar hoog en andersom
            { type: 'ascending', description: 'Gooi van laag naar hoog', points: 10 },
            { type: 'descending', description: 'Gooi van hoog naar laag', points: 10 },
            
            // Kleur opdrachten
            { type: 'color', color: 'white', description: 'Gooi wit', points: 10 },
            { type: 'color', color: 'black', description: 'Gooi zwart', points: 10 },
            { type: 'color', color: 'green', description: 'Gooi groen', points: 15 },
            { type: 'color', color: 'red', description: 'Gooi rood', points: 15 },
            
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
        
        // Genereer alle mogelijke wit/zwart combinaties (8 totaal)
        const whiteBlackCombos = [
            ['white', 'white', 'white'],
            ['white', 'white', 'black'],
            ['white', 'black', 'white'],
            ['white', 'black', 'black'],
            ['black', 'white', 'white'],
            ['black', 'white', 'black'],
            ['black', 'black', 'white'],
            ['black', 'black', 'black']
        ];
        
        whiteBlackCombos.forEach(combo => {
            const desc = combo.map(c => c === 'white' ? 'wit' : 'zwart').join('-');
            allMissions.push({
                type: 'sequence',
                sequence: combo,
                description: `Gooi ${desc}`,
                points: 18
            });
        });
        
        // Specifieke dubbels en triples (D10-D20, T10-T20)
        for (let num = 10; num <= 20; num++) {
            allMissions.push({
                type: 'specific_double',
                number: num,
                description: `Gooi dubbel ${num}`,
                points: num * 2
            });
        }
        
        // Specifieke triples (T10-T20)
        for (let num = 10; num <= 20; num++) {
            allMissions.push({
                type: 'specific_triple',
                number: num,
                description: `Gooi triple ${num}`,
                points: num * 3
            });
        }
        
        // Totaalscore opdrachten (willekeurige target scores)
        // Makkelijk: 20-60 punten
        for (let i = 0; i < 5; i++) {
            const target = 20 + Math.floor(Math.random() * 41); // 20-60
            allMissions.push({
                type: 'total_score',
                target: target,
                description: `Gooi ${target} punten`,
                points: 20
            });
        }
        // Gemiddeld: 60-80 punten
        for (let i = 0; i < 5; i++) {
            const target = 60 + Math.floor(Math.random() * 21); // 60-80
            allMissions.push({
                type: 'total_score',
                target: target,
                description: `Gooi ${target} punten`,
                points: 30
            });
        }
        // Moeilijk: 80-100 punten
        for (let i = 0; i < 5; i++) {
            const target = 80 + Math.floor(Math.random() * 21); // 80-100
            allMissions.push({
                type: 'total_score',
                target: target,
                description: `Gooi ${target} punten`,
                points: 40
            });
        }
        // Expert: alle mogelijkheden (willekeurig tussen 0-180)
        for (let i = 0; i < 5; i++) {
            const target = Math.floor(Math.random() * 181); // 0-180
            allMissions.push({
                type: 'total_score',
                target: target,
                description: `Gooi ${target} punten`,
                points: 55
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
            // Bull ronde: de waarde IS de punten (25, 50, of 0)
            // multiplier bevat de score: 0 = miss, 25 = bull, 50 = double bull
            let points = multiplier; // Direct de punten gebruiken
            
            player.score += points;
            player.throwsThisRound++;
            
            if (player.throwsThisRound >= 3) {
                return this.nextPlayer();
            }
            
            return { continue: true, player: player };
        }
    }

    // Verwerk speciale opdracht resultaat
    processSpecialMission(throws, mission) {
        const player = this.getCurrentPlayer();
        
        // Valideer en bereken punten op basis van mission type
        const result = this.validateSpecialMission(throws, mission);
        
        if (result.success) {
            // Tel punten op bij succes
            player.score += result.points;
        } else {
            // Halveer score bij mislukken
            player.score = Math.floor(player.score / 2);
        }
        
        return this.nextPlayer();
    }

    validateSpecialMission(throws, mission) {
        // throws is array van 3 objecten: [{number, multiplier, points}, ...]
        let totalPoints = 0;
        let success = false;

        switch(mission.type) {
            case 'odd':
            case 'even': {
                // Alle worpen moeten oneven/even zijn
                const isOdd = mission.type === 'odd';
                success = throws.every(t => {
                    if (t.number === 0) return false; // Miss telt niet mee
                    return isOdd ? (t.number % 2 === 1) : (t.number % 2 === 0);
                });
                if (success) {
                    totalPoints = throws.reduce((sum, t) => sum + t.points, 0);
                }
                break;
            }

            case 'color': {
                // Tel punten van worpen in de juiste kleur
                totalPoints = throws.reduce((sum, t) => {
                    if (t.number === 0) return sum;
                    const colorMatch = this.checkColorMatch(t.number, t.multiplier, mission.color);
                    return colorMatch ? sum + t.points : sum;
                }, 0);
                success = totalPoints > 0; // Minimaal 1 goede worp
                break;
            }

            case 'sequence': {
                // Check of volgorde klopt
                success = throws.every((t, i) => {
                    if (t.number === 0) return false;
                    return this.checkColorMatch(t.number, t.multiplier, mission.sequence[i]);
                });
                if (success) {
                    totalPoints = throws.reduce((sum, t) => sum + t.points, 0);
                }
                break;
            }

            case 'doubles': {
                // Tel aantal dubbels
                const doubleCount = throws.filter(t => t.multiplier === 2).length;
                success = doubleCount >= mission.count;
                if (success) {
                    totalPoints = throws.reduce((sum, t) => sum + t.points, 0);
                }
                break;
            }

            case 'triples': {
                // Tel aantal triples
                const tripleCount = throws.filter(t => t.multiplier === 3).length;
                success = tripleCount >= mission.count;
                if (success) {
                    totalPoints = throws.reduce((sum, t) => sum + t.points, 0);
                }
                break;
            }

            case 'specific_double': {
                // Check of specifieke dubbel is gegooid
                success = throws.some(t => t.number === mission.number && t.multiplier === 2);
                if (success) {
                    totalPoints = throws.reduce((sum, t) => sum + t.points, 0);
                }
                break;
            }

            case 'specific_triple': {
                // Check of specifieke triple is gegooid
                success = throws.some(t => t.number === mission.number && t.multiplier === 3);
                if (success) {
                    totalPoints = throws.reduce((sum, t) => sum + t.points, 0);
                }
                break;
            }

            case 'total_score': {
                // Check of totaal PRECIES klopt
                totalPoints = throws.reduce((sum, t) => sum + t.points, 0);
                success = totalPoints === mission.target;
                if (!success) totalPoints = 0; // Bij fail geen punten
                break;
            }

            case 'ascending': {
                // Check of elke worp hoger is dan vorige
                success = true;
                for (let i = 1; i < throws.length; i++) {
                    if (throws[i].points <= throws[i-1].points) {
                        success = false;
                        break;
                    }
                }
                if (success) {
                    totalPoints = throws.reduce((sum, t) => sum + t.points, 0);
                }
                break;
            }

            case 'descending': {
                // Check of elke worp lager is dan vorige
                success = true;
                for (let i = 1; i < throws.length; i++) {
                    if (throws[i].points >= throws[i-1].points) {
                        success = false;
                        break;
                    }
                }
                if (success) {
                    totalPoints = throws.reduce((sum, t) => sum + t.points, 0);
                }
                break;
            }

            default:
                success = false;
                totalPoints = 0;
        }

        return { success, points: totalPoints };
    }

    checkColorMatch(number, multiplier, color) {
        // Singles
        const whiteSingles = [1, 4, 6, 9, 11, 15, 16, 17, 19];
        const blackSingles = [2, 3, 5, 7, 8, 10, 12, 13, 14, 18, 20];
        
        // Double/Triple (inverse van singles)
        const greenDoubleTriple = [2, 3, 5, 7, 8, 10, 12, 13, 14, 18, 20];
        const redDoubleTriple = [1, 4, 6, 9, 11, 15, 16, 17, 19];

        if (multiplier === 1) {
            // Singles
            if (color === 'white') return whiteSingles.includes(number);
            if (color === 'black') return blackSingles.includes(number);
        } else if (multiplier === 2 || multiplier === 3) {
            // Doubles en Triples
            if (color === 'green') return greenDoubleTriple.includes(number);
            if (color === 'red') return redDoubleTriple.includes(number);
        }
        
        return false;
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
