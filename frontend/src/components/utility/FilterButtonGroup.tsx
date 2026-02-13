import React from "react";

/**
 * FilterButtonGroup component - A group of filter buttons with active state styling
 * Used for filtering content on various pages
 */
interface FilterOption {
  id: string;
  label: string;
}

interface FilterButtonGroupProps {
  options: FilterOption[];
  activeFilter: string | null;
  onFilterChange: (filterId: string) => void;
  className?: string;
}

const FilterButtonGroup: React.FC<FilterButtonGroupProps> = ({
  options,
  activeFilter,
  onFilterChange,
  className = "",
}) => {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {options.map((option) => (
        <button
          key={option.id}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            activeFilter === option.id
              ? "bg-blue-600 text-white dark:bg-blue-700"
              : "bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          }`}
          onClick={() => onFilterChange(option.id)}
          aria-pressed={activeFilter === option.id}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
};

export default FilterButtonGroup;
