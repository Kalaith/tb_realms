// Trading validation constants and utilities
export const tradeConstraints = {
  MIN_SHARES: 1,
  MAX_SHARES_PER_TRADE: 10000,
  MIN_TRADE_AMOUNT: 0.01,
  MAX_TRADE_AMOUNT: 1000000,
} as const;

export interface TradeValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Validates share quantity input
 */
export const validateShares = (
  shares: number,
  availableShares?: number,
): TradeValidationResult => {
  const errors: string[] = [];

  // Check if it's a valid number
  if (isNaN(shares)) {
    errors.push("Please enter a valid number");
    return { isValid: false, errors };
  }

  // Check minimum shares
  if (shares < tradeConstraints.MIN_SHARES) {
    errors.push(`Minimum ${tradeConstraints.MIN_SHARES} share required`);
  }

  // Check maximum shares
  if (shares > tradeConstraints.MAX_SHARES_PER_TRADE) {
    errors.push(
      `Maximum ${tradeConstraints.MAX_SHARES_PER_TRADE.toLocaleString()} shares per trade`,
    );
  }

  // Check if shares is a whole number
  if (shares % 1 !== 0) {
    errors.push("Shares must be a whole number");
  }

  // Check available shares for sell orders
  if (availableShares !== undefined && shares > availableShares) {
    errors.push(`You only have ${availableShares} shares available`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validates trade amount
 */
export const validateTradeAmount = (
  amount: number,
  availableCash?: number,
): TradeValidationResult => {
  const errors: string[] = [];

  // Check if it's a valid number
  if (isNaN(amount)) {
    errors.push("Invalid trade amount");
    return { isValid: false, errors };
  }

  // Check minimum amount
  if (amount < tradeConstraints.MIN_TRADE_AMOUNT) {
    errors.push(
      `Minimum trade amount is $${tradeConstraints.MIN_TRADE_AMOUNT}`,
    );
  }

  // Check maximum amount
  if (amount > tradeConstraints.MAX_TRADE_AMOUNT) {
    errors.push(
      `Maximum trade amount is $${tradeConstraints.MAX_TRADE_AMOUNT.toLocaleString()}`,
    );
  }

  // Check available cash for buy orders
  if (availableCash !== undefined && amount > availableCash) {
    errors.push(`Insufficient funds. Available: $${availableCash.toFixed(2)}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validates complete trade request
 */
export const validateTrade = (
  shares: number,
  tradeAmount: number,
  tradeType: TransactionType,
  availableCash?: number,
  availableShares?: number,
): TradeValidationResult => {
  const allErrors: string[] = [];

  // Validate shares
  const sharesValidation = validateShares(
    shares,
    tradeType === TransactionType.SELL ? availableShares : undefined,
  );
  allErrors.push(...sharesValidation.errors);

  // Validate trade amount
  const amountValidation = validateTradeAmount(
    tradeAmount,
    tradeType === TransactionType.BUY ? availableCash : undefined,
  );
  allErrors.push(...amountValidation.errors);

  // Additional business logic validations
  if (shares > 0 && tradeAmount <= 0) {
    allErrors.push("Trade amount must be greater than zero");
  }

  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
  };
};
import { TransactionType } from "../entities/Portfolio";
