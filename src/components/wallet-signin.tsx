"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createWalletClient, custom } from "viem";
import { confirmWalletLoginAction, requestWalletLoginAction } from "@/lib/actions";
import { CHAIN } from "@/lib/chain";
import { ensureChain, getEthereum } from "@/lib/wallet";

/** Вход через кошелёк (Robinhood Chain): подпись сообщения вместо пароля. */
export function WalletSignIn() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function signIn() {
    setError(null);
    const eth = getEthereum();
    if (!eth) {
      setError("Кошелёк не найден — установи MetaMask или другой Web3-кошелёк.");
      return;
    }
    setBusy(true);
    try {
      const accounts = (await eth.request({ method: "eth_requestAccounts" })) as string[];
      const address = accounts[0];
      if (!address) throw new Error("Кошелёк не выдал адрес.");

      await ensureChain(eth, CHAIN);

      const message = await requestWalletLoginAction(address);
      const client = createWalletClient({ transport: custom(eth) });
      const signature = await client.signMessage({ account: address as `0x${string}`, message });

      const ok = await confirmWalletLoginAction(address, message, signature);
      if (!ok) {
        setError("Подпись не прошла проверку. Попробуй ещё раз.");
        return;
      }
      router.push("/feed");
      router.refresh();
    } catch (e) {
      const err = e as { shortMessage?: string; message?: string };
      setError(err.shortMessage ?? err.message ?? "Не удалось войти кошельком.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-4">
      <button type="button" onClick={signIn} disabled={busy} className="btn-ghost w-full disabled:opacity-50">
        {busy ? "Проверяем подпись…" : `Войти кошельком · ${CHAIN.name}`}
      </button>
      {error && <p className="mt-2 text-xs font-semibold text-[#e8927d]">{error}</p>}
    </div>
  );
}
