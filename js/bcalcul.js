/**
 * Biological Analysis Price Calculator
 * Handles DB interactions, search logic, and price computation.
 */
class BCalculApp {
    constructor() {
        // Static Data
        this.APB_ACTS = [
            { label: "Prélèvement de sang veineux (un prélèvement)", val: 1.5},
            { label: "Prélèvements multiples de sang veineux (2 prélèvements)", val: 2.5},
            { label: "Prélèvements multiples de sang veineux (3 prélèvements)", val: 3.5},
            { label: "Prélèvements multiples de sang veineux (4 prélèvements ou plus)", val: 4},
            { label: "Prélèvements aseptiques au niveau des muqueuses ou de la peau : 1 seul prélèvement", val: 1.5},
            { label: "Prélèvements aseptiques au niveau des muqueuses ou de la peau : Plusieurs prélèvements", val: 3},
            { label: "Prélèvements gynécologiques à différents niveaux quel que soit le nombre", val: 3},
            { label: "Prélèvement urétral", val: 2},
            { label: "Prélèvement de sang artériel", val: 2},
            { label: "Prélèvement de sang à domicile", val: 5},
            { label: "Prélèvement de sang à domicile en dehors de la commune + indemnité kilometrique", val: 5},
            { label: "Prélèvement de sang à domicile (nuit, dimanche ou jour férié)", val: 7.5}
        ];

        // State
        this.dbLoader = null;
        this.db = null;
        this.config = { b: 0.350, apb: 2.100 };
        this.cart = { apbItems: [], bilans: [], km: 0 };
        
        // Search State
        this.search = { results: [], index: -1, timer: null };

        // UI References
        this.ui = {}; 

        this.init();
    }

    async init() {
        this.cacheDOM();
        this.populateApbSelect();
        await this.initializeDatabase();
        this.bindEvents();
    }

    cacheDOM() {
        const get = (id) => document.getElementById(id);
        this.ui = {
            loader: {
                container: get('loader'),
                status: get('loader-text'),
                bar: get('loader-bar'),
                spinner: get('loader-spinner')
            },
            app: get('app'),
            config: {
                b: get('config-b'),
                apb: get('config-apb')
            },
            apb: {
                select: get('apb-select'),
                addBtn: get('btn-add-apb'),
                kmInput: get('apb-km'),
                list: get('list-apb'),
                empty: get('empty-apb')
            },
            search: {
                input: get('search-input'),
                resultsBox: get('search-results'),
                list: get('results-list'),
                empty: get('results-empty'),
                resetBtn: get('btn-reset-search'),
                error: get('error-msg')
            },
            bilans: {
                list: get('list-bilans'),
                empty: get('empty-bilans')
            },
            result: {
                total: get('res-total'),
                detailApb: get('res-detail-apb'),
                detailB: get('res-detail-b'),
                detailTva: get('res-detail-tva'),
                footerApb: get('footer-count-apb'),
                footerB: get('footer-count-b')
            }
        };
    }

    async initializeDatabase() {
        this.dbLoader = new DatabaseLoader({
            dbPath: '/db/bilans.db',
            onProgress: (msg, pct) => {
                this.ui.loader.status.textContent = msg;
                this.ui.loader.bar.value = pct;
                if (pct >= 100) {
                    this.ui.loader.bar.style.display = 'none';
                    this.ui.loader.spinner.style.display = 'inline-block';
                }
            },
            onComplete: (db) => {
                this.db = db;
                setTimeout(() => {
                    this.ui.loader.container.style.display = 'none';
                    this.ui.app.style.display = 'block';
                }, 400);
            },
            onError: (err) => {
                this.ui.loader.status.textContent = "Erreur: " + err.message;
                this.ui.loader.status.style.color = "red";
            }
        });

        await this.dbLoader.load();
    }

    populateApbSelect() {
        const fragment = document.createDocumentFragment();
        const defaultOpt = document.createElement('option');
        defaultOpt.value = "";
        defaultOpt.textContent = "-- Sélectionner un acte --";
        fragment.appendChild(defaultOpt);

        this.APB_ACTS.forEach((item, index) => {
            const opt = document.createElement('option');
            opt.value = index;
            opt.textContent = `${item.label} (${item.val} APB)`;
            fragment.appendChild(opt);
        });
        this.ui.apb.select.innerHTML = "";
        this.ui.apb.select.appendChild(fragment);
    }

    bindEvents() {
        // Configuration
        const updateConfig = () => {
            this.config.b = parseFloat(this.ui.config.b.value) || 0;
            this.config.apb = parseFloat(this.ui.config.apb.value) || 0;
            this.calculate();
        };
        this.ui.config.b.addEventListener('change', updateConfig);
        this.ui.config.apb.addEventListener('change', updateConfig);

        // APB Actions
        this.ui.apb.addBtn.addEventListener('click', () => {
            const idx = this.ui.apb.select.value;
            if (idx === "") return;
            this.addApbItem(this.APB_ACTS[parseInt(idx)]);
            this.ui.apb.select.value = "";
        });

        this.ui.apb.kmInput.addEventListener('input', (e) => {
            this.cart.km = parseFloat(e.target.value) || 0;
            this.calculate();
        });

        // Search Actions
        this.ui.search.input.addEventListener('input', (e) => {
            const term = e.target.value.trim();
            if (this.search.timer) clearTimeout(this.search.timer);
            this.search.timer = setTimeout(() => this.performSearch(term), 300);
        });

        this.ui.search.input.addEventListener('keydown', (e) => this.handleSearchNav(e));
        
        this.ui.search.resetBtn.addEventListener('click', () => {
            this.resetSearch();
        });

        // Close search when clicking outside
        document.addEventListener('click', (e) => {
            const s = this.ui.search;
            if (!s.input.contains(e.target) && !s.resultsBox.contains(e.target)) {
                this.hideDropdown();
            }
        });
    }

    // --- Search Logic ---

    performSearch(term) {
        if (!this.db || term.length < 2) {
            this.hideDropdown();
            return;
        }

        try {
            // Updated SQL to filter by Lettre B as requested
            const sql = `SELECT id, name, cotation FROM bilans WHERE (id LIKE ? OR name LIKE ? ) AND lettre=='B' LIMIT 20`;
            const wildcard = `%${term}%`;
            const rows = this.dbLoader.query(sql, [wildcard, wildcard]);
            this.renderAutocomplete(rows, term);
        } catch (e) {
            console.error(e);
            this.ui.search.error.textContent = "Erreur de recherche.";
            this.ui.search.error.classList.remove('hidden');
        }
    }

    renderAutocomplete(rows, term) {
        this.search.results = rows;
        const s = this.ui.search;
        
        s.resultsBox.classList.remove('hidden');
        
        if (rows.length === 0) {
            s.list.innerHTML = '';
            s.empty.classList.remove('hidden');
            return;
        }

        s.empty.classList.add('hidden');
        s.list.innerHTML = rows.map((r, i) => `
            <li data-index="${i}">
                <div class="result-name">${this.highlight(r.name, term)}</div>
                <span class="cotation-badge">B${r.cotation}</span>
            </li>
        `).join('');

        s.list.querySelectorAll('li').forEach((li, i) => {
            li.addEventListener('click', () => {
                this.addBilanItem(rows[i]);
                this.resetSearch();
            });
            li.addEventListener('mouseenter', () => {
                this.search.index = i;
                this.updateSearchSelection();
            });
        });
    }

    handleSearchNav(e) {
        const len = this.search.results.length;
        if (len === 0) return;

        if (e.key === 'Enter' && this.search.index > -1) {
            e.preventDefault();
            this.addBilanItem(this.search.results[this.search.index]);
            this.resetSearch();
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            this.search.index = (this.search.index + 1) % len;
            this.updateSearchSelection();
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            this.search.index = (this.search.index - 1 + len) % len;
            this.updateSearchSelection();
        } else if (e.key === 'Escape') {
            this.resetSearch();
        }
    }

    updateSearchSelection() {
        this.ui.search.list.querySelectorAll('li').forEach((li, i) => {
            if (i === this.search.index) li.classList.add('selected');
            else li.classList.remove('selected');
        });
    }

    resetSearch() {
        this.ui.search.input.value = '';
        this.hideDropdown();
    }

    hideDropdown() {
        this.ui.search.resultsBox.classList.add('hidden');
        this.search.index = -1;
    }

    highlight(text, term) {
        if (!text) return "";
        const regex = new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, "gi");
        return text.replace(regex, "<u>$1</u>");
    }

    // --- Cart Management ---

    addApbItem(item) {
        this.cart.apbItems.push({ ...item, id: Date.now() });
        this.renderList(this.cart.apbItems, this.ui.apb.list, this.ui.apb.empty, 'APB', 'removeApb');
        this.calculate();
    }

    removeApb(id) {
        this.cart.apbItems = this.cart.apbItems.filter(i => i.id !== id);
        this.renderList(this.cart.apbItems, this.ui.apb.list, this.ui.apb.empty, 'APB', 'removeApb');
        this.calculate();
    }

    addBilanItem(item) {
        this.cart.bilans.push({
            id: Date.now(),
            code: item.id,
            label: item.name,
            val: parseFloat(item.cotation)
        });
        this.renderList(this.cart.bilans, this.ui.bilans.list, this.ui.bilans.empty, 'B', 'removeBilan');
        this.calculate();
    }

    removeBilan(id) {
        this.cart.bilans = this.cart.bilans.filter(i => i.id !== id);
        this.renderList(this.cart.bilans, this.ui.bilans.list, this.ui.bilans.empty, 'B', 'removeBilan');
        this.calculate();
    }

    renderList(items, container, emptyState, unit, removeFnName) {
        if (items.length === 0) {
            container.innerHTML = '';
            emptyState.style.display = 'block';
            return;
        }
        emptyState.style.display = 'none';
        
        container.innerHTML = items.map(item => `
            <div class="list-item">
                <div class="item-info">
                    <span class="item-code">${unit}${item.val}</span>
                    <span class="item-name">${item.label}</span>
                </div>
                <button class="btn-remove" onclick="window.app.${removeFnName}(${item.id})" title="Supprimer">✖</button>
            </div>
        `).join('');
    }

    calculate() {
        // 1. Calculate Coefficients
        const totalApbCount = this.cart.apbItems.reduce((sum, item) => sum + item.val, 0) + this.cart.km;
        const totalBCount = this.cart.bilans.reduce((sum, item) => sum + item.val, 0);

        // 2. Calculate HT (Hors Taxe)
        const priceApbHT = totalApbCount * this.config.apb;
        const priceBHT = totalBCount * this.config.b;
        const totalHT = priceApbHT + priceBHT;

        // 3. Calculate TVA (7%)
        const TVA_RATE = 0.07;
        const amountTva = totalHT * TVA_RATE;
        const totalTTC = totalHT + amountTva;

        // 4. Update UI
        // Main Total (TTC)
        this.ui.result.total.textContent = totalTTC.toFixed(3);
        
        // Breakdown (HT + Tax amount)
        this.ui.result.detailApb.textContent = `APB: ${priceApbHT.toFixed(3)}`;
        this.ui.result.detailB.textContent = `Bilans: ${priceBHT.toFixed(3)}`;
        this.ui.result.detailTva.textContent = `TVA (7%): ${amountTva.toFixed(3)}`;
        
        // Footer Counters
        this.ui.result.footerApb.textContent = totalApbCount.toFixed(1);
        this.ui.result.footerB.textContent = Math.round(totalBCount); 
    }
}

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    window.app = new BCalculApp();
});
