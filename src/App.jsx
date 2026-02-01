import "./App.css";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import {
  WalletModalProvider,
  WalletDisconnectButton,
  WalletMultiButton,
} from "@solana/wallet-adapter-react-ui";
import "@solana/wallet-adapter-react-ui/styles.css";
import { Toaster } from "react-hot-toast";
import TokenLaunchpad from "./components/TokenLaunchpad";

function App() {
  return (
    <ConnectionProvider endpoint={"https://api.devnet.solana.com"}>
      <WalletProvider wallets={[]} autoConnect>
        <WalletModalProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: "#1a1a1a",
                color: "#fff",
                border: "1px solid rgba(249, 115, 22, 0.2)",
                fontFamily: "'Pixelify Sans', sans-serif",
              },
              success: {
                iconTheme: {
                  primary: "#f97316",
                  secondary: "#fff",
                },
              },
              error: {
                iconTheme: {
                  primary: "#ef4444",
                  secondary: "#fff",
                },
              },
            }}
          />
          <div className="min-h-screen bg-linear-to-br from-gray-950 via-gray-900 to-black">
            {/* Header */}
            <nav className="border-b border-orange-500/20 backdrop-blur-sm bg-black/40">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">
                  <div className="flex items-center space-x-3">
                    <div className="text-4xl">☀️</div>
                    <h1 className="text-3xl font-bold bg-linear-to-r from-orange-400 via-red-500 to-yellow-500 bg-clip-text text-transparent">
                      SunPad
                    </h1>
                  </div>
                  <div className="flex items-center gap-4">
                    <WalletMultiButton className="bg-linear-to-r! from-orange-500! to-red-500! hover:from-orange-600! hover:to-red-600! rounded-xl! font-pixelify! transition-all! duration-300!" />
                    <WalletDisconnectButton className="bg-gray-800! hover:bg-gray-700! rounded-xl! font-pixelify! transition-all! duration-300!" />
                  </div>
                </div>
              </div>
            </nav>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <TokenLaunchpad />
            </main>

            {/* Footer */}
            <footer className="mt-auto border-t border-orange-500/20 backdrop-blur-sm bg-black/40">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <p className="text-center text-gray-400 text-sm">
                  Built on Solana • Powered by Token 2022 Program
                </p>
              </div>
            </footer>
          </div>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

export default App;
