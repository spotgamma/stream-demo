# History REST api
The `/history` REST API provides up to a 2-day lookup history of all streamed events in both the `filtered` and `absolute` streams.
It takes 1 requried parameters and 3 optional query parameters:
1. `sym`: `String` (required)
2. `stream`: `String` (enum): values `absolute` or `filtered`. Defaults to `filtered`
3. `start`: `i64` UTC epoch in milliseconds (**inclusive**). Defaults to midnight UTC (`00:00+0:00`) today
4. `end`: `i64` UTC epoch milliseconds (**exclusive**). Defaults to now

Example API call:

```sh
curl -H 'Authorization: Bearer <REDACTED>'  \
  'https://stream.spotgamma.com/history?sym=SPX&start=1693886400000&end=1693972799999&stream=absolute' -o- > 
  /tmp/spx.mp
```

Output is the same tuple structure as in the `stream` websocket API, but in one flat array or vector encoded in Messagepack format.

For example:
```sh
msgpack2json < /tmp/spx.mp | jq . | head -40
[
  [
    "SPX",
    1696392009047,
    -23696.807284663595,
    -1231.8660886464766,
    -106701.97455140528,
    4214.108910891089,
    "7285948200047870003",
    1696449600000,
    4290,
    48,
    ".SPXW231004C4290"
  ],
  [
    "SPX",
    1696392022690,
    -223024.91058721516,
    -3957.219741498195,
    -374487.26834143494,
    4214.1,
    "7285948258579382305",
    1696449600000,
    4225,
    48,
    ".SPXW231004C4225"
  ],
  [
    "SPX",
    1696392022691,
    -223024.91058721516,
    -3957.219741498195,
    -374487.26834143494,
    4214.1,
    "7285948258583576611",
    1696449600000,
    4225,
    48,
    ".SPXW231004C4225"
  ],
```

