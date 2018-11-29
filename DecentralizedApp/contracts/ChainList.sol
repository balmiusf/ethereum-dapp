pragma solidity ^0.4.18;

contract ChainList
{
  address seller;
  address buyer;
  string name;
  string description;
  uint256 price;

  // events

  event logSellArticle(
    address indexed _seller,
    string _name,
    uint256 _price
    );

  event logBuyArticle(
    address indexed _seller,
    address indexed _buyer,
    string _name,
    uint256 _price
    );

  function sellArticle(
    string _name,
    string _description,
    uint256 _price) public
  {
    seller = msg.sender;
    name = _name;
    description = _description;
    price = _price;

    logSellArticle(seller, name, price);
  }

  function buyArticle() payable public {

    // seller not null
    require(seller != 0x0);

    // buyer not null
    require(buyer == 0x0);

    // seller cant be buyer
    require(seller != msg.sender);

    // amount being send equals to article price
    require(msg.value == price);

    // update buyer field
    buyer = msg.sender;

    // transfer value to seller
    seller.transfer(msg.value);

    // trigger event to log
    logBuyArticle(seller, buyer, name, price);
  }

  function getArticle() public view returns (
    address _seller,
    address _buyer,
    string _name,
    string _description,
    uint256 _price)
  {
    return(seller, buyer, name, description, price);
  }
}
