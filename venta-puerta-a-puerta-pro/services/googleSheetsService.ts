
import { Product, Client, Sale } from '../types';

/**
 * Este servicio requiere un URL de Google Apps Script configurado como Web App.
 */

export class GoogleSheetsService {
  private scriptUrl: string;

  constructor(url: string) {
    this.scriptUrl = url;
  }

  async fetchProducts(): Promise<Product[]> {
    if (!this.scriptUrl) return [];
    try {
      const response = await fetch(`${this.scriptUrl}?action=getProducts`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching products:', error);
      return [];
    }
  }

  async syncClients(clients: Client[]): Promise<boolean> {
    if (!this.scriptUrl || clients.length === 0) return false;
    try {
      await fetch(this.scriptUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'syncClients', data: clients })
      });
      return true;
    } catch (error) {
      console.error('Error syncing clients:', error);
      return false;
    }
  }

  async syncSales(sales: Sale[]): Promise<boolean> {
    if (!this.scriptUrl || sales.length === 0) return false;
    try {
      await fetch(this.scriptUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'syncSales', data: sales })
      });
      return true;
    } catch (error) {
      console.error('Error syncing sales:', error);
      return false;
    }
  }
}
