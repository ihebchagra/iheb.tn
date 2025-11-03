// APIprofil App
class APIprofilApp {
    constructor() {
        this.dbOptions = [
            { key: 'api10s', label: 'API 10S' },
            { key: 'api20e', label: 'API 20E' },
            { key: 'api20ne', label: 'API 20NE' },
            { key: 'apistrep', label: 'API Strep' },
            { key: 'apicoryne', label: 'API Coryne' },
            { key: 'apinh', label: 'API NH' },
            { key: 'apistaph', label: 'API Staph' },
            { key: 'id32c', label: 'ID32 C' }
        ];
        
        this.selectedDb = localStorage.getItem('apiprofil-selected-db') || 'api10s';
        this.db = [];
        this.criteria = [];
        this.searchTerm = '';
        this.displayedResults = [];
        this.selectedAutocompleteIndex = -1;
        
        // DOM elements
        this.elements = {
            dbSelect: document.getElementById('db-select'),
            loadingSection: document.getElementById('loading-section'),
            errorSection: document.getElementById('error-section'),
            searchSection: document.getElementById('search-section'),
            searchInput: document.getElementById('search-input'),
            autocompleteDropdown: document.getElementById('autocomplete-dropdown'),
            autocompleteList: document.getElementById('autocomplete-list'),
            autocompleteEmpty: document.getElementById('autocomplete-empty'),
            resetButton: document.getElementById('reset-button'),
            placeholderSection: document.getElementById('placeholder-section'),
            resultsSection: document.getElementById('results-section')
        };
        
        this.init();
    }
    
    async init() {
        this.renderDbSelect();
        await this.loadDb(this.selectedDb);
        this.setupEventListeners();
    }
    
    renderDbSelect() {
        this.elements.dbSelect.innerHTML = this.dbOptions.map(opt => `
            <button type="button" 
                    class="db-button ${opt.key === this.selectedDb ? 'active' : ''}" 
                    data-db="${opt.key}">
                ${opt.label}
            </button>
        `).join('');
        
        this.elements.dbSelect.querySelectorAll('.db-button').forEach(btn => {
            btn.addEventListener('click', () => this.selectDb(btn.dataset.db));
        });
    }
    
    async selectDb(key) {
        if (this.selectedDb === key) return;
        
        this.selectedDb = key;
        localStorage.setItem('apiprofil-selected-db', key);
        this.resetSearch();
        
        this.renderDbSelect();
        await this.loadDb(key);
    }
    
    async loadDb(key) {
        this.showLoading();
        this.hideError();
        this.elements.searchSection.style.display = 'none';
        this.elements.placeholderSection.style.display = 'none';
        
        this.criteria = [];
        this.db = [];
        this.resetSearch();
        
        const url = `/db/${key}.json?v=1`;
        
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error('Erreur de chargement');
            
            const data = await response.json();
            this.db = this.createSearchIndex(data.db);
            this.criteria = data.criteria;
            
            this.hideLoading();
            this.elements.searchSection.style.display = 'flex';
            this.elements.placeholderSection.style.display = 'block';
            
        } catch (e) {
            this.hideLoading();
            
            const errorMessages = {
                'api20e': "API 20E : Bientôt disponible.",
                'api20ne': "API 20NE : Bientôt disponible.",
                'apistrep': "API Strep : Bientôt disponible.",
                'apicoryne': "API Coryne : Bientôt disponible.",
                'apinh': "API NH : Bientôt disponible.",
                'apistaph': "API Staph : Bientôt disponible.",
                'id32c': "ID32 C : Bientôt disponible."
            };
            
            this.showError(errorMessages[key] || "Erreur de chargement de la base.");
        }
    }
    
    normalizeKey(key) {
        if (!key) return '';
        return key.toLowerCase().replace(/[^a-z0-9]/g, '');
    }
    
    createSearchIndex(database) {
        if (!database) return [];
        return database.map(bacterium => {
            const name = bacterium.Taxon.toLowerCase();
            const tokens = name.split(/[\s./-]+/).filter(t => t.length > 0);
            
            const normalizedProps = {};
            for (const key in bacterium) {
                normalizedProps[this.normalizeKey(key)] = bacterium[key];
            }
            
            return {
                ...bacterium,
                search_tokens: tokens,
                search_acronym: tokens.map(t => t[0]).join(''),
                normalized_props: normalizedProps
            };
        });
    }
    
    setupEventListeners() {
        this.elements.searchInput.addEventListener('input', () => {
            this.searchTerm = this.elements.searchInput.value;
            this.displayedResults = [];
            this.updateAutocomplete();
        });
        
        this.elements.searchInput.addEventListener('keydown', (e) => {
            this.handleAutocompleteKeydown(e);
        });
        
        this.elements.searchInput.addEventListener('focus', () => {
            if (this.searchTerm.trim()) {
                this.updateAutocomplete();
            }
        });
        
        this.elements.resetButton.addEventListener('click', () => {
            this.resetSearch();
        });
        
        document.addEventListener('click', (e) => {
            if (!this.elements.searchInput.contains(e.target) && 
                !this.elements.autocompleteDropdown.contains(e.target)) {
                this.closeAutocomplete();
            }
        });
    }
    
    updateAutocomplete() {
        if (this.searchTerm.trim().length < 1) {
            this.closeAutocomplete();
            return;
        }
        
        const searchTokens = this.searchTerm.toLowerCase().trim().split(/\s+/).filter(t => t.length > 0);
        const isAcronymSearch = searchTokens.length === 1;
        
        const results = this.db.filter(bacterium => {
            if (isAcronymSearch && bacterium.search_acronym.startsWith(searchTokens[0])) {
                return true;
            }
            return searchTokens.every(sToken =>
                bacterium.search_tokens.some(bToken => bToken.startsWith(sToken) || sToken.startsWith(bToken))
            );
        }).slice(0, 10);
        
        this.renderAutocomplete(results);
    }
    
    renderAutocomplete(results) {
        if (results.length === 0) {
            this.elements.autocompleteList.innerHTML = '';
            this.elements.autocompleteEmpty.style.display = 'block';
        } else {
            this.elements.autocompleteEmpty.style.display = 'none';
            this.elements.autocompleteList.innerHTML = results.map((bacterium, index) => `
                <li data-index="${index}">${this.highlightMatch(bacterium.Taxon, this.searchTerm)}</li>
            `).join('');
            
            this.elements.autocompleteList.querySelectorAll('li').forEach((li, index) => {
                li.addEventListener('click', () => {
                    this.selectSingleBacterium(results[index]);
                });
                li.addEventListener('mouseenter', () => {
                    this.selectedAutocompleteIndex = index;
                    this.updateAutocompleteSelection();
                });
            });
        }
        
        this.autocompleteResults = results;
        this.elements.autocompleteDropdown.style.display = 'block';
    }
    
    handleAutocompleteKeydown(e) {
        if (this.elements.autocompleteDropdown.style.display === 'none') {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.updateAutocomplete();
            }
            return;
        }
        
        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                this.selectedAutocompleteIndex = Math.min(
                    this.selectedAutocompleteIndex + 1,
                    this.autocompleteResults.length - 1
                );
                this.updateAutocompleteSelection();
                break;
            case 'ArrowUp':
                e.preventDefault();
                this.selectedAutocompleteIndex = Math.max(this.selectedAutocompleteIndex - 1, 0);
                this.updateAutocompleteSelection();
                break;
            case 'Enter':
                e.preventDefault();
                this.showAllMatches();
                break;
            case 'Escape':
                e.preventDefault();
                this.closeAutocomplete();
                break;
        }
    }
    
    updateAutocompleteSelection() {
        this.elements.autocompleteList.querySelectorAll('li').forEach((li, index) => {
            li.classList.toggle('selected', index === this.selectedAutocompleteIndex);
        });
    }
    
    showAllMatches() {
        this.displayedResults = this.autocompleteResults;
        this.renderResults();
        this.closeAutocomplete();
    }
    
    selectSingleBacterium(bacterium) {
        this.displayedResults = [bacterium];
        this.searchTerm = bacterium.Taxon;
        this.elements.searchInput.value = bacterium.Taxon;
        this.renderResults();
        this.closeAutocomplete();
    }
    
    resetSearch() {
        this.searchTerm = '';
        this.elements.searchInput.value = '';
        this.displayedResults = [];
        this.selectedAutocompleteIndex = -1;
        this.closeAutocomplete();
        this.elements.resultsSection.style.display = 'none';
        if (this.db.length > 0) {
            this.elements.placeholderSection.style.display = 'block';
        }
    }
    
    renderResults() {
        if (this.displayedResults.length === 0) {
            this.elements.resultsSection.style.display = 'none';
            this.elements.placeholderSection.style.display = 'block';
            return;
        }
        
        this.elements.placeholderSection.style.display = 'none';
        this.elements.resultsSection.innerHTML = this.displayedResults.map(bacterium => `
            <div class="apiprofil-result">
                <h2 class="result-title">${this.escapeHtml(bacterium.Taxon)}</h2>
                <div class="profile-grid">
                    ${this.criteria.map(crit => {
                        const value = bacterium.normalized_props[this.normalizeKey(crit.key)];
                        return `
                            <div class="profile-item">
                                <div class="profile-item-label">
                                    <span>${this.escapeHtml(crit.label)}</span>
                                    <span class="criterion-abbr">${this.escapeHtml(crit.key)}</span>
                                </div>
                                <div class="profile-item-value ${this.getProfileValueColor(value)}">
                                    ${this.getProfileValueText(value)}
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `).join('');
        
        this.elements.resultsSection.style.display = 'flex';
    }
    
    getProfileValueText(value) {
        if (value === undefined || value === null) return 'N/A';
        return `${value}%`;
    }
    
    getProfileValueColor(value) {
        if (value === undefined || value === null) return 'color-na';
        if (value >= 85) return 'color-high';
        if (value >= 50) return 'color-mid';
        if (value >= 15) return 'color-low';
        return 'color-vlow';
    }
    
    highlightMatch(text, term) {
        if (!text || !term) return this.escapeHtml(text);
        const escapedText = this.escapeHtml(text);
        const searchTerms = term.trim().split(/\s+/).join('|');
        if (!searchTerms) return escapedText;
        const regex = new RegExp('(' + searchTerms.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + ')', 'gi');
        return escapedText.replace(regex, '<span class="highlight">$1</span>');
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    closeAutocomplete() {
        this.elements.autocompleteDropdown.style.display = 'none';
        this.selectedAutocompleteIndex = -1;
    }
    
    showLoading() {
        this.elements.loadingSection.style.display = 'block';
    }
    
    hideLoading() {
        this.elements.loadingSection.style.display = 'none';
    }
    
    showError(message) {
        this.elements.errorSection.textContent = message;
        this.elements.errorSection.style.display = 'block';
    }
    
    hideError() {
        this.elements.errorSection.style.display = 'none';
    }
}

// Initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new APIprofilApp());
} else {
    new APIprofilApp();
}
