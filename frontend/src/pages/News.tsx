import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { marketEventService } from "../api/marketEventService";
import {
  MarketEvent,
  MarketEventType,
  EventSeverity,
} from "../entities/MarketEvent";
import { LoadingSpinner } from "../components/utility";

/**
 * News page component - Displays market events and news with filtering options
 * Uses only Tailwind CSS for styling
 */
const News: React.FC = () => {
  const [events, setEvents] = useState<MarketEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        setError(null);

        let response;

        if (!activeFilter) {
          response = await marketEventService.getAll();
        } else if (
          Object.values(MarketEventType).includes(
            activeFilter as MarketEventType,
          )
        ) {
          response = await marketEventService.getByType(
            activeFilter as MarketEventType,
          );
        } else if (
          Object.values(EventSeverity).includes(activeFilter as EventSeverity)
        ) {
          response = await marketEventService.getBySeverity(
            activeFilter as EventSeverity,
          );
        }

        if (response?.success && response.data) {
          setEvents(response.data);
        } else {
          setError("Failed to load market events");
        }
      } catch (err) {
        setError("An error occurred while fetching market events");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [activeFilter]);

  const formatEventDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    }).format(new Date(date));
  };

  const getSeverityClasses = (severity: EventSeverity) => {
    switch (severity) {
      case EventSeverity.Low:
        return "border-l-4 border-l-cyan-500";
      case EventSeverity.Medium:
        return "border-l-4 border-l-blue-500";
      case EventSeverity.High:
        return "border-l-4 border-l-orange-500";
      case EventSeverity.Critical:
        return "border-l-4 border-l-red-500";
      default:
        return "border-l-4 border-l-gray-300";
    }
  };

  const getSeverityButtonClasses = (
    severity: EventSeverity,
    isActive: boolean,
  ) => {
    const baseClasses =
      "px-3 py-1.5 rounded-full text-sm font-medium transition-colors";

    if (isActive) {
      switch (severity) {
        case EventSeverity.Low:
          return `${baseClasses} bg-cyan-600 text-white font-bold shadow-sm`;
        case EventSeverity.Medium:
          return `${baseClasses} bg-blue-600 text-white font-bold shadow-sm`;
        case EventSeverity.High:
          return `${baseClasses} bg-orange-600 text-white font-bold shadow-sm`;
        case EventSeverity.Critical:
          return `${baseClasses} bg-red-600 text-white font-bold shadow-sm`;
        default:
          return `${baseClasses} bg-gray-700 text-white font-bold shadow-sm`;
      }
    } else {
      switch (severity) {
        case EventSeverity.Low:
          return `${baseClasses} bg-cyan-200 text-cyan-900 border border-cyan-400 font-bold hover:bg-cyan-300 hover:text-cyan-950`;
        case EventSeverity.Medium:
          return `${baseClasses} bg-blue-200 text-blue-900 border border-blue-400 font-bold hover:bg-blue-300 hover:text-blue-950`;
        case EventSeverity.High:
          return `${baseClasses} bg-orange-200 text-orange-900 border border-orange-400 font-bold hover:bg-orange-300 hover:text-orange-950`;
        case EventSeverity.Critical:
          return `${baseClasses} bg-red-200 text-red-900 border border-red-400 font-bold hover:bg-red-300 hover:text-red-950`;
        default:
          return `${baseClasses} bg-gray-200 text-gray-900 border border-gray-400 font-bold hover:bg-gray-300 hover:text-gray-950`;
      }
    }
  };

  const getEventTypeName = (type: MarketEventType) => {
    return type
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const handleFilterChange = (filter: string | null) => {
    setActiveFilter(activeFilter === filter ? null : filter);
  };

  const renderStockImpact = (event: MarketEvent) => {
    return (
      <div className="flex flex-wrap gap-2 mt-4">
        {event.affectedStocks.map((affectedStock) => {
          const changeSymbol =
            affectedStock.priceChangePercent &&
            affectedStock.priceChangePercent > 0
              ? "+"
              : "";

          let impactClasses =
            "inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full";

          switch (affectedStock.impactDirection) {
            case "positive":
              impactClasses +=
                " bg-green-100 text-green-800 border border-green-300";
              break;
            case "negative":
              impactClasses += " bg-red-100 text-red-800 border border-red-300";
              break;
            case "mixed":
              impactClasses +=
                " bg-orange-100 text-orange-800 border border-orange-300";
              break;
            default:
              impactClasses +=
                " bg-gray-100 text-gray-800 border border-gray-300";
          }

          return (
            <div
              key={`${event.id}-${affectedStock.stockId}`}
              className={impactClasses}
            >
              <span className="font-semibold">
                {affectedStock.stock
                  ? affectedStock.stock.symbol
                  : `Stock #${affectedStock.stockId}`}
              </span>
              {affectedStock.priceChangePercent && (
                <span className="font-bold">
                  {changeSymbol}
                  {affectedStock.priceChangePercent.toFixed(2)}%
                </span>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  if (loading && events.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex justify-center">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="p-4 mt-4 text-red-700 bg-red-100 border border-red-200 rounded-lg dark:bg-red-900 dark:text-red-200 dark:border-red-800">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="p-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
        <div className="flex flex-wrap gap-5">
          <div className="flex-1 min-w-[250px]">
            <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-3">
              Event Types
            </h3>
            <div className="flex flex-wrap gap-2">
              {Object.values(MarketEventType).map((type) => (
                <button
                  key={type}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    activeFilter === type
                      ? "bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-800"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
                  }`}
                  onClick={() => handleFilterChange(type)}
                >
                  {getEventTypeName(type)}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 min-w-[250px]">
            <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-3">
              Severity
            </h3>
            <div className="flex flex-wrap gap-2">
              {Object.values(EventSeverity).map((severity) => (
                <button
                  key={severity}
                  className={getSeverityButtonClasses(
                    severity as EventSeverity,
                    activeFilter === severity,
                  )}
                  onClick={() => handleFilterChange(severity)}
                >
                  {severity.charAt(0).toUpperCase() + severity.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {events.length === 0 ? (
        <section className="p-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
          <div className="text-center py-10">
            <p className="text-gray-600 dark:text-gray-400">
              No events found matching the selected filters.
            </p>
          </div>
        </section>
      ) : (
        <section className="space-y-4">
          {events.map((event) => (
            <div
              key={event.id}
              className={`${getSeverityClasses(event.severity)} p-6 bg-white rounded-lg shadow-md dark:bg-gray-800 overflow-hidden`}
            >
              <div className="mb-3">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                  {event.title}
                </h2>
                <div className="flex flex-wrap gap-3 text-sm text-gray-500 dark:text-gray-400 mt-1">
                  <span className="inline-flex items-center">
                    <span className="mr-1.5">🕒</span>{" "}
                    {formatEventDate(event.date)}
                  </span>
                  <span className="inline-flex items-center">
                    <span className="mr-1.5">📰</span> {event.source}
                  </span>
                  <span className="inline-flex items-center">
                    <span className="mr-1.5">🏷️</span>{" "}
                    {getEventTypeName(event.type)}
                  </span>
                </div>
              </div>

              <p className="my-4 text-gray-700 dark:text-gray-300 leading-relaxed">
                {event.description}
              </p>

              {renderStockImpact(event)}

              <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700 flex justify-end">
                <Link
                  to={`/market`}
                  className="inline-flex items-center px-4 py-2 bg-indigo-700 text-white font-bold rounded-md hover:bg-indigo-800 transition-colors shadow-md focus:ring-2 focus:ring-indigo-300 dark:focus:ring-indigo-500"
                  aria-label="View market details"
                >
                  View Market
                </Link>
              </div>
            </div>
          ))}
        </section>
      )}
    </div>
  );
};

export default News;
