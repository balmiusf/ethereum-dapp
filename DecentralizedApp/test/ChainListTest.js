var ChainList = artifacts.require("./ChainList.sol");


contract('ChainList', function(accounts)
{

  var chainListInstance;
  var seller = accounts[1];
  var articleName = "foobar";
  var articleDescription = "Classic description";
  var articlePrice = 10;

  it("should be init with empty values", function()
  {
    return ChainList.deployed().then(function(instance)
    {
      return instance.getArticle();
    }).then(function(data)
    {
      assert.equal(data[0], 0x0, " article seller must be empty");
      assert.equal(data[1], "", "article name must be empty");
      assert.equal(data[2], "", "article description must be empty");
      assert.equal(data[3].toNumber(), 0, "article price must be empty");
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
      assert.equal(data[1], articleName, "article name must be " + articleName);
      assert.equal(data[2], articleDescription, "article description must be " + articleDescription);
      assert.equal(data[3].toNumber(), web3.toWei(articlePrice,"ether"), "article price must be" +  web3.toWei(articlePrice,"ether"));
    });
  });
});
