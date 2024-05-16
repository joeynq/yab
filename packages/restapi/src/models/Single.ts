import { Generic, Of } from "@vermi/openapi";

export interface ISingle<Resource> {
	data: Resource;
}

@Generic()
export class Single<T> implements ISingle<T> {
	@Of()
	data!: T;

	constructor(data: T) {
		this.data = data;
	}
}
