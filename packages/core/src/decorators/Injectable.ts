export const Injectable = (): ClassDecorator => {
	return (target) => {
		// expecting do nothing. needed to Reflect metadata work
		return target;
	};
};
