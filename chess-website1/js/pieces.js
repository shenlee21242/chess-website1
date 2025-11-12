// Piece movement logic and class definitions
class Piece {
    constructor(type, color) {
        this.type = type;
        this.color = color;
        this.hasMoved = false;
    }

    getValidMoves(board, row, col) {
        switch (this.type) {
            case 'p': return this.getPawnMoves(board, row, col);
            case 'r': return this.getRookMoves(board, row, col);
            case 'n': return this.getKnightMoves(board, row, col);
            case 'b': return this.getBishopMoves(board, row, col);
            case 'q': return this.getQueenMoves(board, row, col);
            case 'k': return this.getKingMoves(board, row, col);
            default: return [];
        }
    }

    getPawnMoves(board, row, col) {
        const moves = [];
        const direction = this.color === 'white' ? -1 : 1;
        const startRow = this.color === 'white' ? 6 : 1;

        // Forward move
        if (this.isInBounds(row + direction, col) && !board[row + direction][col]) {
            moves.push({ row: row + direction, col, type: 'move' });

            // Double move from starting position
            if (row === startRow && !board[row + 2 * direction][col]) {
                moves.push({ row: row + 2 * direction, col, type: 'move' });
            }
        }

        // Captures
        for (let dc of [-1, 1]) {
            const newRow = row + direction;
            const newCol = col + dc;
            
            if (this.isInBounds(newRow, newCol)) {
                const target = board[newRow][newCol];
                if (target && target.color !== this.color) {
                    moves.push({ row: newRow, col: newCol, type: 'capture' });
                }
            }
        }

        return moves;
    }

    getRookMoves(board, row, col) {
        const moves = [];
        const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];

        for (let [dr, dc] of directions) {
            for (let i = 1; i < 8; i++) {
                const newRow = row + dr * i;
                const newCol = col + dc * i;
                
                if (!this.isInBounds(newRow, newCol)) break;

                const target = board[newRow][newCol];
                if (!target) {
                    moves.push({ row: newRow, col: newCol, type: 'move' });
                } else {
                    if (target.color !== this.color) {
                        moves.push({ row: newRow, col: newCol, type: 'capture' });
                    }
                    break;
                }
            }
        }

        return moves;
    }

    getKnightMoves(board, row, col) {
        const moves = [];
        const knightMoves = [
            [-2, -1], [-2, 1], [-1, -2], [-1, 2],
            [1, -2], [1, 2], [2, -1], [2, 1]
        ];

        for (let [dr, dc] of knightMoves) {
            const newRow = row + dr;
            const newCol = col + dc;
            
            if (this.isInBounds(newRow, newCol)) {
                const target = board[newRow][newCol];
                if (!target) {
                    moves.push({ row: newRow, col: newCol, type: 'move' });
                } else if (target.color !== this.color) {
                    moves.push({ row: newRow, col: newCol, type: 'capture' });
                }
            }
        }

        return moves;
    }

    getBishopMoves(board, row, col) {
        const moves = [];
        const directions = [[-1, -1], [-1, 1], [1, -1], [1, 1]];

        for (let [dr, dc] of directions) {
            for (let i = 1; i < 8; i++) {
                const newRow = row + dr * i;
                const newCol = col + dc * i;
                
                if (!this.isInBounds(newRow, newCol)) break;

                const target = board[newRow][newCol];
                if (!target) {
                    moves.push({ row: newRow, col: newCol, type: 'move' });
                } else {
                    if (target.color !== this.color) {
                        moves.push({ row: newRow, col: newCol, type: 'capture' });
                    }
                    break;
                }
            }
        }

        return moves;
    }

    getQueenMoves(board, row, col) {
        return [
            ...this.getRookMoves(board, row, col),
            ...this.getBishopMoves(board, row, col)
        ];
    }

    getKingMoves(board, row, col) {
        const moves = [];
        const directions = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1],           [0, 1],
            [1, -1],  [1, 0],  [1, 1]
        ];

        for (let [dr, dc] of directions) {
            const newRow = row + dr;
            const newCol = col + dc;
            
            if (this.isInBounds(newRow, newCol)) {
                const target = board[newRow][newCol];
                if (!target) {
                    moves.push({ row: newRow, col: newCol, type: 'move' });
                } else if (target.color !== this.color) {
                    moves.push({ row: newRow, col: newCol, type: 'capture' });
                }
            }
        }

        return moves;
    }

    isInBounds(row, col) {
        return row >= 0 && row < 8 && col >= 0 && col < 8;
    }
}