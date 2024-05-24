import {
	AppHook,
	Config,
	HttpException,
	Logger,
	type LoggerAdapter,
	Module,
	type RequestContext,
	type VermiModule,
} from "@vermi/core";
import { pathname } from "@vermi/utils";
import { generateETag, isCached } from "./utils";

export type SlashedPath = `/${string}`;

export type StaticModuleOptions = {
	assetsDir: string;
	ignorePatterns?: string[];
	extensions?: string[];
	immutable?: boolean;
	maxAge?: number;
	eTag?: boolean;
	index?: string;
	direct?: boolean;
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
export class StaticModule
	implements VermiModule<Record<SlashedPath, StaticModuleOptions>>
{
	@Logger() private logger!: LoggerAdapter;
	@Config() public config!: Record<SlashedPath, StaticModuleOptions>;

	#getPrefix(request: Request) {
		const path = pathname(request.url).split("/")[1];
		const mount = `/${path}` as SlashedPath;

		return Object.hasOwn(this.config, mount) ? mount : undefined;
	}

	#getFile(config: StaticModuleOptions, request: Request, prefix: SlashedPath) {
		const { assetsDir, direct } = config;
		const isAbsolute = assetsDir.startsWith("/");

		const url = pathname(request.url);

		try {
			if (!direct) {
				const filePath = isAbsolute
					? `${assetsDir}${url.slice(prefix.length)}`
					: Bun.resolveSync(
							`${assetsDir}${url.slice(prefix.length)}`,
							process.cwd(),
						);

				return Bun.file(filePath);
			}

			const filePath = isAbsolute
				? `${assetsDir}${prefix}`
				: Bun.resolveSync(`${assetsDir}${prefix}`, process.cwd());
			return Bun.file(filePath);
		} catch (error) {
			this.logger.error(error as Error, "File not found: {path}", url);
			throw new HttpException(404, "Not Found", error as Error);
		}
	}

	#getHeaders(config: StaticModuleOptions, etag?: string) {
		const { immutable, maxAge } = config;
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
			this.config,
		);
	}

	@AppHook("app:request")
	public async onRequest(context: RequestContext) {
		const { request, serverUrl } = context.store;

		const prefix = this.#getPrefix(request);
		if (!prefix) {
			return;
		}

		const test = `${serverUrl.slice(0, -1)}${prefix}`;

		if (!request.url.startsWith(test)) {
			return;
		}

		let path = pathname(request.url);

		const config = this.config[prefix];

		const {
			extensions = defaultStaticExtensions,
			ignorePatterns,
			eTag,
			index,
		} = config;

		if (index && path.endsWith("/")) {
			path += index;
		}

		const ext = path.split(".").pop();
		if (!ext || !extensions.includes(`.${ext}`)) {
			return;
		}

		if (ignorePatterns) {
			for (const pattern of ignorePatterns) {
				if (RegExp(pattern).exec(path)) {
					return;
				}
			}
		}

		const file = this.#getFile(config, request, prefix);

		const etag = eTag ? await generateETag(file) : undefined;

		if (etag && (await isCached(request.headers, etag, file))) {
			return new Response(null, { status: 304 });
		}

		return new Response(file, { headers: this.#getHeaders(config, etag) });
	}
}
