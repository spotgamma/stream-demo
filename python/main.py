import base64
import json
import msgpack
import sys
import os
from urllib.request import Request, urlopen
from websockets.sync.client import connect

# Stream types
FILTERED = 1  # Sends filtered results where a side is determined
ABSOLUTE = 2  # Sends *all* TimeAndSales with all positive greeks.

TNS_TYPE_MASK = 0x6
SIDE_TYPE_MASK = 0x18
IS_NEXT_EXP_MASK = 0x20
IS_RETAIL_MASK = 0x40
IS_BLOCK_MASK = 0x80
IS_SPREAD_MASK = 0x100

# Provide the USER and PASSWORD in environment variables
user = (os.getenv("USER") or "").encode("ascii")
password = (os.getenv("PASSWORD") or "").encode("ascii")

# Authenticate with https://stream.spotgamma.com/auth
req = Request("https://stream.spotgamma.com/auth")
ascii_auth = base64.b64encode(b"%s:%s" % (user, password)).decode("ascii")
req.add_header("Authorization", f"Basic {ascii_auth}")
token = urlopen(req).read().decode("ascii")

subscription = json.dumps(
    {
        "action": "subscribe",
        "stream_types": FILTERED,  # Filtered only
        "underlyings": ["/ESU23:XCME", "SPY", "AAPL", "TSLA"],
    }
)

TYPE_STRS = [
    "n",  # new
    "r",  # correction
    "c",  # cancel
    "",  # ERROR: This is an unexpected value
]


def type_to_string(tns_type):
    return TYPE_STRS[tns_type]


SIDE_STRS = [
    "u",  # undefined
    "b",  # buy
    "s",  # sell
    "",  # ERROR: This is an unexpected value
]


def side_to_string(side_idx):
    return SIDE_STRS[side_idx]


def parse_flags(flags):
    option_type = "P" if (flags & 0x1) else "C"
    tns_type = type_to_string((flags & TNS_TYPE_MASK) >> 1)
    side_type = side_to_string((flags & SIDE_TYPE_MASK) >> 3)
    is_next_exp = (flags & IS_NEXT_EXP_MASK) > 0
    is_retail = (flags & IS_RETAIL_MASK) > 0
    is_block = (flags & IS_BLOCK_MASK) > 0
    is_spread = (flags & IS_SPREAD_MASK) > 0
    return (
        option_type,
        tns_type,
        side_type,
        is_next_exp,
        is_retail,
        is_block,
        is_spread,
    )


print(subscription, file=sys.stderr)
with connect(f"wss://stream.spotgamma.com/stream?token={token}") as ws:
    ws.send(subscription)
    msg = ws.recv()
    while True:
        if type(msg) is bytes:
            (stream_type, signal) = msgpack.unpackb(msg, use_list=False)
            (underlying, timestamp, delta, gamma, vega, price, tns_id, flags) = signal
            (
                option_type,
                tns_type,
                side,
                is_next_exp,
                is_retail,
                is_block,
                is_spread,
            ) = parse_flags(flags)
            if stream_type == FILTERED:
                print(
                    "%s,%d,%f,%f,%f,%f,%d,%s,%s,%s,%d,%d,%d,%d"
                    % (
                        underlying,
                        timestamp,
                        delta,
                        gamma,
                        vega,
                        price,
                        tns_id,
                        option_type,
                        tns_type,
                        side,
                        is_next_exp,
                        is_retail,
                        is_block,
                        is_spread,
                    )
                )
        else:
            print(msg, file=sys.stderr)
        msg = ws.recv()
