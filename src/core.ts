import pm2 from "pm2";
import {config} from "./config";
import {AxelError} from "./err";
import {tuple, unsound} from "./foundation";
import {Mutex} from "./Mutex";
import {nginx} from "./nginx";
import {shell} from "./shell";
import {int} from "./types/int";

export const nameof = (version: string) => `server-${version}`;

// when you stop or start something, you also need to ask nginx
export function remove(version: string): Promise<void> {
	return new Promise((res, rej) => {
		config.unset(version);
		config.write();
		nginx.write();
		pm2.connect(err => {
			if (err != null) {
				return rej(err);
			}
			pm2.delete(nameof(version), err => {
				pm2.disconnect()
				if (err != null) {
					return rej(err);
				}
				else {
					return res();
				}
			});
		});
	});
}

export function add(version: string, port: int, rel_main: string): Promise<void> {
	return new Promise((res, rej) => {
		config.set(version, {SERVER_PORT: port, RELATIVE_MAIN: rel_main});
		config.write();
		nginx.write();

		const SERVER_ROOT = `/pub/${nameof(version)}`;
		process.chdir(SERVER_ROOT);
		shell("npm", "install", "--omit=dev");

		pm2.connect(async err => {
			if (err != null) {
				return rej(err);
			}
			await start(version, port, rel_main);
			pm2.disconnect();
			res();
		});
	});
}

export function sync(): Promise<void> {
	return new Promise((res, rej) => {
		pm2.connect(async err => {
			if (err != null) {
				return rej(err);
			}
			const missing_versions: string[] = [];
			const describe_mx = new Mutex();
			for (const version of config.versions()) {
				await describe_mx.lock();
				const name = nameof(version);
				pm2.describe(name, (err, descriptions) => {
					if (err != null) {
						return describe_mx.unlock();
					}
					if (descriptions.length === 0) {
						console.log(`MISSING ${name}`);
						missing_versions.push(version);
						return describe_mx.unlock();
					}
					if (descriptions.length === 1) {
						console.log(`RUNNING ${name}`);
						return describe_mx.unlock();
					}
					if (descriptions.length > 1) {
						console.log(`${name} has more than one process attached to it!`);
						pm2.delete(name, err => {
							if (err != null) {
								console.log(`Failed to delete ${name}!`);
							}
							return describe_mx.unlock();
						});
					}
				});
			}
			for (const version of missing_versions) {
				const config_entry = config.get(version);
				if (config_entry == null) {
					throw new AxelError("Impossible");
				}
				await start(version, config_entry.SERVER_PORT, config_entry.RELATIVE_MAIN);
			}
			res();
		});
	});
}

/**
 * you should connect to the pm2 daemon before calling this
 * oh yeah and also disconnect from it later
 */
export function start(version: string, port: int, rel_main: string): Promise<void> {
	return new Promise((res, rej) => {
		const SERVER_ROOT = `/pub/${nameof(version)}`;
		const fig = {
			name: nameof(version),
			script: `${SERVER_ROOT}/${rel_main}`,
			cwd: SERVER_ROOT,
			env: {
				SERVER_ROOT,
				SERVER_VERSION: version,
				SERVER_PORT: `${port}`,
				IS_PRODUCTION: "true",
			},
		};
		console.log(`STARTING ${version}`);
		console.log(`SCRIPT = ${SERVER_ROOT}/${rel_main}`);
		pm2.start(fig, err => {
			if (err != null) {
				return rej(err);
			} else {
				return res();
			}
		});
	});
}
