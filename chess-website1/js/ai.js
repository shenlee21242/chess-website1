// Basic AI opponent
class ChessAI {
    constructor(difficulty = 'easy') {
        this.difficulty = difficulty;
        this.depths = {
            'easy': 1,
            'medium': 2,
            'hard': 3
        };
    }

    getBestMove(game) {
        const possibleMoves = this.getAllPossibleMoves(game);
        
        if (possibleMoves.length === 0) return null;

        // For easy difficulty, return random move
        if (this.difficulty === 'easy') {
            return possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
        }

        // For medium and hard, use minimax
        let bestMove = null;
        let bestValue = -Infinity;

        for (let move of possibleMoves) {
            const gameCopy = this.cloneGame(game);
            this.makeMoveOnCopy(gameCopy, move);
            
            const moveValue = this.minimax(gameCopy, this.depths[this.difficulty] - 1, false);
            
            if (moveValue > bestValue) {
                bestValue = moveValue;
                bestMove = move;
            }
        }

        return bestMove;
    }

    getAllPossibleMoves(game) {
        const moves = [];
        
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = game.board[row][col];
                if (piece && piece.color === 'black') { // AI plays black
                    const pieceMoves = piece.getValidMoves(game.board, row, col);
                    for (let move of pieceMoves) {
                        moves.push({
                            from: { row, col },
                            to: { row: move.row, col: move.col },
                            piece: piece.type
                        });
                    }
                }
            }
        }
        
        return moves;
    }

    minimax(game, depth, isMaximizing) {
        if (depth === 0) {
            return this.evaluateBoard(game);
        }

        const possibleMoves = this.getAllPossibleMoves(game);

        if (isMaximizing) {
            let bestValue = -Infinity;
            for (let move of possibleMoves) {
                const gameCopy = this.cloneGame(game);
                this.makeMoveOnCopy(gameCopy, move);
                bestValue = Math.max(bestValue, this.minimax(gameCopy, depth - 1, false));
            }
            return bestValue;
        } else {
            let bestValue = Infinity;
            for (let move of possibleMoves) {
                const gameCopy = this.cloneGame(game);
                this.makeMoveOnCopy(gameCopy, move);
                bestValue = Math.min(bestValue, this.minimax(gameCopy, depth - 1, true));
            }
            return bestValue;
        }
    }

    evaluateBoard(game) {
        let score = 0;
        const pieceValues = {
            'p': 1, 'n': 3, 'b': 3, 'r': 5, 'q': 9, 'k': 0
        };

        // Count material
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = game.board[row][col];
                if (piece) {
                    const value = pieceValues[piece.type];
                    score += piece.color === 'black' ? value : -value;
                }
            }
        }

        return score;
    }

    cloneGame(game) {
        // Create a deep copy of the game state for simulation
        const cloned = {
            board: Array(8).fill().map(() => Array(8).fill(null)),
            currentPlayer: game.currentPlayer
        };

        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = game.board[row][col];
                if (piece) {
                    cloned.board[row][col] = new Piece(piece.type, piece.color);
                    cloned.board[row][col].hasMoved = piece.hasMoved;
                }
            }
        }

        return cloned;
    }

    makeMoveOnCopy(game, move) {
        const { from, to } = move;
        const piece = game.board[from.row][from.col];
        game.board[to.row][to.col] = piece;
        game.board[from.row][from.col] = null;
        game.currentPlayer = game.currentPlayer === 'white' ? 'black' : 'white';
    }
}

// AI integration with the main game
class AIGame extends ChessGame {
    constructor(aiDifficulty = 'easy') {
        super();
        this.ai = new ChessAI(aiDifficulty);
        this.aiEnabled = true;
    }

    makeAIMove() {
        const bestMove = this.ai.getBestMove(this);
        if (bestMove) {
            this.makeMove(bestMove.from.row, bestMove.from.col, bestMove.to.row, bestMove.to.col);
        }
    }
}