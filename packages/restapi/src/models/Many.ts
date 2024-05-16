import { Generic, Integer, Of } from "@vermi/openapi";

export interface IMany<Resource> {
	data: Resource[];
	total: number;
}

@Generic()
export class Many<T> implements IMany<T> {
	@Of()
	data!: T[];

	@Integer({ minimum: 0 })
	total!: number;

	constructor(data: T[], total: number) {
		this.data = data;
		this.total = total;
	}
}
