import "./App.css";
import "./styles/index.css";
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
          <div className="min-h-screen bg-black relative overflow-hidden">
            {/* Galaxy Star Field Background */}
            <div className="galaxy-stars">
              {/* Large bright stars */}
              <div className="star-large-1"></div>
              <div className="star-large-2"></div>
              <div className="star-large-3"></div>
              <div className="star-large-4"></div>
              <div className="star-large-5"></div>
              <div className="star-large-6"></div>
              <div className="star-large-7"></div>
              <div className="star-large-8"></div>

              {/* Medium stars scattered across */}
              <div className="star-medium-1"></div>
              <div className="star-medium-2"></div>
              <div className="star-medium-3"></div>
              <div className="star-medium-4"></div>
              <div className="star-medium-5"></div>
              <div className="star-medium-6"></div>
              <div className="star-medium-7"></div>
              <div className="star-medium-8"></div>

              {/* Small distant stars */}
              <div className="star-small-1"></div>
              <div className="star-small-2"></div>
              <div className="star-small-3"></div>
              <div className="star-small-4"></div>
              <div className="star-small-5"></div>
              <div className="star-small-6"></div>
              <div className="star-small-7"></div>
              <div className="star-small-8"></div>
              <div className="star-small-9"></div>
              <div className="star-small-10"></div>

              {/* Tiny background stars for depth */}
              <div className="star-tiny-1"></div>
              <div className="star-tiny-2"></div>
              <div className="star-tiny-3"></div>
              <div className="star-tiny-4"></div>
              <div className="star-tiny-5"></div>
              <div className="star-tiny-6"></div>
              <div className="star-tiny-7"></div>
              <div className="star-tiny-8"></div>
            </div>

            {/* Sun Gradient Orb - Background Effect */}
            <div className="sun-orb-large"></div>
            <div className="sun-orb-medium"></div>
            <div className="sun-orb-small"></div>

            {/* Header*/}
            <nav className="header-nav">
              <div className="header-inner-glow"></div>
              <div className="header-top-border"></div>
              <div className="header-bottom-border"></div>
              <div className="header-content">
                <div className="header-flex">
                  <div className="header-logo">
                    <div className="text-4xl">☀️</div>
                    <h1 className="header-title">SunPad</h1>
                  </div>
                  <div className="header-wallet-buttons">
                    <WalletMultiButton
                      style={{
                        background: "transparent",
                        borderRadius: "8px",
                        border: "1px solid rgba(249, 115, 22, 0.6)",
                        color: "white",
                        backdropFilter: "blur(10px)",
                      }}
                    />
                    <WalletDisconnectButton
                      style={{
                        background: "transparent",
                        borderRadius: "8px",
                        border: "1px solid rgba(249, 115, 22, 0.6)",
                        color: "white",
                        backdropFilter: "blur(10px)",
                      }}
                    />
                  </div>
                </div>
              </div>
            </nav>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <TokenLaunchpad />
            </main>

            {/* Footer */}
            <footer className="footer-nav">
              <div className="footer-top-border"></div>
              <div className="footer-content">
                <p className="footer-text">
                  Built on Solana • Powered by Token 2022 Program
                </p>
                <a
                  href="https://github.com/vinsmokejazz/sunpad-solana-token-lp"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-github-link"
                >
                  <svg
                    className="footer-github-icon"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                  View on GitHub
                </a>
              </div>
            </footer>
          </div>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

export default App;
