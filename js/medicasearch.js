// Medicasearch App - Now much simpler using reusable components
class MedicasearchApp {
    constructor() {
        this.dbLoader = null;
        this.db = null;
        this.searchResults = [];
        this.activeFilter = 'all';
        this.ftsTableName = 'medicaments_fts';
        
        // DOM elements
        this.elements = {
            loadingSection: document.getElementById('loading-section'),
            loadingStatus: document.getElementById('loading-status'),
            loadingProgress: document.getElementById('loading-progress'),
            loadingSpinner: document.getElementById('loading-spinner'),
            searchUI: document.getElementById('search-ui'),
            searchInput: document.getElementById('search-input'),
            searchButton: document.getElementById('search-button'),
            autocompleteDropdown: document.getElementById('autocomplete-dropdown'),
            autocompleteList: document.getElementById('autocomplete-list'),
            autocompleteLoading: document.getElementById('autocomplete-loading'),
            filterControls: document.getElementById('filter-controls'),
            searchLoading: document.getElementById('search-loading'),
            searchError: document.getElementById('search-error'),
            noResults: document.getElementById('no-results'),
            resultsList: document.getElementById('results-list')
        };
        
        this.init();
    }
    
    async init() {
        await this.loadDatabase();
        this.setupSearch();
        this.setupAutocomplete();
        this.setupFilters();
    }
    
    async loadDatabase() {
        this.dbLoader = new DatabaseLoader({
            dbPath: '/db/medicaments_fts.db?v=7',
            onProgress: (message, progress) => {
                this.elements.loadingStatus.textContent = message;
                this.elements.loadingProgress.value = progress;
                
                if (progress >= 100) {
                    this.elements.loadingProgress.style.display = 'none';
                    this.elements.loadingSpinner.style.display = 'inline-block';
                }
            },
            onComplete: (db) => {
                this.db = db;
                setTimeout(() => {
                    this.elements.loadingSection.style.display = 'none';
                    this.elements.searchUI.style.display = 'flex';
                }, 500);
            },
            onError: (err) => {
                this.elements.searchError.textContent = `Échec du chargement : ${err.message}`;
                this.elements.searchError.style.display = 'block';
            }
        });
        
        await this.dbLoader.load();
    }
    
    setupSearch() {
        this.elements.searchButton.addEventListener('click', () => this.performSearch());
        
        this.elements.searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.performSearch();
            }
        });
    }
    
    setupAutocomplete() {
        this.autocomplete = new AutocompleteComponent({
            input: this.elements.searchInput,
            dropdown: this.elements.autocompleteDropdown,
            list: this.elements.autocompleteList,
            loadingElement: this.elements.autocompleteLoading,
            onSearch: async (term) => {
                const ftsQueryTerm = SearchUtils.formatFTSTerm(term);
                if (!ftsQueryTerm) return [];
                
                const query = `
                    SELECT DISTINCT Nom_Commercial, DCI
                    FROM "${this.ftsTableName}"
                    WHERE "${this.ftsTableName}" MATCH ?
                    ORDER BY rank
                    LIMIT 10
                `;
                
                const results = this.dbLoader.query(query, [ftsQueryTerm]);
                
                return results.map(row => ({
                    text: row.Nom_Commercial + (row.DCI ? ' (' + row.DCI + ')' : ''),
                    html: SearchUtils.highlightMatch(row.Nom_Commercial, term) + 
                          (row.DCI ? ' (' + SearchUtils.highlightMatch(row.DCI, term) + ')' : '')
                }));
            },
            onSelect: (item) => {
                this.elements.searchInput.value = item.text;
                this.performSearch();
            }
        });
    }
    
    setupFilters() {
        this.elements.filterControls.querySelectorAll('.filter-button').forEach(button => {
            button.addEventListener('click', () => {
                this.activeFilter = button.dataset.filter;
                this.updateFilterButtons();
                this.renderResults();
            });
        });
    }
    
    async performSearch() {
        const searchTerm = this.elements.searchInput.value.trim();
        
        if (!this.db || !searchTerm) return;
        
        this.activeFilter = 'all';
        this.updateFilterButtons();
        
        // Show loading
        this.elements.searchLoading.style.display = 'flex';
        this.elements.searchError.style.display = 'none';
        this.elements.noResults.style.display = 'none';
        this.elements.resultsList.innerHTML = '';
        this.elements.filterControls.style.display = 'none';
        
        const ftsQueryTerm = SearchUtils.formatFTSTerm(searchTerm);
        
        if (!ftsQueryTerm) {
            this.showError('Terme de recherche invalide.');
            return;
        }
        
        try {
            await new Promise(resolve => setTimeout(resolve, 10));
            
            const query = `
                SELECT
                    rowid, CODE_PCT, Nom_Commercial, Dosage, DCI, AMM, Laboratoire,
                    PRIX_PUBLIC, TARIF_REFERENCE, CATEGORIE, AP,
                    Indications, Classe_Therapeutique, Sous_Classe_Therapeutique,
                    Forme, Presentation, Date_AMM, VEIC, Tableau,
                    Duree_Conservation, Conditionnement_Primaire, Specification_Conditionnement,
                    RCP_Link, Notice_Link
                FROM "${this.ftsTableName}"
                WHERE "${this.ftsTableName}" MATCH ?
                ORDER BY rank
            `;
            
            const results = this.dbLoader.query(query, [ftsQueryTerm]);
            
            // Format prices
            results.forEach(row => {
                row.PRIX_PUBLIC_formatted = row.PRIX_PUBLIC ? parseFloat(row.PRIX_PUBLIC).toFixed(3) : 'N/A';
                row.TARIF_REFERENCE_formatted = row.TARIF_REFERENCE ? parseFloat(row.TARIF_REFERENCE).toFixed(3) : 'N/A';
            });
            
            this.searchResults = results;
            this.elements.searchLoading.style.display = 'none';
            
            if (results.length === 0) {
                this.elements.noResults.innerHTML = `Aucun résultat trouvé pour "<span>${SearchUtils.escapeHtml(searchTerm)}</span>".`;
                this.elements.noResults.style.display = 'block';
            } else {
                this.elements.filterControls.style.display = 'flex';
                this.renderResults();
            }
            
        } catch (err) {
            this.showError(err.message.includes('malformed MATCH') ? 
                'Syntaxe de recherche invalide. Essayez des mots simples.' : 
                `Erreur : ${err.message}`);
        }
    }
    
    showError(message) {
        this.elements.searchLoading.style.display = 'none';
        this.elements.searchError.textContent = message;
        this.elements.searchError.style.display = 'block';
    }
    
    renderResults() {
        let results = this.searchResults;
        
        // Apply filters
        if (this.activeFilter === 'hasPrice') {
            results = results.filter(r => r.PRIX_PUBLIC != null && r.PRIX_PUBLIC !== '');
        } else if (this.activeFilter === 'hasLinks') {
            results = results.filter(r => (r.RCP_Link && r.RCP_Link.trim()) || (r.Notice_Link && r.Notice_Link.trim()));
        }
        
        // Limit to 100
        results = results.slice(0, 100);
        
        this.elements.resultsList.innerHTML = results.map(result => this.createResultHTML(result)).join('');
        
        // Add click handlers for collapsible sections
        this.elements.resultsList.querySelectorAll('.result-header').forEach(header => {
            header.addEventListener('click', () => {
                const details = header.nextElementSibling;
                const arrow = header.querySelector('.arrow-indicator');
                details.classList.toggle('open');
                arrow.classList.toggle('rotate-90');
                
                if (details.classList.contains('open')) {
                    this.updateLastVisibleSection(details);
                }
            });
        });
    }
    
    createResultHTML(result) {
        const title = this.makeTitle(result.Nom_Commercial, result.Forme, result.Presentation);
        const dosage = result.Dosage ? ` (${SearchUtils.escapeHtml(result.Dosage)})` : '';
        
        return `
            <div class="result-item">
                <div class="result-header">
                    <div class="result-title">
                        <span class="title-main">${title}</span>${dosage}
                    </div>
                    <span class="arrow-indicator">❯</span>
                </div>
                <div class="result-details">
                    ${this.renderSections(result)}
                </div>
            </div>
        `;
    }
    
    renderSections(result) {
        const sections = [
            this.renderSection(result, ['DCI', 'Laboratoire'], {
                'DCI': 'DCI', 'Laboratoire': 'Laboratoire'
            }),
            this.renderSection(result, ['PRIX_PUBLIC', 'TARIF_REFERENCE', 'VEIC', 'CATEGORIE', 'AP', 'CODE_PCT'], {
                'PRIX_PUBLIC': 'Prix Public',
                'TARIF_REFERENCE': 'Remboursement CNAM',
                'VEIC': 'VEIC',
                'CATEGORIE': 'VEIC',
                'AP': 'AP',
                'CODE_PCT': 'Code PCT'
            }, (key, value) => {
                if (key === 'PRIX_PUBLIC' || key === 'TARIF_REFERENCE') return value + ' TND';
                if (key === 'VEIC' || key === 'CATEGORIE') return this.expandVEIC(this.formatCategorie(value));
                return value;
            }),
            this.renderSection(result, ['AMM', 'Date_AMM', 'Tableau'], {
                'AMM': 'AMM', 'Date_AMM': 'Date AMM', 'Tableau': 'Tableau'
            }),
            this.renderSection(result, ['Forme', 'Presentation', 'Duree_Conservation', 'Conditionnement_Primaire', 'Specification_Conditionnement'], {
                'Forme': 'Forme',
                'Presentation': 'Présentation',
                'Duree_Conservation': 'Durée Conserv.',
                'Conditionnement_Primaire': 'Condit. Primaire',
                'Specification_Conditionnement': 'Spécif. Condit.'
            }),
            this.renderSection(result, ['Classe_Therapeutique', 'Sous_Classe_Therapeutique'], {
                'Classe_Therapeutique': 'Classe Thérapeutique',
                'Sous_Classe_Therapeutique': 'Sous-Classe'
            }),
            result.Indications ? `
                <div class="details-section">
                    <strong class="prop-label">Indications:</strong>
                    <span class="prop-value">${SearchUtils.escapeHtml(result.Indications)}</span>
                </div>
            ` : '',
            (result.RCP_Link || result.Notice_Link) ? `
                <div class="details-section">
                    <strong class="prop-label">Liens:</strong>
                    ${result.RCP_Link ? `<a class="prop-value" href="${result.RCP_Link}" target="_blank">RCP</a>` : ''}
                    ${result.Notice_Link ? `<a class="prop-value" href="${result.Notice_Link}" target="_blank" style="margin-left: 5px;">Notice</a>` : ''}
                </div>
            ` : ''
        ];
        
        return sections.filter(s => s).join('');
    }
    
    renderSection(result, keys, labels, formatter = null) {
        const fields = keys.filter(key => result[key] != null && result[key] !== '');
        if (fields.length === 0) return '';
        
        const content = fields.map(key => {
            let value = key === 'PRIX_PUBLIC' ? result.PRIX_PUBLIC_formatted : 
                       key === 'TARIF_REFERENCE' ? result.TARIF_REFERENCE_formatted : 
                       result[key];
            
            if (formatter) value = formatter(key, value);
            
            return `
                <div class="field-container">
                    <strong class="prop-label">${labels[key]}:</strong>
                    <span class="prop-value">${SearchUtils.escapeHtml(String(value))}</span>
                </div>
            `;
        }).join('');
        
        return `<div class="details-section">${content}</div>`;
    }
    
    makeTitle(nom, forme, presentation) {
        const parts = [nom];
        if (forme) parts.push(forme);
        if (presentation) parts.push(presentation);
        return SearchUtils.escapeHtml(parts.join(' '));
    }
    
    formatCategorie(cat) {
        const map = { 'Vital': 'V', 'Essentiel': 'E', 'Intermédiaire': 'I', 'Confort': 'C' };
        return map[cat] || cat;
    }
    
    expandVEIC(value) {
        const map = { 'V': 'Vital', 'E': 'Essentiel', 'I': 'Intermédiaire', 'C': 'Confort' };
        return map[value] || value;
    }
    
    updateLastVisibleSection(container) {
        setTimeout(() => {
            const sections = Array.from(container.querySelectorAll('.details-section'));
            sections.forEach(s => s.classList.remove('last-visible-section'));
            const visible = sections.filter(s => s.offsetParent !== null);
            if (visible.length > 0) {
                visible[visible.length - 1].classList.add('last-visible-section');
            }
        }, 50);
    }
    
    updateFilterButtons() {
        this.elements.filterControls.querySelectorAll('.filter-button').forEach(button => {
            button.classList.toggle('active-filter-button', button.dataset.filter === this.activeFilter);
        });
    }
}

// Initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new MedicasearchApp());
} else {
    new MedicasearchApp();
}
