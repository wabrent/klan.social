"use client";

/** Браузерный EIP-1193 провайдер (MetaMask и т.п.). */
export type Eip1193 = {
  request: (args: { method: string; params?: unknown[] | object }) => Promise<unknown>;
};

export function getEthereum(): Eip1193 | null {
  if (typeof window === "undefined") return null;
  return (window as unknown as { ethereum?: Eip1193 }).ethereum ?? null;
}

/** Добавляет/переключает кошелёк на нужную сеть (Robinhood Chain). */
export async function ensureChain(eth: Eip1193, chain: { idHex: `0x${string}`; name: string; rpcUrl: string; explorerUrl: string }): Promise<void> {
  try {
    await eth.request({ method: "wallet_switchEthereumChain", params: [{ chainId: chain.idHex }] });
  } catch (e: unknown) {
    const code = (e as { code?: number })?.code;
    if (code === 4902) {
      await eth.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: chain.idHex,
            chainName: chain.name,
            nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
            rpcUrls: [chain.rpcUrl],
            blockExplorerUrls: [chain.explorerUrl],
          },
        ],
      });
    } else {
      throw e;
    }
  }
}
