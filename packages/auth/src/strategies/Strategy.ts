import { type RequestContext, asValue } from "@yab/core";

export abstract class Strategy<S> {
	abstract readonly tokenType: string;

	init?: () => Promise<void>;

	constructor(
		public config: {
			tokenFrom?: "header" | "query" | "body";
			tokenName?: string;
			options: S;
		},
	) {}

	async useContext(ctx: RequestContext) {
		ctx.register({
			token: asValue(await this.extractToken(ctx.resolve("request"))),
			verifyToken: {
				resolve: (c) => {
					const token = c.resolve<string>("token");
					return this.verify.bind(this, token);
				},
				lifetime: "SCOPED",
			},
		});
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
	abstract verify(token: string): Promise<any>;
}
