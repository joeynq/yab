import { type RequestContext, asValue } from "@vermi/core";
import { getParam } from "@vermi/utils";
import type { SecurityScheme } from "../interfaces";

export abstract class Strategy<S> {
	abstract readonly securityScheme: SecurityScheme;

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
			token: asValue(await this.extractToken(ctx.store.request)),
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
			return getParam(request.url, "token") ?? undefined;
		}
		if (tokenFrom === "body") {
			if (request.headers.get("content-type")?.includes("application/json")) {
				const body = (await request.json()) as any;
				const token = body[tokenName];
				return token || undefined;
			}
			const body = await request.formData();
			const token = body.get(tokenName);
			return token?.toString() ?? undefined;
		}
		return undefined;
	}
	abstract verify(token: string): Promise<any>;
}
