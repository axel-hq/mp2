import fs from "fs";
import {int} from "./types/int";
import {object, string, unsound} from "./foundation";
import {AxelTypeError, to_AxelError} from "./err";

export type config_entry = {
	SERVER_PORT: int;
	RELATIVE_MAIN: string;
};
namespace config_entry {
	export const typename = "config_entry";
	export function assert(u: unknown): asserts u is config_entry {
		try {
			object.assert(u);
			object.assert_has_t(u, "SERVER_PORT", int);
			object.assert_has_t(u, "RELATIVE_MAIN", string);
		} catch (e) {
			throw new AxelTypeError(
				"While asserting that a value was a config_entry, encountered an error!",
				to_AxelError(e),
			);
		}
	}
}

type config = {[SERVER_VERSION in string]: config_entry | undefined};
export namespace config {
	const filename = `${__dirname}/config.json`;
	let config: config = {};
	
	export function assert(u: unknown): asserts u is config {
		object.assert(u);
		unsound.is_now<{[SERVER_VERSION in string]: unknown}>(u);
		
		const ports: {[SERVER_PORT in string]: string} = {};
		for (const name of object.keys(u)) {
			const entry: unknown = u[name];
			config_entry.assert(entry);
			if (entry.SERVER_PORT in ports) {
				throw new AxelTypeError(
					"In the config file, you have two entries that share the same SERVER_PORT.",
					`Both ${ports[entry.SERVER_PORT]} and ${name} share port ${entry.SERVER_PORT}`,
				);
			}
		}
	}

	try {
		const obj = JSON.parse(fs.readFileSync(filename, "utf8"));
		assert(obj);
		config = obj;
	} catch (e) {
		console.log("----------- THIS IS FINE. I'M JUST LETTING YOU KNOW -----------");
		console.log(`Something went wrong while reading ${filename}.`, e);
		console.log("---------------------------------------------------------------");
	}
	export function write() {
		fs.writeFileSync(filename, JSON.stringify(config, null, '\t'));
	}

	export function set(version: string, entry: config_entry) {
		config[version] = entry;
	}

	export function unset(version: string) {
		delete config[version];
	}

	export function versions(): readonly string[] {
		return object.keys(config);
	}

	export function get(version: string): config_entry | undefined {
		return config[version];
	}
}
