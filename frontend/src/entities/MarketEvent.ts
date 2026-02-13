import { Stock } from "./Stock";

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
  EarningsReport = "earnings_report",
  ProductLaunch = "product_launch",
  MergerAcquisition = "merger_acquisition",
  ExecutiveChange = "executive_change",
  RegulatoryNews = "regulatory_news",
  IndustryTrend = "industry_trend",
  EconomicIndicator = "economic_indicator",
  GlobalEvent = "global_event",
}

export enum EventSeverity {
  Low = "low",
  Medium = "medium",
  High = "high",
  Critical = "critical",
}

export interface AffectedStock {
  stockId: string;
  stock?: Stock;
  impactDirection: "positive" | "negative" | "mixed" | "neutral";
  impactMagnitude: number; // 0-100 scale
  priceChangePercent?: number;
}
