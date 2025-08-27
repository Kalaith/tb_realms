import { Stock } from './Stock';

export interface MarketEvent {
  id: string;
  title: string;
  description: string;
  type: MarketEventType;
  severity: EventSeverity;
  affectedStocks: AffectedStock[];
  date: Date;
  expiryDate?: Date;
  imageUrl?: string;
  source?: string;
}

export enum MarketEventType {
  EARNINGS_REPORT = 'earnings_report',
  PRODUCT_LAUNCH = 'product_launch',
  MERGER_ACQUISITION = 'merger_acquisition',
  EXECUTIVE_CHANGE = 'executive_change',
  REGULATORY_NEWS = 'regulatory_news',
  INDUSTRY_TREND = 'industry_trend',
  ECONOMIC_INDICATOR = 'economic_indicator',
  GLOBAL_EVENT = 'global_event',
}

export enum EventSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export interface AffectedStock {
  stockId: string;
  stock?: Stock;
  impactDirection: 'positive' | 'negative' | 'mixed' | 'neutral';
  impactMagnitude: number; // 0-100 scale
  priceChangePercent?: number;
}