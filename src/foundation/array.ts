import * as debug from "./debug";
import {AxelTypeError} from "../err";
import * as unsound from "./unsound";
import * as reflect from "./reflect";

export type array = unknown[];
export const typename = "array";

export function is(u: unknown): u is array {
	return Array.isArray(u);
}

export function assert(u: unknown): asserts u is array {
	if (Array.isArray(u)) {}
	else {
		throw new AxelTypeError(
			"Tried asserting that value was Array but failed!",
			`typeof value = ${debug.show(typeof u)}`,
			`value = ${debug.show(u)}`,
		);
	}
}

import * as _array from "./array";
// sufferage
export function typed
<
	C extends reflect.capabilities<any>,
	T = C extends reflect.capabilities<infer inner> ? inner : never,
>
(c: C):
(
	& reflect.view
	& (C extends reflect.validator<T>     ? reflect.validator<T[], unknown>     : {})
	& (C extends reflect.transformer<T>   ? reflect.transformer<T[], unknown>   : {})
	& (C extends reflect.reinterpreter<T> ? reflect.reinterpreter<T[], unknown> : {})
)
{
	const view: reflect.view = {typename: `${c.typename} ${_array.typename}`};
	
	let validator: Partial<reflect.validator<T[], unknown>>;
	if (c.is) {
		const is: reflect.validator<T>["is"] = c.is;
		validator = {
			is(u: unknown): u is T[] {
				if (_array.is(u)) {}
				else {
					return false;
				}
				for (const elem of u) {
					if (is(elem)) {}
					else {
						return false;
					}
				}
				return true;
			},
		};
	} else {
		validator = {};
	}
	
	let reinterpreter: Partial<reflect.reinterpreter<T[], unknown>>;
	if (c.assert) {
		const assert: reflect.reinterpreter<T>["assert"] = c.assert;
		reinterpreter = {
			assert(u: unknown): asserts u is T[] {
				_array.assert(u);
				for (const elem of u) {
					assert(elem);
				}
			},
		};
	} else {
		reinterpreter = {};
	}
	
	let transformer: Partial<reflect.transformer<T[], unknown[]>>;
	if (c.from) {
		const {from} = c;
		transformer = {
			from(u: unknown): T[] {
				_array.assert(u);
				return u.map(from);
			},
		};
	} else {
		transformer = {};
	}
	return unsound.shut_up({
		...view,
		...validator,
		...reinterpreter,
		...transformer,
	});
}