export type view =
	{typename: string};

export type validator<O extends I, I = unknown> =
	view & {is: (u: I) => u is O};

export type reinterpreter<O extends I, I = unknown> =
	view & {assert: {(u: I): asserts u is O}};

export type transformer<O, I = unknown> =
	view & {from: (u: I) => O};

// it's a reflector
// rarely need transformer so
export type shine<O extends I, I = unknown> =
	& validator<O, I>
	& reinterpreter<O, I>;

export type whole<O extends I, I = unknown> =
	& shine<O, I>
	& transformer<O, I>;

export type capabilities<O extends I, I = unknown>
	= view & Partial<whole<O, I>>;
