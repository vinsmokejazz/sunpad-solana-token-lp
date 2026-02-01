import {
  createAssociatedTokenAccountInstruction,
  createInitializeInstruction,
  createInitializeMetadataPointerInstruction,
  createInitializeMint2Instruction,
  createMintToInstruction,
  ExtensionType,
  getAssociatedTokenAddressSync,
  getMintLen,
  LENGTH_SIZE,
  TOKEN_2022_PROGRAM_ID,
  TYPE_SIZE,
} from "@solana/spl-token";
import { pack } from "@solana/spl-token-metadata";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Keypair, SystemProgram, Transaction } from "@solana/web3.js";
import { PinataSDK } from "pinata";
import { useState } from "react";
import toast from "react-hot-toast";

const TokenLaunchpad = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [newToken, setNewToken] = useState({
    name: "",
    symbol: "",
    image: "",
    initialSupply: 0,
    description: "",
  });

  const { connection } = useConnection();
  const wallet = useWallet();

  const pinata = new PinataSDK({
    pinataJwt: import.meta.env.VITE_PINATA_JWT,
    pinataGateway: import.meta.env.VITE_PINATA_GATEWAY_URL,
  });

  // Upload metadata to IPFS - required before creating token
  const createUploadMetadata = async (name, symbol, description, image) => {
    const metadata = JSON.stringify({
      name,
      symbol,
      description,
      image,
    });

    const metadataFile = new File([metadata], "metadata.json", {
      type: "application/json",
    });

    try {
      const result = await pinata.upload.file(metadataFile);
      console.log("Metadata uploaded:", result);
      return result.IpfsHash;
    } catch (error) {
      console.error("Error uploading metadata:", error);
      throw error;
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewToken((prev) => ({
      ...prev,
      [name]: name === "initialSupply" ? Number(value) : value,
    }));
  };

  const createToken = async () => {
    if (!wallet || !wallet.publicKey) {
      toast.error("Please connect your wallet first");
      return;
    }

    if (
      !newToken.name ||
      !newToken.symbol ||
      !newToken.image ||
      !newToken.initialSupply
    ) {
      toast.error("Please fill all the fields");
      return;
    }

    try {
      setIsCreating(true);
      const mintKeyPair = Keypair.generate(); // Generate new keypair for mint account

      // Step 1: Upload metadata to IPFS first
      let metadataUri = await createUploadMetadata(
        newToken.name,
        newToken.symbol,
        newToken.description,
        newToken.image,
      );
      if (!metadataUri) {
        throw new Error("Failed to upload metadata");
      }

      metadataUri = `https://${import.meta.env.VITE_PINATA_GATEWAY_URL}/ipfs/${metadataUri}`;

      // Prepare metadata for on-chain storage
      const metadata = {
        mint: mintKeyPair.publicKey,
        name: newToken.name,
        symbol: newToken.symbol,
        uri: metadataUri,
        additionalMetadata: [],
      };

      // Calculate account sizes for rent exemption
      const mintLen = getMintLen([ExtensionType.MetadataPointer]);
      const metadataLen = TYPE_SIZE + LENGTH_SIZE + pack(metadata).length;

      const lamports = await connection.getMinimumBalanceForRentExemption(
        mintLen + metadataLen,
      );

      // TRANSACTION 1: Create mint account with metadata
      const transaction = new Transaction().add(
        // Create account on blockchain
        SystemProgram.createAccount({
          fromPubkey: wallet.publicKey,
          newAccountPubkey: mintKeyPair.publicKey,
          space: mintLen,
          lamports,
          programId: TOKEN_2022_PROGRAM_ID,
        }),
        // Initialize metadata pointer extension
        createInitializeMetadataPointerInstruction(
          mintKeyPair.publicKey,
          wallet.publicKey,
          mintKeyPair.publicKey,
          TOKEN_2022_PROGRAM_ID,
        ),
        // Initialize mint with 9 decimals
        createInitializeMint2Instruction(
          mintKeyPair.publicKey,
          9,
          wallet.publicKey,
          wallet.publicKey,
          TOKEN_2022_PROGRAM_ID,
        ),
        // Store metadata on-chain
        createInitializeInstruction({
          programId: TOKEN_2022_PROGRAM_ID,
          metadata: mintKeyPair.publicKey,
          updateAuthority: wallet.publicKey,
          mint: mintKeyPair.publicKey,
          mintAuthority: wallet.publicKey,
          name: metadata.name,
          symbol: metadata.symbol,
          uri: metadataUri,
        }),
      );

      // Sign and send first transaction
      transaction.feePayer = wallet.publicKey;
      transaction.recentBlockhash = (
        await connection.getLatestBlockhash()
      ).blockhash;
      transaction.partialSign(mintKeyPair); // Sign with mint's private key

      await wallet.sendTransaction(transaction, connection);
      console.log(`Token Mint created at ${mintKeyPair.publicKey.toBase58()}`);
      toast.success("Token Minted Successfully!");

      // TRANSACTION 2: Create ATA and mint initial supply
      const associatedTokenAccount = getAssociatedTokenAddressSync(
        mintKeyPair.publicKey,
        wallet.publicKey,
        false,
        TOKEN_2022_PROGRAM_ID,
      );

      const transaction2 = new Transaction().add(
        // Create associated token account for user
        createAssociatedTokenAccountInstruction(
          wallet.publicKey,
          associatedTokenAccount,
          wallet.publicKey,
          mintKeyPair.publicKey,
          TOKEN_2022_PROGRAM_ID,
        ),
        // Mint initial supply to user's wallet
        createMintToInstruction(
          mintKeyPair.publicKey,
          associatedTokenAccount,
          wallet.publicKey,
          newToken.initialSupply * Math.pow(10, 9), // Convert to smallest unit
          [],
          TOKEN_2022_PROGRAM_ID,
        ),
      );

      // Sign and send second transaction
      transaction2.feePayer = wallet.publicKey;
      transaction2.recentBlockhash = (
        await connection.getLatestBlockhash()
      ).blockhash;

      await wallet.sendTransaction(transaction2, connection);
      console.log("Minted initial supply to associated account");
      toast.success("Initial supply minted to your wallet!");
    } catch (error) {
      console.error("Error creating token:", error);
      toast.error(`Error creating token: ${error.message}`);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div>
      <h1>Solana Token LaunchPad</h1>
      <input
        name="name"
        type="text"
        placeholder="Token name"
        value={newToken.name}
        onChange={handleInputChange}
      />
      <input
        name="symbol"
        type="text"
        placeholder="Symbol"
        value={newToken.symbol}
        onChange={handleInputChange}
      />
      <input
        name="description"
        type="text"
        placeholder="Description"
        value={newToken.description}
        onChange={handleInputChange}
      />
      <input
        name="image"
        type="text"
        placeholder="Image URL"
        value={newToken.image}
        onChange={handleInputChange}
      />
      <input
        name="initialSupply"
        type="number"
        placeholder="Initial Supply"
        value={newToken.initialSupply || ""}
        onChange={handleInputChange}
      />

      <button onClick={createToken} disabled={isCreating}>
        {isCreating ? "Creating..." : "Mint Token"}
      </button>
    </div>
  );
};

export default TokenLaunchpad;
