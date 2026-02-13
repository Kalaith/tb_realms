import React from "react";

interface MarketFiltersProps {
  searchQuery: string;
  selectedSector: string | null;
  sectors: string[];
  onSearchChange: (query: string) => void;
  onSectorChange: (sector: string | null) => void;
}

/**
 * Provides search and filtering capabilities for the Market page
 * Includes a text search input and sector filter buttons
 */
const MarketFilters: React.FC<MarketFiltersProps> = ({
  searchQuery,
  selectedSector,
  sectors,
  onSearchChange,
  onSectorChange,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md dark:bg-gray-800 p-4">
      <div className="flex flex-col md:flex-row justify-between space-y-4 md:space-y-0 md:space-x-4">
        <div className="w-full md:w-1/3">
          <label htmlFor="stock-search" className="sr-only">
            Search stocks
          </label>
          <input
            id="stock-search"
            type="text"
            placeholder="Search by symbol or name"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            aria-label="Search stocks by symbol or name"
          />
        </div>

        <div className="flex-grow">
          <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Sector:
          </div>
          <div
            className="flex flex-wrap gap-2"
            role="radiogroup"
            aria-label="Filter stocks by sector"
          >
            <button
              className={`px-3 py-1 text-sm rounded-full ${
                selectedSector === null
                  ? "bg-blue-600 text-white dark:bg-blue-700"
                  : "bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              }`}
              onClick={() => onSectorChange(null)}
              aria-pressed={selectedSector === null}
              role="radio"
            >
              All
            </button>
            {sectors.map((sector) => (
              <button
                key={sector}
                className={`px-3 py-1 text-sm rounded-full ${
                  selectedSector === sector
                    ? "bg-blue-600 text-white dark:bg-blue-700"
                    : "bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                }`}
                onClick={() => onSectorChange(sector)}
                aria-pressed={selectedSector === sector}
                role="radio"
              >
                {sector}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketFilters;
