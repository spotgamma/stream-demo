# stream-demo
Demonstrating connecting to the SpotGamma stream.

## Connecting
To connect, you'll first need a token by authenticating with `https://stream.spotgamma.com/auth` using a SpotGamma-provided username and password.

The stream is hosted over a websocket: `wss://stream.spotgamma.com/stream`.
Pass your authentication token in here as a GET parameter:
```JavaScript
`wss://stream.spotgamma.com/stream?token=${token}`
```

## Subscribing
Once successfully connected, you can subscribe to individual underlying instruments or to all instruments using `*`.
e.g.

**Filtered stream**
```JavaScript
ws.send(JSON.stringify({
  action: "subscribe",
  underlyings: ["*"], // listen to all underlyings
  stream_types: 1,    // only listen to the filtered stream
});
```

**Both streams**
```JavaScript
ws.send(JSON.stringify({
  action: "subscribe",
  underlyings: ["TSLA", "SPY", "AAPL"], // listen to selected underlyings
  stream_types: 3,                      // listen to both the filtered and "absolute" stream
});
```

## Messages
Messages come down as [msgpack'd](https://msgpack.org/index.html) tuples of the form:
```JavaScript
[streamType, [underlying, timestamp, delta, gamma, vega, stockPrice, sequenceID, flags]]
```

`flags` is a 32-bit bitmask containing auxiliary data in the following format:
```rust
const PUT_MASK: u32      = 0b00000000001;
const TYPE_MASK: u32     = 0b00000000110;
const SIDE_MASK: u32     = 0b00000011000;
const NEXT_EXP_MASK: u32 = 0b00000100000;
const RETAIL_MASK: u32   = 0b00001000000;
const BLOCK_MASK: u32    = 0b00010000000;
const SPREAD_MASK: u32   = 0b00100000000;
```
