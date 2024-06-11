import type { ApiConfig, OpenAPIConfig } from "../interfaces";

export const isOpenAPI = (config: ApiConfig): config is OpenAPIConfig => {
	return config.type === "openapi";
};
