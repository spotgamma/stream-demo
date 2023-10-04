# Manifest API
The `/manifest` REST API provides the *current* list of all supported underlyings as well as the "aggregate combination symbols" structure.
This represents the composite view that the aggregatee symbol is composeed of.
It takes no query parameters.  Output is a JSON object in the following format:

```sh
curl -H 'Authorization: Bearer <REDACTED>'  'https://stream.spotgamma.com/manifest' -o- | jq . 
{
  "underlyings": [
    "/ESH24:XCME",
    ...,
    "/ESZ27:XCME",
    "A",
    "AA",
    "AAC",
    "AADI",
    "AAIC",
    "AAL",
    "AAN",
    "AAOI",
    "AAON",
    "AAP",
    "AAPB",
    "AAPD",
    "AAPL",
    ...
  ],
  "combos": [
    {
      "combo": "S&P 500",
      "shard": 0,
      "symbols": [
        "S&P ES=F",
        "SPX",
        "SPY",
        "XSP"
      ],
      "price_sym": "SPX"
    },
    {
      "combo": "S&P ES=F",
      "shard": 0,
      "symbols": [
        "/ESZ23:XCME",
        "/ESH24:XCME",
        "/ESM24:XCME",
        "/ESU24:XCME",
        "/ESZ24:XCME",
        "/ESH25:XCME",
        "/ESM25:XCME",
        "/ESU25:XCME",
        "/ESZ25:XCME",
        "/ESH26:XCME",
        "/ESZ26:XCME",
        "/ESH27:XCME",
        "/ESZ27:XCME",
        "/ESH28:XCME"
      ],
      "price_sym": "/ESZ23:XCME"
    },
    {
      "combo": "Nasdaq",
      "shard": 1,
      "symbols": [
        "NDX",
        "QQQ"
      ],
      "price_sym": "NDX"
    },
    {
      "combo": "Russell 2k",
      "shard": 2,
      "symbols": [
        "IWM",
        "RUT"
      ],
      "price_sym": "RUT"
    }
  ]
}
```
