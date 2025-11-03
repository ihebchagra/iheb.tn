// Autocomplete Component - Reusable autocomplete functionality
class AutocompleteComponent {
    constructor(config) {
        this.input = config.input;
        this.dropdown = config.dropdown;
        this.list = config.list;
        this.loadingElement = config.loadingElement;
        this.onSearch = config.onSearch; // Function to fetch results
        this.onSelect = config.onSelect; // Function when item selected
        this.debounceDelay = config.debounceDelay || 200;
        
        this.results = [];
        this.selectedIndex = -1;
        this.isOpen = false;
        
        this.init();
    }

    init() {
        // Input events
        this.input.addEventListener('input', SearchUtils.debounce(() => {
            this.fetchResults();
        }, this.debounceDelay));
        
        this.input.addEventListener('focus', () => this.fetchResults());
        
        this.input.addEventListener('keydown', (e) => this.handleKeydown(e));
        
        // Close on click outside
        document.addEventListener('click', (e) => {
            if (!this.input.contains(e.target) && !this.dropdown.contains(e.target)) {
                this.close();
            }
        });
    }

    async fetchResults() {
        const term = this.input.value.trim();
        if (!term) {
            this.close();
            return;
        }

        this.showLoading();
        
        try {
            this.results = await this.onSearch(term);
            this.render();
        } catch (err) {
            console.error('Autocomplete error:', err);
            this.close();
        }
        
        this.hideLoading();
    }

    render() {
        if (this.results.length === 0) {
            this.close();
            return;
        }

        this.list.innerHTML = this.results.map((item, index) => 
            `<li data-index="${index}">${item.html}</li>`
        ).join('');

        // Add event listeners to items
        this.list.querySelectorAll('li').forEach(li => {
            li.addEventListener('click', () => {
                const index = parseInt(li.dataset.index);
                this.select(index);
            });
            
            li.addEventListener('mouseenter', () => {
                this.selectedIndex = parseInt(li.dataset.index);
                this.updateSelection();
            });
        });

        this.open();
    }

    handleKeydown(e) {
        if (!this.isOpen || this.results.length === 0) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                this.selectedIndex = Math.min(this.selectedIndex + 1, this.results.length - 1);
                this.updateSelection();
                break;
            case 'ArrowUp':
                e.preventDefault();
                this.selectedIndex = Math.max(this.selectedIndex - 1, -1);
                this.updateSelection();
                break;
            case 'Enter':
                if (this.selectedIndex >= 0) {
                    e.preventDefault();
                    this.select(this.selectedIndex);
                }
                break;
            case 'Escape':
                e.preventDefault();
                this.close();
                break;
        }
    }

    updateSelection() {
        this.list.querySelectorAll('li').forEach((li, index) => {
            li.classList.toggle('selected', index === this.selectedIndex);
        });
    }

    select(index) {
        if (index >= 0 && index < this.results.length) {
            this.onSelect(this.results[index]);
            this.close();
        }
    }

    open() {
        this.dropdown.style.display = 'block';
        this.isOpen = true;
    }

    close() {
        this.dropdown.style.display = 'none';
        this.isOpen = false;
        this.selectedIndex = -1;
        this.results = [];
    }

    showLoading() {
        if (this.loadingElement) {
            this.loadingElement.style.display = 'block';
        }
        this.list.innerHTML = '';
        this.dropdown.style.display = 'block';
    }

    hideLoading() {
        if (this.loadingElement) {
            this.loadingElement.style.display = 'none';
        }
    }
}
