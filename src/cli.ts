import fs from "fs";
import pm2 from "pm2";

process.chdir(__dirname);

try {
   const managed_raw = fs.readFileSync("managed.json", "utf8");
   var managed = JSON.parse(managed_raw);
} catch (e) {
   console.log(`Couldn't read ${__dirname}/managed.json`);
   var managed = {};
}

function get_help(...something_else) {
   throw new Error([...something_else
      ,  "mp2 add <base64 encoded json config>"
      ,  ""
      ,  "type config = {"
      ,  "   SERVER_VERSION: string;"
      ,  "   RELATIVE_MAIN: string;"
      ,  "   SERVER_PORT: number;"
      ,  "};"
      ,  ""
      ,  "const example_config = {"
      ,  "   SERVER_VERSION: 'v1',"
      ,  "   RELATIVE_MAIN: 'bin/main.js'"
      ,  "   SERVER_PORT: 4013,",
      ,  "};"
      ,  ""
      ,  "mp2 subtract SERVER_NAME"
      ,  ""
      ,  "mp2 sync"
   ].join("\n"))
}
