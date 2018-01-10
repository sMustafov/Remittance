var Migrations = artifacts.require("./Migrations.sol");
var Remittance = artifacts.require("./Remittance.sol");

module.exports = function(deployer) {
  deployer.deploy(Migrations);
  deployer.deploy(Remittance);
};
