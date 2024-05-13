import {
	AppHook,
	type Configuration,
	type LoggerAdapter,
	Module,
	type RequestContext,
	VermiModule,
} from "@vermi/core";
import { generateETag, isCached } from "./utils";

export type SlashedPath = `/${string}`;

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

@Module()
export class StaticModule extends VermiModule<StaticModuleOptions> {
	constructor(
		protected configuration: Configuration,
		private logger: LoggerAdapter,
	) {
		super();
	}

	#getFile(request: Request) {
		const { prefix, assetsDir } = this.getConfig();
		const isAbsolute = assetsDir.startsWith("/");

		const filePath = isAbsolute
			? `${assetsDir}${request.url.slice(prefix.length)}`
			: Bun.resolveSync(
					`${assetsDir}${request.url.slice(prefix.length)}`,
					process.cwd(),
				);

		return Bun.file(filePath);
	}

	#getHeaders(etag?: string) {
		const { immutable, maxAge } = this.getConfig();
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

		return headers;
	}

	@AppHook("app:init")
	public async onInit() {
		this.logger.info(
			"StaticModule initialized. Public path: {prefix}",
			this.getConfig(),
		);
	}

	@AppHook("app:request")
	public async onRequest(context: RequestContext) {
		const { request, serverUrl } = context.store;

		// remove slash from serverUrl
		const prefix = `${serverUrl.slice(0, -1)}${this.getConfig().prefix}`;

		if (!request.url.startsWith(prefix)) {
			return;
		}

		const url = new URL(request.url);

		const {
			extensions = defaultStaticExtensions,
			ignorePatterns,
			eTag,
			index,
		} = this.getConfig();

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
				if (RegExp(pattern).exec(url.pathname)) {
					return;
				}
			}
		}

		const file = this.#getFile(request);

		const etag = eTag ? await generateETag(file) : undefined;

		if (etag && (await isCached(request.headers, etag, file))) {
			return new Response(null, { status: 304 });
		}

		return new Response(file, { headers: this.#getHeaders(etag) });
	}
}
