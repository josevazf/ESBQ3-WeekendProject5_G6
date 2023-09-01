import { useState, useEffect } from 'react';
import styles from './instructionsComponent.module.css';
import { useAccount, useBalance, useContractRead, useContractWrite, useNetwork, usePrepareContractWrite, useWaitForTransaction } from 'wagmi';
import { ethers} from 'ethers';
import * as tokenJson from '../assets/LotteryToken.json';
import * as lotteryJson from '../assets/Lottery.json';
import Footer from "@/components/instructionsComponent/navigation/footer";

const TOKEN_ADDRESS = '0xba64c03e45cc1E3Fe483dBDB3A671DBa7a0Ab7cD';
const LOTTERY_ADDRESS = '0xC7FA315CFc80505F725B2ebB0d75e35D086f025d';

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
						<img src="https://tomato-leading-stoat-542.mypinata.cloud/ipfs/QmZB7CZADmeJ2wwas5U6wbdP3MZ84mUWDoqGxCq5JtYpDq"></img>
 						{/*<h1>
						🤑 <span> Lottery</span> 🤑
						</h1>
						<h3>The ultimate web3 Lottery</h3> */}
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
				<UserInfo></UserInfo>
				<hr></hr>
				<LotteryInfo></LotteryInfo>
				<hr></hr>
				<LotteryContract></LotteryContract>
				<hr></hr>
				<OwnerInteractions address={address}></OwnerInteractions>
				<Footer />
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

function UserInfo() {
	const {address, isConnecting, isDisconnected } = useAccount();
	const { chain } = useNetwork();
	if (address)
    return (
      <div>
				<header className={styles.header_container}>
					<div className={styles.header}>
						<h3>User Info</h3>
					</div>
				</header>
					<p>Connected to <i>{chain?.name}</i> network </p>
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
  return <div><b>Token: </b> {name} ({TokenSymbol()})</div>;
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
  return symbol;
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

	if (isLoading) return <div>Checking bets state…</div>;
  if (isError) return <div>Error checking bets state</div>;
  if (Number(data) === 0) return <div><p>⭕ You do not have any prize to claim...</p></div>
	if (Number(data) !== 0) return <div>
		<p>🏆 You have a prize of {ethers.formatUnits(String(data))} <TokenSymbol></TokenSymbol>!&nbsp;
		<WithdrawPrize amount={ethers.formatUnits(String(data))}></WithdrawPrize>
		</p></div>;
}

function WithdrawPrize({amount}: {amount: string}) {
	const { data, isLoading, isSuccess, write } = useContractWrite({
    address: LOTTERY_ADDRESS,
    abi: lotteryJson.abi,
    functionName: 'prizeWithdraw',
  })
	console.info({data});
		return (
			<>
				<button
					disabled={!write}
					onClick={() =>write ({
						args: [ethers.parseUnits(amount)] 
					})
				}
				>
					Claim Prize
				</button>
				{isLoading && <>&nbsp;Approve in wallet</>}
				{isSuccess && <>&nbsp; 
					<a target={"_blank"} href={`https://sepolia.etherscan.io/tx/${data?.hash}`}>
					Transaction details</a></>}
			</>
		);
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

	const betsOpen = data ? true : false;
	
	if (isLoading) return <div>Checking bets state…</div>;
  if (isError) return <div>Error checking bets state</div>;
	if (betsOpen) return <div><b>Bets state:</b> Open <CloseLottery isDisabled={betsOpen}></CloseLottery></div>;
	if (!betsOpen) return <div><b>Bets state:</b> Closed <CloseLottery isDisabled={betsOpen}></CloseLottery></div>;
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
  if (time === 0) return <div>
		<b>Closing time:</b> Not defined</div>;
	if (time < now.getTime()/1000) return <div>
		Lottery ended at {closingTime.toLocaleTimeString()} ({closingTime.toLocaleDateString()})</div>;
	if (time > now.getTime()/1000) return <div>
		Lottery ending at {closingTime.toLocaleTimeString()} ({closingTime.toLocaleDateString()})</div>;
}

function CloseLottery(isDisabled: {isDisabled: boolean}) {
	const { data, isLoading, isSuccess, write } = useContractWrite({
    address: LOTTERY_ADDRESS,
    abi: lotteryJson.abi,
    functionName: 'closeLottery',
  })
		return (
			<>
				<button
					disabled={!isDisabled}
					onClick={() =>write ({
						args: []
					})
				}
				>
					Close Lottery
				</button>
				{isLoading && <>&nbsp;Approve in wallet</>}
				{isSuccess && <>&nbsp; 
					<a target={"_blank"} href={`https://sepolia.etherscan.io/tx/${data?.hash}`}>
							Transaction details
					</a></>}
			</>
		);
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

// formatUnits function started giving problems... had to change to 10**18
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
  return <div><b>Prize Pool:</b> {ethers.formatUnits(String(data))} <TokenSymbol></TokenSymbol> </div>;
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
				<CheckAllowance address={address}></CheckAllowance>
				<ApproveTokens></ApproveTokens>
					<br></br>
				<BuyTokens></BuyTokens>
					<br></br>
				<b>Sell Tokens</b>
				<SellTokens></SellTokens>
					<br></br>
				<TransferTokens></TransferTokens>
					<br></br>
				<BetMany></BetMany>
					<br></br>
		</div>
	);
}

function CheckAllowance(params: { address: `0x${string}` }) {
	const { data, isError, isLoading } = useContractRead({
    address: TOKEN_ADDRESS,
    abi: tokenJson.abi,
    functionName: 'allowance',
		args: [params.address, LOTTERY_ADDRESS],
		watch: true,
  });

	const allowance = Number(data);
	if (isLoading) return <div>Checking allowance…</div>;
  if (isError) return <div>Error checking allowance</div>;
  return <div><b>Approved Tokens: </b> {ethers.formatUnits(BigInt(allowance))} <TokenSymbol></TokenSymbol></div>;
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
				{isLoading && <>&nbsp;Approve in wallet</>}
				{isSuccess && <>&nbsp; 
					<a target={"_blank"} href={`https://sepolia.etherscan.io/tx/${data?.hash}`}>
						Transaction details
					</a></>}
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
						placeholder={`100 ${TokenSymbol()}/0.01 ETH`}
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
					{isLoading && <>&nbsp;Approve in wallet</>}
					{isSuccess && <>&nbsp; 
						<a target={"_blank"} href={`https://sepolia.etherscan.io/tx/${data?.hash}`}>Transaction details</a></>}
			</div>
		);
}

function SellTokens() {
	const [amount, setAmount] = useState("");
	const { data, isLoading, isSuccess, write } = useContractWrite({
    address: LOTTERY_ADDRESS,
    abi: lotteryJson.abi,
    functionName: 'returnTokens',
  })
		return (
			<div>
				<input
					type='number'
					value={amount}
					onChange={(e) => setAmount(e.target.value)}
					placeholder={`0.01 ETH/100 ${TokenSymbol()}`}
				/>
					<button
						disabled={!write}
						onClick={() => {
							write ({args: [ethers.parseUnits(amount)]})
					}}
					>
						Sell Tokens
					</button>
					{isLoading && <>&nbsp;Approve in wallet</>}
					{isSuccess && <>&nbsp; 
						<a target={"_blank"} href={`https://sepolia.etherscan.io/tx/${data?.hash}`}>
							Transaction details
						</a></>}
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
				<b>Transfer Tokens</b>
				<br></br>	
					<input
						value={addressTo}
						onChange={(e) => setAddress(e.target.value)}
						placeholder='Address to (0x...)'
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
						{isLoading && <>&nbsp;Approve in wallet</>}
						{isSuccess && <>&nbsp; 
							<a target={"_blank"} href={`https://sepolia.etherscan.io/tx/${data?.hash}`}>
								Transaction details
							</a></>}
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
					<b>Place Bets</b>
				</label>
				<br></br>
					<input
						type='number'
						value={amount}
						onChange={(e) => setAmount(e.target.value)}
						placeholder={`1 bet = ${final/(10**18)} ${TokenSymbol()}`}
					/>
					<button
						disabled={!write}
						onClick={() =>write ({
							args: [amount]
						})
					}
					>
						Bet
					</button>
					{isLoading && <>&nbsp;Approve in wallet</>}
					{isSuccess && <>&nbsp; 
						<a target={"_blank"} href={`https://sepolia.etherscan.io/tx/${data?.hash}`}>
							Transaction details
      			</a></>}
			</div>
		);
}

////////\\\\\\\\   OWNER INTERACTIONS   ////////\\\\\\\\

function GetOwner() {
	const { data, isError, isLoading } = useContractRead({
    address: LOTTERY_ADDRESS,
    abi: lotteryJson.abi,
    functionName: 'owner',
		watch: true
  });

  return String(data);
}

function OwnerInteractions(params: { address: `0x${string}` }) {
	const owner = GetOwner();
	if (owner === params.address)
	return (
		<div>
			<header className={styles.header_container}>
				<div className={styles.header}>
					<h3>Owner Interactions</h3>
				</div>
			</header>
				<OpenBets></OpenBets>
					<br></br>
				<OwnerFees></OwnerFees>
				<WithdrawFees></WithdrawFees>
					<br></br>
				<TransferOwnership></TransferOwnership>
					<br></br>
		</div>
	);
	return (
		<>
			<header className={styles.header_container}>
				<div className={styles.header}>
					<h3>Owner Interactions</h3>
					You are not the owner!
				</div>
			</header>
		</>
	)
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
  return <div><b>Fees collected:</b> {ethers.formatUnits(String(data))} <TokenSymbol></TokenSymbol></div>;
}

function OpenBets() {
	const [amount, setDeadline] = useState("");
	const now = new Date();
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
					type='datetime-local'
					min={`${now.toISOString()}`.slice(0, -8)}
					value={amount}
					onChange={(e) => setDeadline(e.target.value)}
				/>
				<button
					disabled={!write}
					onClick={() =>write ({
						args: [BigInt(`${new Date(amount).getTime()/1000}`)]
					})
				}
				>
					Open Bets
				</button>
				{isLoading && <>&nbsp;Approve in wallet</>}
				{isSuccess && <>&nbsp; 
					<a target={"_blank"} href={`https://sepolia.etherscan.io/tx/${data?.hash}`}>
						Transaction details
					</a></>}
		</div>
	);
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
						args: [ethers.parseUnits(amount)],
					})
				}
				>
					Withdraw Fees
				</button>
				{isLoading && <>&nbsp;Approve in wallet</>}
				{isSuccess && <>&nbsp; 
					<a target={"_blank"} href={`https://sepolia.etherscan.io/tx/${data?.hash}`}>
						Transaction details
					</a></>}
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
			<b>Transfer Ownership</b>
			<br></br>
				<input
					value={addressTo}
					onChange={(e) => setAddress(e.target.value)}
					placeholder='Address to (0x...)'
				/>
					<button
						disabled={!write}
						onClick={() =>write ({
							args: [addressTo],
						})
					}
					>
						Transfer
					</button>
					{isLoading && <>&nbsp;Approve in wallet</>}
					{isSuccess && <>&nbsp; 
						<a target={"_blank"} href={`https://sepolia.etherscan.io/tx/${data?.hash}`}>
							Transaction details
						</a></>}
		</div>
	);
}
