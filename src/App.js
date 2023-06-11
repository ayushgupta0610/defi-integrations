// import logo from "./logo.svg";
import "./App.css";
import { useEffect, useState } from "react";
import { Button, Input } from "semantic-ui-react";
import { ethers } from "ethers";


function App() {
  const [walletAddress, setWalletAddress] = useState("");
  const [signer, setSigner] = useState();
  const [loading, setLoading] = useState(false);
  const [inputAddress, setInputValue] = useState("");
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

  async function approve() {
    try {
      setApprovalLoading(true);

    } catch (error) {
      console.error(error);
    }
    setApprovalLoading(false);
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
      console.log("Signer: ", signer);
    } catch (error) {
      console.error(error);
    }
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
          onClick={() => {
            connectWallet();
          }}
        >
          {walletAddress ? walletAddress : "Connect Wallet"}
        </Button>
        <Button
          basic
          color="purple"
          loading={approvalLoading}
          onClick={() => approve()}
        >
          {" "}
          Approve{" "}
        </Button>
        <Input
          placeholder="Swap token"
          onChange={(e) => setInputValue(e.target.value)}
          value={inputAddress}
        ></Input>
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
