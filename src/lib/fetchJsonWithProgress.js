/**
 * Fetches a large JSON file with progress tracking.
 *
 * @param {string} url - The URL of the JSON file to fetch.
 * @param {(received: number, total: number) => void} [onProgress] - Optional callback to track progress.
 * @returns {Promise<Object>} - A promise that resolves to the parsed JSON object.
 * @throws {Error} If the fetch fails, the response body is null, or headers are missing.
 */
async function fetchJsonWithProgress(url, onProgress) {
	const response = await fetch(url);

	if (!response.ok) {
		throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
	}

	const contentLength = response.headers?.get('Content-Length');
	const totalBytes = contentLength ? +contentLength : 0;

	if (!response.body) {
		throw new Error(`Response body is null for ${url}`);
	}

	const reader = response.body.getReader();

	let receivedLength = 0; // received bytes so far
	let chunks = []; // array of received binary chunks (comprises the body)

	while (true) {
		const { done, value } = await reader.read();

		if (done) {
			break;
		}

		chunks.push(value);
		receivedLength += value.length;

		if (onProgress) {
			onProgress(receivedLength, totalBytes);
		}
	}

	const chunksAll = new Uint8Array(receivedLength);
	let position = 0;
	for (let chunk of chunks) {
		chunksAll.set(chunk, position);
		position += chunk.length;
	}

	const result = new TextDecoder('utf-8').decode(chunksAll);

	return JSON.parse(result);
}

export default fetchJsonWithProgress;
