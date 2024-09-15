import { ethers, Contract } from "ethers";
import PredictionMarket from "./contracts/PredictionMarket.json";

const getBlockchain = () =>
  new Promise(async (resolve, reject) => {
    try {
      if (window.ethereum) {
        await window.ethereum.request({ method: "eth_requestAccounts" });
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const signerAddress = await signer.getAddress();
        const network = await provider.getNetwork();
        const networkId = Number(network.chainId); // Convert BigInt to Number
        const contractAddress = PredictionMarket.networks[networkId]?.address;

        console.log("Network:", network);
        console.log("Network ID:", networkId);
        console.log("Contract Address:", contractAddress);

        if (!contractAddress) {
          throw new Error("Contract address not found for the current network");
        }

        const predictionMarket = new Contract(
          contractAddress,
          PredictionMarket.abi,
          signer
        );

        resolve({ signerAddress, predictionMarket });
      } else {
        reject("Ethereum provider not found");
      }
    } catch (error) {
      reject(error.message || "An error occurred");
    }
  });

export default getBlockchain;
