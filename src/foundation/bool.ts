import {AxelTypeError} from "../err";
import * as debug from "./debug";

export const typename = "boolean";

export function is(u: unknown): u is boolean {
	return typeof u === "boolean";
}

export function assert(u: unknown): asserts u is boolean {
	if (typeof u !== "boolean") {
		throw new AxelTypeError(
			"Tried asserting that value was boolean but failed!",
			`typeof value was ${debug.show(typeof u)} when it should've been "boolean"!`,
		);
	}
}
