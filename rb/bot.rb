#!/usr/bin/env ruby
require 'discordrb'
require 'httparty'

config  = JSON.parse(File.read("token.json"))

token = config["discord-token"]
bot = Discordrb::Bot.new token: "#{token}"

cars  = JSON.parse(File.read("data/cars.json"))
lambo = cars["lambo"].to_f
bugatti = cars["bugatti"].to_f
tesla = cars["tesla"].to_f
prius = cars["prius"].to_f
subaru = cars["subaru"].to_f
porsche = cars["porsche"].to_f


bot.message(with_text: ['/lambo', '/Lambo']) do |event|
btcprice = HTTParty.get("https://api.coinmarketcap.com/v1/ticker/bitcoin", :verify => false )
grav = HTTParty.get("https://graviex.net/api/v2/tickers/egembtc.json", :verify => false )

last = grav['ticker']['last'].to_f
btcp = btcprice[0]['price_usd'].to_f
pAvg = btcp * last

total = pAvg / lambo

event.respond "
You need #{total} EGEM at the current price of #{pAvg} USD to get a Lamborghini Aventador, Vroom Vroooom!
"
end

bot.message(with_text: ['/coin', '/Coin']) do |event|
grav = HTTParty.get("https://graviex.net/api/v2/tickers/egembtc.json", :verify => false )
btcprice = HTTParty.get("https://api.coinmarketcap.com/v1/ticker/bitcoin", :verify => false )
block_height = HTTParty.get("http://pool.egem.io/api/stats")

buy = grav['ticker']['buy']
sell = grav['ticker']['sell']
low = grav['ticker']['low']
high = grav['ticker']['high']
last = grav['ticker']['last'].to_f
last2 = grav['ticker']['last']
vol = grav['ticker']['vol']
volbtc = grav['ticker']['volbtc']
change = grav['ticker']['change']

block_h = block_height['nodes'][1]['height']
supply = (block_h.to_i - 5000)*9

btcp = btcprice[0]['price_usd'].to_f
pAvg = btcp * last
mcap = pAvg * supply

event.respond "```
***Coin Status***
----------
Name: EtherGem https://egem.io
Ticker: EGEM
Block Height: #{block_h}
Supply: #{supply} EGEM
Marketcap: $ #{mcap} USD
Price Avg: $ #{pAvg} USD
----------
```"
end

bot.message(with_text: ['/graviex', '/Graviex']) do |event|
grav = HTTParty.get("https://graviex.net/api/v2/tickers/egembtc.json", :verify => false )

buy = grav['ticker']['buy']
sell = grav['ticker']['sell']
low = grav['ticker']['low']
high = grav['ticker']['high']
last = grav['ticker']['last'].to_f
last2 = grav['ticker']['last']
vol = grav['ticker']['vol']
volbtc = grav['ticker']['volbtc']
change = grav['ticker']['change']

event.respond "```

***Graviex Exchange***
----------
Price: #{last2} BTC
Change: #{change}
EGEM Volume: #{vol}
BTC Volume: #{volbtc}
----------
```"
end

bot.message(with_text: ['/btsx', '/Btsx']) do |event|

response2 = HTTParty.get("https://cryptofresh.com/api/asset/markets?asset=EGEM", :verify => false )

openbtclast = response2['OPEN.BTC']['price'] * 10**8
openbtc24 = response2['OPEN.BTC']['volume24']
bridgebtclast = response2['BRIDGE.BTC']['price'] * 10**8
bridgebtc24 = response2['BRIDGE.BTC']['volume24']
shieldbtclast = response2['BRIDGE.XSH']['price']
shieldbtc24 = response2['BRIDGE.XSH']['volume24']
btslast = response2['BTS']['price']
bts24 = response2['BTS']['volume24']

event.respond "```

***Bitshares Exchange***
----------
open.BTC: #{openbtclast} sats
24h Vol: #{openbtc24} BTC
----------
bridge.BTC: #{bridgebtclast} sats
24h Vol: #{bridgebtc24} BTC
----------
bridge.XSH: #{shieldbtclast}
24h Vol: #{shieldbtc24} XSH
---------
BTS: #{btslast}
24h Vol: #{bts24} BTS
```"
end

bot.run
