import type { OpenAPIObject } from "openapi3-ts/oas31";

export const removeUnused = (source: OpenAPIObject) => {
	const schemas = source.components?.schemas;

	if (!schemas || !source.components || !source.paths) {
		return source;
	}

	const json = JSON.stringify(source);

	const keys = Object.keys(schemas);

	for (const key of keys) {
		const id = `"#/components/schemas/${key}"`;
		if (json.split(id).length <= 2) {
			delete schemas[key];
		}
	}

	source.components.schemas = schemas;

	// Remove all $id
	const idPattern = /"\$id":\s*"\#\/components\/schemas\/[^"]*",/g;

	const newSource = JSON.parse(
		JSON.stringify(source).replaceAll(idPattern, ""),
	);

	return newSource;
};
