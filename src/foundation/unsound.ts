import {identity} from "./identity";

// When TypeScript is too stupid to figure out that something is definitely true
export function is_now<T>(val: any): asserts val is T { void val }
export const cast: {<T>(val: any): T} = identity;
// Blessing something makes it of that type by definition. Should really only
// be used with newtypes.
export const bless = cast;
// When you need the type system to fuck off and let you do what you want with
// a value. Usually you want to use this one from the "insertion" side of
// expressions.
export const shut_up: {(who_cares: any): never} = identity as never;
// Same thing as above but for the "receiving" side of expressions. Arguments
// have the right type but the function refuses em? UNSOUND_unlock's your Go-To.
export const unlock: {(fuck_off: any): any} = identity as never;
