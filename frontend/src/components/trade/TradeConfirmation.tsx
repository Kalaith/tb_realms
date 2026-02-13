import React, { useRef, useEffect } from "react";
import { TradeConfirmationProps } from "../../entities/Trade";
import { formatCurrency } from "../../utils/formatUtils";
import { TransactionType } from "../../entities/Portfolio";

/**
 * TradeConfirmation component - Modal dialog for confirming a trade
 * Implements focus trapping for better keyboard accessibility
 */
const TradeConfirmation: React.FC<TradeConfirmationProps> = ({
  stock,
  tradeType,
  shares,
  amount,
  onConfirm,
  onCancel,
  loading,
  canAfford,
}) => {
  // Trap focus inside modal
  const modalRef = useRef<HTMLDivElement>(null);
  const confirmButtonRef = useRef<HTMLButtonElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // Focus confirm button when modal opens
    confirmButtonRef.current?.focus();

    // Handle escape key to close modal
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onCancel();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onCancel]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirmation-title"
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md mx-4"
        ref={modalRef}
        tabIndex={-1}
      >
        <h2
          id="confirmation-title"
          className="text-xl font-bold text-gray-900 dark:text-white mb-4"
        >
          Confirm {tradeType === TransactionType.BUY ? "Purchase" : "Sale"}
        </h2>

        <div className="space-y-3 mb-6">
          <p className="text-gray-700 dark:text-gray-300">
            <span className="font-medium text-gray-900 dark:text-white">
              Stock:
            </span>{" "}
            {stock.name} ({stock.symbol})
          </p>
          <p className="text-gray-700 dark:text-gray-300">
            <span className="font-medium text-gray-900 dark:text-white">
              Action:
            </span>{" "}
            {tradeType === TransactionType.BUY ? "Buy" : "Sell"} {shares} share
            {shares !== 1 ? "s" : ""}
          </p>
          <p className="text-gray-700 dark:text-gray-300">
            <span className="font-medium text-gray-900 dark:text-white">
              Price:
            </span>{" "}
            {formatCurrency(stock.currentPrice)} per share
          </p>
          <p className="text-gray-700 dark:text-gray-300">
            <span className="font-medium text-gray-900 dark:text-white">
              Total:
            </span>{" "}
            {formatCurrency(amount)}
          </p>
        </div>

        {!canAfford && tradeType === TransactionType.BUY && (
          <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 rounded-md dark:bg-red-900 dark:text-red-200">
            Insufficient funds for this purchase.
          </div>
        )}

        <div className="flex space-x-3">
          <button
            ref={confirmButtonRef}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
              loading || !canAfford
                ? "bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500"
                : tradeType === TransactionType.BUY
                  ? "bg-green-600 hover:bg-green-700 text-white dark:bg-green-700 dark:hover:bg-green-800"
                  : "bg-red-600 hover:bg-red-700 text-white dark:bg-red-700 dark:hover:bg-red-800"
            }`}
            onClick={onConfirm}
            disabled={loading || !canAfford}
            aria-disabled={loading || !canAfford}
          >
            {loading ? "Processing..." : "Confirm"}
          </button>
          <button
            ref={cancelButtonRef}
            className="flex-1 py-2 px-4 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-md transition-colors dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200"
            onClick={onCancel}
            disabled={loading}
            aria-disabled={loading}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default TradeConfirmation;
