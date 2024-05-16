import { Model, Prop } from "@vermi/openapi";
import type { Paging } from "./Paging";
import type { Sort } from "./Sort";

// @ts-expect-error
@Model()
export abstract class SearchParams<T> {
	abstract filter?: T;

	@Prop({ nullable: true })
	paging?: Paging;

	@Prop({ nullable: true })
	sort?: Sort;
}
