"use client";

import { useState } from "react";
import { createWalletClient, custom, encodeFunctionData, keccak256, stringToBytes } from "viem";
import { CHAIN, OATH_ABI, OATH_CONTRACT, explorerTxUrl } from "@/lib/chain";
import { ensureChain, getEthereum } from "@/lib/wallet";

/**
 * Кнопка «поклясться ончейн»: пишет клан в контракт KlanOath на Robinhood Chain.
 * Показывается только участникам, вошедшим по кошельку, и только если задеплоен контракт.
 */
export function OathButton({ clanSlug, clanName, hasWallet }: { clanSlug: string; clanName: string; hasWallet: boolean }) {
  const [txHash, setTxHash] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!hasWallet || !OATH_CONTRACT) return null;

  async function swear() {
    setError(null);
    const eth = getEthereum();
    if (!eth) {
      setError("Кошелёк не найден.");
      return;
    }
    setBusy(true);
    try {
      await ensureChain(eth, CHAIN);
      const clanId = keccak256(stringToBytes(clanSlug));
      const data = encodeFunctionData({ abi: OATH_ABI, functionName: "swear", args: [clanId] });
      const accounts = (await eth.request({ method: "eth_requestAccounts" })) as string[];
      const hash = (await eth.request({
        method: "eth_sendTransaction",
        params: [{ from: accounts[0], to: OATH_CONTRACT, data }],
      })) as string;
      setTxHash(hash);
    } catch (e) {
      const err = e as { shortMessage?: string; message?: string };
      setError(err.shortMessage ?? err.message ?? "Транзакция не прошла.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-3">
      <button type="button" onClick={swear} disabled={busy} className="btn-ghost text-sm disabled:opacity-50">
        {busy ? "Подтверди в кошельке…" : `Поклясться ончейн · ${clanName}`}
      </button>
      {txHash && (
        <p className="mt-2 text-xs font-semibold text-muted">
          Клятва отправлена в {CHAIN.name}.{" "}
          <a href={explorerTxUrl(txHash)} target="_blank" rel="noreferrer" className="underline text-lime">
            Открыть транзакцию
          </a>
        </p>
      )}
      {error && <p className="mt-2 text-xs font-semibold text-[#b3260b]">{error}</p>}
    </div>
  );
}
