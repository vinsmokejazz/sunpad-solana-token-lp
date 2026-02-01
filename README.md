# ☀️ SunPad - Solana Token Launchpad

A modern, beautiful token launchpad built on Solana's Token 2022 program. Create and launch your own SPL tokens with integrated metadata, powered by IPFS .

## ✨ Features

- 🚀 **Token 2022 Integration**: Create modern SPL tokens with built-in metadata extensions
- 🌌 **Galaxy UI**: Stunning starfield background with animated sun orbs and glassy effects
- 📱 **Responsive Design**: Beautiful, mobile-friendly interface with Pixelify Sans font
- 🔗 **IPFS Metadata**: Upload token metadata to IPFS via Pinata for decentralized storage
- 👛 **Wallet Integration**: Seamless connection with Solana wallets
- 🎨 **Modern Styling**: Tailwind CSS with custom animations and transparent effects
- ⚡ **Fast Development**: Built with Vite for lightning-fast hot reload

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite
- **Styling**: Tailwind CSS v4, Custom CSS animations
- **Blockchain**: Solana Devnet, Token 2022 Program
- **Storage**: IPFS (via Pinata)
- **Wallets**: Solana Wallet Adapter
- **Notifications**: React Hot Toast

## 📋 Prerequisites

- Node.js 18+
- npm or yarn
- A Solana wallet (Phantom, Solflare, etc.)
- Pinata account for IPFS uploads

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/vinsmokejazz/sunpad.git
   cd sunpad-solana-token-lp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   VITE_PINATA_JWT=your_pinata_jwt_here
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Build for production**
   ```bash
   npm run build
   ```

## 🔧 Configuration

### Pinata Setup
1. Create an account at [Pinata](https://pinata.cloud)
2. Generate a JWT token from your Pinata dashboard
3. Add the JWT to your `.env` file as `VITE_PINATA_JWT`

### Wallet Connection
The app automatically connects to Solana Devnet. To use Mainnet:
- Update the endpoint in `src/App.jsx`:
  ```javascript
  <ConnectionProvider endpoint={"https://api.devnet.solana.com"}>
  ```

## 🎯 Usage

1. **Connect Wallet**: Click "Connect Wallet" and select your Solana wallet
2. **Fill Token Details**:
   - Token Name
   - Symbol
   - Description
   - Upload Image (PNG/JPG)
   - Set Supply
3. **Create Token**: Click "Create Token" to mint your SPL token
4. **View on Explorer**: Check your token on Solana Explorer

## 📁 Project Structure

```
sunpad-solana-token-lp/
├── public/
│   ├── sun.svg              # Custom sun favicon
│   └── ...
├── src/
│   ├── components/
│   │   └── TokenLaunchpad.jsx  # Main token creation component
│   ├── styles/
│   │   ├── galaxy-stars.css    # Starfield animations
│   │   ├── sun-orbs.css        # Sun gradient effects
│   │   ├── header-footer.css   # Navigation styling
│   │   └── index.css           # Main styles import
│   ├── App.jsx                 # Main app component
│   ├── main.jsx                # App entry point
│   └── ...
├── index.html                  # HTML template
├── package.json                # Dependencies
├── vite.config.js             # Vite configuration
└── README.md                  # This file
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## ⚠️ Disclaimer

This is a development tool for creating tokens on Solana Devnet. Always test thoroughly before using on Devnet. Token creation involves blockchain transactions.

---

Built with ❤️ on Solana • Powered by Token 2022 Program
