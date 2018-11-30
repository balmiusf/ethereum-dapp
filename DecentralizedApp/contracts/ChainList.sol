pragma solidity ^0.4.18;

import "./Ownable.sol";

// solidity supports multiple inheritance
contract ChainList is Ownable
{
  address owner;

  struct Article {
    uint id;
    address seller;
    address buyer;
    string name;
    string description;
    uint256 price;
  }

   // maps in Solidity cannot be iterated over
   // articleCounter permits to know how many articles in existence
   // Range of keys: [0, articleCounter]
   // a getter will be generated by the compiler, which takes an id (uint)
   // and returns all values of 'article'
   mapping(uint => Article) public articles;
   uint articleCounter;

   // constructor

   // business logic

  function sellArticle(
    string _name,
    string _description,
    uint256 _price) public
  {
    articleCounter++;
    articles[articleCounter] = Article(
      articleCounter,
      msg.sender,
      0x0,
      _name,
      _description,
      _price
      );

    logSellArticle(articleCounter, msg.sender, _name, _price);
  }

  function buyArticle(uint _id) payable public
  {
    // at least one article for sale
    require(articleCounter > 0);

    // check if the article exists
    require(_id > 0 && articleCounter >= _id);

    Article storage article = articles[_id];

    // buyer not null
    require(article.buyer == 0x0);

    // seller cant be buyer
    require(article.seller != msg.sender);

    // amount being send equals to article price
    require(article.price == msg.value);

    // update buyer field
    article.buyer = msg.sender;

    // transfer value to seller
    article.seller.transfer(msg.value);

    // trigger event to log
    logBuyArticle(_id, article.seller, article.buyer, article.name, article.price);
  }

  // getters and setters

  function getNumberOfArticles() public view returns (uint)
  {
    return articleCounter;
  }

  function getArticlesForSale() public view returns (uint[])
  {
    uint[] memory articleIds = new uint[](articleCounter);
    uint numberOfArticlesForSale = 0;

    for(uint i = 1; i <= articleCounter; i++)
    {
      // article still for sale
      if (articles[i].buyer == 0x0)
      {
        articleIds[numberOfArticlesForSale] = articles[i].id;
        numberOfArticlesForSale++;
      }
    }

    if(numberOfArticlesForSale != articleCounter)
    {
      // copy contents of articleIds to a smaller array
      uint[] memory itemsForSale = new uint[](numberOfArticlesForSale);
      for(uint j = 0; j < numberOfArticlesForSale ; j++)
      {
        itemsForSale[j] = articleIds[j];
      }

      return itemsForSale;
    }

    return articleIds;


  }

  // deactivate the contract
  function kill() public onlyOwner
  {
    selfdestruct(owner);
  }

  // events

  event logSellArticle(
    uint indexed _id,
    address indexed _seller,
    string _name,
    uint256 _price
    );

  event logBuyArticle(
    uint indexed _id,
    address indexed _seller,
    address indexed _buyer,
    string _name,
    uint256 _price
    );
}
