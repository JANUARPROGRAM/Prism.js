/**
 * Resolves `ref` (a file name found inside a model file) against the URL of the
 * file that mentioned it. Absolute URLs (http:, data:, blob:, //host, /root) are kept.
 * Plain string joining on purpose: it works for relative and absolute bases, and
 * the browser normalises "../" itself.
 */
export function resolveURL(base, ref) {
	ref = ref.trim().replace(/\\/g, '/');
	if (/^(?:[a-z][a-z0-9+.-]*:|\/)/i.test(ref)) return ref;
	const clean = String(base).split(/[?#]/)[0];
	const slash = clean.lastIndexOf('/');
	return (slash === -1 ? '' : clean.slice(0, slash + 1)) + ref;
}
