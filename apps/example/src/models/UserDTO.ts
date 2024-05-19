import { Integer, Model, Prop, String } from "@vermi/openapi";
import { Resource, SearchParams } from "@vermi/restapi";

@Resource("User")
export class UserDTO {
	@Integer()
	id!: number;

	@String()
	firstName!: string;

	@String()
	lastName!: string;

	@String()
	email!: string;
}

@Model()
export class UserSearch extends SearchParams<UserDTO> {
	@Prop({ nullable: true, description: "Filter options" })
	filter?: UserDTO;
}
