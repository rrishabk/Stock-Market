export class ApiService {
  static async getCompanies() {
    const res = await fetch('/api/companies');
    if (!res.ok) throw new Error('Failed to fetch companies');
    return res.json();
  }

  static async getStock(ticker: string, range: string) {
    const res = await fetch(`/api/stocks/${encodeURIComponent(ticker)}?range=${encodeURIComponent(range)}`);
    if (!res.ok) throw new Error('Failed to fetch stock');
    return res.json();
  }
}
