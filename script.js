document.addEventListener('DOMContentLoaded', function() {
    // Simulate loading
    setTimeout(function() {
        document.querySelector('.loading-screen').style.opacity = '0';
        setTimeout(function() {
            document.querySelector('.loading-screen').style.display = 'none';
            document.querySelector('.container').classList.add('loaded');
            
            // Initialize particles after loading
            initParticles();
            
            // Play background music
            const bgMusic = document.getElementById('background-music');
            bgMusic.volume = 0.3;
            bgMusic.play().catch(e => console.log('Auto-play prevented:', e));
        }, 1000);
    }, 3000);
    
    // Custom cursor
    const cursor = document.querySelector('.custom-cursor');
    document.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
    });
    
    // Cursor hover effects
    const hoverElements = document.querySelectorAll('a, button, .game-card, .memory-card');
    hoverElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursor.classList.add('active');
        });
        el.addEventListener('mouseleave', () => {
            cursor.classList.remove('active');
        });
    });
    
    // Navigation
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            playSound('click-sound');
            
            // Remove active class from all links
            navLinks.forEach(l => l.classList.remove('active'));
            
            // Add active class to clicked link
            link.classList.add('active');
            
            // Hide all sections
            document.querySelectorAll('.content-section').forEach(section => {
                section.classList.remove('active');
            });
            
            // Show selected section
            const sectionId = link.getAttribute('data-section');
            document.getElementById(sectionId).classList.add('active');
        });
    });
    
    // Explore button
    document.querySelector('.btn-explore').addEventListener('click', () => {
        playSound('click-sound');
        document.querySelector('.nav-link[data-section="games"]').click();
    });
    
    // Game cards
    const gameCards = document.querySelectorAll('.game-card');
    gameCards.forEach(card => {
        card.addEventListener('click', (e) => {
            // Only proceed if the click is on the card itself or the play button
            if (e.target.classList.contains('game-card') || e.target.classList.contains('btn-play')) {
                playSound('game-start-sound');
                const gameType = card.getAttribute('data-game');
                startGame(gameType);
            }
        });
    });
    
    // Music toggle
    const musicToggle = document.querySelector('.music-toggle');
    const bgMusic = document.getElementById('background-music');
    let isMusicPlaying = false;
    
    musicToggle.addEventListener('click', () => {
        playSound('click-sound');
        isMusicPlaying = !isMusicPlaying;
        
        if (isMusicPlaying) {
            bgMusic.play();
            musicToggle.innerHTML = '<i class="fas fa-music"></i><span>MUSIC ON</span>';
        } else {
            bgMusic.pause();
            musicToggle.innerHTML = '<i class="fas fa-music"></i><span>MUSIC OFF</span>';
        }
    });
    
    // Leaderboard tabs
    const leaderboardTabs = document.querySelectorAll('.tab-btn');
    leaderboardTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            playSound('click-sound');
            leaderboardTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            updateLeaderboard(tab.getAttribute('data-game'));
        });
    });
    
    // Initialize leaderboard with first tab active
    if (leaderboardTabs.length > 0) {
        updateLeaderboard(leaderboardTabs[0].getAttribute('data-game'));
    }
    
    // Game exit button
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-exit')) {
            playSound('click-sound');
            document.querySelector('.game-screen').classList.remove('active');
            setTimeout(() => {
                document.querySelector('.game-screen').style.display = 'none';
            }, 500);
        }
    });
    
    // Function to play sounds
    function playSound(soundId) {
        const sound = document.getElementById(soundId);
        sound.currentTime = 0;
        sound.play().catch(e => console.log('Sound play prevented:', e));
    }
    
    // Function to start a game
    function startGame(gameType) {
        const gameScreen = document.querySelector('.game-screen');
        gameScreen.style.display = 'flex';
        setTimeout(() => {
            gameScreen.classList.add('active');
        }, 10);
        
        // Initialize the selected game
        switch(gameType) {
            case 'memory':
                initMemoryGame();
                break;
            case 'snake':
                initSnakeGame();
                break;
            case 'typing':
                initTypingGame();
                break;
            default:
                console.log(`Game ${gameType} not implemented yet`);
        }
    }
    
    // Memory Game Implementation
    function initMemoryGame() {
        const memoryBoard = document.getElementById('memory-board');
        memoryBoard.innerHTML = '';
        
        // Update game header
        document.querySelector('.game-header h2').textContent = 'MEMORY MATCH';
        
        // Card symbols (using Font Awesome icons)
        const symbols = [
            'fas fa-gamepad', 'fas fa-gamepad',
            'fas fa-ghost', 'fas fa-ghost',
            'fas fa-dragon', 'fas fa-dragon',
            'fas fa-crown', 'fas fa-crown',
            'fas fa-chess', 'fas fa-chess',
            'fas fa-dice', 'fas fa-dice',
            'fas fa-flag', 'fas fa-flag',
            'fas fa-headset', 'fas fa-headset'
        ];
        
        // Shuffle symbols
        const shuffledSymbols = shuffleArray([...symbols]);
        
        // Create cards
        shuffledSymbols.forEach((symbol, index) => {
            const card = document.createElement('div');
            card.className = 'memory-card';
            card.dataset.index = index;
            card.dataset.symbol = symbol;
            
            const cardContent = document.createElement('div');
            cardContent.className = 'card-content';
            
            const icon = document.createElement('i');
            icon.className = symbol;
            
            cardContent.appendChild(icon);
            card.appendChild(cardContent);
            memoryBoard.appendChild(card);
            
            // Add click event
            card.addEventListener('click', flipCard);
        });
        
        // Game state
        let hasFlippedCard = false;
        let lockBoard = false;
        let firstCard, secondCard;
        let matchedPairs = 0;
        let score = 0;
        let timeLeft = 60;
        let timer;
        
        // Update score display
        const scoreDisplay = document.querySelector('.game-stats .score span');
        const timerDisplay = document.querySelector('.game-stats .timer span');
        
        scoreDisplay.textContent = score;
        timerDisplay.textContent = timeLeft;
        
        // Start timer
        timer = setInterval(() => {
            timeLeft--;
            timerDisplay.textContent = timeLeft;
            
            if (timeLeft <= 0) {
                clearInterval(timer);
                endGame(false);
            }
        }, 1000);
        
        // Restart button
        document.querySelector('.btn-restart').addEventListener('click', () => {
            playSound('click-sound');
            clearInterval(timer);
            initMemoryGame();
        });
        
        function flipCard() {
            if (lockBoard) return;
            if (this === firstCard) return;
            
            playSound('card-flip-sound');
            
            this.classList.add('flipped');
            
            if (!hasFlippedCard) {
                // First click
                hasFlippedCard = true;
                firstCard = this;
                return;
            }
            
            // Second click
            secondCard = this;
            checkForMatch();
        }
        
        function checkForMatch() {
            const isMatch = firstCard.dataset.symbol === secondCard.dataset.symbol;
            
            if (isMatch) {
                disableCards();
                playSound('match-sound');
                score += 10;
                scoreDisplay.textContent = score;
                matchedPairs++;
                
                if (matchedPairs === symbols.length / 2) {
                    clearInterval(timer);
                    endGame(true);
                }
            } else {
                unflipCards();
                score = Math.max(0, score - 2);
                scoreDisplay.textContent = score;
            }
        }
        
        function disableCards() {
            firstCard.removeEventListener('click', flipCard);
            secondCard.removeEventListener('click', flipCard);
            firstCard.classList.add('matched');
            secondCard.classList.add('matched');
            
            resetBoard();
        }
        
        function unflipCards() {
            lockBoard = true;
            
            setTimeout(() => {
                firstCard.classList.remove('flipped');
                secondCard.classList.remove('flipped');
                
                resetBoard();
            }, 1000);
        }
        
        function resetBoard() {
            [hasFlippedCard, lockBoard] = [false, false];
            [firstCard, secondCard] = [null, null];
        }
        
        function endGame(isWin) {
            if (isWin) {
                playSound('game-win-sound');
                // Add confetti effect
                for (let i = 0; i < 100; i++) {
                    createConfetti();
                }
            } else {
                playSound('game-lose-sound');
            }
            
            // Save score to leaderboard
            saveScore('memory', score, isWin);
        }
    }
    
    // Snake Game Implementation
    function initSnakeGame() {
        const memoryBoard = document.getElementById('memory-board');
        memoryBoard.innerHTML = '';
        
        // Update game header
        document.querySelector('.game-header h2').textContent = 'NEON SNAKE';
        
        // Create canvas for snake game
        const canvas = document.createElement('canvas');
        canvas.id = 'snake-canvas';
        canvas.width = 400;
        canvas.height = 400;
        memoryBoard.appendChild(canvas);
        
        const ctx = canvas.getContext('2d');
        const box = 20;
        let snake = [{x: 9 * box, y: 10 * box}];
        let food = {
            x: Math.floor(Math.random() * 20) * box,
            y: Math.floor(Math.random() * 20) * box
        };
        let d;
        let score = 0;
        let game;
        let timeLeft = 60;
        let timer;
        
        // Update score display
        const scoreDisplay = document.querySelector('.game-stats .score span');
        const timerDisplay = document.querySelector('.game-stats .timer span');
        
        scoreDisplay.textContent = score;
        timerDisplay.textContent = timeLeft;
        
        // Start timer
        timer = setInterval(() => {
            timeLeft--;
            timerDisplay.textContent = timeLeft;
            
            if (timeLeft <= 0) {
                clearInterval(timer);
                clearInterval(game);
                endGame(false);
            }
        }, 1000);
        
        // Draw game elements
        function draw() {
            // Clear canvas
            ctx.fillStyle = '#0a0a1a';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Draw snake
            for (let i = 0; i < snake.length; i++) {
                ctx.fillStyle = i === 0 ? '#00f7ff' : '#ff00f7';
                ctx.fillRect(snake[i].x, snake[i].y, box, box);
                
                ctx.strokeStyle = '#0a0a1a';
                ctx.strokeRect(snake[i].x, snake[i].y, box, box);
            }
            
            // Draw food
            ctx.fillStyle = '#f7ff00';
            ctx.fillRect(food.x, food.y, box, box);
            
            // Current head position
            let snakeX = snake[0].x;
            let snakeY = snake[0].y;
            
            // Direction handling
            if (d === 'LEFT') snakeX -= box;
            if (d === 'UP') snakeY -= box;
            if (d === 'RIGHT') snakeX += box;
            if (d === 'DOWN') snakeY += box;
            
            // Check collision with food
            if (snakeX === food.x && snakeY === food.y) {
                playSound('match-sound');
                score += 10;
                scoreDisplay.textContent = score;
                food = {
                    x: Math.floor(Math.random() * 20) * box,
                    y: Math.floor(Math.random() * 20) * box
                };
            } else {
                // Remove tail
                snake.pop();
            }
            
            // Add new head
            let newHead = {
                x: snakeX,
                y: snakeY
            };
            
            // Game over conditions
            if (
                snakeX < 0 || snakeY < 0 ||
                snakeX >= canvas.width || snakeY >= canvas.height ||
                collision(newHead, snake)
            ) {
                clearInterval(game);
                clearInterval(timer);
                endGame(false);
                return;
            }
            
            snake.unshift(newHead);
        }
        
        // Check collision with self
        function collision(head, array) {
            for (let i = 0; i < array.length; i++) {
                if (head.x === array[i].x && head.y === array[i].y) {
                    return true;
                }
            }
            return false;
        }
        
        // Control the snake
        document.addEventListener('keydown', direction);
        
        function direction(event) {
            if (event.keyCode === 37 && d !== 'RIGHT') {
                d = 'LEFT';
            } else if (event.keyCode === 38 && d !== 'DOWN') {
                d = 'UP';
            } else if (event.keyCode === 39 && d !== 'LEFT') {
                d = 'RIGHT';
            } else if (event.keyCode === 40 && d !== 'UP') {
                d = 'DOWN';
            }
        }
        
        // Start game loop
        game = setInterval(draw, 100);
        
        // Restart button
        document.querySelector('.btn-restart').addEventListener('click', () => {
            playSound('click-sound');
            clearInterval(game);
            clearInterval(timer);
            initSnakeGame();
        });
        
        function endGame(isWin) {
            if (isWin) {
                playSound('game-win-sound');
                // Add confetti effect
                for (let i = 0; i < 100; i++) {
                    createConfetti();
                }
            } else {
                playSound('game-lose-sound');
            }
            
            // Save score to leaderboard
            saveScore('snake', score, isWin);
        }
    }
    
    // Typing Game Implementation
    function initTypingGame() {
        const memoryBoard = document.getElementById('memory-board');
        memoryBoard.innerHTML = '';
        
        // Update game header
        document.querySelector('.game-header h2').textContent = 'SPEED TYPING';
        
        // Create typing game elements
        const gameContainer = document.createElement('div');
        gameContainer.className = 'typing-game-container';
        
        const quoteDisplay = document.createElement('div');
        quoteDisplay.id = 'quote-display';
        quoteDisplay.className = 'quote-display';
        
        const inputElement = document.createElement('input');
        inputElement.type = 'text';
        inputElement.id = 'typing-input';
        inputElement.className = 'typing-input';
        
        const timerElement = document.createElement('div');
        timerElement.id = 'typing-timer';
        timerElement.className = 'typing-timer';
        
        const resultElement = document.createElement('div');
        resultElement.id = 'typing-result';
        resultElement.className = 'typing-result';
        
        gameContainer.appendChild(quoteDisplay);
        gameContainer.appendChild(inputElement);
        gameContainer.appendChild(timerElement);
        gameContainer.appendChild(resultElement);
        memoryBoard.appendChild(gameContainer);
        
        // Sample quotes
        const quotes = [
            "The quick brown fox jumps over the lazy dog",
            "Programming is the art of telling another human what one wants the computer to do",
            "May the force be with you",
            "With great power comes great responsibility",
            "To be or not to be that is the question",
            "I think therefore I am",
            "The only way to learn a new programming language is by writing programs in it",
            "The best way to predict the future is to invent it"
        ];
        
        let currentQuote = '';
        let startTime;
        let timer;
        let timeLeft = 60;
        let score = 0;
        
        // Update score display
        const scoreDisplay = document.querySelector('.game-stats .score span');
        const timerDisplay = document.querySelector('.game-stats .timer span');
        
        scoreDisplay.textContent = score;
        timerDisplay.textContent = timeLeft;
        
        // Start game timer
        timer = setInterval(() => {
            timeLeft--;
            timerDisplay.textContent = timeLeft;
            
            if (timeLeft <= 0) {
                endGame();
            }
        }, 1000);
        
        // Start new round
        newQuote();
        
        // Input event handler
        inputElement.addEventListener('input', () => {
            const arrayQuote = currentQuote.split('');
            const arrayInput = inputElement.value.split('');
            
            let correct = true;
            quoteDisplay.innerHTML = '';
            
            arrayQuote.forEach((character, index) => {
                const span = document.createElement('span');
                span.innerText = character;
                
                if (arrayInput[index] == null) {
                    span.classList.add('pending');
                } else if (character === arrayInput[index]) {
                    span.classList.add('correct');
                } else {
                    span.classList.add('incorrect');
                    correct = false;
                }
                
                quoteDisplay.appendChild(span);
            });
            
            if (correct) {
                playSound('match-sound');
                const timeTaken = (new Date().getTime() - startTime) / 1000;
                const wpm = Math.round((currentQuote.length / 5) / (timeTaken / 60));
                score += wpm;
                scoreDisplay.textContent = score;
                
                resultElement.innerHTML = `WPM: ${wpm}`;
                inputElement.value = '';
                setTimeout(newQuote, 1500);
            }
        });
        
        function newQuote() {
            currentQuote = quotes[Math.floor(Math.random() * quotes.length)];
            quoteDisplay.innerHTML = '';
            
            currentQuote.split('').forEach(character => {
                const span = document.createElement('span');
                span.innerText = character;
                span.classList.add('pending');
                quoteDisplay.appendChild(span);
            });
            
            inputElement.value = '';
            inputElement.focus();
            startTime = new Date().getTime();
            resultElement.innerHTML = '';
        }
        
        // Restart button
        document.querySelector('.btn-restart').addEventListener('click', () => {
            playSound('click-sound');
            clearInterval(timer);
            initTypingGame();
        });
        
        function endGame() {
            clearInterval(timer);
            playSound('game-lose-sound');
            
            // Save score to leaderboard
            saveScore('typing', score, false);
        }
    }
    
    // Helper function to shuffle array
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
    
    // Leaderboard functions
    function updateLeaderboard(gameType) {
        const leaderboardData = document.getElementById('leaderboard-data');
        leaderboardData.innerHTML = '';
        
        const scores = getScores(gameType);
        
        if (scores.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = '<td colspan="4">No scores yet. Be the first!</td>';
            leaderboardData.appendChild(row);
            return;
        }
        
        scores.forEach((score, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${score.name || 'Anonymous'}</td>
                <td>${score.score}</td>
                <td>${new Date(score.date).toLocaleDateString()}</td>
            `;
            leaderboardData.appendChild(row);
        });
    }
    
    function getScores(gameType) {
        const scores = JSON.parse(localStorage.getItem(`leaderboard_${gameType}`)) || [];
        return scores.sort((a, b) => b.score - a.score).slice(0, 10);
    }
    
    function saveScore(gameType, score, isWin) {
        const scores = JSON.parse(localStorage.getItem(`leaderboard_${gameType}`)) || [];
        
        // In a real app, you'd prompt for the player's name
        const playerName = prompt(isWin ? 'You won! Enter your name:' : 'Game over. Enter your name:', 'Player');
        
        scores.push({
            name: playerName || 'Anonymous',
            score: score,
            date: new Date().toISOString(),
            win: isWin
        });
        
        localStorage.setItem(`leaderboard_${gameType}`, JSON.stringify(scores));
        updateLeaderboard(gameType);
    }
    
    // Create confetti effect
    function createConfetti() {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + 'vw';
        confetti.style.backgroundColor = `hsl(${Math.random() * 360}, 100%, 50%)`;
        confetti.style.animationDuration = Math.random() * 3 + 2 + 's';
        document.body.appendChild(confetti);
        
        setTimeout(() => {
            confetti.remove();
        }, 5000);
    }
    
    // Particles effect for home section
    function initParticles() {
        const particlesContainer = document.getElementById('particles-js');
        if (!particlesContainer) return;
        
        const particleCount = 50;
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            
            // Random properties
            const size = Math.random() * 5 + 1;
            const posX = Math.random() * 100;
            const posY = Math.random() * 100;
            const delay = Math.random() * 10;
            const duration = Math.random() * 20 + 10;
            const color = `hsl(${Math.random() * 60 + 180}, 100%, 50%)`;
            
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            particle.style.left = `${posX}%`;
            particle.style.top = `${posY}%`;
            particle.style.backgroundColor = color;
            particle.style.animationDelay = `${delay}s`;
            particle.style.animationDuration = `${duration}s`;
            
            particlesContainer.appendChild(particle);
        }
    }
});

// Add CSS for new game elements
const style = document.createElement('style');
style.textContent = `
    @keyframes confettiFall {
        0% { transform: translateY(-100vh) rotate(0deg); opacity: 1; }
        100% { transform: translateY(100vh) rotate(360deg); opacity: 0; }
    }
    
    .confetti {
        position: fixed;
        width: 10px;
        height: 10px;
        border-radius: 50%;
        animation: confettiFall linear forwards;
        z-index: 9998;
    }
    
    @keyframes particleFloat {
        0%, 100% { transform: translate(0, 0); opacity: 0.8; }
        25% { transform: translate(10px, 10px); opacity: 0.5; }
        50% { transform: translate(0, 20px); opacity: 0.8; }
        75% { transform: translate(-10px, 10px); opacity: 0.5; }
    }
    
    .particle {
        position: absolute;
        border-radius: 50%;
        animation: particleFloat infinite ease-in-out;
        opacity: 0.8;
        filter: blur(1px);
    }
    
    /* Snake Game Styles */
    #snake-canvas {
        border: 2px solid var(--primary-color);
        box-shadow: var(--neon-glow);
        margin: 0 auto;
        display: block;
    }
    
    /* Typing Game Styles */
    .typing-game-container {
        max-width: 600px;
        margin: 0 auto;
        text-align: center;
    }
    
    .quote-display {
        font-size: 24px;
        margin-bottom: 20px;
        min-height: 100px;
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
    }
    
    .quote-display span {
        margin: 0 2px;
    }
    
    .quote-display .correct {
        color: var(--primary-color);
    }
    
    .quote-display .incorrect {
        color: var(--secondary-color);
        text-decoration: underline;
    }
    
    .quote-display .pending {
        color: var(--text-color);
    }
    
    .typing-input {
        width: 100%;
        padding: 15px;
        font-size: 18px;
        background: rgba(255, 255, 255, 0.1);
        border: 2px solid var(--primary-color);
        color: var(--text-color);
        border-radius: 5px;
        margin-bottom: 20px;
        font-family: 'Orbitron', sans-serif;
    }
    
    .typing-timer {
        font-size: 24px;
        color: var(--primary-color);
        margin-bottom: 20px;
    }
    
    .typing-result {
        font-size: 20px;
        color: var(--accent-color);
    }
`;
document.head.appendChild(style);