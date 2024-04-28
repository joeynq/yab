import type { Context } from "@yab/core";

export abstract class Strategy<S> {
	protected token: string | undefined;

	constructor(
		protected config: {
			tokenType?: "basic" | "bearer";
			tokenFrom?: "header" | "query";
			tokenName?: string;
			options: S;
		},
	) {}

	useContext(ctx: Context) {
		ctx.token = this.extractToken(ctx.request);
		ctx.verifyToken = this.verify.bind(this);
	}

	protected extractToken(request: Request) {
		const { tokenFrom = "header", tokenName = "authorization" } = this.config;
		if (tokenFrom === "header") {
			const header = request.headers.get(tokenName);
			if (header) {
				const [, token] = header.split(" ");
				return token;
			}
		}
		if (tokenFrom === "query") {
			const url = new URL(request.url);
			const token = url.searchParams.get(tokenName);
			return token || undefined;
		}
		return undefined;
	}
	abstract verify(): Promise<any>;
}
