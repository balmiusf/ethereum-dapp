var ChainList = artifacts.require("./ChainList.sol");


contract('ChainList', function(accounts)
{
  var chainListInstance;
  var seller = accounts[1];
  var buyer = accounts[2];
  var articleName = "foobar";
  var articleDescription = "Classic description";
  var articlePrice = 1;
  var sellerBalanceBeforeBuy, sellerBalanceAfterBuy;
  var buyerBalanceBeforeBuy, buyerBalanceAfterBuy;

  it("should be init with empty values", function()
  {
    return ChainList.deployed().then(function(instance)
    {
      return instance.getArticle();
    }).then(function(data)
    {
      assert.equal(data[0], 0x0, " article seller must be empty");
      assert.equal(data[1], 0x0, "article buyer must be empty");
      assert.equal(data[2], "", "article name must be empty");
      assert.equal(data[3], "", "article description must be empty");
      assert.equal(data[4].toNumber(), 0, "article price must be empty");
    })
  });

  it("should sell an article", function()
  {
    return ChainList.deployed().then(function(instance)
    {
      chainListInstance = instance;
      return chainListInstance.sellArticle(articleName, articleDescription, web3.toWei(articlePrice, "ether"), {from: seller}); // seller must be specified as this generates a transaction and someone must pay for it
    }).then(function()
    {
      return chainListInstance.getArticle();
    }).then(function(data)
    {
      assert.equal(data[0], seller, " article seller must be " + seller);
      assert.equal(data[1], 0x0, " article buer must be 0x0");
      assert.equal(data[2], articleName, "article name must be " + articleName);
      assert.equal(data[3], articleDescription, "article description must be " + articleDescription);
      assert.equal(data[4].toNumber(), web3.toWei(articlePrice,"ether"), "article price must be" +  web3.toWei(articlePrice,"ether"));
    });
  });

  it("should buy an article", function(){
    return ChainList.deployed().then(function(instance) {
      chainListInstance = instance;

      // buyer should not be seller
      assert(seller != buyer, " seller must not be buyer");

      // record balances of seller and buyer before the buy
      sellerBalanceBeforeBuy = web3.fromWei(web3.eth.getBalance(seller), "ether").toNumber();
      buyerBalanceBeforeBuy = web3.fromWei(web3.eth.getBalance(buyer), "ether").toNumber();

      return chainListInstance.buyArticle({
        from: buyer,
        value: web3.toWei(articlePrice, "ether")
      });
    }).then(function(receipt) {
      assert.equal(receipt.logs.length, 1, "one event should have triggered");
      assert.equal(receipt.logs[0].event, "logBuyArticle", "event should be logBuyArticle");
      assert.equal(receipt.logs[0].args._seller, seller, "event seller must be " + seller);
      assert.equal(receipt.logs[0].args._buyer, buyer, "event buyer must be " + buyer);
      assert.equal(receipt.logs[0].args._name, articleName, "event name must be " + articleName);
      assert.equal(receipt.logs[0].args._price.toNumber(), web3.toWei(articlePrice, "ether"), "event price must be " +  web3.toWei(articlePrice, "ether"));

      // record balance of seller and buyer after the buy
      sellerBalanceAfterBuy = web3.fromWei(web3.eth.getBalance(seller), "ether").toNumber();
      buyerBalanceAfterBuy = web3.fromWei(web3.eth.getBalance(buyer), "ether").toNumber();

      // check if balance is correct after buy operation (not to forget the gas)

      assert.equal(sellerBalanceAfterBuy, sellerBalanceBeforeBuy + articlePrice, "seller should have earned " + articlePrice + " ETH ");
      assert(buyerBalanceAfterBuy <= buyerBalanceBeforeBuy - articlePrice, "buyer should have spent " + articlePrice + " ETH");

      return chainListInstance.getArticle();
    }).then(function(data) {
      assert.equal(data[0], seller, " article seller must be " + seller);
      assert.equal(data[1], buyer, " article buyer must be " + buyer);
      assert.equal(data[2], articleName, "article name must be " + articleName);
      assert.equal(data[3], articleDescription, "article description must be " + articleDescription);
      assert.equal(data[4].toNumber(), web3.toWei(articlePrice,"ether"), "article price must be" +  web3.toWei(articlePrice,"ether"));
    });
  });

  it("should trigger an event when a new article is sold", function(){
    return ChainList.deployed().then(function(instance) {
      chainListInstance = instance;
      return chainListInstance.sellArticle(articleName, articleDescription, web3.toWei(articlePrice, "ether"), {from: seller});
    }).then(function(receipt) {
      assert.equal(receipt.logs.length, 1, "one event should have triggered");
      assert.equal(receipt.logs[0].event, "logSellArticle", "event should be logSellArticle");
      assert.equal(receipt.logs[0].args._seller, seller, "event seller must be " + seller);
      assert.equal(receipt.logs[0].args._name, articleName, "event name must be " + articleName);
      assert.equal(receipt.logs[0].args._price.toNumber(), web3.toWei(articlePrice, "ether"), "event price must be " +  web3.toWei(articlePrice, "ether"));
    });
  });
})
