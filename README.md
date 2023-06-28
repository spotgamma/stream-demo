# stream-demo
Demonstrating connecting to the SpotGamma stream.

## Connecting
To connect, you'll first need to acquire a token by authenticating with `https://stream.spotgamma.com/auth` using a SpotGamma-provided username and password.

The stream is hosted over a websocket: `wss://stream.spotgamma.com/stream`.
Pass your authentication token in here as a GET parameter:
```JavaScript
`wss://stream.spotgamma.com/stream?token=${token}`
```

## Subscribing
Once successfully connected, you can subscribe to individual underlying instruments or to all instruments using `*`.

**stream types**:
You can specify the streams to which you'd like to subscribe with the `stream_types` bitamsk.

Possible values: `1` (filtered), `2` (absolute), or `3` (both streams).

**Filtered stream**
```js
ws.send(JSON.stringify({
  action: "subscribe",
  underlyings: ["*"], // listen to all underlyings
  stream_types: 1,    // only listen to the filtered stream
});
```

**Both streams**
```js
ws.send(JSON.stringify({
  action: "subscribe",
  underlyings: ["TSLA", "SPY", "AAPL"], // listen to selected underlyings
  stream_types: 3,                      // listen to both the filtered and "absolute" stream
});
```

## Unsubscribing
Send either an `"unsubscribe"` `action` and specify what you'd like to unsubscribe from or an `"unsusbscribe_all"` `action` for everything:
```js
ws.send(JSON.stringify({
  action: "unsubscribe",
  underlyings: ["TSLA"], // unsubscribe from `TSLA`
  stream_types: 3,       // unsubscribe from both streams
});
```

```js
ws.send(JSON.stringify({
  action: "unsubscribe_all", // unsubscribe everything: All symbols and all streams
});
```

## Messages
Messages come down as [msgpack'd](https://msgpack.org/index.html) tuples of the form:
```JavaScript
[streamType, signal]
```
where `streamType` can be either `1` for the **Filtered** stream or `2` for the **Absolute** stream.

`signal`, here, is itself a tuple of the following format:
```js
[
  underlying, // string
  timestamp,  // 64-bit integer (UTC milliseconds)
  delta,      // double
  gamma,      // double
  vega,       // double
  stockPrice, // double
  sequenceID, // 64-bit integer
  flags,      // unsigned 32-bit integer
]
```

`flags` is a 32-bit bitmask containing auxiliary data in the following format:
```rust
const PUT_MASK: u32      = 0b000000000001; // 0x001 - 0 = call, 1 = put
const TYPE_MASK: u32     = 0b000000000110; // 0x006 - 0 = new, 1 = correction, 2 = cancel
const SIDE_MASK: u32     = 0b000000011000; // 0x018 - 0 = undefined, 1 = buy, 2 = sell
const NEXT_EXP_MASK: u32 = 0b000000100000; // 0x020 - 1 = expires in the "next/nearest expiration"
const RETAIL_MASK: u32   = 0b000001000000; // 0x040 - 1 = is a retail Time & Sale
const BLOCK_MASK: u32    = 0b000010000000; // 0x080 - 1 = is a block trade
const SPREAD_MASK: u32   = 0b000100000000; // 0x100 - 1 = is part of a spread leg
```

## Streams
Currently we support two separate streams of HIRO events: **Filtered** and **Absolute**.
**Filtered**: Runs a proprietary filter on options ***Time and Sale*** events and forms an opinion what "side" the transaction was on as reflected in positive or negative sign of the delta value.

**Absolute**: Filters nothing and lets all **TnS** events through.  An absolute value is applied to all options greeks to reflect that we are taking no opinion on the "side" in relation to a market maker.
