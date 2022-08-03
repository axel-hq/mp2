import {AxelTypeError} from "../err";
import * as debug from "./debug";
import * as string from "./string";
import * as unsound from "./unsound";

export type obj = {};
export declare const type: obj;

export type key = keyof any;
export const typename = "non-null object";

export function is(u: unknown): u is {} {
	return typeof u === "object" && u !== null;
}

export function assert(u: unknown): asserts u is {} {
	if (typeof u !== "object") {
		throw new AxelTypeError(
			"Asserting that value was non-null object failed!",
			`typeof value was ${debug.show(typeof u)} when it should've been "object"`
		);
	}
	if (u === null) {
		throw new AxelTypeError(
			"Asserting that value was non-null object failed because the value was null!",
		);
	}
}

export function has
	<o extends {}, k extends key>
		(o: o, k: k):
			o is o & {[_ in k]: unknown}
{
	return Object.hasOwnProperty.call(o, k);
}

export function freeze<T>(obj: T): asserts obj is Readonly<T> {
	Object.freeze(obj);
}

export function keys<o extends {}>(o: o): readonly (keyof o)[] {
	const ks = Object.keys(o);
	freeze(ks);
	return unsound.shut_up(ks);
}

export type assert_obj<T> = {
	assert: (u: unknown) => asserts u is T;
	typename: string;
};

export function assert_has
<k extends key, o extends {}>(o: o, k: k):
	asserts o is o & {[_ in k]: unknown}
{
	if (has(o, k)) {}
	else {
		throw new AxelTypeError(`Object did not have key ${string.from(k)}!`);
	}
}

/** Assert that an object has a property of type T. */
export function assert_has_t
	<T, k extends key, o extends {}>
		(o: o, k: k, assert: assert_obj<T>):
			asserts o is o & {[_ in k]: T}
{
	assert_has(o, k);
	try {
		assert.assert(o[k]);
	} catch (e) {
		if (e instanceof AxelTypeError) {
			throw new AxelTypeError(
				`While asserting that object[${string.from(k)}] is of type ${assert.typename}`,
				"an error was thrown:",
				e,
			);
		} else {
			throw e;
		}
	}
}

export function has_v
	<v, k extends key, o extends {[_ in k]: unknown}>
		(o: o, k: k, v: v):
			o is o & {[_ in k]: v}
{
	return o[k] === v;
}

export function assert_has_v
	<v, k extends key, o extends {}>
		(o: o, k: k, v: v):
			asserts o is o & {[_ in k]: v}
{
	assert_has(o, k);
	
	if (has_v(o, k, v)) {}
	else {
		throw new AxelTypeError(`object[${string.from(k)}] is not equal to v`);
	}
}

export function assert_optional
	<k extends key, o extends {}>
		(o: o, k: k):
			asserts o is o & {[_ in k]: unknown | undefined}
{
	void o, k;
}

export function assert_optional_t
<T, k extends key, o extends {}>
	(o: o, k: k, assert: assert_obj<T>):
		asserts o is o & {[_ in k]: T | undefined}
{
	if (has(o, k)) {
		try {
			assert.assert(o[k]);
		} catch (e) {
			if (e instanceof AxelTypeError) {
				throw new AxelTypeError(
					`While asserting that object[${string.from(o)}] has optional value of type ${assert.typename}`,
					"an error was thrown:",
					e,
				);
			}
		}
	}
}

export function from_entries<k extends key, v>(entries: [k, v][]): {[_ in k]: v} {
	return unsound.shut_up(Object.fromEntries(entries));
}
