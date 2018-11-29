var ChainList = artifacts.require("./ChainList.sol");


contract('ChainList', function(accounts)
{
  var chainListInstance;
  var seller = accounts[1];
  var buyer = accounts[2];
  var articleName1 = "foo";
  var articleDescription1 = "Classic description";
  var articlePrice1 = 1;

  var articleName2 = "bar";
  var articleDescription2 = "Classic description 2";
  var articlePrice2 = 2;
  var sellerBalanceBeforeBuy, sellerBalanceAfterBuy;
  var buyerBalanceBeforeBuy, buyerBalanceAfterBuy;

  it("should be init with empty values", function()
  {
    return ChainList.deployed().then(function(instance)
    {
      chainListInstance = instance;
      return instance.getNumberOfArticles();
    }).then(function(data)
    {
      assert.equal(data.toNumber(), 0, " number of articles should be 0");
      return chainListInstance.getArticlesForSale();
    }).then(function(data) {
      assert.equal(data.length, 0, " there shouldnt be articles for sale");
    });
  });

  it("should sell a first article", function()
  {
    return ChainList.deployed().then(function(instance)
    {
      chainListInstance = instance;
      return chainListInstance.sellArticle(
        articleName1,
        articleDescription1,
        web3.toWei(articlePrice1, "ether"),
        {from: seller}); // seller must be specified as this generates a transaction and someone must pay for it
    }).then(function(receipt)
    {
      assert.equal(receipt.logs.length, 1, "one event should have triggered");
      assert.equal(receipt.logs[0].event, "logSellArticle", "event should be logSellArticle");
      assert.equal(receipt.logs[0].args._id.toNumber(), 1, "id must be 1");
      assert.equal(receipt.logs[0].args._seller, seller, "event seller must be " + seller);
      assert.equal(receipt.logs[0].args._name, articleName1, "event name must be " + articleName1);
      assert.equal(receipt.logs[0].args._price.toNumber(), web3.toWei(articlePrice1, "ether"), "event price must be " +  web3.toWei(articlePrice1, "ether"));

      return chainListInstance.getNumberOfArticles();
    }).then(function(data){
      assert.equal(data, 1, "article counter must be 1");

      return chainListInstance.getArticlesForSale();
    }).then(function(data) {
      assert.equal(data.length, 1, "there must be 1 article for sale");
      assert.equal(data[0].toNumber(), 1, "article id must be 1");

      return chainListInstance.articles(data[0]);
    }).then(function(data) {
      assert.equal(data[0].toNumber(), 1, "article id must be 1");
      assert.equal(data[1], seller, "seller must be " + seller);
      assert.equal(data[2], 0x0, "buyer must be 0x0");
      assert.equal(data[3], articleName1, "article name must be " + articleName1);
      assert.equal(data[4], articleDescription1, "article description must be " + articleDescription1);
      assert.equal(data[5].toNumber(), web3.toWei(articlePrice1, "ether"), "article price must be "+articlePrice1);
    });
  });

  it("should sell a second article", function()
  {
    return ChainList.deployed().then(function(instance)
    {
      chainListInstance = instance;
      return chainListInstance.sellArticle(
        articleName2,
        articleDescription2,
        web3.toWei(articlePrice2, "ether"),
        {from: seller}); // seller must be specified as this generates a transaction and someone must pay for it
    }).then(function(receipt)
    {
      assert.equal(receipt.logs.length, 1, "one event should have triggered");
      assert.equal(receipt.logs[0].event, "logSellArticle", "event should be logSellArticle");
      assert.equal(receipt.logs[0].args._id.toNumber(), 2, "id must be 2");
      assert.equal(receipt.logs[0].args._seller, seller, "event seller must be " + seller);
      assert.equal(receipt.logs[0].args._name, articleName2, "event name must be " + articleName2);
      assert.equal(receipt.logs[0].args._price.toNumber(), web3.toWei(articlePrice2, "ether"), "event price must be " +  web3.toWei(articlePrice2, "ether"));

      return chainListInstance.getNumberOfArticles();
    }).then(function(data){
      assert.equal(data, 2, "article counter must be 2");

      return chainListInstance.getArticlesForSale();
    }).then(function(data) {
      assert.equal(data.length, 2, "there must be 2 articles for sale");
      assert.equal(data[1].toNumber(), 2, "article id must be 2");

      return chainListInstance.articles(data[1]);
    }).then(function(data) {
      assert.equal(data[0].toNumber(), 2, "article id must be 2");
      assert.equal(data[1], seller, "seller must be " + seller);
      assert.equal(data[2], 0x0, "buyer must be 0x0");
      assert.equal(data[3], articleName2, "article name must be " +articleName2);
      assert.equal(data[4], articleDescription2, "article description must be "+ articleDescription2);
      assert.equal(data[5].toNumber(), web3.toWei(articlePrice2, "ether"), "article price must be "+articlePrice2);
    });
  });

  it("should buy the first article", function(){
    return ChainList.deployed().then(function(instance) {
      chainListInstance = instance;

      // buyer should not be seller
      assert(seller != buyer, " seller must not be buyer");

      // record balances of seller and buyer before the buy
      sellerBalanceBeforeBuy = web3.fromWei(web3.eth.getBalance(seller), "ether").toNumber();
      buyerBalanceBeforeBuy = web3.fromWei(web3.eth.getBalance(buyer), "ether").toNumber();

      return chainListInstance.buyArticle(1, {
        from: buyer,
        value: web3.toWei(articlePrice1, "ether")
      });
    }).then(function(receipt) {
      assert.equal(receipt.logs.length, 1, "one event should have triggered");
      assert.equal(receipt.logs[0].event, "logBuyArticle", "event should be logBuyArticle");
      assert.equal(receipt.logs[0].args._id.toNumber(), 1, "article id must be 1");
      assert.equal(receipt.logs[0].args._seller, seller, "event seller must be " + seller);
      assert.equal(receipt.logs[0].args._buyer, buyer, "event buyer must be " + buyer);
      assert.equal(receipt.logs[0].args._name, articleName1, "event name must be " + articleName1);
      assert.equal(receipt.logs[0].args._price.toNumber(), web3.toWei(articlePrice1, "ether"), "event price must be " +  web3.toWei(articlePrice1, "ether"));

      // record balance of seller and buyer after the buy
      sellerBalanceAfterBuy = web3.fromWei(web3.eth.getBalance(seller), "ether").toNumber();
      buyerBalanceAfterBuy = web3.fromWei(web3.eth.getBalance(buyer), "ether").toNumber();

      // check if balance is correct after buy operation (not to forget the gas)

      assert.equal(sellerBalanceAfterBuy, sellerBalanceBeforeBuy + articlePrice1, "seller should have earned " + articlePrice1 + " ETH ");
      assert(buyerBalanceAfterBuy <= buyerBalanceBeforeBuy - articlePrice1, "buyer should have spent " + articlePrice1 + " ETH");

      return chainListInstance.getArticlesForSale();
    }).then(function(data) {
      assert.equal(data.length, 1, " there should be 1 article for sale");
      assert.equal(data[0].toNumber(), 2, " article with id 2 must be the only article left for sale");

      return chainListInstance.getNumberOfArticles();
    }).then(function(data) {
      assert.equal(data.toNumber(), 2, "there should be still two articles in total");
    });
  });
})
