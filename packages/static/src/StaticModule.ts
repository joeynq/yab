import { Cache, type CacheAdapter } from "@vermi/cache";
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
import type { BunFile } from "bun";
import { generateETag, isCached } from "./utils";

export type SlashedPath = `/${string}`;

export type StaticModuleOptions = {
	patterns?: (string | RegExp)[];
	cache?: string;
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

interface StaticCache {
	path: string;
	config: StaticModuleOptions;
}

@Module()
export class StaticModule
	implements VermiModule<Record<SlashedPath, StaticModuleOptions>>
{
	@Logger() private logger!: LoggerAdapter;
	@Config() public config!: Record<SlashedPath, StaticModuleOptions>;
	@Cache() cache!: CacheAdapter<StaticCache>;

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
		for (const [assetsDir] of Object.entries(this.config)) {
			this.logger.info(`StaticModule initialized. ${assetsDir}`);
		}
	}

	async lookup(
		requestUrl: string,
	): Promise<[BunFile, StaticModuleOptions] | undefined> {
		const cached = await this.cache?.get(requestUrl);

		if (cached) {
			const file = Bun.file(cached.path);
			if (await file.exists()) {
				return [file, cached.config];
			}
			await this.cache.delete(requestUrl);
		}

		let relPath = pathname(requestUrl);
		let ext = relPath.split(".").pop();

		const isAbsolute = (assetsDir: string) => assetsDir.startsWith("/");

		const findFile = async (assetsDir: string) => {
			const conf = this.config[assetsDir as keyof typeof this.config];
			const indexFile = conf.index ?? "index.html";
			const allowedExtensions = conf.extensions ?? defaultStaticExtensions;
			if (!ext) {
				relPath += `/${indexFile}`;
				ext = relPath.split(".").pop();
			}
			if (!ext || !allowedExtensions.includes(`.${ext}`)) {
				return;
			}

			const filePath = isAbsolute(assetsDir)
				? `${assetsDir}${relPath}`
				: `${process.cwd()}${assetsDir}${relPath}`;
			const file = Bun.file(filePath);
			if (await file.exists()) {
				await this.cache?.set(requestUrl, { path: filePath, config: conf });
				return file;
			}
		};

		for (const [assetsDir, { patterns, ...rest }] of Object.entries(
			this.config,
		)) {
			if (!patterns?.length) {
				const file = await findFile(assetsDir);
				if (file) {
					return [file, rest];
				}
				continue;
			}

			const isMatch = patterns.some((pattern) =>
				new RegExp(pattern).test(relPath),
			);
			if (!isMatch) {
				continue;
			}
			const file = await findFile(assetsDir);
			if (file) {
				return [file, rest];
			}
		}
	}

	@AppHook("app:request")
	public async onRequest(context: RequestContext) {
		try {
			const { request } = context.store;

			const found = await this.lookup(request.url);

			if (!found) {
				return;
			}
			const [file, config] = found;
			const mtime = file.lastModified;

			const etag = config.eTag ? await generateETag(mtime) : undefined;

			if (etag && (await isCached(request.headers, etag, mtime))) {
				return new Response(null, { status: 304 });
			}

			return new Response(file, { headers: this.#getHeaders(config, etag) });
		} catch (err) {
			const error = err as Error;
			this.logger.error(error.message, error);
			return new HttpException(500, error.message, error).toResponse();
		}
	}
}
