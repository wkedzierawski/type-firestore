const getTypesFromObject = (object: unknown) => {
	if (typeof object !== "object" || !object) {
		return typeof object;
	}

	const iterator = object instanceof Map ? object : Object.entries(object);

	const types: Record<string, string> = {};
	for (const [key, value] of iterator) {
		types[key] = getType(value);
	}

	const sortedObject = Object.entries(types).sort(([nameA], [nameB]) =>
		nameA.localeCompare(nameB)
	);

	const uniqueObject = sortedObject.filter(
		([name], index, arr) =>
			arr.findIndex(([itemName]) => itemName === name) === index
	);

	const mappedObjectTypes = uniqueObject.map(
		([name, type]) => `${name}:${type}`
	);

	return `{${mappedObjectTypes.join(";")}}`;
};

const getTypesFromArray = (array: unknown[]) => {
	const types = [];

	for (const element of array) {
		switch (true) {
			case element === null:
				types.push("null");
				break;

			case typeof element === "object":
				types.push(getTypesFromObject(element));
				break;

			default:
				types.push(typeof element);
				break;
		}
	}

	return `(${[...new Set(types)].join(" | ")})[]`;
};

export const getType = (item: unknown): string => {
	let type: unknown = item;

	switch (true) {
		case Array.isArray(item):
			type = getTypesFromArray(item);
			break;

		case typeof item === "object":
			type = getTypesFromObject(item);
			break;

		case typeof item === "string" && /string|boolean|number/.test(item):
			return item;

		default:
			return typeof item;
	}

	return getType(type);
};
