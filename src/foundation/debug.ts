export function show(val: any): string {
	if (typeof val === "string") {
	return `"${val}"`;
	}
	return `${val}`;
}
