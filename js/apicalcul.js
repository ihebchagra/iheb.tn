// APIcalcul App
class APIcalculApp {
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
        
        this.selectedDb = localStorage.getItem('apicalcul-selected-db') || 'api10s';
        this.db = [];
        this.criteria = [];
        this.profile = {};
        this.results = [];
        
        // DOM elements
        this.elements = {
            dbSelect: document.getElementById('db-select'),
            loadingSection: document.getElementById('loading-section'),
            errorSection: document.getElementById('error-section'),
            criteriaForm: document.getElementById('criteria-form'),
            criteriaList: document.getElementById('criteria-list'),
            resetButton: document.getElementById('reset-button'),
            resultsSection: document.getElementById('results-section'),
            resultsTbody: document.getElementById('results-tbody')
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
        
        // Add click handlers
        this.elements.dbSelect.querySelectorAll('.db-button').forEach(btn => {
            btn.addEventListener('click', () => this.selectDb(btn.dataset.db));
        });
    }
    
    async selectDb(key) {
        if (this.selectedDb === key) return;
        
        this.selectedDb = key;
        localStorage.setItem('apicalcul-selected-db', key);
        this.results = [];
        this.elements.resultsSection.style.display = 'none';
        
        this.renderDbSelect();
        await this.loadDb(key);
    }
    
    async loadDb(key) {
        this.showLoading();
        this.hideError();
        this.elements.criteriaForm.style.display = 'none';
        
        this.criteria = [];
        this.db = [];
        this.profile = {};
        
        const url = `/db/${key}.json?v=1`;
        
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error('Erreur de chargement');
            
            const data = await response.json();
            this.db = data.db;
            this.criteria = data.criteria;
            
            // Load saved profile for this database
            const savedProfile = localStorage.getItem(`apicalcul-profile-${key}`);
            if (savedProfile) {
                const parsed = JSON.parse(savedProfile);
                this.criteria.forEach(crit => {
                    this.profile[crit.key] = parsed[crit.key] ?? null;
                });
            } else {
                this.criteria.forEach(crit => {
                    this.profile[crit.key] = null;
                });
            }
            
            this.hideLoading();
            this.renderCriteria();
            this.elements.criteriaForm.style.display = 'flex';
            
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
    
    renderCriteria() {
        this.elements.criteriaList.innerHTML = this.criteria.map(crit => `
            <div class="criterion criterion-${crit.class}">
                <label class="criterion-label">
                    <span>${crit.label}</span>
                    <span class="criterion-abbr">${crit.key}</span>
                </label>
                <div class="toggle-group">
                    <button type="button" 
                            class="toggle-btn ${this.profile[crit.key] === '+' ? 'active ' + crit.posClass : ''}" 
                            data-test="${crit.key}" 
                            data-value="+">+</button>
                    <button type="button" 
                            class="toggle-btn ${this.profile[crit.key] === '-' ? 'active ' + crit.negClass : ''}" 
                            data-test="${crit.key}" 
                            data-value="-">-</button>
                    <button type="button" 
                            class="toggle-btn ${this.profile[crit.key] === null ? 'active gray' : ''}" 
                            data-test="${crit.key}" 
                            data-value="null">?</button>
                </div>
            </div>
        `).join('');
        
        // Add click handlers for toggle buttons
        this.elements.criteriaList.querySelectorAll('.toggle-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const test = btn.dataset.test;
                const value = btn.dataset.value === 'null' ? null : btn.dataset.value;
                this.setProfile(test, value);
            });
        });
    }
    
    setProfile(key, val) {
        this.profile[key] = val;
        localStorage.setItem(`apicalcul-profile-${this.selectedDb}`, JSON.stringify(this.profile));
        this.renderCriteria();
    }
    
    resetProfile() {
        this.profile = {};
        this.criteria.forEach(crit => {
            this.profile[crit.key] = null;
        });
        localStorage.removeItem(`apicalcul-profile-${this.selectedDb}`);
        this.results = [];
        this.elements.resultsSection.style.display = 'none';
        this.renderCriteria();
    }
    
    setupEventListeners() {
        this.elements.criteriaForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.calculate();
        });
        
        this.elements.resetButton.addEventListener('click', () => {
            this.resetProfile();
        });
    }
    
    calculate() {
        const profile = this.profile;
        const db = this.db;

        // Constants for reading errors
        const ALPHA_POSITIVE = 0.001;
        const ALPHA_NEGATIVE = 0.01;
        const S = 0.01;

        const taxaResults = db.map(taxon => {
            let poFrequency = 1;
            let ptFrequency = 1;
            const incompatibilities = [];

            for (const [test, expected] of Object.entries(profile)) {
                const percentPositive = taxon[test];
                if (percentPositive === undefined || expected === null) continue;

                const pPositive = percentPositive / 100;
                const pNegative = 1 - pPositive;

                let reactionFrequency;
                if (expected === "+") {
                    reactionFrequency = pPositive * (1 - ALPHA_POSITIVE) + (ALPHA_POSITIVE * pNegative);
                } else {
                    reactionFrequency = pNegative * (1 - ALPHA_NEGATIVE) + (ALPHA_NEGATIVE * pPositive);
                }

                poFrequency *= reactionFrequency;

                const typicalFrequency = (percentPositive >= 50) ?
                    pPositive * (1 - ALPHA_POSITIVE) + (ALPHA_POSITIVE * pNegative) :
                    pNegative * (1 - ALPHA_NEGATIVE) + (ALPHA_NEGATIVE * pPositive);

                ptFrequency *= typicalFrequency;

                if (reactionFrequency < 0.25) {
                    incompatibilities.push({
                        test,
                        expected,
                        actual: percentPositive
                    });
                }
            }

            return {
                taxon: taxon.Taxon,
                poFrequency,
                ptFrequency,
                modalFrequency: poFrequency / ptFrequency,
                incompatibilites: incompatibilities,
                bacterium: taxon
            };
        });

        const validTaxa = taxaResults.filter(t => t.poFrequency > 0.000001);
        const totalFrequency = validTaxa.reduce((sum, t) => sum + t.poFrequency, 0) || 1;

        validTaxa.forEach(taxon => {
            taxon.percentId = (taxon.poFrequency / totalFrequency) * 100;
            taxon.tIndex = Math.max(0,
                (Math.log10(Math.max(taxon.modalFrequency, 0.000001)) - Math.log10(S)) / -Math.log10(S)
            );
        });

        validTaxa.sort((a, b) => b.percentId - a.percentId);

        for (let i = 0; i < Math.min(validTaxa.length - 1, 4); i++) {
            validTaxa[i].ratio = validTaxa[i].percentId / (validTaxa[i + 1].percentId || 0.01);
        }

        let maxRatio = 0;
        let maxRatioIndex = 0;
        for (let i = 0; i < Math.min(validTaxa.length - 1, 4); i++) {
            if (validTaxa[i].ratio > maxRatio) {
                maxRatio = validTaxa[i].ratio;
                maxRatioIndex = i;
            }
        }

        const selectedTaxa = validTaxa.slice(0, maxRatioIndex + 1);

        selectedTaxa.forEach(taxon => {
            if (taxon.percentId >= 99.9 && taxon.tIndex >= 0.75) {
                taxon.quality = 'EXCELLENTE';
            } else if (taxon.percentId >= 99.0 && taxon.tIndex >= 0.50) {
                taxon.quality = 'TRÈS BONNE';
            } else if (taxon.percentId >= 90.0 && taxon.tIndex >= 0.25) {
                taxon.quality = 'BONNE';
            } else if (taxon.percentId >= 80.0 && taxon.tIndex >= 0) {
                taxon.quality = 'ACCEPTABLE';
            } else {
                taxon.quality = 'NON FIABLE';
            }
        });

        const sumPercentId = selectedTaxa.reduce((sum, t) => sum + t.percentId, 0);

        if (selectedTaxa.length === 0) {
            selectedTaxa.push({
                taxon: "PROFIL NON IDENTIFIABLE",
                percentId: 0,
                tIndex: 0,
                quality: "INACCEPTABLE",
                incompatibilites: []
            });
        } else if (sumPercentId < 80.0) {
            selectedTaxa.forEach(taxon => {
                taxon.quality = 'NON FIABLE';
            });
        }

        this.results = selectedTaxa.slice(0, 5);
        this.renderResults();
        
        // Log analytics
        if (window.logApiCalculation) {
            window.logApiCalculation({
                db_type: this.selectedDb,
                profile: Object.fromEntries(
                    Object.entries(this.profile).filter(([_, v]) => v !== null)
                ),
                results: this.results.map(r => ({
                    taxon: r.taxon,
                    percentId: r.percentId,
                    tIndex: r.tIndex
                }))
            });
        }
    }
    
    renderResults() {
        this.elements.resultsTbody.innerHTML = this.results.map(res => `
            <tr>
                <td>${this.escapeHtml(res.taxon)}</td>
                <td><b>${res.percentId.toFixed(1)}%</b></td>
                <td>
                    ${res.incompatibilites.length > 0 ? `
                        <div class="incompatibilities">
                            ${res.incompatibilites.map(inc => `
                                <div class="incompat-item">
                                    <span>${this.escapeHtml(inc.test)}</span>
                                    <span>${inc.expected} (${inc.actual}%)</span>
                                </div>
                            `).join('')}
                        </div>
                    ` : '—'}
                </td>
                <td>${res.tIndex.toFixed(2)}</td>
                <td>${this.escapeHtml(res.quality)}</td>
            </tr>
        `).join('');
        
        this.elements.resultsSection.style.display = 'block';
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
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
    document.addEventListener('DOMContentLoaded', () => new APIcalculApp());
} else {
    new APIcalculApp();
}
