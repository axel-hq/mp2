import {spawnSync} from "child_process";

export function shell(command: string, ...args: string[]) {
	spawnSync(command, args, {stdio: "inherit"});
}
