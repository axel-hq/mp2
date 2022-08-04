const ts = require("@rollup/plugin-typescript");

module.exports = {
	input: "src/cli.ts",
	output: {
		file: "index.js",
		format: "cjs",
		strict: true,
	},
	plugins: [ts()],
};
