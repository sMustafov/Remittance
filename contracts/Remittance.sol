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
    	address exchange; // Carol
    	uint256 deadlineTimestamp; // When can get back if not sent
    	uint256 amount; // How much going to send
  	}

	modifier onlyActive(uint256 amount) {
		 require(amount > 0);
		 _;
	}

	modifier afterDeadline(uint256 deadlineTimestamp) {
		require(block.timestamp > deadlineTimestamp);
		_;
	}

	modifier beforeDeadline(uint256 deadlineTimestamp) {
		require(block.timestamp <= deadlineTimestamp);
		_;
	}
	
	mapping(bytes32 => RemittanceStruct) public remittances;

	event RemittanceCreated(address indexed _from, address indexed _to, uint256 _amount, uint256 _deadline);
    event RemittanceConvertAndSend(address indexed _who, address indexed _to, uint256 _amount);
    event RemittanceRefunded(address indexed _who, uint256 _amount);
    event Killed(address indexed _owner);
	
	// Alice create remittance
	// Exchange = Carol
	function createRemittance(address _exchange, bytes32 _passwordHash, uint256 _deadlineTimestamp) payable onlyActive(msg.value) public {
		require(_exchange != address(0));

		RemittanceStruct storage remittance = remittances[keccak256(_passwordHash, msg.sender)];
		remittance.exchange = _exchange; // Carols - exchange
    	remittance.amount = msg.value; // Ethers she want to send
    	remittance.deadlineTimestamp = _deadlineTimestamp; // After this time Alice can get her ethers back

		RemittanceCreated(msg.sender, remittance.exchange, remittance.amount, remittance.deadlineTimestamp);
	}

	// Carol Withdraw Alices Ethers 
	// Before Deadline
	function convertAndSend(bytes32 firstPasswordHash, bytes32 secondPasswordHash, address _owner) public beforeDeadline(remittance.deadlineTimestamp) onlyActive(remittance.amount) returns (bool) {
		bytes32 password = keccak256(firstPasswordHash, secondPasswordHash, _owner);
		RemittanceStruct storage remittance = remittances[password];

		require(remittance.exchange == msg.sender);

		uint256 amount = remittance.amount;
		remittance.amount = 0;

		remittance.exchange.transfer(amount);

		RemittanceConvertAndSend(msg.sender, remittance.exchange, amount);
		return true;
	}
	
	// Alice get her ethers back 
	// After Deadline
	function refund(bytes32 _passwordHash) public afterDeadline(remittance.deadlineTimestamp) onlyActive(remittance.amount) returns (bool) {
		RemittanceStruct storage remittance = remittances[keccak256(_passwordHash, msg.sender)];

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