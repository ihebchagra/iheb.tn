/**
 * makes a google like snippet.
 *
 * @param {string[]} keywords - the keywords tòmatch
 * @param {string} text - the long paragraph to match in.
 * @param {number} snippetLength - the snippet length
 * @returns {string} - returns the snippet.
 * @throws {Error} If the fetch fails, the response body is null, or headers are missing.
 */
function highlightKeywords(keywords, text, snippetLength = 300) {
	let lowerText = text.toLowerCase();
	let startIndex = 0;
	let endIndex = text.length;
	let matchFound = false;

	// Find the first and last matching keywords
	for (let i = 0; i < keywords.length; i++) {
		const keyword = keywords[i].toLowerCase();
		if (keyword.length <= 2) {
			continue;
		}
		const index = lowerText.indexOf(keyword, startIndex);
		if (index !== -1) {
			if (!matchFound) {
				startIndex = Math.max(0, index - 20); // Start a bit before the first match
				matchFound = true;
			}
			endIndex = Math.min(text.length, index + keyword.length + 20); // End a bit after the last match
			startIndex = Math.max(0, endIndex - snippetLength); // Ensure we don't exceed snippetLength
		}
	}

	// If no match found, return the start of the text
	if (!matchFound) {
		return text.slice(0, snippetLength) + (text.length > snippetLength ? '...' : '');
	}

	// Extract the snippet
	let snippet = text.slice(startIndex, endIndex);

	// Add ellipsis if necessary
	if (startIndex > 0) snippet = '...' + snippet;
	if (endIndex < text.length) snippet += '...';

	// Highlight keywords in the snippet
	keywords.forEach((keyword) => {
		if (keyword.length <= 2) {
			return;
		}
		const regex = new RegExp(keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
		snippet = snippet.replace(regex, '<strong>$&</strong>');
	});

	return snippet;
}

export default highlightKeywords;
