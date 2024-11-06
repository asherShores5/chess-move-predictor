// Main application logic
let selectedPiece = null;

function createPieceSelector() {
    const selector = document.getElementById('pieceSelector');
    selector.innerHTML = '';
    
    PIECE_SELECTIONS.forEach(piece => {
        const button = document.createElement('button');
        button.className = 'piece-button';
        if (piece === selectedPiece) {
            button.classList.add('selected');
        }
        
        if (piece !== '.') {
            button.appendChild(createPieceElement(piece, false));
        } else {
            button.textContent = '×';
        }
        
        // Add click handler for selection
        button.onclick = () => {
            selectedPiece = piece;
            updateSelectedPieceDisplay();
            createPieceSelector();
        };
        
        selector.appendChild(button);
    });
}

function updateSelectedPieceDisplay() {
    const display = document.getElementById('selectedPiece');
    display.textContent = `Selected: ${selectedPiece ? PIECES[selectedPiece] || 'Empty' : 'None'}`;
}

function handleSquareClick(row, col) {
    if (selectedPiece !== null) {
        updateSquare(row, col, selectedPiece);
    }
}

function updateFEN() {
    const fenDisplay = document.getElementById('fenDisplay');
    fenDisplay.textContent = boardToFEN(board);
}

function resetBoard() {
    board = JSON.parse(JSON.stringify(INITIAL_BOARD));
    saveBoard();
    createBoard();
    updateFEN();
    calculateMaterial();
}

function clearBoard() {
    board = Array(8).fill().map(() => Array(8).fill('.'));
    saveBoard();
    createBoard();
    updateFEN();
    calculateMaterial();
}

function initializeEngineControls() {
    const analyzeBtn = document.getElementById('analyzeBtn');
    const stopAnalysisBtn = document.getElementById('stopAnalysisBtn');
    const engineOutput = document.getElementById('engineOutput');
    const turnSelector = document.getElementById('turnSelector');

    // Clear previous engine output
    engineOutput.querySelector('.evaluation').textContent = '';
    engineOutput.querySelector('.best-move').textContent = '';

    analyzeBtn.addEventListener('click', async () => {
        analyzeBtn.disabled = true;
        stopAnalysisBtn.disabled = false;
        engineOutput.querySelector('.evaluation').textContent = 'Analyzing...';
        engineOutput.querySelector('.best-move').textContent = '';
        
        const turn = turnSelector.value;
        const fen = boardToFEN(board, turn);
        await chessEngine.analyzeFEN(fen);
    });

    stopAnalysisBtn.addEventListener('click', () => {
        chessEngine.stop();
        analyzeBtn.disabled = false;
        stopAnalysisBtn.disabled = true;
        
        // Disable make move button when analysis is stopped
        const makeMoveBtn = engineOutput.querySelector('.make-move-btn');
        if (makeMoveBtn) {
            makeMoveBtn.disabled = true;
        }
    });

    document.addEventListener('engineMove', (event) => {
        const { move, evaluation } = event.detail;
        
        analyzeBtn.disabled = false;
        stopAnalysisBtn.disabled = true;
        
        engineOutput.querySelector('.evaluation').textContent =
            `Evaluation: ${evaluation > 0 ? '+' : ''}${evaluation}`;
    });
}

// Add to initialization
document.addEventListener('DOMContentLoaded', () => {
    createBoard();
    createPieceSelector();
    updateFEN();
    updateSelectedPieceDisplay();
    initializeEngineControls();
    calculateMaterial();
});