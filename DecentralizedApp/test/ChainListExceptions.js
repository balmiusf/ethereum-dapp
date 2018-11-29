var ChainList = artifacts.require("./ChainList.sol");

contract("ChainList", function(accounts){
  var chainListInstance;
  var seller = accounts[1];
  var buyer = accounts[2];
  var articleName = "foobar";
  var articleDescription = "foobar description";
  var articlePrice = 1;


  it("should throw exception when trying to buy an article when there is no article for sale", function() {
    return ChainList.deployed().then(function(instance) {
      chainListInstance = instance;
      return chainListInstance.buyArticle(1, {
        from: buyer,
        value: web3.toWei(articlePrice, "ether")
      });
    }).then(assert.fail)    // should throw an exception on eror message
    .catch(function(error) {
      assert(true);   // if it reach this point, then an exception was throw and is true
    }).then(function() {
      return chainListInstance.getNumberOfArticles();
    }).then(function(data) {
      assert.equal(data.toNumber(), 0, " number of articles must be 0");
    });
  });

  // buy an article that does not exist
  it("should throw an exception if the buyer tries to buy an article that does not exist", function(){
    return ChainList.deployed().then(function(instance) {
      chainListInstance = instance;
      return chainListInstance.sellArticle(
        articleName,
        articleDescription,
        web3.toWei(articlePrice, "ether"),
        {from: seller})
    }).then(function(receipt){
      return chainListInstance.buyArticle(2, {
        from: seller,
        value: web3.toWei(articlePrice, "ether")
      }).then(assert.fail)
      .catch(function(error){
        assert(true);
      }).then(function() {
        return chainListInstance.articles(1);
      }).then(function(data){
        assert.equal(data[0].toNumber(), 1, "article id must be 1");
        assert.equal(data[1], seller, "seller must be " + seller);
        assert.equal(data[2], 0x0, "buyer must be 0x0");
        assert.equal(data[3], articleName, "article name must be " +articleName);
        assert.equal(data[4], articleDescription, "article description must be "+ articleDescription);
        assert.equal(data[5].toNumber(), web3.toWei(articlePrice, "ether"), "article price must be "+articlePrice);
      })
    });
  });

  // buyer is seller
  it("should throw an exception if the buyer of the article is also the seller", function(){
    return ChainList.deployed().then(function(instance) {
      chainListInstance = instance;
      return chainListInstance.buyArticle(1, {
        from: seller,
        value: web3.toWei(articlePrice, "ether")});
      }).then(assert.fail)
      .catch(function(error) {
        assert(true);
      }).then(function() {
        return chainListInstance.articles(1)
      }).then(function(data) {
        assert.equal(data[0].toNumber(), 1, "article id must be 1");
        assert.equal(data[1], seller, "seller must be " + seller);
        assert.equal(data[2], 0x0, "article buyer must be empty");
        assert.equal(data[3], articleName, "article name must be " + articleName);
        assert.equal(data[4],articleDescription, "article description must be " + articleDescription);
        assert.equal(data[5].toNumber(), web3.toWei(articlePrice, "ether"), "article price must be " + web3.toWei(articlePrice, "ether"));
    });
  });

  // stated price does not match the value that was sent
  it("should throw an exception if buy price is incorrect", function(){
    return ChainList.deployed().then(function(instance) {
      chainListInstance = instance;
      return chainListInstance.buyArticle(1, {
        from: buyer,
        value: web3.toWei(articlePrice + 1, "ether")});
      }).then(assert.fail)
      .catch(function(error) {
        assert(true);
      }).then(function() {
        return chainListInstance.articles(1);
      }).then(function(data) {
        assert.equal(data[0].toNumber(), 1, "article id must be 1");
        assert.equal(data[1], seller, "seller must be " + seller);
        assert.equal(data[2], 0x0, "article buyer must be empty");
        assert.equal(data[3], articleName, "article name must be " + articleName);
        assert.equal(data[4], articleDescription, "article description must be " + articleDescription);
        assert.equal(data[5].toNumber(), web3.toWei(articlePrice, "ether"), "article price must be " + web3.toWei(articlePrice, "ether"));
      });
    });

  // article has already been sold -> buy then try to buy again
  it("should throw an exception when trying to buy an article that was already been sold", function(){
    return ChainList.deployed().then(function(instance) {
      chainListInstance = instance;
      return chainListInstance.buyArticle(1, {
        from: buyer,
        value: web3.toWei(articlePrice, "ether")});
      }).then(function() {
        return chainListInstance.buyArticle(1, {
          from: web3.eth.accounts[0],
          value: web3.toWei(articlePrice, "ether")});
      }).then(assert.fail)
      .catch(function(error) {
        assert(true);
      }).then(function() {
        return chainListInstance.articles(1);
      }).then(function(data) {
        assert.equal(data[0].toNumber(), 1, "article id must be 1");
        assert.equal(data[1], seller, "seller must be " + seller);
        assert.equal(data[2], buyer, "article buyer must be " + buyer);
        assert.equal(data[3], articleName, "article name must be " + articleName);
        assert.equal(data[4],articleDescription, "article description must be " + articleDescription);
        assert.equal(data[5].toNumber(), web3.toWei(articlePrice, "ether"), "article price must be " + web3.toWei(articlePrice, "ether"));
      });
    });
});
