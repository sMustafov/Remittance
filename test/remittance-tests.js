const Remittance = artifacts.require('./Remittance.sol');
const expectThrow = require('./util.js').expectThrow;

contract('Remittance', function(accounts) {
    var remittanceInstance;
    const owner = accounts[0];  // alice
    const recipient = accounts[1];  // bob
    const exchange = accounts[2];  // carol
  
    var firstPasswordHash = "Password1";
    var secondPasswordHash = "Password2";
    var password = "0x9d1437de893f788f85e064b803382800b046563e0a6f0c208e11a86a26aace4f";
    
    var amount = 1000000000000000000;
    var durationLimit = 1000000000;
    var duration = 10000000;


    describe("create remittance", () => {

        beforeEach(async function () {
			remittanceInstance = await Remittance.new({
				from: owner
			});
		})

		it("should create remittance correctly by the owner", async function () {
			remittanceInstance.createRemittance(exchange, password, durationLimit, {
				value: amount,
				from: owner
			}) 
        })

        it("should throw on zero amount", async function () {
			const amountWei = 0;
			await expectThrow(remittanceInstance.createRemittance(exchange, password, durationLimit, {
				value: amountWei,
				from: owner
			}))
        })
        
        it("should throw on null exchange address", async function () {
			const exchange = 0x0;
			await expectThrow(remittanceInstance.createRemittance(exchange, password, durationLimit, {
				value: amount,
				from: owner
			}))
		})
    });
    

    describe("convert and send remittance", () => {

        beforeEach(async function () {
			remittanceInstance = await Remittance.new({
				from: owner
            });
            
            remittanceInstance.createRemittance(exchange, password, durationLimit, {
				value: amount,
				from: owner
			}) 
		})
		
        it("should throw on wrong msg.sender, exchange can only call the function", async function () {
			await expectThrow(remittanceInstance.convertAndSend(firstPasswordHash, secondPasswordHash, owner, {
				from: owner
			})) 
        })

        it("should throw on wrong msg.sender, recipient can only call the function", async function () {
			await expectThrow(remittanceInstance.convertAndSend(firstPasswordHash, secondPasswordHash, owner, {
				from: recipient
			})) 
        })
        
        it("should throw on null owner address", async function () {
			const owner = 0x0;
			await expectThrow(remittanceInstance.convertAndSend(firstPasswordHash, secondPasswordHash, owner, {
				from: exchange
			}))
        })

        it("should be successfully called", async function () {
			remittanceInstance.convertAndSend(firstPasswordHash, secondPasswordHash, owner, {
				from: exchange
			})
        })
    })

    describe("kill remittance", () => {
        beforeEach(async function () {
            remittanceInstance = await Remittance.new({
                from: owner
            })

            remittanceInstance.createRemittance(exchange, password, durationLimit, {
				value: amount,
				from: owner
			}) 
        })
        
        it("should kill the contract successfully", async function () {
            remittanceInstance.kill({
                from: owner
            }) 
        })

        it("should throw on wrong msg.sender, exchange can only call the function", async function () {
            await expectThrow(remittanceInstance.kill({
                from: exchange
            })) 
        })

        it("should throw on wrong msg.sender, exchange can only call the function", async function () {
            await expectThrow(remittanceInstance.kill({
                from: recipient
            })) 
        })
    });

    
    describe("refund remittance", () => {
        beforeEach(async function () {
            remittanceInstance = await Remittance.new({
                from: owner
            });

            remittanceInstance.createRemittance(exchange, password, 0, {
				value: amount,
				from: owner
			}) 
        })
        
        it("should throw due to durationLimit", async function () {
            remittanceInstance.createRemittance(exchange, password, durationLimit, {
				value: amount,
				from: owner
            }) 
            
            await expectThrow(remittanceInstance.refund(password, {
                from: owner
            }))
        })

        it("should throw owner can refund not exchange", async function () {
            await expectThrow(remittanceInstance.refund(password, {
                from: exchange
            }))
        })

        it("should throw owner can refund not recipient", async function () {
            await expectThrow(remittanceInstance.refund(password, {
                from: recipient
            }))
        })

        it("should refund successfully", async function () {
            remittanceInstance.refund(password, {
                from: exchange
            })
        })
        
    });
});