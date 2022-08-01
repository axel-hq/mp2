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

if (process.argv.length < 3) {
   get_help("I expected you to provide at least one argument to mp2");
}

function awaitable(hof) {
   return (...args) => ({then($){ hof(...args, (..._) => $(_)) }});
}

const pm3 = new Proxy(pm2, {
   get(target, key) {
      if (typeof target[key] === "function") {
         return awaitable(target[key].bind(target));
      } else {
         return target[key];
      }
   }
});

switch (process.argv[2]) {
   case "subtract": subtract(); break;
   case "sync": sync(); break;
   case "add": add(); break;
   default: get_help(`I don't know what ${process.argv[2]} means!`);
}

async function subtract() {
   const name = process.argv[3];
   var [err] = await pm3.connect();
   if (err != null) throw err;
   var [err] = await pm3.delete(name);
   await pm3.disconnect();
   if (err != null) throw err;
}

async function sync() {
   var [err] = await pm3.connect();
   if (err != null) throw err;
   var [err, processes] = await pm3.list();
   if (err != null) throw err;
   const mana_GED = {...managed};
   for (const process of processes) {
      if (process.name in mana_GED) {
         if (process.pm2_env.status === "running") {
            console.log(`MANAGED & RUNNING ${process.name}`);
            delete mana_GED[process.name];
            // I'm using mana_GED to keep track of the processes that we know are
            // running under pm2 so we can list the ones that aren't
         } else {
            console.log(`MANAGED & STOPPED ${process.name}`);
         }
      } else {
         console.log(`UNKNOWN ${process.name}`);
      }
   }
   for (const process_name of Object.keys(mana_GED)) {
      console.log(`  !! MISSING !! ${process_name}`);
      console.log("I'm starting it now.");
      await start(process_name);
   }
   await pm3.disconnect();
}

async function add() {
   const new_config = JSON.parse(atob(process.argv[3]));

   if ("SERVER_VERSION" in new_config) {} else {
      get_help("Missing SERVER_VERSION field!");
   }
   if ("SERVER_PORT" in new_config) {} else {
      get_help("missing SERVER_PORT field!");
   }
   if ("RELATIVE_MAIN" in new_config) {} else {
      get_help("Missing RELATIVE_MAIN field!");
   }

   const server_name = `server-${new_config.SERVER_VERSION}`;

   managed[server_name] = {
      SERVER_VERSION: new_config.SERVER_VERSION,
      SERVER_PORT: new_config.SERVER_PORT,
      RELATIVE_MAIN: new_config.RELATIVE_MAIN,
   };

   var [err] = await pm3.connect();
   await start(server_name);
   await pm3.disconnect();
   fs.writeFileSync(`${__dirname}/managed.json`, JSON.stringify(managed, null, 3));
}

async function start(manages_name) {
   const cfg = managed[manages_name];
   // this doesn't return a consistent thing lol
   const [err, whogivesafuck] = await pm3.start({
      name: manages_name,
      script: `/pub/${manages_name}/${cfg.RELATIVE_MAIN}`,
      cwd: `/pub/${manages_name}`,
      env: {
         SERVER_ROOT: `/pub/${manages_name}`,
         SERVER_VERSION: `/pub/${cfg.SERVER_VERSION}`,
         SERVER_PORT: cfg.SERVER_PORT,
         IS_PRODUCTION: "true",
      },
   });
   if (err) {
      if (Array.isArray(err) && err.length > 0) {
         throw err[0];
      } else {
         throw err;
      }
   }
}
