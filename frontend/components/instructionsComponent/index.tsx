import { useState, useEffect } from 'react';
import styles from './instructionsComponent.module.css';
import { useAccount, useBalance, useContractRead, useContractWrite, useNetwork, usePrepareContractWrite, useWaitForTransaction } from 'wagmi';
import { BigNumberish, dataSlice, ethers, toBigInt } from 'ethers';
import * as tokenJson from '../assets/LotteryToken.json';
import * as lotteryJson from '../assets/Lottery.json';

const TOKEN_ADDRESS = '0x3D1752A2BDA6D85347ad8d4FFD59ac7d3CEcEc11';
const LOTTERY_ADDRESS = '0x576699323492733FC4EAA26b4C973D01054e86c1';
const MAX_ALLOWANCE =
  115792089237316195423570985008687907853269984665640564039457584007913129639935;

export default function Loading() {
	const [mounted, setMounted] = useState(false);
	useEffect(() => {
		setMounted(true)
	}, [])

  return (
		mounted &&
			<div className={styles.container}>
				<header className={styles.header_container}>
					<div className={styles.header}>
						<h1>
						🤑 <span> Lottery</span> 🤑
						</h1>
						<h3>The ultimate web3 Lottery</h3>
					</div>
				</header>
					<p className={styles.get_started}>
						<PageBody></PageBody>
					</p>
			</div>
  );
}

function PageBody() {
	const {address, isConnecting, isDisconnected } = useAccount();
	if (address)
		return (
			<div>
				<WalletInfo></WalletInfo>
				<hr></hr>
				<LotteryInfo></LotteryInfo>
				<hr></hr>
				<TokenContract></TokenContract>
				<hr></hr>
				<LotteryContract></LotteryContract>
				<hr></hr>
				<OwnerInteractions></OwnerInteractions>
			</div>
		);
		if (isConnecting)
    return (
      <div>
        <p>Loading...</p>
      </div>
    );
  if (isDisconnected)
    return (
      <div>
        <p>Wallet disconnected. Connect wallet to continue</p>
      </div>
    );
  return (
    <div>
      <p>Connect wallet to continue</p>
    </div>
  );
}

////////\\\\\\\\     WALLET INFO   ////////\\\\\\\\

function WalletInfo() {
	const {address, isConnecting, isDisconnected } = useAccount();
	const { chain } = useNetwork();
	if (address)
    return (
      <div>
				<header className={styles.header_container}>
					<div className={styles.header}>
						<h3>Wallet Info</h3>
					</div>
				</header>
					<p>Connected to <i>{chain?.name}</i> network </p>
					{/* <WalletBalance address={address}></WalletBalance> */}
					<TokenName></TokenName>
					<WalletTokenBalance address={address}></WalletTokenBalance>
					<WinnerPrize address={address}></WinnerPrize>
      </div>
    );
  if (isConnecting)
    return (
      <div>
        <p>Loading...</p>
      </div>
    );
  if (isDisconnected)
    return (
      <div>
        <p>Wallet disconnected. Connect wallet to continue</p>
      </div>
    );
  return (
    <div>
      <p>Connect wallet to continue</p>
    </div>
  );
}

function TokenName() {
  const { data, isError, isLoading } = useContractRead({
    address: TOKEN_ADDRESS,
    abi: tokenJson.abi,
    functionName: "name",
  });

  const name = typeof data === "string" ? data : 0;

  if (isLoading) return <div>Fetching name…</div>;
  if (isError) return <div>Error fetching name</div>;
  return <div><b>Token: </b> {name} (<TokenSymbol></TokenSymbol>)</div>;
}

function TokenSymbol() {
  const { data, isError, isLoading } = useContractRead({
    address: TOKEN_ADDRESS,
    abi: tokenJson.abi,
    functionName: 'symbol',
  });

  const symbol = typeof data === 'string' ? data : 0;

  if (isLoading) return <div>Fetching name…</div>;
  if (isError) return <div>Error fetching symbol</div>;
  return <>{symbol}</>;
}

function WalletTokenBalance(params: { address: `0x${string}` }) {
  const { data, isError, isLoading } = useBalance({
    address: params.address,
		token: TOKEN_ADDRESS,
		watch: true
  });

  if (isLoading) return <div>Fetching balance…</div>;
  if (isError) return <div>Error fetching balance</div>;
  return <div><b>Balance: </b>{data?.formatted} <TokenSymbol></TokenSymbol></div>;
}

function WinnerPrize(params: { address: `0x${string}` }) {
	const { data, isError, isLoading } = useContractRead({
    address: LOTTERY_ADDRESS,
    abi: lotteryJson.abi,
    functionName: 'prize',
		args: [params.address],
		watch: true
  });

	const isWinner = Number(data) !== 0 ? 'You have won the last Lottery!' : 'You did not win the last Lottery...';

	if (isLoading) return <div>Checking bets state…</div>;
  if (isError) return <div>Error checking bets state</div>;
  return <div><p>{isWinner}</p>
		<p><b>Winning prize:</b> {Number(data)} <TokenSymbol></TokenSymbol></p></div>;
}

////////\\\\\\\\   LOTTERY INFO   ////////\\\\\\\\

function LotteryInfo() {
	return (
		<div>
			<header className={styles.header_container}>
				<div className={styles.header}>
					<h3>Lottery Info</h3>
				</div>
			</header>
				<BetsState></BetsState>
				<BetsClosingTime></BetsClosingTime>
				<TokenPrice></TokenPrice>
				<FinalPrice></FinalPrice>
				<PrizePool></PrizePool>
		</div>
	);
}

function BetsState() {
	const { data, isError, isLoading } = useContractRead({
    address: LOTTERY_ADDRESS,
    abi: lotteryJson.abi,
    functionName: 'betsOpen',
		watch: true
  });

	const betsOpen = data ? 'Open' : 'Closed';

	if (isLoading) return <div>Checking bets state…</div>;
  if (isError) return <div>Error checking bets state</div>;
  return <div><b>Bets state:</b> {betsOpen}</div>;
}

function BetsClosingTime() {
	const { data, isError, isLoading } = useContractRead({
    address: LOTTERY_ADDRESS,
    abi: lotteryJson.abi,
    functionName: 'betsClosingTime',
		watch: true
  });

	const now = new Date();
	const time = Number(data);
	const closingTime = new Date(time * 1000);

	if (isLoading) return <div>Checking closing time…</div>;
  if (isError) return <div>Error checking closing time</div>;
  if (time === 0) return <div><b>Closing time:</b> Not defined</div>;
	if (time < now.getTime()) return <div><b>Closing time:</b> ended at {closingTime.toLocaleTimeString()} ({closingTime.toLocaleDateString()})</div>
	if (time !== 0) return <div><b>Closing time:</b> ending at {closingTime.toLocaleTimeString()} ({closingTime.toLocaleDateString()})</div>;
}

function TokenPrice() {
	const { data, isError, isLoading } = useContractRead({
    address: LOTTERY_ADDRESS,
    abi: lotteryJson.abi,
    functionName: 'purchaseRatio',
		watch: true
  });

	if (isLoading) return <div>Checking token price…</div>;
  if (isError) return <div>Error checking token price</div>;
  return <div><b>Token price:</b> {String((Number(data) * 0.01))} <TokenSymbol></TokenSymbol> / 0.01 ETH</div>;
}

function BetPrice() {
	const {data} = useContractRead({
    address: LOTTERY_ADDRESS,
    abi: lotteryJson.abi,
    functionName: 'betPrice',
		watch: true
  });
  return String(data);
}

function BetFee() {
	const {data} = useContractRead({
    address: LOTTERY_ADDRESS,
    abi: lotteryJson.abi,
    functionName: 'betFee',
		watch: true
  });
  return String(data);
}

// formatUnits function started givin problems... had to change to 10**18
function FinalPrice() {
	const price = BetPrice();
	const fee = BetFee();
	const final = Number(price) + Number(fee);
	return <div><b>Bet Price:</b> {final/(10**18)} <TokenSymbol></TokenSymbol> ({Number(price)/(10**18)} + {Number(fee)/(10**18)} Fee)</div>;
}

function PrizePool() {
	const { data, isError, isLoading } = useContractRead({
    address: LOTTERY_ADDRESS,
    abi: lotteryJson.abi,
    functionName: 'prizePool',
		watch: true
  });

	if (isLoading) return <div>Checking Prize Pool…</div>;
  if (isError) return <div>Error checking Prize Pool</div>;
  return <div><b>Prize Pool:</b> {String(data)} <TokenSymbol></TokenSymbol></div>;
}

////////\\\\\\\\   TOKEN CONTRACT   ////////\\\\\\\\

function TokenContract() {
	return (
		<div>
			<header className={styles.header_container}>
				<div className={styles.header}>
					<h3>Token Interaction</h3>
				</div>
			</header>
				<TransferTokens></TransferTokens>
					<br></br>
		</div>
	);
}

function TransferTokens() {
	const [addressTo, setAddress] = useState("");
	const [amount, setAmount] = useState("");
	const { data, isLoading, isSuccess, write } = useContractWrite({
    address: TOKEN_ADDRESS,
    abi: tokenJson.abi,
    functionName: 'transfer',
  })

		return (
			<div>
				<input
					value={addressTo}
					onChange={(e) => setAddress(e.target.value)}
					placeholder='Address (0x...)'
				/>
					<br></br>
						<input
							type='number'
							value={amount}
							onChange={(e) => setAmount(e.target.value)}
							placeholder='Amount'
						/>
					<button
						disabled={!write}
						onClick={() =>write ({
							args: [addressTo, ethers.parseUnits(amount)],
						})
					}
					>
						Transfer Tokens
					</button>
					{isLoading && <div>Approve in wallet</div>}
					{isSuccess && <div> 
						<a target={"_blank"} href={`https://sepolia.etherscan.io/tx/${data?.hash}`}>
							Transaction details
      			</a></div>}
			</div>
		);
}

////////\\\\\\\\   LOTTERY CONTRACT   ////////\\\\\\\\

function LotteryContract() {
	const {address} = useAccount();
	if (address)
	return (
		<div>
			<header className={styles.header_container}>
				<div className={styles.header}>
					<h3>Lottery Interaction</h3>
				</div>
			</header>
				<WinnerPrize address={address}></WinnerPrize>
				<WithdrawPrize></WithdrawPrize>
					<br></br>
				<CheckAllowance address={address}></CheckAllowance>
					<br></br>
				<CloseLottery></CloseLottery>
					<br></br>
				<BuyTokens></BuyTokens>
					<br></br>
				<b>Sell Tokens</b>
				<ApproveTokens></ApproveTokens>
				<SellTokens></SellTokens>
					<br></br>
				{/* <Bet></Bet>
					<br></br> */}
				<BetMany></BetMany>
					<br></br>
		</div>
	);
}

function WithdrawPrize() {
	const [amount, setAmount] = useState("");
	const { data, isLoading, isSuccess, write } = useContractWrite({
    address: LOTTERY_ADDRESS,
    abi: lotteryJson.abi,
    functionName: 'prizeWithdraw',
  })
	console.info({data});
		return (
			<div>
					<input
						type='number'
						value={amount}
						onChange={(e) => setAmount(e.target.value)}
						placeholder="Amount"
					/>
					<button
						disabled={!write}
						onClick={() =>write ({
							value: ethers.parseUnits(amount) 
						})
					}
					>
						Withdraw Prize
					</button>
					{isLoading && <div>Approve in wallet</div>}
					{isSuccess && <div>
						<a target={"_blank"} href={`https://sepolia.etherscan.io/tx/${data?.hash}`}>
							Transaction details
      			</a></div>}
			</div>
		);
}

function BuyTokens() {
	const [amount, setAmount] = useState("");
	const { data, isLoading, isSuccess, write } = useContractWrite({
    address: LOTTERY_ADDRESS,
    abi: lotteryJson.abi,
    functionName: 'purchaseTokens',
  })
		return (
			<div>
				<b>Buy Tokens</b>
				<br></br>
					<input
						type='number'
						value={amount}
						onChange={(e) => setAmount(e.target.value)}
						placeholder="100/0.01 ETH"
					/>
					<button
						disabled={!write}
						onClick={() =>write ({
							value: ethers.parseUnits(String((Number(amount)*0.0001))) 
						})
					}
					>
						Buy
					</button>
					{isLoading && <div>Approve in wallet</div>}
					{isSuccess && <div>
						<a target={"_blank"} href={`https://sepolia.etherscan.io/tx/${data?.hash}`}>
							Transaction details
      			</a></div>}
			</div>
		);
}

function ApproveTokens()	{
	const [amount, setAmount] = useState("");
	const { data, isLoading, isSuccess, write } = useContractWrite({
    address: TOKEN_ADDRESS,
    abi: tokenJson.abi,
    functionName: 'approve',
  })
		return (
			<div>
				<input
					type='number'
					value={amount}
					onChange={(e) => setAmount(e.target.value)}
					placeholder="Amount"
					/>
				<button
					disabled={!write}
					onClick={() => {
						write ({
							args: [LOTTERY_ADDRESS, ethers.parseUnits(amount)],
						})
					}}
				>
					Approve Tokens
				</button>
				{isLoading && <div>Approve in wallet</div>}
				{isSuccess && <div>
					<a target={"_blank"} href={`https://sepolia.etherscan.io/tx/${data?.hash}`}>
						Transaction details
					</a></div>}
			</div>
		);
}

function CheckAllowance(params: { address: `0x${string}` }) {
	const { data, isError, isLoading } = useContractRead({
    address: TOKEN_ADDRESS,
    abi: tokenJson.abi,
    functionName: 'allowance',
		args: [params.address, LOTTERY_ADDRESS],
		watch: true
  });

	const allowance = Number(data);
	if (isLoading) return <div>Checking allowance…</div>;
  if (isError) return <div>Error checking allowance</div>;
  return <div><b>You have allowed: </b> {ethers.formatUnits(BigInt(allowance))} <TokenSymbol></TokenSymbol></div>;
}

function SellTokens() {
	const [amount, setAmount] = useState("");
	const { data, isLoading, isSuccess, write } = useContractWrite({
    address: LOTTERY_ADDRESS,
    abi: lotteryJson.abi,
    functionName: 'returnTokens',
  })
	console.info({data});
		return (
			<div>
					<input
						type='number'
						value={amount}
						onChange={(e) => setAmount(e.target.value)}
						placeholder="Amount"
					/>
					<button
						disabled={!write}
						onClick={() => {
							write ({args: [ethers.parseUnits(amount)]})
					}}
					>
						Sell Tokens
					</button>
					{isLoading && <div>Approve in wallet</div>}
					{isSuccess && <div>
						<a target={"_blank"} href={`https://sepolia.etherscan.io/tx/${data?.hash}`}>
							Transaction details
      			</a></div>}
			</div>
		);
}

function CloseLottery() {
	const [amount, setDeadline] = useState("");
	const { data, isLoading, isSuccess, write } = useContractWrite({
    address: LOTTERY_ADDRESS,
    abi: lotteryJson.abi,
    functionName: 'closeLottery',
  })
		return (
			<div>
				<label>
					Close the lottery and find the winner
				</label>
				<br></br>
					<button
						disabled={!write}
						onClick={() =>write ({
							args: []
						})
					}
					>
						Close Lottery
					</button>
					{isLoading && <div>Approve in wallet</div>}
					{isSuccess && <div>
						<a target={"_blank"} href={`https://sepolia.etherscan.io/tx/${data?.hash}`}>
							Transaction details
      			</a></div>}
			</div>
		);
}

function BetMany() {
	const [amount, setAmount] = useState("");
	const price = BetPrice();
	const fee = BetFee();
	const final = Number(price) + Number(fee);
	const { data, isLoading, isSuccess, write } = useContractWrite({
    address: LOTTERY_ADDRESS,
    abi: lotteryJson.abi,
    functionName: 'betMany',
  })
	console.info({data});
		return (
			<div>
				<label>
					Set number of Bets (1 bet = {final/(10**18)} <TokenSymbol></TokenSymbol>)
				</label>
				<br></br>
					<input
						type='number'
						value={amount}
						onChange={(e) => setAmount(e.target.value)}
						placeholder="Amount"
					/>
				<br></br>
					<button
						disabled={!write}
						onClick={() =>write ({
							args: [amount]
						})
					}
					>
						Place Bets
					</button>
					{isLoading && <div>Approve in wallet</div>}
					{isSuccess && <div>
						<a target={"_blank"} href={`https://sepolia.etherscan.io/tx/${data?.hash}`}>
							Transaction details
      			</a></div>}
			</div>
		);
}

////////\\\\\\\\   OWNER INTERACTIONS   ////////\\\\\\\\

function OwnerInteractions() {
	return (
		<div>
			<header className={styles.header_container}>
				<div className={styles.header}>
					<h3>Owner Interactions</h3>
				</div>
			</header>
				<OwnerFees></OwnerFees>
				<WithdrawFees></WithdrawFees>
					<br></br>
				<OpenBets></OpenBets>
					<br></br>
				<TransferOwnership></TransferOwnership>
					<br></br>
		</div>
	);
}

function OwnerFees() {
	const { data, isError, isLoading } = useContractRead({
    address: LOTTERY_ADDRESS,
    abi: lotteryJson.abi,
    functionName: 'ownerPool',
		watch: true
  });

	if (isLoading) return <div>Checking Prize Pool…</div>;
  if (isError) return <div>Error checking Prize Pool</div>;
  return <div><b>Fees collected:</b> {String(data)} <TokenSymbol></TokenSymbol></div>;
}

function WithdrawFees() {
	const [amount, setAmount] = useState("");
	const { data, isLoading, isSuccess, write } = useContractWrite({
    address: LOTTERY_ADDRESS,
    abi: lotteryJson.abi,
    functionName: 'ownerWithdraw',
  })
	console.info({data});
	return (
		<div>
				<input
					type='number'
					value={amount}
					onChange={(e) => setAmount(e.target.value)}
					placeholder="Amount"
				/>
				<button
					disabled={!write}
					onClick={() =>write ({
						value: ethers.parseUnits(amount) 
					})
				}
				>
					Withdraw Fees
				</button>
				{isLoading && <div>Approve in wallet</div>}
				{isSuccess && <div>
					<a target={"_blank"} href={`https://sepolia.etherscan.io/tx/${data?.hash}`}>
						Transaction details
					</a></div>}
		</div>
	);
}

function OpenBets() {
	const [amount, setDeadline] = useState("");
	const { data, isLoading, isSuccess, write } = useContractWrite({
    address: LOTTERY_ADDRESS,
    abi: lotteryJson.abi,
    functionName: 'openBets',
  })
	return (
		<div>
			<b>Start Lottery</b>
			<br></br>
				<input
					type='number'
					value={amount}
					onChange={(e) => setDeadline(e.target.value)}
					placeholder="Deadline"
				/>
				<button
					disabled={!write}
					onClick={() =>write ({
						args: [amount]
					})
				}
				>
					Open Bets
				</button>
				{isLoading && <div>Approve in wallet</div>}
				{isSuccess && <div>
					<a target={"_blank"} href={`https://sepolia.etherscan.io/tx/${data?.hash}`}>
						Transaction details
					</a></div>}
		</div>
	);
}

function TransferOwnership() {
	const [addressTo, setAddress] = useState("");
	const { data, isLoading, isSuccess, write } = useContractWrite({
    address: LOTTERY_ADDRESS,
    abi: tokenJson.abi,
    functionName: 'transferOwnership',
  })
	return (
		<div>
			<input
				value={addressTo}
				onChange={(e) => setAddress(e.target.value)}
				placeholder='Address (0x...)'
			/>
					<button
						disabled={!write}
						onClick={() =>write ({
							args: [addressTo],
						})
					}
					>
						Transfer Ownership
					</button>
					{isLoading && <div>Approve in wallet</div>}
					{isSuccess && <div> 
						<a target={"_blank"} href={`https://sepolia.etherscan.io/tx/${data?.hash}`}>
							Transaction details
						</a></div>}
		</div>
	);
}
