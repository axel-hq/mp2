const fs = require("fs");
const pm2 = require("pm2");

process.chdir(__dirname);

try {
   const managed_raw = fs.readFileSync("managed.json");
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
      ,  "   SERVER_NAME: string;"
      ,  "   RELATIVE_MAIN: string;"
      ,  "   SERVER_PORT: number;"
      ,  "};"
      ,  ""
      ,  "const example_config = {"
      ,  "   SERVER_NAME: 'server-v1',"
      ,  "   RELATIVE_MAIN: 'bin/main.js'"
      ,  "   SERVER_PORT: 4013,",
      ,  "};"
      ,  ""
      ,  "mp2 subtract SERVER_NAME"
      ,  ""
      ,  "mp2 list"
   ].join("\n"))
}

if (process.argv.length < 4) {
   get_help("I expected you to provide two arguments to mp2!");
}

function then_ish(hof) {
   return (...args) => ({then($){ hof(...args, (..._) => $(_)) }});
}

const pm3 = new Proxy(pm2, {
   get(target, key) {
      if (typeof target[key] === "function") {
         return then_ish(target[key].bind(target));
      } else {
         return target[key];
      }
   }
});

switch (process.argv[2]) {
case "subtract": subtract();
case "sync": sync();
case "add": add();
default: get_help(`I don't know what ${process.argv[2]} means!`);
}

async function subtract() {
   const name = process.argv[3];
   var [err] = await pm3.connect();
   if (err != null) throw err;
   var [err, processes] = await pm3.delete(name);
   await pm3.disconnect();
   if (err != null) throw err;
   process.exit(0);
}

async function add(name) {
   const new_config = JSON.parse(atob(process.argv[2]));

   if ("SERVER_NAME" in config) {} else {
      get_help("Missing SERVER_NAME field!");
   }
   if ("RELATIVE_MAIN" in config) {} else {
      get_help("Missing RELATIVE_MAIN field!");
   }
   if ("SERVER_PORT" in config) {} else {
      get_help("missing SERVER_PORT field!");
   }

   manages[new_config.SERVER_NAME] = {
      RELATIVE_NAME: 
   }
}

// void async function () {
//    var [err] = await pm3.connect;
//    if (err != null) throw err;
//    var [err, processes] = await pm3.list;
//    if (err != null) throw err;
//    console.log(processes);
//    await pm3.disconnect;
// }()
