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
      return chainListInstance.buyArticle({
        from: buyer,
        value: web3.toWei(articlePrice, "ether")
      });
    }).then(assert.fail)    // should throw an exception on eror message
    .catch(function(error) {
      assert(true);   // if it reach this point, then an exception was throw and is true
    }).then(function() {
      return chainListInstance.getArticle();
    }).then(function(data) {
      assert.equal(data[0], 0x0, " article seller must be empty");
      assert.equal(data[1], 0x0, "article buyer must be empty");
      assert.equal(data[2], "", "article name must be empty");
      assert.equal(data[3], "", "article description must be empty");
      assert.equal(data[4].toNumber(), 0, "article price must be empty");
    });
  });

  // buyer is seller
  it("should throw an exception if the buyer of the article is also the seller", function(){
    return ChainList.deployed().then(function(instance) {
      chainListInstance = instance;
      return chainListInstance.sellArticle(articleName, articleDescription, web3.toWei(articlePrice, "ether"), {
        from: seller
      }).then(function(receipt) {
          return chainListInstance.buyArticle({
            from: seller,
            value: web3.toWei(articlePrice, "ether")
          }).then(assert.fail)
          .catch(function(error) {
            assert(true);
          }).then(function() {
            return chainListInstance.getArticle()
          }).then(function(data) {
            assert.equal(data[0], seller, "article seller must be " + seller);
            assert.equal(data[1], 0x0, "article buyer must be empty");
            assert.equal(data[2], articleName, "article name must be " + articleName);
            assert.equal(data[3],articleDescription, "article description must be " + articleDescription);
            assert.equal(data[4].toNumber(), web3.toWei(articlePrice, "ether"), "article price must be " + web3.toWei(articlePrice, "ether"));
          });
      });
    });
  });

  // stated price does not match the value that was sent
  it("should throw an exception if buy price is incorrect", function(){
    return ChainList.deployed().then(function(instance) {
      chainListInstance = instance;
      return chainListInstance.buyArticle({
        from: buyer,
        value: web3.toWei(articlePrice - 1, "ether")
      }).then(assert.fail)
      .catch(function(error) {
        assert(true);
      }).then(function() {
        return chainListInstance.getArticle()
      }).then(function(data) {
        assert.equal(data[0], seller, "article seller must be " + seller);
        assert.equal(data[1], 0x0, "article buyer must be empty");
        assert.equal(data[2], articleName, "article name must be " + articleName);
        assert.equal(data[3],articleDescription, "article description must be " + articleDescription);
        assert.equal(data[4].toNumber(), web3.toWei(articlePrice, "ether"), "article price must be " + web3.toWei(articlePrice, "ether"));
      });
    });
  });

  // article has already been sold -> buy then try to buy again
  it("should throw an exception when trying to buy an article that was already been sold", function(){
    return ChainList.deployed().then(function(instance) {
      chainListInstance = instance;
      return chainListInstance.buyArticle({
        from: buyer,
        value: web3.toWei(articlePrice, "ether")
        }).then(function() {
          return chainListInstance.buyArticle({
            from: buyer,
            value: web3.toWei(articlePrice, "ether")
        }).then(assert.fail)
        .catch(function(error) {
          assert(true);
        }).then(function() {
          return chainListInstance.getArticle()
        }).then(function(data) {
          assert.equal(data[0], seller, "article seller must be " + seller);
          assert.equal(data[1], buyer, "article buyer must be " + buyer);
          assert.equal(data[2], articleName, "article name must be " + articleName);
          assert.equal(data[3],articleDescription, "article description must be " + articleDescription);
          assert.equal(data[4].toNumber(), web3.toWei(articlePrice, "ether"), "article price must be " + web3.toWei(articlePrice, "ether"));
        });
      });
    });
  });

  
});
