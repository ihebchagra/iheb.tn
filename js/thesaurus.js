// Thesaurus App - Standalone, styled like existing search pages
class ThesaurusApp {
    constructor() {
        this.dbLoader = null;
        this.db = null;
        this.table = 'thesaurus_fts';
        this.results = [];

        this.el = {
            loadingSection: document.getElementById('loading-section'),
            loadingStatus: document.getElementById('loading-status'),
            loadingProgress: document.getElementById('loading-progress'),
            loadingSpinner: document.getElementById('loading-spinner'),
            searchUI: document.getElementById('search-ui'),
            searchInput: document.getElementById('search-input'),
            searchButton: document.getElementById('search-button'),
            searchLoading: document.getElementById('search-loading'),
            searchError: document.getElementById('search-error'),
            noResults: document.getElementById('no-results'),
            resultsList: document.getElementById('results-list'),
            resultLimit: document.getElementById('result-limit')
        };

        const params = new URLSearchParams(window.location.hash.replace('#',''));
        this.initial = params.get('q') || '';

        this.init();
    }

    async init() {
        await this.loadDB();
        this.bindEvents();
        if (this.initial) {
            this.el.searchInput.value = this.initial;
            this.performSearch();
        }
    }

    async loadDB() {
        this.dbLoader = new DatabaseLoader({
            dbPath: '/db/thesaurus_fts.db?v=2',
            onProgress: (msg, pct) => {
                this.el.loadingStatus.textContent = msg;
                this.el.loadingProgress.value = pct;
                if (pct >= 100) {
                    this.el.loadingProgress.style.display = 'none';
                    this.el.loadingSpinner.style.display = 'inline-block';
                }
            },
            onComplete: db => {
                this.db = db;
                setTimeout(() => {
                    this.el.loadingSection.style.display = 'none';
                    this.el.searchUI.style.display = 'flex';
                }, 350);
            },
            onError: err => this.showError(`Échec du chargement : ${err.message}`)
        });

        await this.dbLoader.load();
    }

    bindEvents() {
        this.el.searchButton.addEventListener('click', () => this.performSearch());
        this.el.searchInput.addEventListener('keydown', e => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.performSearch();
            }
        });
    }

    async performSearch() {
        const term = this.el.searchInput.value.trim();
        if (!this.db || !term) {
            this.clearResults();
            return;
        }
        window.location.hash = `q=${encodeURIComponent(term)}`;

        this.el.searchLoading.style.display = 'flex';
        this.el.searchError.style.display = 'none';
        this.el.noResults.style.display = 'none';
        this.el.resultsList.innerHTML = '';
        this.el.resultLimit.style.display = 'none';

        const ftsTerm = SearchUtils.formatFTSTerm(term);
        if (!ftsTerm) {
            this.showError('Terme de recherche invalide.');
            return;
        }

        try {
            await new Promise(r => setTimeout(r, 10));

            const sql = `
                SELECT rowid, english, french, arabic
                FROM "${this.table}"
                WHERE "${this.table}" MATCH ?
                ORDER BY rank
                LIMIT 101
            `;
            const rows = this.dbLoader.query(sql, [ftsTerm]);
            this.results = rows;
            this.el.searchLoading.style.display = 'none';

            if (rows.length === 0) {
                this.el.noResults.innerHTML =
                    `Aucun résultat trouvé pour "<span>${SearchUtils.escapeHtml(term)}</span>".`;
                this.el.noResults.style.display = 'block';
            } else {
                if (rows.length > 100) this.el.resultLimit.style.display = 'block';
                this.render(rows.slice(0, 100), term);
            }
        } catch (err) {
            this.showError(
                err.message.includes('malformed MATCH')
                    ? 'Syntaxe de recherche invalide.'
                    : `Erreur : ${err.message}`
            );
        }
    }

    render(rows, term) {
        this.el.resultsList.innerHTML = rows.map(r => {
            const lines = [];
            if (r.english) {
                lines.push(`
                    <div class="term-line">
                        <span class="term-label">EN</span>
                        <span class="term-text">${r.english}</span>
                    </div>`);
            }
            if (r.french) {
                lines.push(`
                    <div class="term-line">
                        <span class="term-label">FR</span>
                        <span class="term-text">${r.french}</span>
                    </div>`);
            }
            if (r.arabic) {
                lines.push(`
                    <div class="term-line arabic">
                        <span class="term-label">AR</span>
                        <span class="term-text">${r.arabic}</span>
                    </div>`);
            }
            return `
                <div class="result-item">
                    <div class="term-block">
                        ${lines.join('')}
                    </div>
                </div>
            `;
        }).join('');
    }

    clearResults() {
        this.el.resultsList.innerHTML = '';
        this.el.noResults.style.display = 'none';
        this.el.resultLimit.style.display = 'none';
        this.el.searchError.style.display = 'none';
    }

    showError(msg) {
        this.el.searchLoading.style.display = 'none';
        this.el.searchError.textContent = msg;
        this.el.searchError.style.display = 'block';
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new ThesaurusApp());
} else {
    new ThesaurusApp();
}
