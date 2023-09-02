
# Encode Solidity Bootcamp Q3
## Weekend Project 5 - Group 6

Decentralized Lottery application based on previously deployed Token and Lottery contracts.

https://esbq3-group6-lottery.netlify.app/

- **Token contract**: 0xba64c03e45cc1E3Fe483dBDB3A671DBa7a0Ab7cD
- **Lottery contract**: 0xC7FA315CFc80505F725B2ebB0d75e35D086f025d

The dApp displays information about the connected wallet and the Lottery state. It also allows the purchase/sell of the tokens needed to enter the Lottery and the redeeming of the Lottery prize (by the winner). When the owner of the deployed contracts connects, a new section appears where he can start a new Lottery, withdraw the fees collected or transfer the ownership to another account.

The application was implemented using React/Next.js and Wagmi hooks to interact with the smart contracts.

## Setup:
1. Clone the repository.
2. Install dependencies with `npm install` within `frontend` folder.
3. Update variables with your contracts addresses inside `/frontend/components/instructionsComponent/index.tsx`
4. Run `npm run dev` and open [http://localhost:3000](http://localhost:3000) with your browser to interact with the dApp.
