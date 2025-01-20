<script>
	// @ts-nocheck
	import Mark from 'mark.js';
	import { onMount, onDestroy } from 'svelte';
	export let title;
	export let pageNumber;
	export let query = '';

	let highlightInterval;

	// onMount(() => {
	// 	window.markInstance = new Mark('span');

	// 	function initializeHighlighting() {
	// 		var pdfViewer = document.getElementById('pdf-viewer');
	// 		if (pdfViewer.contentDocument.readyState === 'complete') {
	// 			var iframeDocument = pdfViewer.contentDocument || pdfViewer.contentWindow.document;
	// 			var style = iframeDocument.createElement('style');
	// 			style.textContent = 'mark { background: red; color:red; opacity:20% }';
	// 			iframeDocument.head.appendChild(style);
	// 			window.markInstance = new Mark(iframeDocument);
	// 		}
	// 	}

	// 	document.getElementById('pdf-viewer').addEventListener('load', initializeHighlighting);

	// 	highlightInterval = setInterval(function () {
	// 		if (window.markInstance) {
	// 			window.markInstance.mark(query, {
	// 				separateWordSearch: true,
	// 				accuracy: 'partially',
	// 				diacritics: true,
	// 				iframes: true,
	// 				ignorePunctuation: ':;.,-–—‒_(){}[]!\'"+='.split(''),
	// 				ignoreJoiners: true,
	// 				exclude: ['.marked']
	// 			});
	// 		}
	// 	}, 2000);
	// });

	onDestroy(() => {
		if (highlightInterval) {
			clearInterval(highlightInterval);
		}
	});
	const viewerUrl = `/polysearchfmt_static/pdfjs/web/viewer.html?file=/ecn_pdfs/${encodeURIComponent(title)}.pdf&q=${encodeURIComponent(query)}#page=${pageNumber}`;
</script>

<iframe
	id="pdf-viewer"
	title="PDF Viewer"
	src={viewerUrl}
	class="pdf-viewer border-none w-full h-full"
></iframe>
