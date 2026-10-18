/**
 * Robinhood Chain — сеть для klan.social.
 * Mainnet: chain ID 4663 (0x1237), газ — ETH.
 * Testnet: chain ID 46630 (0xB626).
 * Документация: https://docs.robinhood.com/chain/connecting/
 */

export const NETWORK = process.env.NEXT_PUBLIC_RH_NETWORK === "testnet" ? "testnet" : "mainnet";

type ChainInfo = {
  id: number;
  idHex: `0x${string}`;
  name: string;
  rpcUrl: string;
  explorerUrl: string;
  testnet: boolean;
};

export const CHAINS: Record<"mainnet" | "testnet", ChainInfo> = {
  mainnet: {
    id: 4663,
    idHex: "0x1237",
    name: "Robinhood Chain",
    rpcUrl: "https://rpc.mainnet.chain.robinhood.com",
    explorerUrl: "https://robinhoodchain.blockscout.com",
    testnet: false,
  },
  testnet: {
    id: 46630,
    idHex: "0xb626",
    name: "Robinhood Chain Testnet",
    rpcUrl: "https://rpc.testnet.chain.robinhood.com",
    explorerUrl: "https://explorer.testnet.chain.robinhood.com",
    testnet: true,
  },
};

/** Активная сеть (переключается env'ом NEXT_PUBLIC_RH_NETWORK). */
export const CHAIN = CHAINS[NETWORK];

/** Адрес контракта KlanOath (см. contracts/KlanOath.sol). Пустой — кнопка ончейн-клятвы скрыта. */
export const OATH_CONTRACT = (process.env.NEXT_PUBLIC_OATH_CONTRACT ?? "") as `0x${string}` | "";

export const OATH_ABI = [
  {
    type: "function",
    name: "swear",
    stateMutability: "nonpayable",
    inputs: [{ name: "clanId", type: "bytes32" }],
    outputs: [],
  },
  {
    type: "function",
    name: "oathOf",
    stateMutability: "view",
    inputs: [{ name: "member", type: "address" }],
    outputs: [
      { name: "clanId", type: "bytes32" },
      { name: "swornAt", type: "uint64" },
    ],
  },
  {
    type: "event",
    name: "OathSworn",
    inputs: [
      { name: "member", type: "address", indexed: true },
      { name: "clanId", type: "bytes32", indexed: true },
    ],
  },
] as const;

/** Короткий адрес для отображения: 0x1234…abcd */
export function shortAddress(address: string): string {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

export function explorerAddressUrl(address: string): string {
  return `${CHAIN.explorerUrl}/address/${address}`;
}

export function explorerTxUrl(hash: string): string {
  return `${CHAIN.explorerUrl}/tx/${hash}`;
}
