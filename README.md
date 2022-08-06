# mp2

*Server deploy orchestrator*

So when you upload a new server, two things have to be configured.
You have to tell nginx to properly route to the server and you need to tell pm2
to restart it if it shuts down.

The big issue is that you can only listen on port 433 (https) once in all of
your nginx config files. That means we need to have one nginx config file that
routes to each of the servers.

mp2 is highly dependent on the directory structure because I don't care enough
to make it configurable.

Make the server directory structure like so:

```
/
> pub/
>  >  mp2/
>  >  server-v*/
>  >  >  package.json
```

Individual server versions should invoke mp2 in their deploy scripts.

```
node /pub/mp2 v1 --SERVER_PORT:4013 --RELATIVE_MAIN:bin/main.js
```
