import {
  createInitializeMint2Instruction,
  getMinimumBalanceForRentExemptMint,
  MINT_SIZE,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Keypair, SystemProgram, Transaction } from "@solana/web3.js";
import React, { useRef } from "react";

const TokenLaunchpad = () => {
  const { connection } = useConnection();
  const wallet = useWallet();

  // declaring refs
  const nameRef = useRef();
  const symbolRef = useRef();
  const imageRef = useRef();
  const supplyRef = useRef();

  const createToken = async () => {
    const mintKeyPair = Keypair.generate();
    const lamports = await getMinimumBalanceForRentExemptMint(connection);

    const transaction = new Transaction().add(
      SystemProgram.createAccount({
        fromPubkey: wallet.publicKey,
        newAccountPubkey: mintKeyPair.publicKey,
        space: MINT_SIZE,
        lamports,
        programId: TOKEN_PROGRAM_ID,
      }),
      createInitializeMint2Instruction(
        mintKeyPair.publicKey,
        9,
        wallet.publicKey,
        TOKEN_PROGRAM_ID,
      ),
    );

    transaction.feePayer = wallet.publicKey;
    transaction.recentBlockhash = (
      await connection.getLatestBlockhash()
    ).blockhash;

    await wallet.sendTransaction(transaction, connection);
    console.log(`Token Mint created at ${mintKeyPair.publicKey.toBase58()}`);

    // access the value via current
    const name = nameRef.current.value;
    const symbol = symbolRef.current.value;
    const image = imageRef.current.value;
    const initialSupply = supplyRef.current.value;
    console.log("Token details:", { name, symbol, image, initialSupply });
  };

  return (
    <div>
      <h1>Solana Token LaunchPad</h1>
      <input ref={nameRef} type="text" placeholder="Token name" />
      <input ref={symbolRef} type="text" placeholder="Symbol" />
      <input ref={imageRef} type="text" placeholder="Image URL" />
      <input ref={supplyRef} type="number" placeholder="Initial Supply" />

      <button onClick={createToken}>Mint Token</button>
    </div>
  );
};

export default TokenLaunchpad;
