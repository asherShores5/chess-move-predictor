// Chess engine interface using Stockfish.js
class ChessEngine {
    constructor() {
        this.initialized = false;
        this.engine = null;
        this.currentEvaluation = null;
        this.isAnalyzing = false;
    }

    async init() {
        if (this.initialized) return;

        try {
            // Create Stockfish worker directly
            this.engine = new Worker('stockfish.js');
            
            // Set up message handling
            this.engine.onmessage = (event) => {
                const message = event.data;
                console.log('Engine:', message); // Debug logging
                
                if (message.startsWith('bestmove')) {
                    this.handleBestMove(message);
                } else if (message.includes('score cp')) {
                    this.handleEvaluation(message);
                }
            };

            // Initialize UCI mode
            this.engine.postMessage('uci');
            this.initialized = true;
        } catch (error) {
            console.error('Failed to initialize chess engine:', error);
            throw error;
        }
    }

    handleBestMove(message) {
        const bestMove = message.split(' ')[1];
        
        // Update the engine output display
        const engineOutput = document.getElementById('engineOutput');
        const bestMoveDiv = engineOutput.querySelector('.best-move');
        bestMoveDiv.textContent = `Best move: ${bestMove}`;

        // Enable the make move button or create it if it doesn't exist
        let makeMoveBtn = engineOutput.querySelector('.make-move-btn');
        if (!makeMoveBtn) {
            makeMoveBtn = document.createElement('button');
            makeMoveBtn.className = 'make-move-btn';
            makeMoveBtn.textContent = 'Make Engine Move';
            
            makeMoveBtn.addEventListener('click', () => {
                if (bestMove) {
                    executeMove(bestMove);
                    // Disable the button after move is made
                    makeMoveBtn.disabled = true;
                }
            });
            
            engineOutput.appendChild(makeMoveBtn);
        } else {
            makeMoveBtn.disabled = false;
        }

        const event = new CustomEvent('engineMove', {
            detail: {
                move: bestMove,
                evaluation: this.currentEvaluation
            }
        });
        document.dispatchEvent(event);
        this.isAnalyzing = false;
    }

    handleEvaluation(message) {
        const matches = message.match(/score cp (-?\d+)/);
        if (matches) {
            this.currentEvaluation = parseInt(matches[1]) / 100;
        }
    }

    async analyzeFEN(fen, depth = 15) {
        if (!this.initialized) await this.init();
        if (this.isAnalyzing) return;
        
        this.isAnalyzing = true;
        this.currentEvaluation = null;
        
        // Reset the engine output display
        const engineOutput = document.getElementById('engineOutput');
        engineOutput.querySelector('.evaluation').textContent = 'Analyzing...';
        engineOutput.querySelector('.best-move').textContent = '';
        
        // Disable the make move button while analyzing
        const makeMoveBtn = engineOutput.querySelector('.make-move-btn');
        if (makeMoveBtn) {
            makeMoveBtn.disabled = true;
        }
        
        console.log('Analyzing position:', fen);
        this.engine.postMessage('position fen ' + fen);
        this.engine.postMessage('go depth ' + depth);
    }

    stop() {
        if (this.engine) {
            this.engine.postMessage('stop');
            this.isAnalyzing = false;
        }
    }

    destroy() {
        if (this.engine) {
            this.engine.terminate();
            this.initialized = false;
        }
    }
}

// Create and export engine instance
window.chessEngine = new ChessEngine();