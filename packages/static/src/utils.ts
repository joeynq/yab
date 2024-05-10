import type { BunFile } from "bun";

export async function isCached(
	headers: Request["headers"],
	etag: string,
	file: BunFile,
) {
	if (
		headers.get("cache-control") &&
		headers.get("cache-control")?.indexOf("no-cache") !== -1
	) {
		return false;
	}

	const ifNoneMatch = headers.get("if-none-match");

	if (!ifNoneMatch) return false;

	if (ifNoneMatch === "*") return true;

	if (typeof etag !== "string") return false;

	if (ifNoneMatch === etag) return true;

	const ifModifiedSince = headers.get("if-modified-since");
	let lastModified: Date | undefined;
	try {
		lastModified = new Date(file.lastModified);
	} catch {
		/* empty */
	}

	return (
		!ifModifiedSince ||
		(lastModified && lastModified.getTime() <= Date.parse(ifModifiedSince))
	);
}

export async function generateETag(file: BunFile) {
	const hash = new Bun.CryptoHasher("md5");
	hash.update(await file.arrayBuffer());

	return hash.digest("base64");
}
