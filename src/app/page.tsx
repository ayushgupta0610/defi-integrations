"use client";

import { useEffect, useState } from "react";


export default function Home() {
  const [walletAddress, setWalletAddress] = useState("");
  const [inputValueOne, setInputValueOne] = useState("");
  const [inputValueTwo, setInputValueTwo] = useState("");

  useEffect(() => {
    
  }, []);


  const swap = async () => {

  }

  const updateLiquidity = async () => {

  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
      <ul className="divide-y divide-gray-200">
        <input placeholder="Token to transfer"
          onChange={(e) => setInputValueOne(e.target.value)}
          value={inputValueOne}/> 
        <input placeholder="Token to swap for"
          onChange={(e) => setInputValueTwo(e.target.value)}
          value={inputValueTwo}/>
      <button onClick={() => swap()}> Swap </button>
      <button onClick={() => swap()}> Swap </button>
    </ul>
       </div>
    </main>
  )
}
