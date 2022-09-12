import fs from "fs";
import {shell} from "./shell";
import {config} from "./config";

export namespace nginx {
	function generate(): string {
		const lines = [];
		lines.push(
			"log_format bjork",
			`\t'[$time_local] $http_x_api_key: "$request" {$request_body}'`,
			"\t'-> $status';",
			"",
			"server {",
			"\troot /pub;",
			"\taccess_log /pub/access.log bjork;",
			"",
			"\tindex /pub/mp2/index.html;",
			"\tserver_name api.axel.dev;",
			"",
			"\tlocation / {",
			"\t\ttry_files $uri $uri/ =404;",
			"\t}",
			"",
		);
		for (const version of config.versions()) {
			const entry = config.get(version);
			if (entry == null) {
				// strange
				continue;
			}
			lines.push(
				`\tlocation /${version} {`,
				`\t\tproxy_pass http://localhost:${entry.SERVER_PORT};`,
				"\t\tproxy_http_version 1.1;",
				"\t\tproxy_set_header Host $host;",
				"\t\tproxy_cache_bypass $http_upgrade;",
				'\t\tproxy_set_header Connection "upgrade";',
				"\t\tproxy_set_header Upgrade $http_upgrade;",
				"\t}",
				"",
			);
		}
		lines.push(
			"\tlisten 443 ssl;",
			"\tlisten [::]:443 ssl ipv6only=on;",
			"\tssl_certificate /etc/letsencrypt/live/api.axel.dev/fullchain.pem;",
			"\tssl_certificate_key /etc/letsencrypt/live/api.axel.dev/privkey.pem;",
			"\tinclude /etc/letsencrypt/options-ssl-nginx.conf;",
			"\tssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;",
			"}",
			"",
		);
		return lines.join("\n");
	}

	export function write() {
		const nginx_config_path = "/etc/nginx/sites-enabled/all_servers.conf";
		try { fs.unlinkSync(nginx_config_path) } catch (e) {}
		fs.writeFileSync(nginx_config_path, generate());
		shell("nginx", "-t");
		shell("systemctl", "restart", "nginx");
	}
}
