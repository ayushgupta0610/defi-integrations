// import logo from "./logo.svg";
import "./App.css";
import { useEffect, useState } from "react";
import { Button, Input } from "semantic-ui-react";
import { ethers } from "ethers";
import axios from "axios";
import ExampleDapp from "../artifacts/contracts/ExampleDapp.sol/ExampleDapp.json";
import UniswapV2Factory from "../artifacts/@uniswap/v2-core/contracts/interfaces/IUniswapV2Factory.sol/IUniswapV2Factory.json";
import config from "./config";

const network = "polygon";

function App() {
  const [walletAddress, setWalletAddress] = useState("");
  const [signer, setSigner] = useState();
  const [loading, setLoading] = useState(false);
  const [convertLoading, setConvertLoading] = useState(false);
  const [pairAddressLoading, setPairAddressLoading] = useState(false);
  const [liquidityLoading, setLiquidityLoading] = useState(false);
  const [token1Value, setToken1Value] = useState("");
  const [token2Value, setToken2Value] = useState("");
  const [approvalLoading, setApprovalLoading] = useState(false);
  const [swapLoading, setSwapLoading] = useState(false);

  useEffect(() => {
    // Update the document title using the browser API
    // window.ethereum?.on("accountsChanged", connectWallet);
  });

  async function connectWallet() {
    try {
      setLoading(true);
      if (window.ethereum) {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        console.log("Account: ", accounts[0]);
        setWalletAddress(accounts[0]);
        await setWalletSigner();
      } else {
        console.log("Web3 wallet not found.");
      }
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  }

  async function setWalletSigner() {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      // const urlJsonRpcProvider = new ethers.providers.InfuraProvider("matic", "00b1a853d56e47a8822e1124927039fa"); // Matic Mainnet
      // const urlJsonRpcProvider = new ethers.providers.InfuraProvider("maticmum", "00b1a853d56e47a8822e1124927039fa"); // Matic Mumbai
      // const walletSigner = new ethers.Wallet(privateKey, urlJsonRpcProvider); // On mobile for web3Auth wallet creation
      const walletSigner = provider.getSigner();
      console.log("Signer address: ", await walletSigner.getAddress());
      setSigner(walletSigner);
    } catch (error) {
      console.error(error);
    }
  }

  async function getGasPrice(txnSpeed = 'standard') {
    try {
      console.log(`Fetching gas price from ${config[network].gasStationUrl}`);
      const { data } = await axios.get(config[network].gasStationUrl);
      const maxFeePerGas = Math.ceil(data[txnSpeed].maxFee) * 10 ** 9;
      const maxPriorityFeePerGas = Math.ceil(data[txnSpeed].maxPriorityFee) * 10 ** 9;
      return { maxFeePerGas, maxPriorityFeePerGas };
    } catch (error) {
      console.error(error);
    }
};

  async function checkLiquidity(token1, token2) {
    try {
      setLiquidityLoading(true);
      const exampleDapp = new ethers.Contract(config[network].exampleDappAddress, ExampleDapp.abi, signer);
      // const { maxFeePerGas, maxPriorityFeePerGas } = await getGasPrice('fast');
      token1 = token1 || config[network].usdcAddress;
      token2 = token2 || config[network].maticAddress;
      const pairInfo = await exampleDapp.pairInfo(token1, token2);
      console.log(`token1: ${token1} reserve is: ${pairInfo.reserveA.toString()}`);
      console.log(`token2: ${token2} reserve is: ${pairInfo.reserveB.toString()}`);
      console.log(`Total supply is: ${pairInfo.totalSupply.toString()}`);
    } catch (error) {
      console.error(error);
    }
    setLiquidityLoading(false);
  }

  async function getLiquidtyPairAddress(token1, token2) {
    try {
      setPairAddressLoading(true);
      const uniswapV2Factory = new ethers.Contract(config[network].uniswapV2FactoryAddress, UniswapV2Factory.abi, signer);
      token1 = token1 || config[network].usdcAddress;
      token2 = token2 || config[network].maticAddress;
      const pairAddress = await uniswapV2Factory.getPair(token1, token2);
      console.log(`Pair address for ${token1} and ${token2} is: ${pairAddress}`);
    } catch (error) {
      console.error(error);
    }
    setPairAddressLoading(false);
  }


  async function convert() {
    try {
      setConvertLoading(true);

    } catch (error) {
      console.error(error);
    }
    setConvertLoading(false);
  }

  async function approve() {
    try {
      setApprovalLoading(true);

    } catch (error) {
      console.error(error);
    }
    setApprovalLoading(false);
  }

  async function swap() { 
    try {
      setSwapLoading(true);

    } catch (error) {
      console.error(error);
    }
    setSwapLoading(false);
  }


  return (
    <div className="App">
      <header className="App-header">
        {/* <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a> */}
        <Button
          basic
          color="teal"
          loading={loading}
          onClick={() => connectWallet()}
        >
          {walletAddress ? walletAddress : "Connect Wallet"}
        </Button>
        <Button
          basic
          color="green"
          loading={pairAddressLoading}
          onClick={() => {
            getLiquidtyPairAddress();
          }}
        >
          Get Liquidity Pair Address
        </Button>
        <Button
          basic
          color="blue"
          loading={liquidityLoading}
          onClick={() => {
            checkLiquidity();
          }}
        >
          Convert MATIC and USDC Liquidity
        </Button>
        <Button
          basic
          color="blue"
          loading={convertLoading}
          onClick={() => {
            convert();
          }}
        >
          Convert USDT to MATIC and USDC
        </Button>
        <Input
          placeholder="Token 1 value"
          onChange={(e) => setToken1Value(e.target.value)}
          value={token1Value}
        ></Input>
         <Input
          placeholder="Token 2 value"
          onChange={(e) => setToken2Value(e.target.value)}
          value={token2Value}
        ></Input>
        <Button
          basic
          color="purple"
          loading={approvalLoading}
          onClick={() => approve()}
        >
          {" "}
          Approve{" "}
        </Button>
        <Button
          basic
          color="orange"
          loading={swapLoading}
          onClick={() => swap()}
        >
          {" "}
          Swap{" "}
        </Button>
      </header>
    </div>
  );
}

export default App;
