<script>
	// @ts-nocheck
	import Mark from 'mark.js';
	import { onMount } from 'svelte';
	export let title;
	export let pageNumber;
	export let query = '';

	onMount(() => {
		window.markInstance = new Mark('span');

		//initialize highlighting
		function initializeHighlighting() {
			var pdfViewer = document.getElementById('pdf-viewer');
			if (pdfViewer.contentDocument.readyState === 'complete') {
				var iframeDocument = pdfViewer.contentDocument || pdfViewer.contentWindow.document;
				var style = iframeDocument.createElement('style');
				style.textContent = 'mark { background: red; color:red; opacity:20% }';
				iframeDocument.head.appendChild(style);
				window.markInstance = new Mark(iframeDocument);
			}
		}

		document.getElementById('pdf-viewer').addEventListener('load', initializeHighlighting);

		setInterval(function () {
			if (window.markInstance) {
				// Perform the highlighting
				window.markInstance.mark(query, {
					separateWordSearch: true,
					accuracy: 'partially',
					diacritics: true,
					iframes: true,
					ignorePunctuation: ':;.,-–—‒_(){}[]!\'"+='.split(''),
					ignoreJoiners: true
				});
			}
		}, 2000	);
	});

	const viewerUrl = `/pdfjs/web/viewer.html?file=/ecn_pdfs/${encodeURIComponent(title)}.pdf#page=${pageNumber}`;
</script>

<iframe
	id="pdf-viewer"
	title="PDF Viewer"
	src={viewerUrl}
	class="pdf-viewer border-none w-full h-full"
></iframe>
