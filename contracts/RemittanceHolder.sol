pragma solidity ^0.4.16;

import "./Remittance.sol";

contract RemittanceHolder {

    mapping (address => Remittance[]) public remittanceMapping;

    function CreateRemittance(address _exchange, bytes32 _passwordHash, uint256 _deadlineTimestamp) payable public {
		Remittance remittance = new Remittance(msg.sender, _exchange, _passwordHash,_deadlineTimestamp, msg.value);

        remittanceMapping[msg.sender].push(remittance);
	}
}