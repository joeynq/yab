import type { Context } from "@yab/core";

export abstract class Strategy<S> {
	protected token: string | undefined;
	abstract readonly tokenType: string;

	init?: () => Promise<void>;

	constructor(
		public config: {
			tokenFrom?: "header" | "query" | "body";
			tokenName?: string;
			options: S;
		},
	) {}

	async useContext(ctx: Context) {
		ctx.token = await this.extractToken(ctx.request);
		ctx.verifyToken = this.verify.bind(this);
	}

	protected async extractToken(request: Request) {
		const { tokenFrom = "header", tokenName = "authorization" } = this.config;
		if (tokenFrom === "header") {
			const header = request.headers.get(tokenName);
			if (header) {
				const [type, token] = header.split(" ");
				if (type === this.tokenType) {
					return token;
				}
			}
		}
		if (tokenFrom === "query") {
			const url = new URL(request.url);
			const token = url.searchParams.get(tokenName);
			return token || undefined;
		}
		if (tokenFrom === "body") {
			if (request.headers.get("content-type")?.includes("application/json")) {
				const body = await request.json();
				const token = (body as any)[tokenName];
				return token || undefined;
			}
			const body = await request.formData();
			const token = body.get(tokenName);
			return token?.toString() || undefined;
		}
		return undefined;
	}
	abstract verify(): Promise<any>;
}
