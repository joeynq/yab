export interface VermiModule<Options> {
	readonly config: Options;
	use?: () => void;
}
