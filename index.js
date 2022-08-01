const fs = require("fs");
const pm2 = require("pm2");

function _(hof) {
   return {then($){ hof((..._) => $(_)) }};
}

void async function ()
{
void 0;
const server_config = 
var [err] = await _(pm2.connect.bind(pm2));
if (err != null) throw err;
var [err, processes] = await _(pm2.list.bind(pm2));
if (err != null) throw err;
console.log(processes);
pm2.disconnect();
}()
