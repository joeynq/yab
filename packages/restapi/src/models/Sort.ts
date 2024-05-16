import { Enum, Model, String } from "@vermi/openapi";

export enum SortDirection {
	Ascending = "asc",
	Descending = "desc",
}

@Model()
export class Sort {
	@String()
	prop!: string;

	@Enum(SortDirection, { default: SortDirection.Ascending })
	direction: SortDirection = SortDirection.Ascending;
}
