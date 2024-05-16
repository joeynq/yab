import { Integer, Model, Prop, String } from "@vermi/openapi";
import { Resource, SearchParams } from "@vermi/restapi";

@Resource("user")
export class UserDTO {
	@Integer()
	id!: number;

	@String()
	name!: string;

	@String()
	email!: string;
}

@Model()
export class UserSearch extends SearchParams<UserDTO> {
	@Prop({ nullable: true })
	filter?: UserDTO;
}
