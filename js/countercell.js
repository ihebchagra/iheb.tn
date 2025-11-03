// CounterCell App
class CounterCellApp {
    constructor() {
        this.presets = [
            {
                key: 'direct',
                label: '🔬 Examen Direct',
                cells: [
                    { id: 'lym', name: 'Lymphocytes', count: 0, color: '#52c234' },
                    { id: 'pnn', name: 'PNN', count: 0, color: '#3498db' },
                ]
            },
            {
                key: 'frottis_complet',
                label: '🩸 Frottis Sanguin',
                cells: [
                    { id: 'pnn', name: 'PNN', count: 0, color: '#3498db' },
                    { id: 'lym', name: 'Lymphocytes', count: 0, color: '#52c234' },
                    { id: 'mon', name: 'Monocytes', count: 0, color: '#9b59b6' },
                    { id: 'pne', name: 'PNE', count: 0, color: '#e67e22' },
                    { id: 'pnb', name: 'PNB', count: 0, color: '#e74c3c' },
                    { id: 'meta', name: 'Métamyélocytes', count: 0, color: '#1abc9c' },
                    { id: 'myelo', name: 'Myélocytes', count: 0, color: '#8b4513' },
                    { id: 'pro', name: 'Promyélocytes', count: 0, color: '#fd79a8' },
                    { id: 'blast', name: 'Blastes', count: 0, color: '#95a5a6' },
                    { id: 'erythro', name: 'Erythroblastes', count: 0, color: '#f4d03f' },
                ]
            },
        ];
        
        this.selectedPresetKey = 'direct';
        this.cells = [];
        
        // DOM elements
        this.elements = {
            presetSelect: document.getElementById('preset-select'),
            counterGrid: document.getElementById('counter-grid'),
            resultsArea: document.getElementById('results-area'),
            totalCount: document.getElementById('total-count'),
            resultsList: document.getElementById('results-list'),
            resetButton: document.getElementById('reset-button'),
            placeholder: document.getElementById('counter-placeholder')
        };
        
        this.init();
    }
    
    init() {
        this.renderPresetSelect();
        this.selectPreset(this.selectedPresetKey);
        this.setupEventListeners();
    }
    
    renderPresetSelect() {
        this.elements.presetSelect.innerHTML = this.presets.map(preset => `
            <button type="button" 
                    class="preset-button ${preset.key === this.selectedPresetKey ? 'active' : ''}" 
                    data-preset="${preset.key}">
                ${preset.label}
            </button>
        `).join('');
        
        this.elements.presetSelect.querySelectorAll('.preset-button').forEach(btn => {
            btn.addEventListener('click', () => this.selectPreset(btn.dataset.preset));
        });
    }
    
    selectPreset(key) {
        const preset = this.presets.find(p => p.key === key);
        if (preset) {
            this.selectedPresetKey = key;
            this.cells = JSON.parse(JSON.stringify(preset.cells));
            this.renderPresetSelect();
            this.renderCounterGrid();
            this.updateResults();
        }
    }
    
    renderCounterGrid() {
        this.elements.counterGrid.innerHTML = this.cells.map(cell => `
            <div class="counter-cell" style="border-top-color: ${cell.color}">
                <div class="cell-info">
                    <span class="cell-name">${this.escapeHtml(cell.name)}</span>
                    <span class="cell-count" id="count-${cell.id}">0</span>
                </div>
                <div class="cell-controls">
                    <button class="count-button decrement" 
                            data-cell="${cell.id}" 
                            data-action="decrement"
                            disabled
                            title="Décrémenter">−</button>
                    <button class="count-button increment" 
                            data-cell="${cell.id}" 
                            data-action="increment"
                            style="background-color: ${cell.color}"
                            title="Incrémenter">+</button>
                </div>
            </div>
        `).join('');
        
        // Add click handlers
        this.elements.counterGrid.querySelectorAll('.count-button').forEach(btn => {
            btn.addEventListener('click', () => {
                const cellId = btn.dataset.cell;
                const action = btn.dataset.action;
                if (action === 'increment') {
                    this.increment(cellId);
                } else if (action === 'decrement') {
                    this.decrement(cellId);
                }
            });
        });
    }
    
    setupEventListeners() {
        this.elements.resetButton.addEventListener('click', () => {
            this.resetCounts();
        });
    }
    
    increment(cellId) {
        const cell = this.cells.find(c => c.id === cellId);
        if (cell) {
            cell.count++;
            this.updateCellDisplay(cellId);
            this.updateResults();
        }
    }
    
    decrement(cellId) {
        const cell = this.cells.find(c => c.id === cellId);
        if (cell && cell.count > 0) {
            cell.count--;
            this.updateCellDisplay(cellId);
            this.updateResults();
        }
    }
    
    updateCellDisplay(cellId) {
        const cell = this.cells.find(c => c.id === cellId);
        if (!cell) return;
        
        const countEl = document.getElementById(`count-${cellId}`);
        if (countEl) {
            countEl.textContent = cell.count;
        }
        
        // Update decrement button state
        const decrementBtn = this.elements.counterGrid.querySelector(
            `.count-button.decrement[data-cell="${cellId}"]`
        );
        if (decrementBtn) {
            decrementBtn.disabled = cell.count === 0;
        }
    }
    
    getTotalCount() {
        return this.cells.reduce((sum, cell) => sum + cell.count, 0);
    }
    
    getResults() {
        const total = this.getTotalCount();
        if (total === 0) {
            return this.cells.map(cell => ({ ...cell, percentage: 0 }));
        }
        return this.cells
            .map(cell => ({
                ...cell,
                percentage: (cell.count / total) * 100
            }))
            .sort((a, b) => b.count - a.count);
    }
    
    updateResults() {
        const total = this.getTotalCount();
        this.elements.totalCount.textContent = total;
        
        // Update reset button state
        this.elements.resetButton.disabled = total === 0;
        
        // Show/hide sections
        if (total > 0) {
            this.elements.resultsArea.style.display = 'block';
            this.elements.placeholder.style.display = 'none';
            this.renderResults();
        } else {
            this.elements.resultsArea.style.display = 'none';
            this.elements.placeholder.style.display = 'block';
        }
    }
    
    renderResults() {
        const results = this.getResults();
        
        this.elements.resultsList.innerHTML = results
            .filter(result => result.count > 0)
            .map(result => `
                <div class="result-item">
                    <div class="result-label">
                        <span>${this.escapeHtml(result.name)}</span>
                        <span class="result-raw-count">(${result.count})</span>
                    </div>
                    <div class="result-bar-container">
                        <div class="result-progress-wrapper">
                            <div class="result-progress-bar" style="width: ${result.percentage}%; background-color: ${result.color}"></div>
                        </div>
                        <span class="result-percentage">${result.percentage.toFixed(1)}%</span>
                    </div>
                </div>
            `).join('');
    }
    
    resetCounts() {
        this.cells.forEach(cell => {
            cell.count = 0;
            this.updateCellDisplay(cell.id);
        });
        this.updateResults();
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new CounterCellApp());
} else {
    new CounterCellApp();
}
