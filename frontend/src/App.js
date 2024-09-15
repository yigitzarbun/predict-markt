import React, { useState, useEffect } from "react";
import getBlockchain from "./ethereum.js";
import styles from "./styles.module.scss";

// Register necessary components

const SIDE = {
  BIDEN: 0,
  TRUMP: 1,
};

function App() {
  const [predictionMarket, setPredictionMarket] = useState(undefined);
  const [myBets, setMyBets] = useState(undefined);
  const [betPredictions, setBetPredictions] = useState(undefined);

  const placeBet = async (side, e) => {
    e.preventDefault();
    await predictionMarket.placeBet(side, {
      value: e.target.elements[0].value,
    });
  };

  const withdrawGain = async () => {
    await predictionMarket.withdrawGain();
  };

  useEffect(() => {
    const init = async () => {
      try {
        const { signerAddress, predictionMarket } = await getBlockchain();
        const myBets = await Promise.all([
          predictionMarket.betsPerGambler(signerAddress, SIDE.BIDEN),
          predictionMarket.betsPerGambler(signerAddress, SIDE.TRUMP),
        ]);
        const bets = await Promise.all([
          predictionMarket.bets(SIDE.BIDEN),
          predictionMarket.bets(SIDE.TRUMP),
        ]);
        const betPredictions = {
          labels: ["Trump", "Biden"],
          datasets: [
            {
              data: [bets[1].toString(), bets[0].toString()],
              backgroundColor: ["#FF6384", "#36A2EB"],
              hoverBackgroundColor: ["#FF6384", "#36A2EB"],
            },
          ],
        };
        setPredictionMarket(predictionMarket);
        setMyBets(myBets);
        setBetPredictions(betPredictions);
      } catch (error) {
        console.error("Failed to initialize blockchain data", error);
      }
    };
    init(); // Call init once on mount
  }, []);

  if (
    typeof predictionMarket === "undefined" ||
    typeof myBets === "undefined" ||
    typeof betPredictions === "undefined"
  ) {
    return "Loading..";
  }

  return (
    <div className={styles.main}>
      <h1 className={styles.title}>Bahis Turk</h1>
      <div className={styles["hero-container"]}>
        <h1>Who will win the US election?</h1>
      </div>

      <div className={styles.images}>
        <div className={styles.side}>
          <img src="./img/trump.png" alt="Trump" />
          <h5>Trump</h5>
          <form onSubmit={(e) => placeBet(SIDE.TRUMP, e)}>
            <input
              type="text"
              className="form-control mb-2 mr-sm-2"
              placeholder="Bet amount (ether)"
            />
            <button type="submit" className="btn btn-primary mb-2">
              Submit
            </button>
          </form>
        </div>
        <div className={styles.side}>
          <img src="./img/biden.png" alt="Biden" />
          <h5>Biden</h5>
          <form onSubmit={(e) => placeBet(SIDE.BIDEN, e)}>
            <input
              type="text"
              className="form-control mb-2 mr-sm-2"
              placeholder="Bet amount (ether)"
            />
            <button type="submit" className="btn btn-primary mb-2">
              Submit
            </button>
          </form>
        </div>
      </div>
      <div>
        <h2>Your Bets</h2>
        <ul>
          <li>Biden: {myBets[0].toString()} ETH (wei)</li>
          <li>Trump: {myBets[1].toString()} ETH (wei)</li>
        </ul>
      </div>
      <div>
        <h2>Claim your gains, if you have any, after the election</h2>
        <button
          type="button"
          className="btn btn-primary mb-2"
          onClick={() => withdrawGain()} // Pass function reference
        >
          Claim Gains
        </button>
      </div>
      <div>
        <h2>Prediction Distribution</h2>
      </div>
    </div>
  );
}

export default App;
