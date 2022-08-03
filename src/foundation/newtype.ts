export declare const nt_s: unique symbol;

export type unwrap<T> =
	T extends {[nt_s]: {unwraps_to: infer inner}} ? inner : T;

export type newtype<uniq_name extends string, of> =
	of & {[nt_s]: {types: {[key in uniq_name]: void}; unwraps_to: unwrap<of>}};
