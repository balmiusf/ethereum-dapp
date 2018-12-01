pragma solidity ^0.4.18;

contract Ownable
{

  // vars

  address owner;


  // constructors

  function Ownable()
  {
    owner = msg.sender;
  }

  // modifiers

  modifier onlyOwner()
  {
    require(msg.sender == owner);
    _;
  }

}
