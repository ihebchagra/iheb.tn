// Search Utilities - Reusable search helpers
class SearchUtils {
    // Format search term for FTS5
    static formatFTSTerm(term) {
        return term.trim()
            .split(/\s+/)
            .filter(part => part.length > 0)
            .map(part => part.replace(/[^a-zA-Z0-9\u00C0-\u017F]/g, ' ').trim())
            .filter(part => part.length > 0)
            .map(part => part + '*')
            .join(' ');
    }

    // Escape HTML
    static escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Highlight matching text
    static highlightMatch(text, term) {
        if (!text) return '';
        const escapedText = this.escapeHtml(text);
        const regex = new RegExp('(' + term.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + ')', 'gi');
        return escapedText.replace(regex, '<span class="highlight">$1</span>');
    }

    // Debounce function
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
}
