// Piece definitions and utilities
const PIECES = {
    'k': '♔', 'q': '♕', 'r': '♖', 'b': '♗', 'n': '♘', 'p': '♙',
    'K': '♔', 'Q': '♕', 'R': '♖', 'B': '♗', 'N': '♘', 'P': '♙',
    '.': ''
};

const PIECE_SELECTIONS = ['K', 'Q', 'R', 'B', 'N', 'P', 'k', 'q', 'r', 'b', 'n', 'p'];

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