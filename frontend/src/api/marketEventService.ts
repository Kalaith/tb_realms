import { BaseApiService } from './baseApiService';
import { MarketEvent, EventSeverity, MarketEventType } from '../entities/MarketEvent';
import { ApiResponse } from '../entities/api';
import apiClient from './apiClient';
import { stockService } from './stockService';

/**
 * Service for managing market events and news
 */
export class MarketEventService extends BaseApiService<MarketEvent> {
  constructor() {
    super('events');
  }
  
  /**
   * Convert raw event data to proper MarketEvent type with date objects
   */
  private normalizeEventData(event: any): MarketEvent {
    return {
      ...event,
      date: new Date(event.date),
      expiryDate: event.expiryDate ? new Date(event.expiryDate) : undefined,
    };
  }

  /**
   * Get all market events
   */
  async getAll(): Promise<ApiResponse<MarketEvent[]>> {
    if (this.useMockData) {
      // Mock implementation code kept for reference
      // ...existing mock implementation...
      return { success: false, error: { code: "NOT_IMPLEMENTED", message: "Mock implementation not used" } };
    }

    try {
      const response = await apiClient.get(this.endpoint);
      const events = response.data || response;
      
      // Normalize the event data with proper date objects
      const normalizedEvents = events.map((event: any) => this.normalizeEventData(event));
      
      return {
        success: true,
        data: normalizedEvents.sort((a: MarketEvent, b: MarketEvent) => 
          b.date.getTime() - a.date.getTime()
        )
      };
    } catch (error: any) {
      return {
        success: false,
        error: {
          code: error.status || 'ERROR',
          message: error.data?.message || error.statusText || 'Failed to fetch market events',
        },
      };
    }
  }

  /**
   * Get market events by type
   */
  async getByType(eventType: MarketEventType): Promise<ApiResponse<MarketEvent[]>> {
    if (this.useMockData) {
      // Mock implementation code kept for reference
      // ...existing mock implementation...
      return { success: false, error: { code: "NOT_IMPLEMENTED", message: "Mock implementation not used" } };
    }

    try {
      const response = await apiClient.get(`${this.endpoint}/type/${eventType}`);
      const events = response.data || response;
      
      // Normalize the event data with proper date objects
      const normalizedEvents = events.map((event: any) => this.normalizeEventData(event));
      
      return {
        success: true,
        data: normalizedEvents.sort((a: MarketEvent, b: MarketEvent) => 
          b.date.getTime() - a.date.getTime()
        )
      };
    } catch (error: any) {
      return {
        success: false,
        error: {
          code: error.status || 'ERROR',
          message: error.data?.message || error.statusText || 'Failed to fetch market events by type',
        },
      };
    }
  }

  /**
   * Get market events by severity
   */
  async getBySeverity(severity: EventSeverity): Promise<ApiResponse<MarketEvent[]>> {
    if (this.useMockData) {
      // Mock implementation code kept for reference
      // ...existing mock implementation...
      return { success: false, error: { code: "NOT_IMPLEMENTED", message: "Mock implementation not used" } };
    }

    try {
      const response = await apiClient.get(`${this.endpoint}/severity/${severity}`);
      const events = response.data || response;
      
      // Normalize the event data with proper date objects
      const normalizedEvents = events.map((event: any) => this.normalizeEventData(event));
      
      return {
        success: true,
        data: normalizedEvents.sort((a: MarketEvent, b: MarketEvent) => 
          b.date.getTime() - a.date.getTime()
        )
      };
    } catch (error: any) {
      return {
        success: false,
        error: {
          code: error.status || 'ERROR',
          message: error.data?.message || error.statusText || 'Failed to fetch market events by severity',
        },
      };
    }
  }
  
  /**
   * Get market events that affect a specific stock
   */
  async getByStockId(stockId: string): Promise<ApiResponse<MarketEvent[]>> {
    if (this.useMockData) {
      // Mock implementation code kept for reference
      // ...existing mock implementation...
      return { success: false, error: { code: "NOT_IMPLEMENTED", message: "Mock implementation not used" } };
    }

    try {
      const response = await apiClient.get(`${this.endpoint}/stock/${stockId}`);
      const events = response.data || response;
      
      // Normalize the event data with proper date objects
      const normalizedEvents = events.map((event: any) => this.normalizeEventData(event));
      
      // Enrich with stock data if needed
      const enrichedEvents = await this.enrichEventsWithStockData(normalizedEvents);
      
      return {
        success: true,
        data: enrichedEvents.sort((a: MarketEvent, b: MarketEvent) => 
          b.date.getTime() - a.date.getTime()
        )
      };
    } catch (error: any) {
      return {
        success: false,
        error: {
          code: error.status || 'ERROR',
          message: error.data?.message || error.statusText || 'Failed to fetch market events by stock',
        },
      };
    }
  }
  
  /**
   * Enrich events with stock data
   */
  private async enrichEventsWithStockData(events: MarketEvent[]): Promise<MarketEvent[]> {
    try {
      // Get all stocks
      const stocksResponse = await stockService.getAll();
      if (!stocksResponse.success || !stocksResponse.data) {
        return events;
      }
      
      const stocks = stocksResponse.data;
      
      // Attach stock objects to affected stocks
      return events.map(event => {
        if (!event.affectedStocks) return event;
        
        const enrichedAffectedStocks = event.affectedStocks.map(affectedStock => {
          const stock = stocks.find(s => s.id === affectedStock.stockId);
          return {
            ...affectedStock,
            stock
          };
        });
        
        return {
          ...event,
          affectedStocks: enrichedAffectedStocks
        };
      });
    } catch (err) {
      console.error("Error enriching event data with stocks:", err);
      return events;
    }
  }
}

// Create and export singleton instance
export const marketEventService = new MarketEventService();