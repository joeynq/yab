import { Model, Prop } from "@vermi/openapi";

@Model()
export class UserParams {
	@Prop()
	id!: string;
}
