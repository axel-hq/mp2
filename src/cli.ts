import * as core from "./core";
import {int} from "./types/int";
import {AxelError, AxelTypeError, to_AxelError} from "./err";

try {
	switch (process.argv[2]) {
		case "add":
			const SERVER_VERSION: string | undefined = process.argv[3];
			let SERVER_PORT: int | undefined;
			let RELATIVE_MAIN: string | undefined;
			for (const arg of process.argv.slice(4)) {
				const port_arg = arg.match(/--SERVER_PORT:(\d+)/);
				if (port_arg) {
					SERVER_PORT = int.from_str(port_arg[1]);
					continue;
				}
				const main_arg = arg.match(/--RELATIVE_MAIN:(.+)/);
				if (main_arg) {
					RELATIVE_MAIN = main_arg[1];
				}
			}
			if (SERVER_VERSION)
			if (SERVER_PORT)
			if (RELATIVE_MAIN)
			{
				core.add(SERVER_VERSION, SERVER_PORT, RELATIVE_MAIN);
				break;
			}
			throw new AxelTypeError(
				"Missing argument to add!",
				`SERVER_VERSION = ${SERVER_VERSION}`,
				`SERVER_PORT    = ${SERVER_PORT}`,
				`RELATIVE_MAIN  = ${RELATIVE_MAIN}`,
			);
		case "remove":
			// if SERVER_VERSION is so good, why isn't there SERVER_VERSION2?
			const SERVER_VERSION2: string | undefined = process.argv[3];
			if (SERVER_VERSION2) {
				core.remove(SERVER_VERSION2);
			}
			throw new AxelTypeError(
				"You forgot to provide a version to mp2 remove!",
			);
		case "sync":
			core.sync();
			break;
		default:
			throw new AxelTypeError(`I don't know what ${process.argv[2]} means!`);
		}
} catch (e) {
	throw new AxelError(
		to_AxelError(e),
		"mp2 add v1 --SERVER_PORT:420 --RELATIVE_MAIN:bin/main.js",
		"mp2 remove v1",
		"mp2 sync",
	);
}
