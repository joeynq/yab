import { type Context, Module, YabHook } from "@yab/core";
import { generateETag, isCached } from "./utils";

type SlashedPath = `/${string}`;

export type StaticModuleOptions = {
	prefix: SlashedPath;
	assetsDir: string;
	ignorePatterns?: string[];
	extensions?: string[];
	immutable?: boolean;
	maxAge?: number;
	eTag?: boolean;
	index?: string;
};

const defaultStaticExtensions = [
	".html",
	".js",
	".css",
	".json",
	".png",
	".jpg",
	".jpeg",
	".gif",
	".svg",
	".ico",
	".webp",
	".woff",
	".woff2",
	".ttf",
	".eot",
	".otf",
];

export class StaticModule extends Module<StaticModuleOptions> {
	constructor(public config: StaticModuleOptions) {
		super();
	}

	@YabHook("app:request")
	public async onRequest(context: Context) {
		const { request, serverUrl } = context;

		// remove slash from serverUrl
		const prefix = `${serverUrl.slice(0, -1)}${this.config.prefix}`;

		if (!request.url.startsWith(prefix)) {
			return;
		}

		const url = new URL(request.url);

		const {
			extensions = defaultStaticExtensions,
			assetsDir,
			ignorePatterns,
			immutable,
			maxAge,
			eTag,
			index,
		} = this.config;

		// file is directory
		if (index && url.pathname.endsWith("/")) {
			url.pathname += index;
		}

		// file extension is not static
		const ext = url.pathname.split(".").pop();
		if (!ext || !extensions.includes(`.${ext}`)) {
			return;
		}

		// file is ignored
		if (ignorePatterns) {
			for (const pattern of ignorePatterns) {
				if (url.pathname.match(pattern)) {
					return;
				}
			}
		}

		const isAbsolute = assetsDir.startsWith("/");

		const filePath = isAbsolute
			? `${assetsDir}${request.url.slice(prefix.length)}`
			: Bun.resolveSync(
					`${assetsDir}${request.url.slice(prefix.length)}`,
					process.cwd(),
				);

		const file = Bun.file(filePath);

		const etag = eTag ? await generateETag(file) : undefined;

		if (etag && (await isCached(request.headers, etag, file))) {
			return new Response(null, { status: 304 });
		}

		const headers = new Headers();

		let cacheControl = "no-cache";
		if (maxAge) {
			cacheControl = `public, max-age=${maxAge}`;
		}
		if (immutable) {
			cacheControl += ", immutable";
		}
		headers.set("Cache-Control", cacheControl);

		if (etag) {
			headers.set("ETag", etag);
		}

		return new Response(file, { headers });
	}
}