import { uuid } from "@vermi/utils";

export class AsyncEvent<Data> {
	public invokerId?: string;
	public id: string;

	constructor(
		public readonly name: string,
		public readonly data: Data,
	) {
		this.id = uuid();
	}
}
