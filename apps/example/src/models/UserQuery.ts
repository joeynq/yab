import { GenericModel, Integer, Model, Of, String } from "@vermi/openapi";

@GenericModel()
export class Pagination<T> {
	@Of()
	data!: T[];

	@Integer()
	page!: number;

	@Integer()
	limit!: number;
}

@Model()
export class User {
	@Integer()
	id!: number;

	@String()
	name!: string;

	@String()
	email!: string;
}
