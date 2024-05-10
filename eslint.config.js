import sonarjs from "eslint-plugin-sonarjs";
import tseslint from "typescript-eslint";

export default [
	sonarjs.configs.recommended,
	{
		languageOptions: { parser: tseslint.parser },
		ignores: ["**/dist/", "**/node_modules/"],
		files: ["**/*.ts", "**/*.tsx"],
	},
];
