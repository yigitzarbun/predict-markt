const PredictionMarket = artifacts.require("PredictionMarket.sol");

const SIDE = {
  BIDEN: 0,
  TRUMP: 1,
};

contract("PredictionMarket", (addresses) => {
  const [admin, oracle, gambler1, gambler2, gambler3, gambler4, _] = addresses;

  it("should work", async () => {
    const predictionMarket = await PredictionMarket.new(oracle);

    await predictionMarket.placeBet(SIDE.BIDEN, {
      from: gambler1,
      value: web3.utils.toWei("1"),
    });

    await predictionMarket.placeBet(SIDE.BIDEN, {
      from: gambler2,
      value: web3.utils.toWei("1"),
    });

    await predictionMarket.placeBet(SIDE.BIDEN, {
      from: gambler3,
      value: web3.utils.toWei("2"),
    });

    await predictionMarket.placeBet(SIDE.TRUMP, {
      from: gambler4,
      value: web3.utils.toWei("4"),
    });

    await predictionMarket.reportResult(SIDE.BIDEN, SIDE.TRUMP, {
      from: oracle,
    });

    // Get balances before withdrawals
    const balancesBefore = await Promise.all(
      [gambler1, gambler2, gambler3, gambler4].map(async (gambler) => {
        const balance = await web3.eth.getBalance(gambler);
        return web3.utils.toBN(balance);
      })
    );

    // Withdraw gains
    await Promise.all(
      [gambler1, gambler2, gambler3].map((gambler) =>
        predictionMarket.withdrawGain({ from: gambler })
      )
    );

    // Get balances after withdrawals
    const balancesAfter = await Promise.all(
      [gambler1, gambler2, gambler3, gambler4].map(async (gambler) => {
        const balance = await web3.eth.getBalance(gambler);
        return web3.utils.toBN(balance);
      })
    );

    // Validate the results
    assert(
      balancesAfter[0].sub(balancesBefore[0]).toString().slice(0, 3) == "199",
      "Gambler 1 did not receive the correct amount"
    );
    assert(
      balancesAfter[1].sub(balancesBefore[1]).toString().slice(0, 3) == "199",
      "Gambler 2 did not receive the correct amount"
    );
    assert(
      balancesAfter[2].sub(balancesBefore[2]).toString().slice(0, 3) == "399",
      "Gambler 3 did not receive the correct amount"
    );
    assert(
      balancesAfter[3].sub(balancesBefore[3]).isZero(),
      "Gambler 4 should not have any gains"
    );
  });
});
