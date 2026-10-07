/** fetch() a text file with errors that say what failed and why. */
export async function fetchText(url, what = 'file') {
	if (typeof fetch !== 'function') {
		throw new Error(`Prism.js: fetch() is not available, cannot load ${what} "${url}".`);
	}
	let response;
	try {
		response = await fetch(url);
	} catch (cause) {
		throw new Error(`Prism.js: Failed to load ${what} "${url}": ${cause.message}`, { cause });
	}
	if (!response.ok) {
		throw new Error(
			`Prism.js: Failed to load ${what} "${url}" (HTTP ${response.status}${response.statusText ? ' ' + response.statusText : ''}).`
		);
	}
	return response.text();
}
