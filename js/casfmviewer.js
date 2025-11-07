// CA-SFM PDF Viewer using PDF.js viewer
class CASFMViewer {
    constructor() {
        // Parse URL parameters
        const searchParams = new URLSearchParams(window.location.hash.replace('#', ''));
        this.searchTerm = searchParams.get('q') || '';
        this.initialPage = parseInt(searchParams.get('p')) || 1;
        
        // PDF.js viewer path - update this to your actual path
        this.pdfViewerPath = '/js/pdfjs/web/viewer.html?v=1';
        this.pdfPath = '/db/casfm.pdf'; // Update this path
        
        // DOM elements
        this.elements = {
            searchTermHeader: document.getElementById('search-term-header'),
            backButton: document.getElementById('back-button'),
            pdfViewer: document.getElementById('pdf-viewer')
        };
        
        this.init();
    }
    
    init() {
        // Show search term if coming from search
        if (this.searchTerm) {
            this.elements.searchTermHeader.textContent = this.searchTerm;
            this.elements.searchTermHeader.style.display = 'inline';
        }
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Load PDF in viewer
        this.loadPDF();
    }
    
    setupEventListeners() {
        // Back button
        this.elements.backButton.addEventListener('click', () => {
            if (this.searchTerm) {
                // Return to search with the search term
                window.location.href = '/casfm-search.html#q=' + encodeURIComponent(this.searchTerm);
            } else {
                // Return to search homepage
                window.location.href = '/casfm-search.html';
            }
        });
    }
    
    loadPDF() {
        // Build the PDF.js viewer URL with parameters
        // let viewerUrl = `${this.pdfViewerPath}?file=${encodeURIComponent(this.pdfPath)}`;
        let viewerUrl = `${this.pdfViewerPath}`;

        // Add page parameter if specified
        if (this.initialPage > 1) {
            viewerUrl += `#page=${this.initialPage}`;
        }

        
        // // Add search parameter if specified
        // if (this.searchTerm) {
        //     viewerUrl += `&search=${encodeURIComponent(this.searchTerm)}`;
        // }
        
        // Load the viewer in iframe
        this.elements.pdfViewer.src = viewerUrl;
    }
}

// Initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new CASFMViewer());
} else {
    new CASFMViewer();
}
