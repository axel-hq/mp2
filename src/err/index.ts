type error_entry = string | AxelError;

function wrap60(s: string): string[] {
	const lines = [];
	while (s.length > 60) {
		lines.push(`${s.slice(0, 59)}-`);
		s = s.slice(59);
	}
	return lines;
}

export class AxelError extends Error {
	#lines: string[];
	constructor (...entries: error_entry[]) {
		const lines: string[] = [""];
		for (const e of entries) {
			if (e instanceof AxelError) {
				for (const subline of e.#lines) {
					lines.push(`> > ${subline}`);
				}
			} else {
				lines.push(`> ${e}`);
			}
		}
		super(lines.join("\n"));
		this.#lines = lines;
	}
}

export class AxelTypeError extends AxelError {
	constructor (...lines: error_entry[]) {
		super(...lines);
	}
}

export function to_AxelError(e: unknown): AxelError {
	if (e instanceof AxelError) {
		return e;
	}

	if (e instanceof Error) {
		return new AxelError(
			`${e.name}:`,
			...wrap60(e.message),
			...(e.stack ?? "").split("\n"),
		);
	}

	else {
		return new AxelError(
			"A value that was not an Error was thrown:",
			`${e}`,
		);
	}
}
