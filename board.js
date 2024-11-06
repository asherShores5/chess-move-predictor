// Board state and operations
const INITIAL_BOARD = [
    ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'],
    ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
    ['.', '.', '.', '.', '.', '.', '.', '.'],
    ['.', '.', '.', '.', '.', '.', '.', '.'],
    ['.', '.', '.', '.', '.', '.', '.', '.'],
    ['.', '.', '.', '.', '.', '.', '.', '.'],
    ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
    ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R']
];

let board = JSON.parse(localStorage.getItem('chessBoard')) || INITIAL_BOARD;

function createBoard() {
    const boardElement = document.getElementById('board');
    boardElement.innerHTML = '';
    
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            const square = document.createElement('div');
            square.className = `square ${(i + j) % 2 === 0 ? 'white' : 'black'}`;
            square.dataset.row = i;
            square.dataset.col = j;
            
            // Add drag and drop event listeners
            square.addEventListener('dragover', handleDragOver);
            square.addEventListener('drop', handleDrop);
            square.addEventListener('click', () => handleSquareClick(i, j));
            
            const piece = board[i][j];
            if (piece !== '.') {
                square.appendChild(createPieceElement(piece));
            }
            
            boardElement.appendChild(square);
        }
    }
    addBoardNotation();
}

function handleDragOver(e) {
    e.preventDefault();
    e.target.closest('.square').classList.add('drag-over');
}

function handleDrop(e) {
    e.preventDefault();
    const square = e.target.closest('.square');
    if (!square) return;
    
    square.classList.remove('drag-over');
    
    const piece = e.dataTransfer.getData('text/plain');
    const source = e.dataTransfer.getData('source');
    const row = parseInt(square.dataset.row);
    const col = parseInt(square.dataset.col);
    
    // If dragging from board, clear the source square
    if (source === 'board') {
        const draggingPiece = document.querySelector('.dragging');
        if (draggingPiece) {
            const sourceSquare = draggingPiece.closest('.square');
            if (sourceSquare) {
                const sourceRow = parseInt(sourceSquare.dataset.row);
                const sourceCol = parseInt(sourceSquare.dataset.col);
                board[sourceRow][sourceCol] = '.';
            }
        }
    }
    
    // Update the destination square
    updateSquare(row, col, piece);
}

function updateSquare(row, col, piece) {
    board[row][col] = piece;
    saveBoard();
    createBoard();
    updateFEN();
    calculateMaterial();
}

// Simplify FEN generation to use turn parameter
function boardToFEN(board, turn = 'w') {
    let fen = '';
    for (let i = 0; i < 8; i++) {
        let emptyCount = 0;
        for (let j = 0; j < 8; j++) {
            if (board[i][j] === '.') {
                emptyCount++;
            } else {
                if (emptyCount > 0) {
                    fen += emptyCount;
                    emptyCount = 0;
                }
                fen += board[i][j];
            }
        }
        if (emptyCount > 0) {
            fen += emptyCount;
        }
        if (i < 7) fen += '/';
    }
    
    // Add turn and other FEN components
    fen += ` ${turn} KQkq - 0 1`;
    return fen;
}

function saveBoard() {
    localStorage.setItem('chessBoard', JSON.stringify(board));
}

function addBoardNotation() {
    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const squares = document.querySelectorAll('.square');
    
    squares.forEach(square => {
        const row = parseInt(square.dataset.row);
        const col = parseInt(square.dataset.col);
        
        // Add file and rank attributes
        square.dataset.file = files[col];
        square.dataset.rank = 8 - row;
    });
}

function executeMove(moveString) {
    if (!moveString || moveString.length < 4) {
        console.error('Invalid move string:', moveString);
        return;
    }

    // Parse move string (e.g., "e2e4")
    const sourceFile = moveString.charAt(0);
    const sourceRank = moveString.charAt(1);
    const targetFile = moveString.charAt(2);
    const targetRank = moveString.charAt(3);
    
    // Convert to board coordinates
    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const sourceCol = files.indexOf(sourceFile);
    const sourceRow = 8 - parseInt(sourceRank);
    const targetCol = files.indexOf(targetFile);
    const targetRow = 8 - parseInt(targetRank);
    
    // Validate coordinates
    if (sourceCol === -1 || targetCol === -1 || 
        sourceRow < 0 || sourceRow > 7 || 
        targetRow < 0 || targetRow > 7) {
        console.error('Invalid move coordinates:', moveString);
        return;
    }

    // Get the piece from source square
    const piece = board[sourceRow][sourceCol];
    
    // Make the move
    board[sourceRow][sourceCol] = '.';
    board[targetRow][targetCol] = piece;
    
    // Update the display
    saveBoard();
    createBoard();
    updateFEN();
}