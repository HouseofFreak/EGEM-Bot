#!/usr/bin/env ruby
require 'discordrb'
require 'httparty'

config  = JSON.parse(File.read("token.json"))
cars  = JSON.parse(File.read("data/cars.json"))

token = config["discord-token"]
bot = Discordrb::Bot.new token: "#{token}"

lambo = cars["lambo"].to_f
bot.message(with_text: ['/lambo', '/Lambo']) do |event|
btcprice = HTTParty.get("https://api.coinmarketcap.com/v1/ticker/bitcoin", :verify => false )
grav = HTTParty.get("https://graviex.net/api/v2/tickers/egembtc.json", :verify => false )
last = grav['ticker']['last'].to_f
btcp = btcprice[0]['price_usd'].to_f
pAvg = btcp * last
total = lambo / pAvg
pAvg2 = pAvg.round(4)
total2 = total.round(2)
event.respond "You need #{total2} EGEM at the current price of $ #{pAvg2} USD to get a Lamborghini Aventador, Vroom Vroooom!"
end

bugatti = cars["bugatti"].to_f
bot.message(with_text: ['/bugatti', '/Bugatti']) do |event|
btcprice = HTTParty.get("https://api.coinmarketcap.com/v1/ticker/bitcoin", :verify => false )
grav = HTTParty.get("https://graviex.net/api/v2/tickers/egembtc.json", :verify => false )
last = grav['ticker']['last'].to_f
btcp = btcprice[0]['price_usd'].to_f
pAvg = btcp * last
total = bugatti / pAvg
pAvg2 = pAvg.round(4)
total2 = total.round(2)
event.respond "You need #{total2} EGEM at the current price of $ #{pAvg2} USD to get a Bugatti Veyron, Vroom Vroooom!"
end

tesla = cars["tesla"].to_f
bot.message(with_text: ['/tesla', '/Tesla']) do |event|
btcprice = HTTParty.get("https://api.coinmarketcap.com/v1/ticker/bitcoin", :verify => false )
grav = HTTParty.get("https://graviex.net/api/v2/tickers/egembtc.json", :verify => false )
last = grav['ticker']['last'].to_f
btcp = btcprice[0]['price_usd'].to_f
pAvg = btcp * last
total = tesla / pAvg
pAvg2 = pAvg.round(4)
total2 = total.round(2)
event.respond "You need #{total2} EGEM at the current price of $ #{pAvg2} USD to get a Tesla Model X, Fshhhhhhhhhh Weeeeeee!"
end

prius = cars["prius"].to_f
bot.message(with_text: ['/prius', '/Prius']) do |event|
btcprice = HTTParty.get("https://api.coinmarketcap.com/v1/ticker/bitcoin", :verify => false )
grav = HTTParty.get("https://graviex.net/api/v2/tickers/egembtc.json", :verify => false )
last = grav['ticker']['last'].to_f
btcp = btcprice[0]['price_usd'].to_f
pAvg = btcp * last
total = prius / pAvg
pAvg2 = pAvg.round(4)
total2 = total.round(2)
event.respond "You need #{total2} EGEM at the current price of $ #{pAvg2} USD to get a Toyota Prius V, Vroom Vroooom!"
end

subaru = cars["subaru"].to_f
bot.message(with_text: ['/subaru', '/Subaru']) do |event|
btcprice = HTTParty.get("https://api.coinmarketcap.com/v1/ticker/bitcoin", :verify => false )
grav = HTTParty.get("https://graviex.net/api/v2/tickers/egembtc.json", :verify => false )
last = grav['ticker']['last'].to_f
btcp = btcprice[0]['price_usd'].to_f
pAvg = btcp * last
total = subaru / pAvg
pAvg2 = pAvg.round(4)
total2 = total.round(2)
event.respond "You need #{total2} EGEM at the current price of $ #{pAvg2} USD to get a Subaru WRX STI, Vroom Vroooom!"
end

porsche = cars["porsche"].to_f
bot.message(with_text: ['/porsche', '/Porsche']) do |event|
btcprice = HTTParty.get("https://api.coinmarketcap.com/v1/ticker/bitcoin", :verify => false )
grav = HTTParty.get("https://graviex.net/api/v2/tickers/egembtc.json", :verify => false )
last = grav['ticker']['last'].to_f
btcp = btcprice[0]['price_usd'].to_f
pAvg = btcp * last
total = porsche / pAvg
pAvg2 = pAvg.round(4)
total2 = total.round(2)
event.respond "You need #{total2} EGEM at the current price of $ #{pAvg2} USD to get a Porsche 911, Vroom Vroooom!"
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
pAvg2 = pAvg.round(4)
mcap2 = mcap.round(2)

event.respond "```
***Coin Status***
----------
Name: EtherGem https://egem.io
Ticker: EGEM
Block Height: #{block_h}
Supply: #{supply} EGEM
Marketcap: $ #{mcap2} USD
Price Avg: $ #{pAvg2} USD
----------
```"
end

bot.message(with_text: ['/graviex', '/Graviex']) do |event|
grav = HTTParty.get("https://graviex.net/api/v2/tickers/egembtc.json", :verify => false )

last2 = grav['ticker']['last'].round(8)
vol = grav['ticker']['vol'].round(2)
volbtc = grav['ticker']['volbtc'].round(8)
change = grav['ticker']['change']

event.respond "```

***Graviex Exchange***
----------
Price: #{last2} BTC
Change: #{change}
24 Volume: #{vol} EGEM
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
