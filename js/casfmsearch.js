// CA-SFM Search App
class CASFMSearchApp {
    constructor() {
        this.dbLoader = null;
        this.db = null;
        this.searchResults = [];
        this.tocData = [];
        this.ftsTableName = 'pdf_content';
        this.currentView = 'toc'; // 'toc' or 'results'
        
        // Get search term from URL hash
        const searchParams = new URLSearchParams(window.location.hash.replace('#', ''));
        this.initialSearchTerm = searchParams.get('q') || '';
        
        // DOM elements
        this.elements = {
            loadingSection: document.getElementById('loading-section'),
            loadingStatus: document.getElementById('loading-status'),
            loadingProgress: document.getElementById('loading-progress'),
            loadingSpinner: document.getElementById('loading-spinner'),
            searchUI: document.getElementById('search-ui'),
            searchInput: document.getElementById('search-input'),
            searchButton: document.getElementById('search-button'),
            tocSection: document.getElementById('toc-section'),
            tocContent: document.getElementById('toc-content'),
            resultsSection: document.getElementById('results-section'),
            searchLoading: document.getElementById('search-loading'),
            searchError: document.getElementById('search-error'),
            noResults: document.getElementById('no-results'),
            resultsList: document.getElementById('results-list'),
            resultLimit: document.getElementById('result-limit')
        };
        
        this.init();
    }
    
    async init() {
        await this.loadDatabase();
        await this.loadTableOfContents();
        this.setupSearch();
        
        // If there's an initial search term, perform search
        if (this.initialSearchTerm) {
            this.elements.searchInput.value = this.initialSearchTerm;
            this.performSearch();
        } else {
            this.showTableOfContents();
        }
    }
    
    async loadDatabase() {
        this.dbLoader = new DatabaseLoader({
            dbPath: '/db/casfm_fts5.db?v=3',
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
                this.showError(`Échec du chargement : ${err.message}`);
            }
        });
        
        await this.dbLoader.load();
    }
    
    async loadTableOfContents() {
        if (!this.db) {
            this.tocData = [];
            return;
        }
        
        try {
            // Get chapters (level 1)
            const chapterQuery = `
                SELECT id, title, page, sort_order
                FROM toc_structure
                WHERE level = 1
                ORDER BY sort_order
            `;
            
            const chapters = this.dbLoader.query(chapterQuery);
            
            for (const chapter of chapters) {
                // Get subchapters (level 2)
                const subchapterQuery = `
                    SELECT id, title, page, sort_order
                    FROM toc_structure
                    WHERE level = 2 AND parent_id = ?
                    ORDER BY sort_order
                `;
                
                chapter.subchapters = this.dbLoader.query(subchapterQuery, [chapter.id]);
                
                // Get subsections (level 3) for each subchapter
                for (const subchapter of chapter.subchapters) {
                    const subsectionQuery = `
                        SELECT title, page, sort_order
                        FROM toc_structure
                        WHERE level = 3 AND parent_id = ?
                        ORDER BY sort_order
                    `;
                    
                    subchapter.subsections = this.dbLoader.query(subsectionQuery, [subchapter.id]);
                }
            }
            
            this.tocData = chapters;
            this.renderTableOfContents();
            
        } catch (err) {
            console.error('Error loading table of contents:', err);
            this.showError('Erreur lors du chargement de la table des matières: ' + err.message);
        }
    }
    
    renderTableOfContents() {
        if (this.tocData.length === 0) {
            this.elements.tocContent.innerHTML = '<p>Table des matières non disponible.</p>';
            return;
        }
        
        let html = '<ul class="toc-list">';
        
        for (const chapter of this.tocData) {
            html += `
                <li>
                    <a href="/casfm-viewer.html#p=${chapter.page}" class="toc-chapter">
                        ${SearchUtils.escapeHtml(chapter.title)}${chapter.page ? ` (p. ${chapter.page})` : ''}
                    </a>
            `;
            
            if (chapter.subchapters && chapter.subchapters.length > 0) {
                html += '<ul class="toc-sub-list">';
                
                for (const subchapter of chapter.subchapters) {
                    html += `
                        <li>
                            <a href="/casfm-viewer.html#p=${subchapter.page}" class="toc-subchapter">
                                ${SearchUtils.escapeHtml(subchapter.title)}${subchapter.page ? ` (p. ${subchapter.page})` : ''}
                            </a>
                    `;
                    
                    if (subchapter.subsections && subchapter.subsections.length > 0) {
                        html += '<ul class="toc-sub-sub-list">';
                        
                        for (const subsection of subchapter.subsections) {
                            html += `
                                <li>
                                    <a href="/casfm-viewer.html#p=${subsection.page}" class="toc-subsection">
                                        ${SearchUtils.escapeHtml(subsection.title)}${subsection.page ? ` (p. ${subsection.page})` : ''}
                                    </a>
                                </li>
                            `;
                        }
                        
                        html += '</ul>';
                    }
                    
                    html += '</li>';
                }
                
                html += '</ul>';
            }
            
            html += '</li>';
        }
        
        html += '</ul>';
        
        this.elements.tocContent.innerHTML = html;
    }
    
    setupSearch() {
        this.elements.searchButton.addEventListener('click', () => this.performSearch());
        
        this.elements.searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.performSearch();
            }
        });
        
        this.elements.searchInput.addEventListener('input', () => {
            const searchTerm = this.elements.searchInput.value.trim();
            if (!searchTerm) {
                this.showTableOfContents();
            }
        });
    }
    
    showTableOfContents() {
        this.currentView = 'toc';
        this.elements.tocSection.style.display = 'block';
        this.elements.resultsSection.style.display = 'none';
        this.elements.searchError.style.display = 'none';
    }
    
    async performSearch() {
        const searchTerm = this.elements.searchInput.value.trim();
        
        if (!this.db || !searchTerm) {
            this.showTableOfContents();
            return;
        }
        
        this.currentView = 'results';
        this.elements.tocSection.style.display = 'none';
        this.elements.resultsSection.style.display = 'block';
        this.elements.searchLoading.style.display = 'flex';
        this.elements.searchError.style.display = 'none';
        this.elements.noResults.style.display = 'none';
        this.elements.resultsList.innerHTML = '';
        this.elements.resultLimit.style.display = 'none';
        
        const ftsQueryTerm = SearchUtils.formatFTSTerm(searchTerm);
        
        if (!ftsQueryTerm) {
            this.showError('Terme de recherche invalide.');
            return;
        }
        
        try {
            await new Promise(resolve => setTimeout(resolve, 10));
            
            const query = `
                SELECT 
                    rowid, page, chapter, subchapter, subsection,
                    snippet(${this.ftsTableName}, 1, '<span class="highlight">', '</span>', '...', 20) as snippet
                FROM "${this.ftsTableName}"
                WHERE "${this.ftsTableName}" MATCH ?
                ORDER BY rank
                LIMIT 101
            `;
            
            const results = this.dbLoader.query(query, [ftsQueryTerm]);
            this.searchResults = results;
            
            this.elements.searchLoading.style.display = 'none';
            
            if (results.length === 0) {
                this.elements.noResults.innerHTML = `Aucun résultat trouvé pour "<span>${SearchUtils.escapeHtml(searchTerm)}</span>".`;
                this.elements.noResults.style.display = 'block';
            } else {
                this.renderResults(searchTerm);
                
                if (results.length > 100) {
                    this.elements.resultLimit.style.display = 'block';
                }
            }
            
        } catch (err) {
            this.showError(err.message.includes('malformed MATCH') ? 
                'Syntaxe de recherche invalide.' : 
                `Erreur : ${err.message}`);
        }
    }
    
    renderResults(searchTerm) {
        const results = this.searchResults.slice(0, 100);
        
        this.elements.resultsList.innerHTML = results.map(result => {
            let hierarchyHTML = '';
            
            if (result.chapter) {
                hierarchyHTML += `
                    <div class="hierarchy-item">
                        <span class="hierarchy-label">Chapitre:</span>
                        <span>${SearchUtils.escapeHtml(result.chapter)}</span>
                    </div>
                `;
            }
            
            if (result.subchapter) {
                hierarchyHTML += `
                    <div class="hierarchy-item">
                        <span class="hierarchy-label">Section:</span>
                        <span>${SearchUtils.escapeHtml(result.subchapter)}</span>
                    </div>
                `;
            }
            
            if (result.subsection) {
                hierarchyHTML += `
                    <div class="hierarchy-item">
                        <span class="hierarchy-label">Sous-section:</span>
                        <span>${SearchUtils.escapeHtml(result.subsection)}</span>
                    </div>
                `;
            }
            
            return `
                <div class="result-item" onclick="window.location.href='/casfm-viewer.html#q=${encodeURIComponent(searchTerm)}&p=${result.page}'">
                    <div class="result-header">
                        <span class="page-number">Page ${result.page}</span>
                    </div>
                    ${hierarchyHTML ? `<div class="result-hierarchy">${hierarchyHTML}</div>` : ''}
                    <div class="result-content">${result.snippet}</div>
                </div>
            `;
        }).join('');
    }
    
    showError(message) {
        this.elements.searchLoading.style.display = 'none';
        this.elements.searchError.textContent = message;
        this.elements.searchError.style.display = 'block';
    }
}

// Initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new CASFMSearchApp());
} else {
    new CASFMSearchApp();
}
