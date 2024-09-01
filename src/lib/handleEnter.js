/**
 * runs function only if the event keypress is enter
 * @param {any} event - takes an event
 * @param {function} runSearch - function to run
 * @returns {any}
 */
function handleEnter(event, runSearch) {
	if (event.key === 'Enter') {
		runSearch();
	}
}

export default handleEnter;
