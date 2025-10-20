class HttpError {
	/**
	 * @param {number} status
	 * @param {{message: string} extends App.Error ? (App.Error | string | undefined) : App.Error} body
	 */
	constructor(status, body) {
		this.status = status;
		if (typeof body === 'string') {
			this.body = { message: body };
		} else if (body) {
			this.body = body;
		} else {
			this.body = { message: `Error: ${status}` };
		}
	}

	toString() {
		return JSON.stringify(this.body);
	}
}

class Redirect {
	/**
	 * @param {300 | 301 | 302 | 303 | 304 | 305 | 306 | 307 | 308} status
	 * @param {string} location
	 */
	constructor(status, location) {
		this.status = status;
		this.location = location;
	}
}

/**
 * An error that was thrown from within the SvelteKit runtime that is not fatal and doesn't result in a 500, such as a 404.
 * `SvelteKitError` goes through `handleError`.
 * @extends Error
 */
class SvelteKitError extends Error {
	/**
	 * @param {number} status
	 * @param {string} text
	 * @param {string} message
	 */
	constructor(status, text, message) {
		super(message);
		this.status = status;
		this.text = text;
	}
}

/**
 * @template {Record<string, unknown> | undefined} [T=undefined]
 */
class ActionFailure {
	/**
	 * @param {number} status
	 * @param {T} data
	 */
	constructor(status, data) {
		this.status = status;
		this.data = data;
	}
}

var BROWSER = typeof window !== 'undefined';

const node_env = globalThis.process?.env?.NODE_ENV;
var DEV = node_env && !node_env.toLowerCase().startsWith('prod');

/**
 * Redirect a request. When called during request handling, SvelteKit will return a redirect response.
 * Make sure you're not catching the thrown redirect, which would prevent SvelteKit from handling it.
 *
 * Most common status codes:
 *  * `303 See Other`: redirect as a GET request (often used after a form POST request)
 *  * `307 Temporary Redirect`: redirect will keep the request method
 *  * `308 Permanent Redirect`: redirect will keep the request method, SEO will be transferred to the new page
 *
 * [See all redirect status codes](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status#redirection_messages)
 *
 * @param {300 | 301 | 302 | 303 | 304 | 305 | 306 | 307 | 308 | ({} & number)} status The [HTTP status code](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status#redirection_messages). Must be in the range 300-308.
 * @param {string | URL} location The location to redirect to.
 * @throws {Redirect} This error instructs SvelteKit to redirect to the specified location.
 * @throws {Error} If the provided status is invalid.
 * @return {never}
 */
function redirect(status, location) {
	if ((!BROWSER || DEV) && (isNaN(status) || status < 300 || status > 308)) {
		throw new Error('Invalid status code');
	}

	throw new Redirect(
		// @ts-ignore
		status,
		location.toString()
	);
}

/**
 * Create a JSON `Response` object from the supplied data.
 * @param {any} data The value that will be serialized as JSON.
 * @param {ResponseInit} [init] Options such as `status` and `headers` that will be added to the response. `Content-Type: application/json` and `Content-Length` headers will be added automatically.
 */
function json(data, init) {
	// TODO deprecate this in favour of `Response.json` when it's
	// more widely supported
	const body = JSON.stringify(data);

	// we can't just do `text(JSON.stringify(data), init)` because
	// it will set a default `content-type` header. duplicated code
	// means less duplicated work
	const headers = new Headers(init?.headers);
	if (!headers.has('content-length')) {
		headers.set('content-length', encoder.encode(body).byteLength.toString());
	}

	if (!headers.has('content-type')) {
		headers.set('content-type', 'application/json');
	}

	return new Response(body, {
		...init,
		headers
	});
}

const encoder = new TextEncoder();

/**
 * Create a `Response` object from the supplied body.
 * @param {string} body The value that will be used as-is.
 * @param {ResponseInit} [init] Options such as `status` and `headers` that will be added to the response. A `Content-Length` header will be added automatically.
 */
function text(body, init) {
	const headers = new Headers(init?.headers);
	if (!headers.has('content-length')) {
		const encoded = encoder.encode(body);
		headers.set('content-length', encoded.byteLength.toString());
		return new Response(encoded, {
			...init,
			headers
		});
	}

	return new Response(body, {
		...init,
		headers
	});
}

/**
 * Create an `ActionFailure` object. Call when form submission fails.
 * @param {number} status The [HTTP status code](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status#client_error_responses). Must be in the range 400-599.
 * @overload
 * @param {number} status
 * @returns {import('./public.js').ActionFailure<undefined>}
 */
/**
 * Create an `ActionFailure` object. Call when form submission fails.
 * @template {Record<string, unknown> | undefined} [T=undefined]
 * @param {number} status The [HTTP status code](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status#client_error_responses). Must be in the range 400-599.
 * @param {T} data Data associated with the failure (e.g. validation errors)
 * @overload
 * @param {number} status
 * @param {T} data
 * @returns {import('./public.js').ActionFailure<T>}
 */
/**
 * Create an `ActionFailure` object. Call when form submission fails.
 * @param {number} status
 * @param {any} [data]
 * @returns {import('./public.js').ActionFailure<any>}
 */
function fail(status, data) {
	// @ts-expect-error unique symbol missing
	return new ActionFailure(status, data);
}

export { ActionFailure as A, HttpError as H, Redirect as R, SvelteKitError as S, fail as f, json as j, redirect as r, text as t };
//# sourceMappingURL=index-BL3bFNcc.js.map
