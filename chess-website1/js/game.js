// Game logic and board management
class ChessGame {
    constructor() {
        this.board = Array(8).fill().map(() => Array(8).fill(null));
        this.currentPlayer = 'white';
        this.selectedPiece = null;
        this.validMoves = [];
        this.moveHistory = [];
        this.capturedPieces = { white: [], black: [] };
        this.boardFlipped = false;
        this.scores = { white: 0, black: 0 };
        this.showHints = false;
        this.aiGame = null;
        
        this.pieceValues = {
            'p': 1,  // Pawn
            'n': 3,  // Knight
            'b': 3,  // Bishop
            'r': 5,  // Rook
            'q': 9,  // Queen
            'k': 0   // King (infinite value)
        };
        
        this.initGame();
        this.setupEventListeners();
    }

    initGame() {
        this.setupBoard();
        this.renderBoard();
        this.updateGameInfo();
        this.updateCapturedDisplay();
    }

    setupBoard() {
        // Clear board
        this.board = Array(8).fill().map(() => Array(8).fill(null));

        // Setup pawns
        for (let i = 0; i < 8; i++) {
            this.board[1][i] = new Piece('p', 'black');
            this.board[6][i] = new Piece('p', 'white');
        }

        // Setup other pieces
        const backRow = ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'];
        for (let i = 0; i < 8; i++) {
            this.board[0][i] = new Piece(backRow[i], 'black');
            this.board[7][i] = new Piece(backRow[i], 'white');
        }
    }

    renderBoard() {
        const boardElement = document.getElementById('chessBoard');
        boardElement.innerHTML = '';

        const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
        const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];

        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const displayRow = this.boardFlipped ? 7 - row : row;
                const displayCol = this.boardFlipped ? 7 - col : col;

                const square = document.createElement('div');
                square.className = `square ${(displayRow + displayCol) % 2 === 0 ? 'white' : 'black'}`;
                square.dataset.row = row;
                square.dataset.col = col;

                // Add coordinates
                if ((this.boardFlipped && row === 7) || (!this.boardFlipped && row === 0)) {
                    const fileCoord = document.createElement('div');
                    fileCoord.className = 'coordinate file';
                    fileCoord.textContent = files[displayCol];
                    square.appendChild(fileCoord);
                }

                if ((this.boardFlipped && col === 0) || (!this.boardFlipped && col === 7)) {
                    const rankCoord = document.createElement('div');
                    rankCoord.className = 'coordinate rank';
                    rankCoord.textContent = ranks[displayRow];
                    square.appendChild(rankCoord);
                }

                // Add piece if exists - USING ONLINE IMAGES
                const piece = this.board[row][col];
                if (piece) {
                    const pieceElement = document.createElement('div');
                    pieceElement.className = 'piece';
                    pieceElement.dataset.piece = `${piece.color}-${piece.type}`;
                    
                    // Use online chess.com images
                    const pieceCode = piece.type.toUpperCase();
                    pieceElement.style.backgroundImage = `url('https://images.chesscomfiles.com/chess-themes/pieces/neo/150/${piece.color}${pieceCode}.png')`;
                    pieceElement.style.backgroundSize = 'cover';
                    pieceElement.style.backgroundPosition = 'center';
                    pieceElement.style.backgroundRepeat = 'no-repeat';
                    
                    square.appendChild(pieceElement);
                }

                square.addEventListener('click', () => this.handleSquareClick(row, col));
                boardElement.appendChild(square);
            }
        }

        this.highlightValidMoves();
    }

    handleSquareClick(row, col) {
        const piece = this.board[row][col];

        // If a piece is already selected
        if (this.selectedPiece) {
            const move = this.validMoves.find(m => m.row === row && m.col === col);
            
            if (move) {
                this.makeMove(this.selectedPiece.row, this.selectedPiece.col, row, col);
                this.clearSelection();
            } else if (piece && piece.color === this.currentPlayer) {
                // Select a different piece of the same color
                this.selectPiece(row, col);
            } else {
                this.clearSelection();
            }
        } else if (piece && piece.color === this.currentPlayer) {
            // Select a piece
            this.selectPiece(row, col);
        }
    }

    selectPiece(row, col) {
        this.selectedPiece = { row, col, piece: this.board[row][col] };
        this.validMoves = this.board[row][col].getValidMoves(this.board, row, col);
        this.renderBoard();
    }

    clearSelection() {
        this.selectedPiece = null;
        this.validMoves = [];
        this.renderBoard();
    }

    highlightValidMoves() {
        if (!this.selectedPiece) return;

        const squares = document.querySelectorAll('.square');
        
        this.validMoves.forEach(move => {
            const displayRow = this.boardFlipped ? 7 - move.row : move.row;
            const displayCol = this.boardFlipped ? 7 - move.col : move.col;
            
            const index = displayRow * 8 + displayCol;
            if (squares[index]) {
                if (move.type === 'capture') {
                    squares[index].classList.add('valid-capture');
                } else {
                    squares[index].classList.add('valid-move');
                }
            }
        });

        // Highlight selected piece
        const selectedDisplayRow = this.boardFlipped ? 7 - this.selectedPiece.row : this.selectedPiece.row;
        const selectedDisplayCol = this.boardFlipped ? 7 - this.selectedPiece.col : this.selectedPiece.col;
        const selectedIndex = selectedDisplayRow * 8 + selectedDisplayCol;
        if (squares[selectedIndex]) {
            squares[selectedIndex].classList.add('selected');
        }
    }

    makeMove(fromRow, fromCol, toRow, toCol) {
        const piece = this.board[fromRow][fromCol];
        const targetPiece = this.board[toRow][toCol];

        // Record move
        this.moveHistory.push({
            piece: piece.type,
            from: { row: fromRow, col: fromCol },
            to: { row: toRow, col: toCol },
            captured: targetPiece ? targetPiece.type : null,
            player: this.currentPlayer
        });

        // Handle capture
        if (targetPiece) {
            this.capturedPieces[this.currentPlayer].push(targetPiece);
            this.updateScore(targetPiece);
            this.updateCapturedDisplay();
        }

        // Move piece
        this.board[toRow][toCol] = piece;
        this.board[fromRow][fromCol] = null;
        piece.hasMoved = true;

        // Check for game end conditions
        if (this.isCheckmate()) {
            this.endGame('checkmate');
        } else if (this.isStalemate()) {
            this.endGame('stalemate');
        } else {
            // Switch player
            this.currentPlayer = this.currentPlayer === 'white' ? 'black' : 'white';
            
            // If playing with AI and it's AI's turn
            if (this.aiGame && this.currentPlayer === 'black') {
                setTimeout(() => this.aiGame.makeAIMove(), 500);
            }
        }
        
        this.updateGameInfo();
        this.renderBoard();
    }

    updateScore(capturedPiece) {
        const value = this.pieceValues[capturedPiece.type];
        this.scores[this.currentPlayer] += value;
    }

    updateCapturedDisplay() {
        const whiteCaptured = document.getElementById('whiteCaptured');
        const blackCaptured = document.getElementById('blackCaptured');

        whiteCaptured.innerHTML = '';
        blackCaptured.innerHTML = '';

        this.capturedPieces.white.forEach(piece => {
            const pieceElement = document.createElement('div');
            pieceElement.className = 'captured-piece';
            // Use online images for captured pieces (black pieces for white captured)
            const pieceCode = piece.type.toUpperCase();
            pieceElement.style.backgroundImage = `url('https://images.chesscomfiles.com/chess-themes/pieces/neo/150/black${pieceCode}.png')`;
            pieceElement.style.backgroundSize = 'cover';
            pieceElement.style.backgroundPosition = 'center';
            pieceElement.style.backgroundRepeat = 'no-repeat';
            whiteCaptured.appendChild(pieceElement);
        });

        this.capturedPieces.black.forEach(piece => {
            const pieceElement = document.createElement('div');
            pieceElement.className = 'captured-piece';
            // Use online images for captured pieces (white pieces for black captured)
            const pieceCode = piece.type.toUpperCase();
            pieceElement.style.backgroundImage = `url('https://images.chesscomfiles.com/chess-themes/pieces/neo/150/white${pieceCode}.png')`;
            pieceElement.style.backgroundSize = 'cover';
            pieceElement.style.backgroundPosition = 'center';
            pieceElement.style.backgroundRepeat = 'no-repeat';
            blackCaptured.appendChild(pieceElement);
        });
    }

    updateGameInfo() {
        document.getElementById('currentPlayer').textContent = 
            `Current Player: ${this.currentPlayer.charAt(0).toUpperCase() + this.currentPlayer.slice(1)}`;
        
        document.getElementById('playerScore').textContent = 
            `White: ${this.scores.white} | Black: ${this.scores.black}`;
    }

    isCheckmate() {
        // Simplified checkmate detection
        return false;
    }

    isStalemate() {
        // Simplified stalemate detection
        return false;
    }

    endGame(reason) {
        let message = '';
        switch (reason) {
            case 'checkmate':
                message = `Checkmate! ${this.currentPlayer.charAt(0).toUpperCase() + this.currentPlayer.slice(1)} wins!`;
                break;
            case 'stalemate':
                message = 'Stalemate! The game is a draw.';
                break;
        }
        
        document.getElementById('gameStatus').textContent = `Game Status: ${message}`;
        ChessApp.showNotification(message, 'success');
    }

    newGame() {
        this.board = Array(8).fill().map(() => Array(8).fill(null));
        this.currentPlayer = 'white';
        this.selectedPiece = null;
        this.validMoves = [];
        this.moveHistory = [];
        this.capturedPieces = { white: [], black: [] };
        this.scores = { white: 0, black: 0 };
        
        this.setupBoard();
        this.renderBoard();
        this.updateGameInfo();
        this.updateCapturedDisplay();
        
        ChessApp.showNotification('New game started!', 'success');
    }

    undoMove() {
        if (this.moveHistory.length === 0) return;

        const lastMove = this.moveHistory.pop();
        const piece = this.board[lastMove.to.row][lastMove.to.col];
        
        // Move piece back
        this.board[lastMove.from.row][lastMove.from.col] = piece;
        this.board[lastMove.to.row][lastMove.to.col] = null;

        // Restore captured piece if any
        if (lastMove.captured) {
            const capturedColor = this.currentPlayer === 'white' ? 'black' : 'white';
            const capturedPiece = new Piece(lastMove.captured, capturedColor);
            this.board[lastMove.to.row][lastMove.to.col] = capturedPiece;
            
            // Remove from captured pieces and update score
            this.capturedPieces[this.currentPlayer].pop();
            this.scores[this.currentPlayer] -= this.pieceValues[lastMove.captured];
            this.updateCapturedDisplay();
        }

        // Switch player back
        this.currentPlayer = lastMove.player;
        
        this.updateGameInfo();
        this.renderBoard();
        
        ChessApp.showNotification('Move undone', 'info');
    }

    flipBoard() {
        this.boardFlipped = !this.boardFlipped;
        this.renderBoard();
    }

    toggleHints() {
        this.showHints = !this.showHints;
        this.renderBoard();
        ChessApp.showNotification(`Hints ${this.showHints ? 'enabled' : 'disabled'}`, 'info');
    }

    toggleAI() {
        const aiButton = document.getElementById('playWithAI');
        if (this.aiGame) {
            this.aiGame = null;
            aiButton.classList.remove('active');
            ChessApp.showNotification('AI opponent disabled', 'info');
        } else {
            this.aiGame = new AIGame('easy');
            this.aiGame.board = this.board;
            this.aiGame.currentPlayer = this.currentPlayer;
            aiButton.classList.add('active');
            ChessApp.showNotification('AI opponent enabled - Difficulty: Easy', 'success');
            
            // If it's AI's turn, make a move
            if (this.currentPlayer === 'black') {
                setTimeout(() => this.aiGame.makeAIMove(), 500);
            }
        }
    }

    setupEventListeners() {
        document.getElementById('newGame').addEventListener('click', () => this.newGame());
        document.getElementById('undoMove').addEventListener('click', () => this.undoMove());
        document.getElementById('flipBoard').addEventListener('click', () => this.flipBoard());
        document.getElementById('showHints').addEventListener('click', () => this.toggleHints());
        document.getElementById('playWithAI').addEventListener('click', () => this.toggleAI());
    }
}