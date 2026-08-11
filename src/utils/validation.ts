import type { TradingConfig } from "@/types/trading";

export interface AmountValidation {
  valid: boolean;
  reason?: string;
}

export function sanitizeAmount(raw: string): number {
  const cleaned = raw.replace(/[^0-9.]/g, "");
  const value = Number.parseFloat(cleaned);
  if (!Number.isFinite(value) || value < 0) return 0;
  return Math.floor(value);
}

export function validateAmount(
  amount: number,
  balance: number,
  config: TradingConfig,
): AmountValidation {
  if (!Number.isFinite(amount) || Number.isNaN(amount)) {
    return { valid: false, reason: "Invalid amount" };
  }
  if (amount <= 0) return { valid: false, reason: "Amount must be positive" };
  if (amount < config.minimumTrade) {
    return { valid: false, reason: `Minimum trade is $${config.minimumTrade.toLocaleString()}` };
  }
  if (amount > config.maximumTrade) {
    return { valid: false, reason: `Maximum trade is $${config.maximumTrade.toLocaleString()}` };
  }
  if (amount > balance) return { valid: false, reason: "Insufficient balance" };
  return { valid: true };
}
