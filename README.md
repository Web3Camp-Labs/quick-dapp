# Quick DApp

Quick DApp is a tool for smart contract developers to interact with any smart contracts easily and quickly with only one click!

[![Publish to GitHub Pages](https://github.com/Web3Camp-Labs/quick-dapp/actions/workflows/main.yml/badge.svg)](https://github.com/Web3Camp-Labs/quick-dapp/actions/workflows/main.yml)

With Quick DApp, you can just create a simple dapp in minutes and share it with your friends anywhere.

## Features

- **Instant Interface Generation**: Automatically creates a UI for any smart contract from its ABI
- **Multi-network Support**: Works with Ethereum, Polygon, BSC, and other EVM-compatible networks
- **Comprehensive Method Support**: Handles view/pure functions, state-changing functions, and payable functions
- **Enhanced Transaction Tracking**: Real-time status updates with detailed feedback
- **Advanced Type Handling**: Supports complex parameter types (arrays, structs, etc.)
- **Clean Result Display**: Clearly formatted function return values
- **User-friendly Error Messages**: Readable blockchain error information

## Usage

1. Connect your MetaMask wallet
2. Enter your contract's ABI (JSON format) and address
3. Select the network where your contract is deployed
4. Click on any method to interact with it
5. For read-only methods, results will display immediately
6. For state-changing methods, you'll see transaction status and confirmations

## Installation

### Prerequisites

- Node.js (v14 or later)
- Yarn or npm

### Setup

1. Clone the repository
   ```bash
   git clone https://github.com/Web3Camp-Labs/quick-dapp.git
   cd quick-dapp
   ```

2. Install dependencies
   ```bash
   yarn install
   # or
   npm install
   ```

3. Start the development server
   ```bash
   yarn start
   # or
   npm start
   ```

## Plans
- [ ] Add support for other wallets
  - [ ] CoinBase
  - [ ] WalletConnect
  - [ ] JoyID
  - [ ] etc.
- [ ] Save the created dapp locally
- [ ] Provide share link for dapp
- [ ] New UI
- [x] Enhanced transaction tracking
- [x] Improved error handling
- [x] Better result formatting

## Project Structure

- `src/components/` - React components
  - `AppMethod.jsx` - Core component for interacting with contract methods
  - `TransactionStatus.jsx` - Transaction tracking UI
- `src/utils/` - Utility functions
  - `contractUtils.js` - Smart contract interaction helpers
- `src/store/` - State management
  - `methodReducer.js` - Reducer for method call state
- `src/hooks/` - Custom React hooks
  - `useTransactionTracker.js` - Hook for tracking transaction status

## Special Thanks

https://oneclickdapp.com (Original inspiration)

In the past years, **Patrick Gallagher** created a tool named OneClick DApp for the community. However, this tool has not worked for a long time since mid-2023. So we created Quick dApp as a new tool to replace it under the name of Web3Camp.

## License

This project is licensed under the MIT License.
