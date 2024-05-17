import { Integer, Model } from "@vermi/openapi";

@Model()
export class Paging {
	@Integer({ minimum: 0, default: 0, description: "Page number." })
	page = 0;

	@Integer({
		minimum: 1,
		default: 20,
		description: "Number of objects per page.",
	})
	size = 20;

	@Integer({ readOnly: true, description: "Number of objects to skip." })
	get offset() {
		return this.page ? this.page * this.limit : 0;
	}

	@Integer({
		readOnly: true,
		description: "Maximum number of objects to return.",
	})
	get limit() {
		return this.size;
	}
}
