import {AxelTypeError} from "../err";
import * as debug from "./debug";
import * as reflect from "./reflect";
import * as unsound from "./unsound";

import {identity} from "./identity";

export type tuple<T = any> = readonly [...T[]];
export const typename = "tuple";

export function includes
	<T, tup extends tuple>
		(tup: tup, elem: T):
			elem is tup[number]
{
	return unsound.shut_up(tup.includes(elem));
}

export const to_array:
	{<T, tup extends readonly [...T[]]>(tup: tup): readonly T[]}
		= identity;

export function assert_in
	<tup extends tuple>
		(tup: tup, name: string, elem: tup[number]):
			asserts elem is tup[number]
{
	if (tup.includes(elem)) {}
	else {
		throw new AxelTypeError(
			`Could not assert that input is a ${name}!`,
			`elem was ${debug.show(elem)} but should have been one of the following:`,
			...tup.map(e => `- ${debug.show(e)}`),
		);
	}
}

export function as_enum_shine
	<tup extends tuple>
		(tup: tup, typename: string):
			reflect.shine<tup[number]>
{
	return {
		typename,
		is(u: unknown): u is tup[number] {
			return includes(tup, u);
		},
		assert(u: unknown): asserts u is tup[number] {
			assert_in(tup, typename, u);
		},
	};
}
