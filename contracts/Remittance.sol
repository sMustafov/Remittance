pragma solidity ^0.4.16;

import "./Owned.sol";

// Alice wants to send funds to Bob
// Bob wants local currency
// Carol runs an exchange shop
// To successfully withdraw the ether from Alice
// Carol needs to submit two passwords to Alice's Remittance contract
// firstPasswordHash = Alice gave to Carol in an email
// secondPasswordHash = Alice sent to Bob over SMS
// Carol & Bob meet
// Bob gives Carol his password from Alice
// Carol can submit both passwords to Alice's remittance contract
// No one should send their passwords to the blockchain in the clear
// Possibly minus commission - NO COMMISSION

contract Remittance is Owned {

	struct RemittanceStruct {
		address owner; // Alice
    	address exchange; // Carol
    	uint256 deadlineTimestamp; // When can get back if not sent
    	uint256 amount; // How much going to send
  	}
	
	mapping(bytes32 => RemittanceStruct) public remittances;

	event RemittanceCreated(address indexed _from, address indexed _to, uint256 _amount, uint256 _deadline);
    event RemittanceConvertAndSend(address indexed _who, address indexed _to, uint256 _amount);
    event RemittanceRefunded(address indexed _who, uint256 _amount);
    event Killed(address indexed _owner);

	// Alice create remittance
	// Exchange = Carol
	function Remittance(address _recipient, address _exchange, bytes32 _passwordHash, uint256 _deadlineTimestamp) payable public {
		require(_exchange != address(0));
		require(msg.value > 0);

		RemittanceStruct storage remittance = remittances[_passwordHash];
		remittance.owner = msg.sender; // Alice - creator of remittance
		remittance.exchange = _exchange; // Carols - exchange
    	remittance.amount = msg.value; // Ethers she want to send
    	remittance.deadlineTimestamp = _deadlineTimestamp; // After this time Alice can get her ethers back

		RemittanceCreated(remittance.owner, remittance.exchange, remittance.amount, remittance.deadlineTimestamp);
	}

	// Carol Withdraw Alices Ethers 
	// Before Deadline
	function convertAndSend(bytes32 firstPasswordHash, bytes32 secondPasswordHash) public returns (bool) {
		bytes32 password = keccak256(firstPasswordHash, secondPasswordHash);
		RemittanceStruct storage remittance = remittances[password];

		require(block.timestamp <= remittance.deadlineTimestamp);
		require(remittance.amount > 0);
		require(remittance.exchange == msg.sender);

		uint256 amount = remittance.amount;
		remittance.amount = 0;

		remittance.exchange.transfer(amount);

		RemittanceConvertAndSend(msg.sender, remittance.exchange, amount);
		return true;
	}
	
	// Alice get her ethers back 
	// After Deadline
	function refund(bytes32 _passwordHash) public returns (bool) {
		RemittanceStruct storage remittance = remittances[_passwordHash];

		require(remittance.amount > 0);
		require(block.timestamp > remittance.deadlineTimestamp);
		require(remittance.owner == msg.sender);

		uint256 amountToGetBack = remittance.amount;
		remittance.amount = 0;
		msg.sender.transfer(amountToGetBack);

		RemittanceRefunded(msg.sender, amountToGetBack);
		return true;
	}

	function() payable public {
		revert();
	}

	function kill() public onlyOwner {
      	Killed(owner);
      	selfdestruct(owner);
    }
}