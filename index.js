'use strict';

var pm2 = require('pm2');
var fs = require('fs');
var child_process = require('child_process');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var pm2__default = /*#__PURE__*/_interopDefaultLegacy(pm2);
var fs__default = /*#__PURE__*/_interopDefaultLegacy(fs);

/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

function __classPrivateFieldGet(receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
}

function __classPrivateFieldSet(receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
}

var _AxelError_lines;
function wrap60(s) {
    const lines = [];
    while (s.length > 60) {
        lines.push(`${s.slice(0, 59)}-`);
        s = s.slice(59);
    }
    return lines;
}
class AxelError extends Error {
    constructor(...entries) {
        const lines = [""];
        for (const e of entries) {
            if (e instanceof AxelError) {
                for (const subline of __classPrivateFieldGet(e, _AxelError_lines, "f")) {
                    lines.push(`> > ${subline}`);
                }
            }
            else {
                lines.push(`> ${e}`);
            }
        }
        super(lines.join("\n"));
        _AxelError_lines.set(this, void 0);
        __classPrivateFieldSet(this, _AxelError_lines, lines, "f");
    }
}
_AxelError_lines = new WeakMap();
class AxelTypeError extends AxelError {
    constructor(...lines) {
        super(...lines);
    }
}
function to_AxelError(e) {
    if (e instanceof AxelError) {
        return e;
    }
    if (e instanceof Error) {
        return new AxelError(`${e.name}:`, ...wrap60(e.message), ...(e.stack ?? "").split("\n"));
    }
    else {
        return new AxelError("A value that was not an Error was thrown:", `${e}`);
    }
}

var int;
(function (int) {
    int.typename = "int";
    function assert(u) {
        if (Number.isInteger(u)) ;
        else {
            throw new AxelTypeError("Value was not integer :Cults:", `Instead it was ${u}`, `with type ${typeof u}`);
        }
    }
    int.assert = assert;
    function from_str(s) {
        const i = parseInt(s, 10);
        assert(i);
        return i;
    }
    int.from_str = from_str;
})(int || (int = {}));

const identity = (x) => x;

// When you need the type system to fuck off and let you do what you want with
// a value. Usually you want to use this one from the "insertion" side of
// expressions.
const shut_up = identity;

function show(val) {
    if (typeof val === "string") {
        return `"${val}"`;
    }
    return `${val}`;
}

const typename = "string";
function is(u) {
    return typeof u === "string";
}
function assert$1(u) {
    if (typeof u !== "string") {
        throw new AxelTypeError("Tried asserting that value was string but failed!", `typeof value was ${show(typeof u)} but should've been "string"!`);
    }
}
function from(u) {
    if (typeof u === "string") {
        return `"${u}"`;
    }
    return "" + u;
}

var string = /*#__PURE__*/Object.freeze({
    __proto__: null,
    typename: typename,
    is: is,
    assert: assert$1,
    from: from
});

function assert(u) {
    if (typeof u !== "object") {
        throw new AxelTypeError("Asserting that value was non-null object failed!", `typeof value was ${show(typeof u)} when it should've been "object"`);
    }
    if (u === null) {
        throw new AxelTypeError("Asserting that value was non-null object failed because the value was null!");
    }
}
function has(o, k) {
    return Object.hasOwnProperty.call(o, k);
}
function freeze(obj) {
    Object.freeze(obj);
}
function keys(o) {
    const ks = Object.keys(o);
    freeze(ks);
    return shut_up(ks);
}
function assert_has(o, k) {
    if (has(o, k)) ;
    else {
        throw new AxelTypeError(`Object did not have key ${from(k)}!`);
    }
}
/** Assert that an object has a property of type T. */
function assert_has_t(o, k, assert) {
    assert_has(o, k);
    try {
        assert.assert(o[k]);
    }
    catch (e) {
        if (e instanceof AxelTypeError) {
            throw new AxelTypeError(`While asserting that object[${from(k)}] is of type ${assert.typename}`, "an error was thrown:", e);
        }
        else {
            throw e;
        }
    }
}

var config_entry;
(function (config_entry) {
    config_entry.typename = "config_entry";
    function assert$1(u) {
        try {
            assert(u);
            assert_has_t(u, "SERVER_PORT", int);
            assert_has_t(u, "RELATIVE_MAIN", string);
        }
        catch (e) {
            throw new AxelTypeError("While asserting that a value was a config_entry, encountered an error!", to_AxelError(e));
        }
    }
    config_entry.assert = assert$1;
})(config_entry || (config_entry = {}));
var config;
(function (config_1) {
    const filename = `${__dirname}/config.json`;
    let config = {};
    function assert$1(u) {
        assert(u);
        const ports = {};
        for (const name of keys(u)) {
            const entry = u[name];
            config_entry.assert(entry);
            if (entry.SERVER_PORT in ports) {
                throw new AxelTypeError("In the config file, you have two entries that share the same SERVER_PORT.", `Both ${ports[entry.SERVER_PORT]} and ${name} share port ${entry.SERVER_PORT}`);
            }
        }
    }
    config_1.assert = assert$1;
    try {
        const obj = JSON.parse(fs__default["default"].readFileSync(filename, "utf8"));
        assert$1(obj);
        config = obj;
    }
    catch (e) {
        console.log(`Something went wrong while reading ${filename}.`, e);
    }
    function write() {
        fs__default["default"].writeFileSync(filename, JSON.stringify(config, null, '\t'));
    }
    config_1.write = write;
    function set(version, entry) {
        config[version] = entry;
    }
    config_1.set = set;
    function unset(version) {
        delete config[version];
    }
    config_1.unset = unset;
    function versions() {
        return keys(config);
    }
    config_1.versions = versions;
    function get(version) {
        return config[version];
    }
    config_1.get = get;
})(config || (config = {}));

function shell(command, ...args) {
    child_process.spawnSync(command, args, { stdio: "inherit" });
}

var nginx;
(function (nginx) {
    function generate() {
        const lines = [];
        lines.push("server {", "\troot /pub/;", "\taccess_log /pub/mp2/access.log bjork;", "", "index /pub/mp2/index.html", "server_name api.axelapi.xyz;", "", "location / {", "\ttry files $uri $uri/ =404;", "}", "");
        for (const version of config.versions()) {
            const entry = config.get(version);
            if (entry == null) {
                // strange
                continue;
            }
            lines.push(`\tlocation /${version} {`, `\t\tproxy_pass http://localhost:${entry.SERVER_PORT}`, "\t\tproxy_http_version 1.1;", "\t\tproxy_set_header Upgrade $http_upgrade;", '\t\tproxy_set_header Connection "upgrade";', "\t\tproxy_set_header Host $host;", "\t\tproxy_cache_bypass $http_upgrade;", "");
        }
        lines.push("\tlisten 443 ssl;", "\tlisten [::]:443 ssl ipv6only=on;", "\tssl_certificate /etc/letsencrypt/live/api.axelapi.xyz/fullchain.pem;", "\tssl_certificate_key /etc/letsencrypt/live/api.axelapi.xyz/privkey.pem;", "\tinclude /etc/letsencrypt/options-ssl-nginx.conf;", "\tssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;", "}", "");
        return lines.join("\n");
    }
    function write() {
        const nginx_config_path = "/etc/nginx/sites-enabled/all_servers.conf";
        try {
            fs__default["default"].unlinkSync(nginx_config_path);
        }
        catch (e) { }
        fs__default["default"].writeFileSync(nginx_config_path, generate());
        shell("nginx", "-t");
        shell("systemctl", "restart", "nginx");
    }
    nginx.write = write;
})(nginx || (nginx = {}));

const nameof = (version) => `server-${version}`;
function add(version, port, rel_main) {
    return new Promise((res, rej) => {
        config.set(version, { SERVER_PORT: port, RELATIVE_MAIN: rel_main });
        config.write();
        nginx.write();
        const SERVER_ROOT = `/pub/${nameof(version)}`;
        process.chdir(SERVER_ROOT);
        shell("npm", "install", "--omit=dev");
        pm2__default["default"].connect(async (err) => {
            if (err != null) {
                return rej(err);
            }
            await start(version, port, rel_main);
            pm2__default["default"].disconnect();
            res();
        });
    });
}
/**
 * you should connect to the pm2 daemon before calling this
 * oh yeah and also disconnect from it later
 */
function start(version, port, rel_main) {
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
        console.log(`STARTING ${version}`);
        pm2__default["default"].start(fig, err => {
            if (err != null) {
                return rej(err);
            }
            else {
                return res();
            }
        });
    });
}

try {
    switch (process.argv[2]) {
        case "add":
            const SERVER_VERSION = process.argv[3];
            let SERVER_PORT;
            let RELATIVE_MAIN;
            for (const arg of process.argv.slice(4)) {
                const port_arg = arg.match(/--SERVER_PORT:(\d+)/);
                if (port_arg) {
                    SERVER_PORT = int.from_str(port_arg[1]);
                    continue;
                }
                const main_arg = arg.match(/--RELATIVE_MAIN:(.+)/);
                if (main_arg) {
                    RELATIVE_MAIN = main_arg[1];
                }
            }
            if (SERVER_VERSION)
                if (SERVER_PORT)
                    if (RELATIVE_MAIN) {
                        add(SERVER_VERSION, SERVER_PORT, RELATIVE_MAIN);
                        break;
                    }
            throw new AxelTypeError("Missing argument to add!", `SERVER_VERSION = ${SERVER_VERSION}`, `SERVER_PORT    = ${SERVER_PORT}`, `RELATIVE_MAIN  = ${RELATIVE_MAIN}`);
        case "remove":
        case "sync":
        default:
            throw new AxelTypeError(`I don't know what ${process.argv[2]} means!`);
    }
}
catch (e) {
    throw new AxelError(to_AxelError(e), "mp2 add v1 --SERVER_PORT:420 --RELATIVE_MAIN:bin/main.js", "mp2 remove v1", "mp2 sync");
}
