import {AxelTypeError} from "../err";
import * as debug from "./debug";

export const typename = "string";

export function is(u: unknown): u is string {
	return typeof u === "string";
}

export function assert(u: unknown): asserts u is string {
	if (typeof u !== "string") {
		throw new AxelTypeError(
			"Tried asserting that value was string but failed!",
			`typeof value was ${debug.show(typeof u)} but should've been "string"!`,
		);
	}
}

export function from(u: unknown): string {
	if (typeof u === "string") {
		return `"${u}"`;
	}
	return "" + u;
}
