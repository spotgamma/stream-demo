const { decode } = require("@msgpack/msgpack");

// BROWSER NOTE: Remove the definition below when running in a browser
const WebSocket = require("ws"); 

const SYMBOLS = ["__FAKE__", "/ESU23:XCME", "SPY", "AAPL", "TSLA"];

const Index = {
  UNDERLYING: 0,
  TIMESTAMP: 1,
  DELTA: 2,
  GAMMA: 3,
  VEGA: 4,
  STOCK_PRICE: 5,
  SEQUENCE_ID: 6,
  FLAGS: 7,
};

const Mask = {
  OPTION_TYPE: 0x1,
  TNS_TYPE: 0x6,
  SIDE_TYPE: 0x18,
  IS_NEXT_EXP: 0x20,
  IS_RETAIL: 0x40,
  IS_BLOCK: 0x80,
  IS_SPREAD: 0x100,
};

TYPE_STRS = [
  "n", // new
  "r", // correction
  "c", // cancel
  "", // ERROR: This is an unexpected value
];

const typeToString = (tns_type) => TYPE_STRS[tns_type];

SIDE_STRS = [
  "u", // undefined
  "b", // buy
  "s", // sell
  "", // ERROR: This is an unexpected value
];

const sideToString = (side_idx) => SIDE_STRS[side_idx];

const parseFlags = (flags) => [
  flags & Mask.OPTION_TYPE ? "P" : "C",
  typeToString((flags & Mask.TNS_TYPE) >> 1),
  sideToString((flags & Mask.SIDE_TYPE) >> 3),
  (flags & Mask.IS_NEXT_EXP) > 0 ? '0' : '1',
  (flags & Mask.IS_RETAIL) > 0 ? '0' : '1',
  (flags & Mask.IS_BLOCK) > 0 ? '0' : '1',
  (flags & Mask.IS_SPREAD) > 0 ? '0' : '1',
];

async function authenticateAndConnect() {
  let token = process.env.TOKEN;
  if (token == null) {
    const user = process.env.USER;
    const pass = process.env.PASSWORD;
    const encodedUserPass = btoa(`${user}:${pass}`);
    const authResult = await fetch("https://stream.spotgamma.com/auth", {
      headers: {
        Authorization: `Basic ${encodedUserPass}`,
      },
    });
    const jwt = await authResult.text();
    token = encodeURIComponent(jwt);
  }
  const socket = new WebSocket(
    `wss://stream.spotgamma.com/stream?token=${token}`
  );
  socket.addEventListener("open", function (_evt) {
    console.log("Websocket connected. Subscribing...");
    const msg = {
      action: "subscribe",
      underlyings: SYMBOLS,
      stream_types: 1, // Listen to filtered streeam
    };
    socket.send(JSON.stringify(msg));
  });

  let numMsgs = 0;
  socket.addEventListener("message", async function (event) {
    const { data } = event;
    if (typeof data === 'string') {
      console.log(typeof data);
      console.warn("Ack from server: ", data);
    } else {
      numMsgs += 1;
      // BROWSER NOTE: In a browser, we'd use the blob.arrayBuffer() function:
      //   i.e. const signalTuple = decode(await data.arrayBuffer());
      const signalTuple = decode(data, {
        useBigInt64: true, // for decoding 64-bit sequence ID's
      });

      const [stream, signal] = signalTuple;
      const flagFields = parseFlags(signal[Index.FLAGS]);
      const csvRow = signal
        .slice(Index.UNDERLYING, Index.SEQUENCE_ID)
        .concat(flagFields)
        .join(",");
      console.log(csvRow);
    }
  });

  setInterval(() => {
    console.warn("Messages received: ", numMsgs);
  }, 10_000);

  socket.addEventListener("error", function (event) {
    console.error("error event:", event);
  });

  socket.addEventListener("close", function (event) {
    console.warn("Socket closed:", event);
  });
}

(async () => {
  await authenticateAndConnect();
})();
