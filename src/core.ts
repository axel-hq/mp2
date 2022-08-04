import pm2 from "pm2";
import {config} from "./config";
import {nginx} from "./nginx";
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
		pm2.connect(async err => {
			if (err != null) {
				return rej(err);
			}
			
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
