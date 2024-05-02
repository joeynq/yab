import type { BunFile } from "bun";

export async function isCached(
	headers: Request["headers"],
	etag: string,
	file: BunFile,
) {
	if (
		headers.get("cache-control") &&
		headers.get("cache-control")?.indexOf("no-cache") !== -1
	)
		return false;

	// if-none-match
	if ("if-none-match" in headers) {
		const ifNoneMatch = headers["if-none-match"];

		if (ifNoneMatch === "*") return true;

		if (ifNoneMatch === null) return false;

		if (typeof etag !== "string") return false;

		const isMatching = ifNoneMatch === etag;

		if (isMatching) return true;

		return false;
	}

	// if-modified-since
	if (headers.get("if-modified-since")) {
		const ifModifiedSince = headers.get("if-modified-since");
		let lastModified: Date | undefined;
		try {
			lastModified = new Date(file.lastModified);
		} catch {
			/* empty */
		}

		if (
			ifModifiedSince === null ||
			(lastModified !== undefined &&
				lastModified.getTime() <= Date.parse(ifModifiedSince))
		)
			return true;
	}

	return false;
}

export async function generateETag(file: BunFile) {
	const hash = new Bun.CryptoHasher("md5");
	hash.update(await file.arrayBuffer());

	return hash.digest("base64");
}