import { ContractFactory, ethers } from "ethers";
import {
  PolkaSigner as SubstrateSigner,
  Signer as BodhiSigner,
  Provider as BodhiProvider,
} from "@acala-network/bodhi";
import { Keyring, WsProvider } from "@polkadot/api";
import Trader from "../build/Trader.json";
import prompter from "prompt-sync";
const tokenAddresses = new Map([
  ["ACA", "0x0000000000000000000100000000000000000000"],
  ["AUSD", "0x0000000000000000000100000000000000000001"],
  ["DOT", "0x0000000000000000000100000000000000000002"],
  ["LDOT", "0x0000000000000000000100000000000000000003"],
  ["TAP", "0x0000000000000000000100000000000000000004"],
  ["LP_ACA_AUSD", "0x0000000000000000000200000000000000000001"],
  ["LP_LDOT_AUSD", "0x0000000000000000000200000000010000000003"],
  ["LP_LCDOT_AUSD", "0x000000000000000000020000000001020000000D"],
  ["LP_LCDOT_DOT", "0x000000000000000000020000000002020000000d"],
  ["SA_DOT", "0x0000000000000000000300000000000000000000"],
  ["LCDOT_13", "0x000000000000000000040000000000000000000d"],
  ["FA_GLMR", "0x0000000000000000000500000000000000000000"],
  ["FA_PARA", "0x0000000000000000000500000000000000000001"],
  ["FA_ASTR", "0x0000000000000000000500000000000000000002"],
  ["FA_IBTC", "0x0000000000000000000500000000000000000003"],
  ["FA_INTR", "0x0000000000000000000500000000000000000004"],
  ["FA_WBTC", "0x0000000000000000000500000000000000000005"],
  ["FA_WETH", "0x0000000000000000000500000000000000000006"],
  ["FA_EQ", "0x0000000000000000000500000000000000000007"],
  ["FA_EQD", "0x0000000000000000000500000000000000000008"],
]);

const prompt = prompter();
const token1 = prompt("Enter symbol for first token: ").toUpperCase();
const token2 = prompt("Enter symbol for second token: ").toUpperCase();
const amount = prompt("Enter amount for swap: ");
const tokenAddress1 = tokenAddresses.get(token1);
const tokenAddress2 = tokenAddresses.get(token2);

async function main() {
  if (typeof tokenAddress1 === undefined) {
    console.log("Token not supported");
    return;
  }
  if (typeof tokenAddress2 === undefined) {
    console.log("Token not supported");
    return;
  }
  console.log(`Trading ${token1} for ${tokenAddress2} amount ${token2}`);

  const provider = new BodhiProvider({
    provider: new WsProvider("ws://localhost:8000"),
  });
  await provider.isReady();

  const keyring = new Keyring({ type: "sr25519" });
  const pair = keyring.addFromUri("//Alice");

  const signer = new SubstrateSigner(provider.api.registry, [pair]);
  const wallet = new BodhiSigner(provider, pair.address, signer);

  if (!(await wallet.isClaimed())) {
    console.log("Claiming account...");
    await wallet.claimDefaultAccount();
  }

  console.log("Deploying trader contract...");

  const trader = await ContractFactory.fromSolidity(Trader)
    .connect(wallet)
    .deploy({ value: ethers.parseEther("100") });
  const traderAddress = await trader.getAddress();
  console.log(
    `Trader deployed to ${traderAddress} with balance: ${await provider.getBalance(
      traderAddress
    )}`
  );

  const traderSubstrateAddress = await provider.getSubstrateAddress(
    traderAddress
  );
  console.log("Trader Substrate address: ", traderSubstrateAddress);

  await trader.trade(tokenAddress1, tokenAddress2, amount).catch((error) => {
    console.log("First trade failed as expected with error: ", error.message);
  });
  console.log(
    `Trade successfull. Remaining balance: ${await provider.getBalance(
      traderAddress
    )}`
  );

  console.log(
    "Trader AUSD balance: ",
    (
      await provider.api.query.tokens.accounts(traderSubstrateAddress, {
        Token: "AUSD",
      })
    ).free.toHuman()
  );
}

main()
  .catch((error) => {
    console.error(error);
  })
  .finally(() => process.exit());
