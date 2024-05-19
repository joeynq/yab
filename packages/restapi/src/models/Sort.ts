import { Model, String, StringEnum } from "@vermi/openapi";

export enum SortDirection {
	Ascending = "asc",
	Descending = "desc",
}

@Model()
export class Sort {
	@String({ maxLength: 255 })
	prop!: string;

	@StringEnum(SortDirection, { default: SortDirection.Ascending })
	direction: SortDirection = SortDirection.Ascending;
}
