document.addEventListener('DOMContentLoaded', function() {
    // Initialize Particles.js
    if (typeof particlesJS !== 'undefined') {
        particlesJS('particles-js', particlesConfig);
    }

    // Game Elements
    const board = document.getElementById('board');
    const cells = [];
    const status = document.getElementById('status');
    const playerX = document.getElementById('playerX');
    const playerO = document.getElementById('playerO');
    const scoreX = document.getElementById('scoreX');
    const scoreO = document.getElementById('scoreO');
    const resetBtn = document.getElementById('resetBtn');
    const modeBtn = document.getElementById('modeBtn');
    const themeBtn = document.getElementById('themeBtn');
    const soundBtn = document.getElementById('soundBtn');
    const historyList = document.getElementById('historyList');
    const historyCount = document.querySelector('.history-count');
    const clearHistoryBtn = document.getElementById('clearHistory');
    const instructionsBtn = document.getElementById('instructionsBtn');
    const shareBtn = document.getElementById('shareBtn');
    const difficultyBtns = document.querySelectorAll('.diff-btn');
    const instructionsModal = document.getElementById('instructionsModal');
    const closeModalBtn = document.querySelector('.close-modal');
    const confettiCanvas = document.getElementById('confettiCanvas');

    // Stats Elements
    const totalGamesEl = document.getElementById('totalGames');
    const winStreakEl = document.getElementById('winStreak');
    const timerEl = document.getElementById('timer');
    const movesCountEl = document.getElementById('movesCount');
    const winRateEl = document.getElementById('winRate');
    const currentStreakEl = document.getElementById('currentStreak');
    const bestTimeEl = document.getElementById('bestTime');
    const gameModeEl = document.getElementById('gameMode');

    // Audio Elements
    const clickSound = document.getElementById('clickSound');
    const winSound = document.getElementById('winSound');
    const drawSound = document.getElementById('drawSound');

    // Game State
    let currentPlayer = 'X';
    let gameState = ['', '', '', '', '', '', '', '', ''];
    let gameActive = true;
    let vsComputer = false;
    let scores = { X: 0, O: 0 };
    let gameHistory = [];
    let currentTheme = 0;
    let soundEnabled = true;
    let difficulty = 'medium';
    let movesCount = 0;
    let gameTimer = 0;
    let timerInterval = null;
    let totalGames = 0;
    let currentWinStreak = 0;
    let bestWinStreak = 0;
    let wins = 0;
    let losses = 0;
    let draws = 0;
    let bestTime = null;

    // Themes
    const themes = [
        {
            name: "Neon Blue",
            primary: "#0ff0fc",
            secondary: "#ff2a6d",
            accent: "#00ff88"
        },
        {
            name: "Neon Pink",
            primary: "#ff2a6d",
            secondary: "#0ff0fc",
            accent: "#ffd32a"
        },
        {
            name: "Neon Purple",
            primary: "#d300c5",
            secondary: "#00ff88",
            accent: "#0ff0fc"
        },
        {
            name: "Neon Green",
            primary: "#00ff88",
            secondary: "#d300c5",
            accent: "#ff2a6d"
        },
        {
            name: "Cyber Orange",
            primary: "#ff9500",
            secondary: "#00d4ff",
            accent: "#ff2a6d"
        }
    ];

    // Winning Conditions
    const winningConditions = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
        [0, 4, 8], [2, 4, 6]             // diagonals
    ];

    // Initialize Game
    function initGame() {
        loadGameStats();
        initializeBoard();
        updateStatsDisplay();
        startTimer();
        updateTheme();
    }

    // Initialize Board
    function initializeBoard() {
        board.innerHTML = '';
        cells.length = 0;
        
        for (let i = 0; i < 9; i++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.setAttribute('data-index', i);
            cell.addEventListener('click', () => handleCellClick(i));
            board.appendChild(cell);
            cells.push(cell);
        }
        
        updatePlayerDisplay();
        updateStatus("PLAYER X'S TURN");
        movesCount = 0;
        updateMovesCounter();
    }

    // Handle Cell Click
    function handleCellClick(index) {
        if (!gameActive || gameState[index] !== '') return;
        
        playSound(clickSound);
        makeMove(index, currentPlayer);
        movesCount++;
        updateMovesCounter();
        
        checkResult();
        
        if (vsComputer && gameActive && currentPlayer === 'O') {
            setTimeout(computerMove, 500);
        }
    }

    // Make Move
    function makeMove(index, player) {
        gameState[index] = player;
        cells[index].textContent = player;
        cells[index].classList.add(player.toLowerCase());
        
        // Add animation
        cells[index].style.animation = 'none';
        setTimeout(() => {
            cells[index].style.animation = 'winPulse 0.5s ease-in-out';
        }, 10);
        
        currentPlayer = player === 'X' ? 'O' : 'X';
        updatePlayerDisplay();
    }

    // Computer Move with Difficulty
    function computerMove() {
        let availableCells = gameState
            .map((cell, index) => cell === '' ? index : null)
            .filter(index => index !== null);
        
        if (availableCells.length === 0) return;
        
        let move;
        
        switch(difficulty) {
            case 'easy':
                // Random moves with occasional mistakes
                if (Math.random() < 0.3) {
                    move = getWinningMove('O');
                    if (move !== -1) break;
                }
                if (Math.random() < 0.3) {
                    move = getBlockingMove();
                    if (move !== -1) break;
                }
                move = availableCells[Math.floor(Math.random() * availableCells.length)];
                break;
                
            case 'medium':
                // Standard AI: win > block > center > corner > random
                move = getWinningMove('O');
                if (move !== -1) break;
                
                move = getBlockingMove();
                if (move !== -1) break;
                
                if (availableCells.includes(4)) {
                    move = 4;
                    break;
                }
                
                const corners = [0, 2, 6, 8];
                const availableCorners = corners.filter(corner => availableCells.includes(corner));
                if (availableCorners.length > 0) {
                    move = availableCorners[Math.floor(Math.random() * availableCorners.length)];
                    break;
                }
                
                move = availableCells[Math.floor(Math.random() * availableCells.length)];
                break;
                
            case 'hard':
                // Advanced AI with minimax algorithm
                move = getBestMove();
                break;
        }
        
        if (move !== undefined && move !== -1) {
            setTimeout(() => {
                playSound(clickSound);
                makeMove(move, 'O');
                movesCount++;
                updateMovesCounter();
                checkResult();
            }, 300);
        }
    }

    // AI Helper Functions
    function getWinningMove(player) {
        for (let condition of winningConditions) {
            const [a, b, c] = condition;
            const line = [gameState[a], gameState[b], gameState[c]];
            
            if (line.filter(cell => cell === player).length === 2 && 
                line.includes('')) {
                return condition[line.indexOf('')];
            }
        }
        return -1;
    }

    function getBlockingMove() {
        return getWinningMove('X');
    }

    function getBestMove() {
        // Minimax algorithm implementation
        let bestScore = -Infinity;
        let move;
        
        for (let i = 0; i < 9; i++) {
            if (gameState[i] === '') {
                gameState[i] = 'O';
                let score = minimax(gameState, 0, false);
                gameState[i] = '';
                
                if (score > bestScore) {
                    bestScore = score;
                    move = i;
                }
            }
        }
        
        return move;
    }

    function minimax(boardState, depth, isMaximizing) {
        const winner = checkWinner(boardState);
        
        if (winner === 'O') return 10 - depth;
        if (winner === 'X') return depth - 10;
        if (!boardState.includes('')) return 0;
        
        if (isMaximizing) {
            let bestScore = -Infinity;
            for (let i = 0; i < 9; i++) {
                if (boardState[i] === '') {
                    boardState[i] = 'O';
                    let score = minimax(boardState, depth + 1, false);
                    boardState[i] = '';
                    bestScore = Math.max(score, bestScore);
                }
            }
            return bestScore;
        } else {
            let bestScore = Infinity;
            for (let i = 0; i < 9; i++) {
                if (boardState[i] === '') {
                    boardState[i] = 'X';
                    let score = minimax(boardState, depth + 1, true);
                    boardState[i] = '';
                    bestScore = Math.min(score, bestScore);
                }
            }
            return bestScore;
        }
    }

    function checkWinner(boardState) {
        for (let condition of winningConditions) {
            const [a, b, c] = condition;
            if (boardState[a] && boardState[a] === boardState[b] && boardState[a] === boardState[c]) {
                return boardState[a];
            }
        }
        return null;
    }

    // Check Game Result
    function checkResult() {
        let roundWon = false;
        let winningLine = [];
        
        for (let condition of winningConditions) {
            const [a, b, c] = condition;
            
            if (gameState[a] && gameState[a] === gameState[b] && gameState[a] === gameState[c]) {
                roundWon = true;
                winningLine = condition;
                break;
            }
        }
        
        if (roundWon) {
            const winner = currentPlayer === 'X' ? 'O' : 'X';
            gameActive = false;
            stopTimer();
            
            // Highlight winning cells
            winningLine.forEach(index => {
                cells[index].classList.add('winner');
            });
            
            // Update scores and stats
            scores[winner]++;
            updateScores();
            
            // Update game stats
            totalGames++;
            if (winner === (vsComputer ? 'X' : 'X')) {
                wins++;
                currentWinStreak++;
                bestWinStreak = Math.max(bestWinStreak, currentWinStreak);
            } else {
                losses++;
                currentWinStreak = 0;
            }
            
            // Play win sound and show confetti
            playSound(winSound);
            launchConfetti();
            
            // Update status
            updateStatus(`🎉 PLAYER ${winner} WINS! 🎉`);
            
            // Add to history
            addToHistory(`Player ${winner} won in ${movesCount} moves`);
            
            // Save stats
            saveGameStats();
            return;
        }
        
        // Check for draw
        if (!gameState.includes('')) {
            gameActive = false;
            stopTimer();
            
            // Update stats
            totalGames++;
            draws++;
            currentWinStreak = 0;
            
            // Play draw sound
            playSound(drawSound);
            
            // Update status
            updateStatus("🤝 GAME ENDED IN A DRAW!");
            
            // Add to history
            addToHistory(`Game was a draw in ${movesCount} moves`);
            
            // Save stats
            saveGameStats();
            return;
        }
        
        // Continue game
        updateStatus(`PLAYER ${currentPlayer}'S TURN`);
    }

    // Update Player Display
    function updatePlayerDisplay() {
        playerX.classList.toggle('active', currentPlayer === 'X');
        playerO.classList.toggle('active', currentPlayer === 'O');
    }

    // Update Status
    function updateStatus(message) {
        status.querySelector('span').textContent = message;
    }

    // Update Scores
    function updateScores() {
        scoreX.textContent = scores.X;
        scoreO.textContent = scores.O;
    }

    // Update Moves Counter
    function updateMovesCounter() {
        movesCountEl.textContent = movesCount;
    }

    // Reset Game
    function resetGame() {
        currentPlayer = 'X';
        gameState = ['', '', '', '', '', '', '', '', ''];
        gameActive = true;
        movesCount = 0;
        gameTimer = 0;
        updateMovesCounter();
        updateTimer();
        initializeBoard();
        startTimer();
        playSound(clickSound);
    }

    // Toggle Game Mode
    function toggleMode() {
        vsComputer = !vsComputer;
        gameModeEl.textContent = vsComputer ? 'VS COMPUTER' : '2 PLAYER';
        modeBtn.innerHTML = vsComputer ? 
            '<span class="btn-icon"><i class="fas fa-user-friends"></i></span><span class="btn-text">VS PLAYER</span>' :
            '<span class="btn-icon"><i class="fas fa-robot"></i></span><span class="btn-text">VS COMPUTER</span>';
        
        resetGame();
        updateStatus(vsComputer ? "VS COMPUTER MODE" : "2 PLAYER MODE");
    }

    // Change Theme
    function changeTheme() {
        currentTheme = (currentTheme + 1) % themes.length;
        updateTheme();
        playSound(clickSound);
    }

    function updateTheme() {
        const theme = themes[currentTheme];
        
        // Update CSS variables
        document.documentElement.style.setProperty('--primary-color', theme.primary);
        document.documentElement.style.setProperty('--secondary-color', theme.secondary);
        document.documentElement.style.setProperty('--accent-color', theme.accent);
        document.documentElement.style.setProperty('--x-color', theme.primary);
        document.documentElement.style.setProperty('--o-color', theme.secondary);
        
        // Update theme button
        themeBtn.innerHTML = `<span class="btn-icon"><i class="fas fa-palette"></i></span><span class="btn-text">${theme.name}</span>`;
        
        // Update particles if they exist
        if (window.pJSDom && window.pJSDom[0]) {
            window.pJSDom[0].pJS.particles.color.value = theme.primary;
            window.pJSDom[0].pJS.particles.line_linked.color = theme.primary;
            window.pJSDom[0].pJS.fn.particlesRefresh();
        }
    }

    // Toggle Sound
    function toggleSound() {
        soundEnabled = !soundEnabled;
        soundBtn.innerHTML = soundEnabled ?
            '<span class="btn-icon"><i class="fas fa-volume-up"></i></span><span class="btn-text">SOUND ON</span>' :
            '<span class="btn-icon"><i class="fas fa-volume-mute"></i></span><span class="btn-text">SOUND OFF</span>';
        playSound(clickSound);
    }

    // Play Sound
    function playSound(audioElement) {
        if (soundEnabled && audioElement) {
            audioElement.currentTime = 0;
            audioElement.play().catch(e => console.log("Audio play failed:", e));
        }
    }

    // Game History
    function addToHistory(result) {
        const now = new Date();
        const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const historyItem = document.createElement('li');
        
        historyItem.innerHTML = `
            <span>${timeString}</span>
            <span>${result}</span>
            <span>${Math.floor(gameTimer / 60).toString().padStart(2, '0')}:${(gameTimer % 60).toString().padStart(2, '0')}</span>
        `;
        
        historyList.insertBefore(historyItem, historyList.firstChild);
        
        gameHistory.unshift({ 
            time: timeString, 
            result: result, 
            duration: gameTimer 
        });
        
        // Keep only last 10 games
        if (gameHistory.length > 10) {
            gameHistory.pop();
            if (historyList.lastChild) {
                historyList.removeChild(historyList.lastChild);
            }
        }
        
        historyCount.textContent = gameHistory.length;
    }

    function clearHistory() {
        gameHistory = [];
        historyList.innerHTML = '';
        historyCount.textContent = '0';
        playSound(clickSound);
    }

    // Timer Functions
    function startTimer() {
        stopTimer();
        gameTimer = 0;
        updateTimer();
        timerInterval = setInterval(() => {
            gameTimer++;
            updateTimer();
        }, 1000);
    }

    function stopTimer() {
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        }
    }

    function updateTimer() {
        const minutes = Math.floor(gameTimer / 60);
        const seconds = gameTimer % 60;
        timerEl.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    // Game Stats
    function updateStatsDisplay() {
        totalGamesEl.textContent = totalGames;
        winStreakEl.textContent = bestWinStreak;
        
        const winRate = totalGames > 0 ? Math.round((wins / totalGames) * 100) : 0;
        winRateEl.textContent = `${winRate}%`;
        currentStreakEl.textContent = currentWinStreak;
        bestTimeEl.textContent = bestTime ? 
            `${Math.floor(bestTime / 60).toString().padStart(2, '0')}:${(bestTime % 60).toString().padStart(2, '0')}` : 
            '--:--';
    }

    function saveGameStats() {
        const stats = {
            scores,
            totalGames,
            wins,
            losses,
            draws,
            bestWinStreak,
            currentWinStreak,
            bestTime,
            gameHistory
        };
        
        localStorage.setItem('ticTacToeStats', JSON.stringify(stats));
        updateStatsDisplay();
    }

    function loadGameStats() {
        const savedStats = localStorage.getItem('ticTacToeStats');
        if (savedStats) {
            const stats = JSON.parse(savedStats);
            scores = stats.scores || { X: 0, O: 0 };
            totalGames = stats.totalGames || 0;
            wins = stats.wins || 0;
            losses = stats.losses || 0;
            draws = stats.draws || 0;
            bestWinStreak = stats.bestWinStreak || 0;
            currentWinStreak = stats.currentWinStreak || 0;
            bestTime = stats.bestTime || null;
            gameHistory = stats.gameHistory || [];
            
            // Update history list
            gameHistory.forEach(item => {
                const historyItem = document.createElement('li');
                historyItem.innerHTML = `
                    <span>${item.time}</span>
                    <span>${item.result}</span>
                    <span>${Math.floor(item.duration / 60).toString().padStart(2, '0')}:${(item.duration % 60).toString().padStart(2, '0')}</span>
                `;
                historyList.appendChild(historyItem);
            });
            
            historyCount.textContent = gameHistory.length;
            updateScores();
        }
    }

    // Confetti Effect
    function launchConfetti() {
        const ctx = confettiCanvas.getContext('2d');
        confettiCanvas.width = window.innerWidth;
        confettiCanvas.height = window.innerHeight;
        
        const confettiParticles = [];
        const particleCount = 150;
        
        for (let i = 0; i < particleCount; i++) {
            confettiParticles.push({
                x: Math.random() * confettiCanvas.width,
                y: Math.random() * confettiCanvas.height - confettiCanvas.height,
                r: Math.random() * 10 + 5,
                d: Math.random() * particleCount,
                color: `hsl(${Math.random() * 360}, 100%, 50%)`,
                tilt: Math.random() * 10 - 10,
                tiltAngleIncrement: Math.random() * 0.07 + 0.05,
                tiltAngle: 0
            });
        }
        
        function drawConfetti() {
            ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
            
            confettiParticles.forEach((p, i) => {
                ctx.beginPath();
                ctx.lineWidth = p.r / 2;
                ctx.strokeStyle = p.color;
                ctx.moveTo(p.x + p.tilt + p.r / 4, p.y);
                ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 4);
                ctx.stroke();
                
                p.tiltAngle += p.tiltAngleIncrement;
                p.y += (Math.cos(p.d) + 3 + p.r / 2) / 2;
                p.x += Math.sin(p.d);
                p.tilt = Math.sin(p.tiltAngle) * 15;
                
                if (p.y > confettiCanvas.height) {
                    confettiParticles[i] = {
                        x: Math.random() * confettiCanvas.width,
                        y: -10,
                        r: p.r,
                        d: p.d,
                        color: p.color,
                        tilt: p.tilt,
                        tiltAngleIncrement: p.tiltAngleIncrement,
                        tiltAngle: p.tiltAngle
                    };
                }
            });
            
            requestAnimationFrame(drawConfetti);
        }
        
        drawConfetti();
        
        // Stop confetti after 3 seconds
        setTimeout(() => {
            confettiParticles.length = 0;
            ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
        }, 3000);
    }

    // Difficulty Selection
    function setDifficulty(level) {
        difficulty = level;
        difficultyBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.level === level);
        });
        playSound(clickSound);
        
        if (vsComputer) {
            resetGame();
        }
    }

    // Modal Functions
    function showInstructions() {
        instructionsModal.style.display = 'flex';
        playSound(clickSound);
    }

    function hideInstructions() {
        instructionsModal.style.display = 'none';
        playSound(clickSound);
    }

    // Share Game
    function shareGame() {
        const shareText = `Check out my Tic-Tac-Toe stats! 🎮
Wins: ${wins} | Losses: ${losses} | Draws: ${draws}
Win Rate: ${totalGames > 0 ? Math.round((wins / totalGames) * 100) : 0}%
Best Streak: ${bestWinStreak}

Play the game here!`;
        
        if (navigator.share) {
            navigator.share({
                title: 'Neon Tic-Tac-Toe',
                text: shareText,
                url: window.location.href
            });
        } else {
            navigator.clipboard.writeText(shareText + '\n' + window.location.href);
            alert('Stats copied to clipboard! 📋');
        }
        playSound(clickSound);
    }

    // Event Listeners
    resetBtn.addEventListener('click', resetGame);
    modeBtn.addEventListener('click', toggleMode);
    themeBtn.addEventListener('click', changeTheme);
    soundBtn.addEventListener('click', toggleSound);
    clearHistoryBtn.addEventListener('click', clearHistory);
    instructionsBtn.addEventListener('click', showInstructions);
    shareBtn.addEventListener('click', shareGame);
    closeModalBtn.addEventListener('click', hideInstructions);
    instructionsModal.addEventListener('click', (e) => {
        if (e.target === instructionsModal) hideInstructions();
    });

    difficultyBtns.forEach(btn => {
        btn.addEventListener('click', () => setDifficulty(btn.dataset.level));
    });

    // Keyboard Shortcuts
    document.addEventListener('keydown', (e) => {
        switch(e.key) {
            case 'r':
            case 'R':
                if (e.ctrlKey) resetGame();
                break;
            case 'm':
            case 'M':
                if (e.ctrlKey) toggleMode();
                break;
            case 't':
            case 'T':
                if (e.ctrlKey) changeTheme();
                break;
            case 'Escape':
                hideInstructions();
                break;
        }
    });

    // Handle Window Resize
    window.addEventListener('resize', () => {
        if (confettiCanvas) {
            confettiCanvas.width = window.innerWidth;
            confettiCanvas.height = window.innerHeight;
        }
    });

    // Initialize the game
    initGame();
});