import pm2 from "pm2";
import {config} from "./config";
import {tuple, unsound} from "./foundation";
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
			pm2.list((err, processes) => {
				if (err != null) {
					return rej(err);
				}
				// by the end of the for loop below, this is cleared of any
				// processes that are already running.
				for (const version of config.versions()) {
					pm2.describe(nameof(version), (err, p) => {
						
					});
				}
				pm2.describe()
				for (const process of processes) {
					const name = unsound.cast<string>(process.name);
					if (mp2_versions.map(nameof).includes(name)) {
						if (unsound.shut_up(process.pm2_env?.status) === "running") {
							console.log(`MANAGED & RUNNING ${name}`);
							mp2_versions.delete(name);
						} else {
							const status = process.pm2_env?.status?.toUpperCase() ?? "UNKNOWN";
							console.log(`MANAGED & ${status} ${name}`);
						}
					} else {
						console.log(`UNKNOWN ${name}`);
					}
				}
				for (const stopped_process of mp2_versions) {
					const config_entry = config.get(stopped_process);
					await start();
				}
			})
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
		pm2.start(fig, err => {
			if (err != null) {
				return rej(err);
			} else {
				return res();
			}
		});
	});
}
