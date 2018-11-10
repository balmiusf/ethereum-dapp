pragma solidity ^0.4.18; // tell the compiler which version to use

contract Greetings
{
    string message;

    // constructor
    function Greetings() public
    {
      message = "Greetings! ";
    }

    function setGreetings(string _message) public
    {
      message = _message;
    }

    function getGreetings() public view returns (string)
    {
        return message;
    }
}
