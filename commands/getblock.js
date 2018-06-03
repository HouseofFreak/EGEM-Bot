
exports.run = (client, message, args) => {
  let block = args[1];
  web3.eth.getBlock(args[1], (error,result)=>{
    if(!error){
      if(result !== null){
        let phash = result["parentHash"];
        let hash = result["hash"];
        let number = result["number"];
        let timestamp = result["timestamp"];
        let dt = new Date(timestamp*1000);
        let miner = result["miner"];
        let gasUsed = result["gasUsed"];
        let size = result["size"];
        let nonce = result["nonce"];
        let uncles = result["uncles"];
        message.channel.send("Block Lookup Results: \n"
          + "```"
          + "Parent Hash: " + phash + ". \n"
          + "Hash: " + hash + ". \n"
          + "Number: " + number + ". \n"
          + "Timestamp: " + dt + ". \n"
          + "Gas Used: " + gasUsed + ". \n"
          + "Size: " + size + ". \n"
          + "Miner: " + miner + ". \n"
          + "Nonce: " + nonce + ". \n"
          + "```"
        );
      } else {
        message.channel.send("Block result was null, might be a malformed attempt, please double check and retry.");
      }
    } else {
      message.channel.send("Oops, a error occurred with your block lookup try again, its /getblock <number>.");
    }
  })
}