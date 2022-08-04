import fs from "fs";
import {config} from "./config";
import {shell} from "./shell";

export namespace nginx {
	function generate(): string {
		const lines = [];
		lines.push(
			"server {",
			"\troot /pub/;",
			"\taccess_log /pub/mp2/access.log bjork;",
			"",
			"index /pub/mp2/index.html",
			"server_name api.axelapi.xyz;",
			"",
			"location / {",
			"\ttry files $uri $uri/ =404;",
			"}",
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
				`\t\tproxy_pass http://localhost:${entry.SERVER_PORT}`,
				"\t\tproxy_http_version 1.1;",
				"\t\tproxy_set_header Upgrade $http_upgrade;",
				'\t\tproxy_set_header Connection "upgrade";',
				"\t\tproxy_set_header Host $host;",
				"\t\tproxy_cache_bypass $http_upgrade;",
				"",
			);
		}
		lines.push(
			"\tlisten 443 ssl;",
			"\tlisten [::]:443 ssl ipv6only=on;",
			"\tssl_certificate /etc/letsencrypt/live/api.axelapi.xyz/fullchain.pem;",
			"\tssl_certificate_key /etc/letsencrypt/live/api.axelapi.xyz/privkey.pem;",
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
