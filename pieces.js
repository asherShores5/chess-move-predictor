// Piece definitions and utilities
const PIECES = {
    'k': '♔', 'q': '♕', 'r': '♖', 'b': '♗', 'n': '♘', 'p': '♙',
    'K': '♔', 'Q': '♕', 'R': '♖', 'B': '♗', 'N': '♘', 'P': '♙',
    '.': ''
};

const PIECE_SELECTIONS = ['K', 'Q', 'R', 'B', 'N', 'P', 'k', 'q', 'r', 'b', 'n', 'p'];

const PIECE_VALUES = {
    'p': 1,  // pawn
    'n': 3,  // knight
    'b': 3,  // bishop
    'r': 5,  // rook
    'q': 9,  // queen
    'k': 0   // king (typically not counted in material)
};

function isPieceWhite(piece) {
    return piece === piece.toUpperCase() && piece !== '.';
}

function createPieceElement(piece, isDraggableFromBoard = true) {
    if (piece === '.') return null;
    
    const pieceDiv = document.createElement('div');
    pieceDiv.className = `piece ${isPieceWhite(piece) ? 'white-piece' : 'black-piece'}`;
    pieceDiv.textContent = PIECES[piece];
    pieceDiv.draggable = true;
    
    pieceDiv.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', piece);
        e.dataTransfer.setData('source', isDraggableFromBoard ? 'board' : 'menu');
        e.target.classList.add('dragging');
    });
    
    pieceDiv.addEventListener('dragend', (e) => {
        e.target.classList.remove('dragging');
        document.querySelectorAll('.drag-over').forEach(el => {
            el.classList.remove('drag-over');
        });
    });
    
    return pieceDiv;
}

function calculateMaterial() {
    let whiteMaterial = 0;
    let blackMaterial = 0;

    // Loop through the board and count material
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            const piece = board[i][j];
            if (piece === '.') continue;

            const value = PIECE_VALUES[piece.toLowerCase()];
            if (piece === piece.toUpperCase()) {
                whiteMaterial += value; // White piece
            } else {
                blackMaterial += value; // Black piece
            }
        }
    }

    // Update the display
    updateMaterialDisplay(whiteMaterial, blackMaterial);
}

function updateMaterialDisplay(white, black) {
    const whiteMaterialElement = document.getElementById('whiteMaterial');
    const blackMaterialElement = document.getElementById('blackMaterial');

    const advantage = white - black;
    
    if (advantage > 0) {
        whiteMaterialElement.textContent = `+${advantage}`;
        blackMaterialElement.textContent = '0';
        whiteMaterialElement.style.color = '#4CAF50'; // Green for advantage
        blackMaterialElement.style.color = '#666';
    } else if (advantage < 0) {
        whiteMaterialElement.textContent = '0';
        blackMaterialElement.textContent = `+${Math.abs(advantage)}`;
        blackMaterialElement.style.color = '#4CAF50'; // Green for advantage
        whiteMaterialElement.style.color = '#666';
    } else {
        whiteMaterialElement.textContent = '0';
        blackMaterialElement.textContent = '0';
        whiteMaterialElement.style.color = '#666';
        blackMaterialElement.style.color = '#666';
    }
}