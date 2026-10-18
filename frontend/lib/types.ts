export interface ResearchResult {
  search_results: string;
  scraped_results: string;
  report: string;
  feedback: string;
}

export interface HistoryItem {
  id: string;
  topic: string;
  createdAt: number;
  result: ResearchResult;
}