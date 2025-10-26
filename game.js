// Hip-Hop City Builder - Game Logic

class HipHopCityBuilder {
    constructor() {
        this.player = {
            name: '',
            rep: 0,
            money: 500,
            skills: 1,
            era: '1980s Bronx',
            buildings: [],
            collectibles: []
        };

        this.gameState = {
            currentScreen: 'welcome-screen',
            citySlots: 12,
            triviaAnswered: 0,
            freestyleCompleted: 0
        };

        this.eras = [
            { name: '1980s Bronx', repRequired: 0 },
            { name: '1990s Golden Age', repRequired: 500 },
            { name: '2000s Mainstream', repRequired: 1500 },
            { name: '2010s Digital Era', repRequired: 3000 },
            { name: '2020s Modern Hip-Hop', repRequired: 5000 }
        ];

        this.buildings = [
            { id: 'corner-spot', name: 'Corner Spot', cost: 100, repBonus: 10, icon: '🎤', owned: false },
            { id: 'record-shop', name: 'Record Shop', cost: 300, repBonus: 25, icon: '💿', owned: false },
            { id: 'studio', name: 'Small Studio', cost: 800, repBonus: 50, icon: '🎙️', owned: false },
            { id: 'radio-station', name: 'Radio Station', cost: 2000, repBonus: 100, icon: '📻', owned: false },
            { id: 'concert-venue', name: 'Concert Venue', cost: 5000, repBonus: 250, icon: '🏟️', owned: false },
            { id: 'label', name: 'Record Label', cost: 10000, repBonus: 500, icon: '🏢', owned: false }
        ];

        this.collectibles = [
            { id: 'turntable', name: 'Vintage Turntable', icon: '🎧', unlocked: false, repRequired: 50 },
            { id: 'boombox', name: 'Ghetto Blaster', icon: '📻', unlocked: false, repRequired: 100 },
            { id: 'gold-chain', name: 'Gold Chain', icon: '⛓️', unlocked: false, repRequired: 200 },
            { id: 'sneakers', name: 'Fresh Kicks', icon: '👟', unlocked: false, repRequired: 300 },
            { id: 'cap', name: 'Vintage Cap', icon: '🧢', unlocked: false, repRequired: 400 },
            { id: 'vinyl', name: 'Rare Vinyl', icon: '💿', unlocked: false, repRequired: 600 },
            { id: 'mic', name: 'Golden Mic', icon: '🎤', unlocked: false, repRequired: 1000 },
            { id: 'trophy', name: 'Battle Trophy', icon: '🏆', unlocked: false, repRequired: 2000 }
        ];

        this.triviaQuestions = [
            {
                question: "Who is widely considered the 'Godfather of Hip-Hop'?",
                answers: ["DJ Kool Herc", "Grandmaster Flash", "Afrika Bambaataa", "Run-DMC"],
                correct: 0
            },
            {
                question: "Which borough of New York is considered the birthplace of hip-hop?",
                answers: ["Brooklyn", "Queens", "The Bronx", "Manhattan"],
                correct: 2
            },
            {
                question: "What year is generally recognized as the birth of hip-hop?",
                answers: ["1973", "1979", "1982", "1985"],
                correct: 0
            },
            {
                question: "Who released the first commercially successful rap single 'Rapper's Delight'?",
                answers: ["Run-DMC", "The Sugarhill Gang", "Grandmaster Flash", "Public Enemy"],
                correct: 1
            },
            {
                question: "What does 'B-boy' stand for in hip-hop culture?",
                answers: ["Beat boy", "Break boy", "Bronx boy", "Bad boy"],
                correct: 1
            },
            {
                question: "Which group released the groundbreaking album 'Straight Outta Compton'?",
                answers: ["Public Enemy", "N.W.A", "Wu-Tang Clan", "A Tribe Called Quest"],
                correct: 1
            },
            {
                question: "Who is known as the 'Queen of Hip-Hop Soul'?",
                answers: ["Lauryn Hill", "Mary J. Blige", "Missy Elliott", "Queen Latifah"],
                correct: 1
            },
            {
                question: "What are the four foundational elements of hip-hop culture?",
                answers: [
                    "Rap, DJing, Dancing, Fashion",
                    "MCing, DJing, Breaking, Graffiti",
                    "Beats, Rhymes, Life, Style",
                    "Music, Art, Dance, Poetry"
                ],
                correct: 1
            },
            {
                question: "Which R&B artist is known as the 'King of Pop' and influenced many hip-hop artists?",
                answers: ["Prince", "Stevie Wonder", "Michael Jackson", "James Brown"],
                correct: 2
            },
            {
                question: "What technique involves manipulating vinyl records to create rhythmic sounds?",
                answers: ["Sampling", "Scratching", "Looping", "Mixing"],
                correct: 1
            }
        ];

        this.freestylePrompts = [
            "the streets", "the hustle", "your dreams", "the city lights",
            "making it big", "staying real", "your crew", "the struggle",
            "success", "the grind", "your legacy", "breaking through"
        ];

        this.rhymeWords = [
            { word: 'flow', rhymes: ['show', 'glow', 'know', 'grow', 'pro', 'though', 'throw', 'slow'] },
            { word: 'beat', rhymes: ['street', 'meet', 'heat', 'feat', 'sweet', 'elite', 'compete', 'repeat'] },
            { word: 'rhyme', rhymes: ['time', 'climb', 'prime', 'crime', 'dime', 'grime', 'chime', 'mime'] },
            { word: 'game', rhymes: ['fame', 'name', 'claim', 'frame', 'shame', 'blame', 'flame', 'tame'] },
            { word: 'real', rhymes: ['deal', 'feel', 'steal', 'heal', 'reveal', 'appeal', 'conceal', 'ideal'] },
            { word: 'night', rhymes: ['light', 'fight', 'sight', 'might', 'right', 'bright', 'height', 'flight'] },
            { word: 'day', rhymes: ['way', 'say', 'play', 'stay', 'pay', 'pray', 'gray', 'display'] },
            { word: 'crown', rhymes: ['town', 'down', 'brown', 'frown', 'clown', 'renown', 'drown', 'gown'] }
        ];

        this.wordDropWords = [
            'flow', 'beat', 'rhyme', 'mic', 'rap', 'style', 'fresh', 'dope',
            'ill', 'sick', 'boom', 'bass', 'verse', 'bar', 'hook', 'track',
            'lyric', 'rhythm', 'cipher', 'battle', 'crew', 'peace', 'unity', 'respect'
        ];

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.renderCity();
    }

    setupEventListeners() {
        // Welcome screen
        document.getElementById('start-game-btn').addEventListener('click', () => this.startGame());

        // Navigation
        document.getElementById('build-btn').addEventListener('click', () => this.showScreen('build-screen'));
        document.getElementById('trivia-btn').addEventListener('click', () => this.showTriviaQuestion());
        document.getElementById('lyric-lab-btn').addEventListener('click', () => this.showScreen('lyric-lab-screen'));
        document.getElementById('freestyle-btn').addEventListener('click', () => this.showFreestyle());
        document.getElementById('collectibles-btn').addEventListener('click', () => this.showCollectibles());

        // Back buttons
        document.getElementById('trivia-back-btn').addEventListener('click', () => this.showScreen('city-screen'));
        document.getElementById('lab-back-btn').addEventListener('click', () => this.showScreen('city-screen'));
        document.getElementById('build-back-btn').addEventListener('click', () => this.showScreen('city-screen'));
        document.getElementById('collectibles-back-btn').addEventListener('click', () => this.showScreen('city-screen'));
        document.getElementById('freestyle-back').addEventListener('click', () => this.showScreen('city-screen'));

        // Mini-games
        document.getElementById('word-drop-btn').addEventListener('click', () => this.showScreen('word-drop-game'));
        document.getElementById('rhyme-chains-btn').addEventListener('click', () => this.showScreen('rhyme-chains-game'));
        document.getElementById('recording-booth-btn').addEventListener('click', () => this.showScreen('recording-booth-game'));

        document.getElementById('word-drop-back').addEventListener('click', () => this.showScreen('lyric-lab-screen'));
        document.getElementById('rhyme-chains-back').addEventListener('click', () => this.showScreen('lyric-lab-screen'));
        document.getElementById('recording-back').addEventListener('click', () => this.showScreen('lyric-lab-screen'));

        // Mini-game actions
        document.getElementById('word-drop-start').addEventListener('click', () => this.startWordDrop());
        document.getElementById('rhyme-submit').addEventListener('click', () => this.submitRhyme());
        document.getElementById('recording-start').addEventListener('click', () => this.startRecording());
        document.getElementById('freestyle-submit').addEventListener('click', () => this.submitFreestyle());

        // Rhyme input enter key
        document.getElementById('rhyme-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.submitRhyme();
        });
    }

    startGame() {
        const nameInput = document.getElementById('player-name');
        if (nameInput.value.trim()) {
            this.player.name = nameInput.value.trim();
            this.showScreen('city-screen');
            this.updateStats();
            this.showNotification(`Welcome, ${this.player.name}! Your journey begins in the 1980s Bronx.`);
        } else {
            this.showNotification('Please enter your artist name!');
        }
    }

    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        document.getElementById(screenId).classList.add('active');
        this.gameState.currentScreen = screenId;

        if (screenId === 'build-screen') {
            this.renderBuildMenu();
        } else if (screenId === 'rhyme-chains-game') {
            this.startRhymeChains();
        }
    }

    updateStats() {
        document.getElementById('rep-value').textContent = this.player.rep;
        document.getElementById('money-value').textContent = `$${this.player.money}`;
        document.getElementById('skills-value').textContent = this.player.skills;
        document.getElementById('era-value').textContent = this.player.era;

        // Check for era progression
        this.checkEraProgression();
        // Check for collectible unlocks
        this.checkCollectibles();
    }

    checkEraProgression() {
        for (let i = this.eras.length - 1; i >= 0; i--) {
            if (this.player.rep >= this.eras[i].repRequired && this.player.era !== this.eras[i].name) {
                this.player.era = this.eras[i].name;
                this.showNotification(`🎉 Era unlocked: ${this.eras[i].name}!`);
                break;
            }
        }
    }

    checkCollectibles() {
        this.collectibles.forEach(collectible => {
            if (!collectible.unlocked && this.player.rep >= collectible.repRequired) {
                collectible.unlocked = true;
                this.player.collectibles.push(collectible.id);
                this.showNotification(`🎁 Collectible unlocked: ${collectible.name}!`);
            }
        });
    }

    renderCity() {
        const cityGrid = document.getElementById('city-grid');
        cityGrid.innerHTML = '';

        for (let i = 0; i < this.gameState.citySlots; i++) {
            const slot = document.createElement('div');
            slot.className = 'city-slot';

            if (i < this.player.buildings.length) {
                const building = this.buildings.find(b => b.id === this.player.buildings[i]);
                if (building) {
                    slot.classList.add('built');
                    slot.innerHTML = `
                        <div class="building-icon">${building.icon}</div>
                        <div class="building-name">${building.name}</div>
                    `;
                }
            } else {
                slot.innerHTML = '<div style="color: rgba(255,255,255,0.3);">Empty Lot</div>';
            }

            cityGrid.appendChild(slot);
        }
    }

    renderBuildMenu() {
        const buildingList = document.getElementById('building-list');
        buildingList.innerHTML = '';

        this.buildings.forEach(building => {
            const card = document.createElement('div');
            card.className = 'building-card';
            if (building.owned) card.classList.add('owned');

            card.innerHTML = `
                <div class="building-icon" style="font-size: 3rem;">${building.icon}</div>
                <h3>${building.name}</h3>
                <div class="cost">Cost: $${building.cost}</div>
                <div class="benefit">+${building.repBonus} Rep</div>
                <button class="primary-btn" ${building.owned ? 'disabled' : ''} 
                    onclick="game.buyBuilding('${building.id}')">
                    ${building.owned ? 'Owned' : 'Build'}
                </button>
            `;

            buildingList.appendChild(card);
        });
    }

    buyBuilding(buildingId) {
        const building = this.buildings.find(b => b.id === buildingId);
        if (!building || building.owned) return;

        if (this.player.money >= building.cost) {
            this.player.money -= building.cost;
            this.player.rep += building.repBonus;
            building.owned = true;
            this.player.buildings.push(buildingId);

            this.updateStats();
            this.renderCity();
            this.renderBuildMenu();
            this.showNotification(`Built ${building.name}! +${building.repBonus} Rep`);
        } else {
            this.showNotification('Not enough money!');
        }
    }

    showTriviaQuestion() {
        const question = this.triviaQuestions[Math.floor(Math.random() * this.triviaQuestions.length)];
        
        document.getElementById('trivia-question').textContent = question.question;
        
        const answersContainer = document.getElementById('trivia-answers');
        answersContainer.innerHTML = '';
        
        question.answers.forEach((answer, index) => {
            const btn = document.createElement('button');
            btn.className = 'answer-btn';
            btn.textContent = answer;
            btn.onclick = () => this.checkTriviaAnswer(index, question.correct, btn);
            answersContainer.appendChild(btn);
        });

        document.getElementById('trivia-result').textContent = '';
        this.showScreen('trivia-screen');
    }

    checkTriviaAnswer(selected, correct, button) {
        const resultDiv = document.getElementById('trivia-result');
        const buttons = document.querySelectorAll('.answer-btn');
        
        buttons.forEach(btn => btn.disabled = true);

        if (selected === correct) {
            button.classList.add('correct');
            const reward = 50 + (this.player.skills * 10);
            this.player.rep += reward;
            this.player.money += 100;
            this.gameState.triviaAnswered++;
            
            resultDiv.className = 'result-message success';
            resultDiv.textContent = `Correct! +${reward} Rep, +$100`;
            
            this.updateStats();
        } else {
            button.classList.add('incorrect');
            buttons[correct].classList.add('correct');
            
            resultDiv.className = 'result-message error';
            resultDiv.textContent = 'Not quite! Study up and try again.';
        }
    }

    showFreestyle() {
        const prompt = this.freestylePrompts[Math.floor(Math.random() * this.freestylePrompts.length)];
        document.getElementById('freestyle-prompt').textContent = prompt;
        document.getElementById('freestyle-input').value = '';
        document.getElementById('freestyle-feedback').textContent = '';
        this.showScreen('freestyle-screen');
    }

    submitFreestyle() {
        const input = document.getElementById('freestyle-input').value.trim();
        const feedback = document.getElementById('freestyle-feedback');

        if (input.length < 20) {
            feedback.textContent = 'Your freestyle is too short! Keep going...';
            return;
        }

        const lines = input.split('\n').filter(line => line.trim());
        const words = input.split(/\s+/).length;

        let score = Math.min(100, words * 5);
        let repGain = Math.floor(score / 2) + (this.player.skills * 5);

        this.player.rep += repGain;
        this.player.money += 50;
        this.player.skills += 1;
        this.gameState.freestyleCompleted++;

        feedback.textContent = `🔥 Fire freestyle! Score: ${score}/100. +${repGain} Rep, +$50, +1 Skill`;
        this.updateStats();
    }

    // Lyric Lab Mini-Games

    startRhymeChains() {
        const randomIndex = Math.floor(Math.random() * this.rhymeWords.length);
        this.currentRhymeSet = this.rhymeWords[randomIndex];
        this.currentChain = [];
        this.usedWords = new Set();

        document.getElementById('current-word').textContent = this.currentRhymeSet.word;
        document.getElementById('chain-length').textContent = '0';
        document.getElementById('rhyme-input').value = '';
        document.getElementById('rhyme-chain-display').innerHTML = '';
        
        const bestChain = localStorage.getItem('bestChain') || 0;
        document.getElementById('best-chain').textContent = bestChain;
    }

    submitRhyme() {
        const input = document.getElementById('rhyme-input').value.trim().toLowerCase();
        
        if (!input) return;

        if (this.usedWords.has(input)) {
            this.showNotification('Word already used!');
            return;
        }

        if (this.currentRhymeSet.rhymes.includes(input)) {
            this.currentChain.push(input);
            this.usedWords.add(input);
            
            const chainDisplay = document.getElementById('rhyme-chain-display');
            const wordSpan = document.createElement('span');
            wordSpan.className = 'chain-word';
            wordSpan.textContent = input;
            chainDisplay.appendChild(wordSpan);

            document.getElementById('chain-length').textContent = this.currentChain.length;
            document.getElementById('rhyme-input').value = '';

            this.player.rep += 10;
            this.player.skills += 1;
            this.updateStats();

            const bestChain = parseInt(localStorage.getItem('bestChain') || 0);
            if (this.currentChain.length > bestChain) {
                localStorage.setItem('bestChain', this.currentChain.length);
                document.getElementById('best-chain').textContent = this.currentChain.length;
                this.showNotification('New record!');
            }
        } else {
            this.showNotification("That doesn't rhyme! Chain broken.");
            this.startRhymeChains();
        }
    }

    startWordDrop() {
        const canvas = document.getElementById('word-drop-canvas');
        const ctx = canvas.getContext('2d');
        let score = 0;
        let timeLeft = 30;
        let words = [];
        let gameActive = true;
        let playerX = canvas.width / 2;

        document.getElementById('word-drop-score').textContent = '0';
        document.getElementById('word-drop-time').textContent = '30';

        class FallingWord {
            constructor() {
                this.text = game.wordDropWords[Math.floor(Math.random() * game.wordDropWords.length)];
                this.x = Math.random() * (canvas.width - 100);
                this.y = -20;
                this.speed = 1 + Math.random() * 2;
                this.caught = false;
            }

            update() {
                this.y += this.speed;
            }

            draw() {
                ctx.fillStyle = '#FF6B35';
                ctx.font = 'bold 20px Arial';
                ctx.fillText(this.text, this.x, this.y);
            }
        }

        const timer = setInterval(() => {
            timeLeft--;
            document.getElementById('word-drop-time').textContent = timeLeft;
            
            if (timeLeft <= 0) {
                clearInterval(timer);
                clearInterval(gameLoop);
                gameActive = false;
                
                const repGain = score * 2;
                game.player.rep += repGain;
                game.player.money += score * 5;
                game.player.skills += 1;
                game.updateStats();
                
                ctx.fillStyle = '#FDC830';
                ctx.font = 'bold 30px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(`Game Over! Score: ${score}`, canvas.width / 2, canvas.height / 2);
                ctx.fillText(`+${repGain} Rep!`, canvas.width / 2, canvas.height / 2 + 40);
            }
        }, 1000);

        const spawnWord = setInterval(() => {
            if (gameActive) {
                words.push(new FallingWord());
            }
        }, 1500);

        canvas.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            playerX = e.clientX - rect.left;
        });

        const gameLoop = setInterval(() => {
            if (!gameActive) {
                clearInterval(gameLoop);
                clearInterval(spawnWord);
                return;
            }

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw player
            ctx.fillStyle = '#FDC830';
            ctx.fillRect(playerX - 40, canvas.height - 30, 80, 10);

            words.forEach((word, index) => {
                word.update();
                word.draw();

                // Check collision
                if (word.y > canvas.height - 40 && word.y < canvas.height - 20 &&
                    word.x > playerX - 40 && word.x < playerX + 40 && !word.caught) {
                    word.caught = true;
                    score += 10;
                    document.getElementById('word-drop-score').textContent = score;
                    words.splice(index, 1);
                }

                // Remove words that fell off screen
                if (word.y > canvas.height) {
                    words.splice(index, 1);
                }
            });
        }, 1000 / 60);
    }

    startRecording() {
        let accuracy = 0;
        let combo = 0;
        let totalBeats = 8;
        let currentBeat = 0;
        let hits = 0;

        const beatContainer = document.getElementById('rhythm-beat-container');
        const lyricsDiv = document.getElementById('rhythm-lyrics');

        document.getElementById('rhythm-accuracy').textContent = '0';
        document.getElementById('rhythm-combo').textContent = '0';

        const lyrics = [
            "When the beat drops",
            "Hit the space bar",
            "Keep the rhythm tight",
            "Show your skills"
        ];

        let currentLyricIndex = 0;
        lyricsDiv.textContent = lyrics[currentLyricIndex];

        const spawnBeat = () => {
            if (currentBeat >= totalBeats) {
                const finalAccuracy = Math.floor((hits / totalBeats) * 100);
                const repGain = finalAccuracy + (combo * 5);
                
                this.player.rep += repGain;
                this.player.skills += 1;
                this.updateStats();
                
                lyricsDiv.textContent = `Performance complete! Accuracy: ${finalAccuracy}% - +${repGain} Rep`;
                document.removeEventListener('keydown', keyHandler);
                return;
            }

            const beat = document.createElement('div');
            beat.className = 'rhythm-beat';
            beatContainer.appendChild(beat);

            let beatHit = false;

            const checkHit = (e) => {
                if (e.code === 'Space') {
                    e.preventDefault();
                    const beatPos = beat.offsetLeft;
                    const targetPos = document.getElementById('rhythm-target').offsetLeft;
                    const distance = Math.abs(beatPos - targetPos);

                    if (distance < 50 && !beatHit) {
                        beatHit = true;
                        hits++;
                        combo++;
                        beat.style.background = '#4CAF50';
                        document.getElementById('rhythm-combo').textContent = combo;
                    }
                }
            };

            const keyHandler = checkHit;
            document.addEventListener('keydown', keyHandler);

            setTimeout(() => {
                beat.remove();
                document.removeEventListener('keydown', keyHandler);
                
                if (!beatHit) {
                    combo = 0;
                    document.getElementById('rhythm-combo').textContent = '0';
                }

                accuracy = Math.floor((hits / (currentBeat + 1)) * 100);
                document.getElementById('rhythm-accuracy').textContent = accuracy;

                currentBeat++;
                currentLyricIndex = (currentLyricIndex + 1) % lyrics.length;
                lyricsDiv.textContent = lyrics[currentLyricIndex];

                setTimeout(spawnBeat, 500);
            }, 2000);
        };

        spawnBeat();
    }

    showCollectibles() {
        const grid = document.getElementById('collectibles-grid');
        grid.innerHTML = '';

        this.collectibles.forEach(collectible => {
            const item = document.createElement('div');
            item.className = 'collectible-item';
            if (collectible.unlocked) item.classList.add('unlocked');

            item.innerHTML = `
                <div class="collectible-icon">${collectible.unlocked ? collectible.icon : '🔒'}</div>
                <div class="collectible-name">${collectible.unlocked ? collectible.name : 'Locked'}</div>
                <div class="collectible-desc">${collectible.unlocked ? `Unlocked at ${collectible.repRequired} Rep` : `Unlock at ${collectible.repRequired} Rep`}</div>
            `;

            grid.appendChild(item);
        });

        this.showScreen('collectibles-screen');
    }

    showNotification(message) {
        const container = document.getElementById('notification-container');
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        
        container.appendChild(notification);

        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Initialize game
const game = new HipHopCityBuilder();
