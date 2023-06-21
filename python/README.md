# Python example

External library dependencies
* asyncio
* websockets
* msgpack

## Installing prerequisites:
```
pip3 install asyncio websockets msgpack
```

## Running and appending CSV output to a file
```bash
USER="username" PASSWORD="password" python3 main.py >> data.csv
```

## Example output:
```csv
/ESU23:XCME,1687307930989,-39920.073259,1398.399710,384320.568424,4436.923077,7246932381779623944,P,n,b,0,1,0,0
/ESU23:XCME,1687307935628,26528.020875,-831.536781,-214643.016525,4436.923077,7246932401740316678,P,n,s,0,1,0,0
/ESU23:XCME,1687307935629,279288.098492,-13739.212874,-1452758.531042,4436.923077,7246932401744510996,P,n,s,1,1,0,0
```

### The CSV columns are as follows
```
underlying,timestamp,delta,gamma,vega,stock_price,sequence_id,option_type,tns_type,side,is_next_expiration,is_retail,is_block,is_spread
```

### Explanation of fields generated in the above CSV:
* **`underlying`**: The underlying instrument for the given option's T&S (Time and Sale)
* **`timestamp`**: The timestamp of the T&S
* **`sequence_id`**: Unique identifier for the option instrument traded
* **`option_type`**: `P`: 'put', `C`: 'call'
* **`tns_type`**: TimeAndSale transaction type: `n`: 'new', `r`: 'correction', `c`: 'cancellation'
* **`side`**: `b`: 'buy', `s`: 'sell', `u`: 'unknown'
* **`is_next_expiration`**: whether the option traded has an expiration that is the next to expire
* **`is_block`**:  Whether or not the trade was part of a block trade
* **`is_spread`**: Whether or not the option traded for this TimeAndSale was part of a spread leg
