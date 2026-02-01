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

  // Upload metadata to IPFS - required before creating token
  const createUploadMetadata = async (name, symbol, description, image) => {
    const metadata = {
      name,
      symbol,
      description,
      image,
    };

    try {
      const response = await fetch(
        "https://api.pinata.cloud/pinning/pinJSONToIPFS",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_PINATA_JWT}`,
          },
          body: JSON.stringify(metadata),
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Pinata API error:", errorText);
        throw new Error(
          `Failed to upload to Pinata: ${response.status} - ${errorText}`,
        );
      }

      const result = await response.json();
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
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12 relative z-10">
        <h2 className="text-5xl md:text-6xl font-bold mb-4 bg-linear-to-r from-orange-400 via-red-500 to-yellow-500 bg-clip-text text-transparent drop-shadow-lg">
          Launch Your Token
        </h2>
        <p className="text-gray-400 text-lg">
          Create your own Solana SPL token with metadata in minutes
        </p>
      </div>

      <div className="relative backdrop-blur-xl bg-white/5 rounded-2xl shadow-2xl border border-orange-500/50 overflow-hidden">
        {/* Glassy inner glow */}
        <div className="absolute inset-0 bg-linear-to-br from-orange-500/5 via-transparent to-red-500/5 pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-white/20 to-transparent" />

        <div className="relative border-b border-orange-500/40 px-8 py-6 bg-white/5">
          <h3 className="text-2xl font-semibold  bg-linear-to-r from-orange-400 via-red-500 to-yellow-500 bg-clip-text text-transparent drop-shadow-lg flex items-center gap-3">
            Token Configuration
          </h3>
        </div>

        <div className="p-8 space-y-6 relative">
          <div className="space-y-2">
            <label className="text-md font-medium text-gray-300 flex items-center gap-2">
              <span className="text-orange-400">●</span>
              Token Name
            </label>
            <input
              name="name"
              type="text"
              placeholder="e.g., SunToken"
              value={newToken.name}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 focus:bg-white/10 transition-all duration-300 hover:border-white/20 hover:bg-white/10"
            />
          </div>

          <div className="space-y-2">
            <label className="text-md font-medium text-gray-300 flex items-center gap-2">
              <span className="text-red-400">●</span>
              Symbol
            </label>
            <input
              name="symbol"
              type="text"
              placeholder="e.g., SUN"
              value={newToken.symbol}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 focus:bg-white/10 transition-all duration-300 hover:border-white/20 hover:bg-white/10"
            />
          </div>

          <div className="space-y-2">
            <label className="text-md font-medium text-gray-300 flex items-center gap-2">
              <span className="text-yellow-400">●</span>
              Description
            </label>
            <textarea
              name="description"
              placeholder="Describe your token..."
              value={newToken.description}
              onChange={handleInputChange}
              rows="3"
              className="w-full px-4 py-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500/50 focus:bg-white/10 transition-all duration-300 hover:border-white/20 hover:bg-white/10 resize-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-md font-medium text-gray-300 flex items-center gap-2">
              <span className="text-orange-400">●</span>
              Image URL
            </label>
            <input
              name="image"
              type="text"
              placeholder="https://example.com/token-image.png"
              value={newToken.image}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 focus:bg-white/10 transition-all duration-300 hover:border-white/20 hover:bg-white/10"
            />
          </div>

          <div className="space-y-2">
            <label className="text-md font-medium text-gray-300 flex items-center gap-2">
              <span className="text-red-400">●</span>
              Initial Supply
            </label>
            <input
              name="initialSupply"
              type="number"
              placeholder="1000000"
              value={newToken.initialSupply || ""}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 focus:bg-white/10 transition-all duration-300 hover:border-white/20 hover:bg-white/10"
            />
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-orange-500/20 rounded-xl p-4 flex gap-3">
            <span className="text-2xl">💡</span>
            <div className="text-md text-gray-300">
              <p className="font-semibold text-orange-400 mb-1">Important:</p>
              <p>
                Your token will be created on Solana Devnet using the Token 2022
                program with built-in metadata support.
              </p>
            </div>
          </div>

          <div className="relative">
            <div
              className={`p-0.5 rounded-xl transition-all duration-300 ${
                isCreating
                  ? "bg-white/20"
                  : "bg-linear-to-r from-orange-500 via-red-500 to-yellow-500 hover:from-orange-600 hover:via-red-600 hover:to-yellow-600"
              }`}
            >
              <button
                onClick={createToken}
                disabled={isCreating}
                className={`w-full py-4 px-6 rounded-xl font-bold text-6xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] bg-black text-white ${
                  isCreating
                    ? "cursor-not-allowed text-gray-400"
                    : "hover:bg-gray-900 shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50"
                }`}
              >
                {isCreating ? (
                  <span className="flex items-center justify-center gap-3">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Creating Your Token...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    Mint Token
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TokenLaunchpad;
