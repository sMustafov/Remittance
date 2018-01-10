var Remittance = artifacts.require('./Remittance.sol');

contract('Remittance', function(accounts) {
    var remittance;
    const owner = accounts[0];  // alice
    const recipient = accounts[1];  // bob
    const exchange = accounts[2];  // carol
  
    var firstPasswordHash = "Password1";
    var secondPasswordHash = "Password2";
    var password = "0x9d1437de893f788f85e064b803382800b046563e0a6f0c208e11a86a26aace4f";
    
    var amount = 1000000000000000000;
    var durationLimit = 10000;
    var duration = 100;

    describe('Convert and Send Funds', function() {
        it('Exchange can convert and send money', function() {
            var remittance;
            return Remittance.deployed().then(function (instance) {
                remittance = instance;
                return remittance.convertAndSend(firstPasswordHash, secondPasswordHash, owner, { from: exchange});
            }).then(function(res) {
                assert.equal(res, true);
            }).catch(function(error) {
                // Error
            });	
        });

        it("Recipient cannot convert and send money", function () {
            var remittance;
            return Remittance.deployed().then(function (instance) {
                remittance = instance;
                return remittance.convertAndSend(firstPasswordHash, secondPasswordHash, owner, { from: recipient});
            }).then(function (res) {
                assert.equal(res, false);
            }).catch(function(error) {
                // Error
            });	
        });

        it('Owner can convert and send money', function() {
            var remittance;
            return Remittance.deployed().then(function (instance) {
                remittance = instance;
                return remittance.convertAndSend(firstPasswordHash, secondPasswordHash, owner, { from: owner});
            }).then(function(res) {
                assert.equal(res, false);
            }).catch(function(error) {
                // Error
            });	
        });

        it('Exchange cannot convert and send money with wrong password', function() {
            var remittance;
            var wrongPassword = "WrongOne"
            return Remittance.deployed().then(function (instance) {
                remittance = instance;
                return remittance.convertAndSend(wrongPassword, secondPasswordHash, owner, { from: exchange});
            }).then(function(res) {
                assert.equal(res, false);
            }).catch(function(error) {
                // Error
            });	
        });

        it('Exchange cannot convert and send money with wrong owner address', function() {
            var remittance;
            var wrongPassword = "WrongOne"
            return Remittance.deployed().then(function (instance) {
                remittance = instance;
                return remittance.convertAndSend(wrongPassword, secondPasswordHash, recipient, { from: exchange});
            }).then(function(res) {
                assert.equal(res, false);
            }).catch(function(error) {
                // Error
            });	
        });
    });

    // Refund function
    
    describe('Refund', function() {
        it('Owner refund successfully', function() {
            return Remittance.deployed().then(function (instance) {
                remittance = instance;
                return remittance.convertAndSend(password, { from: owner });
            }).then(function(res) {
                assert.equal(res, true);
            }).catch(function(error) {
                // Error
            });	
        });

        it('Owner wrong password', function() {
            var wrongPassword = "wrongPass";
            return Remittance.deployed().then(function (instance) {
                remittance = instance;
                return remittance.convertAndSend(wrongPassword, { from: owner });
            }).then(function(res) {
                assert.equal(res, true);
            }).catch(function(error) {
                // Error
            });	
        });
    });

    // Kill function
  	describe('Kill Contract', function() {
        it('Owner can kill the contract', function() {
            return Remittance.deployed().then(function (instance) {
                remittance = instance;
                return remittance.kill({ from: owner});
            }).then(function(res) {
                assert.equal(res, true);
            }).catch(function(error) {
                // Error
            });	
        });

        it('Exchange cannot kill the contact', function() {
            return Remittance.deployed().then(function (instance) {
                remittance = instance;
                return remittance.kill({ from: exchange});
            }).then(function(res) {
                assert.equal(res, false);
            }).catch(function(error) {
                // Error
            });	
        });

        it('Recipient cannot kill the contact', function() {
            return Remittance.deployed().then(function (instance) {
                remittance = instance;
                return remittance.kill({ from: recipient});
            }).then(function(res) {
                assert.equal(res, false);
            }).catch(function(error) {
                // Error
            });	
        });
    });
});