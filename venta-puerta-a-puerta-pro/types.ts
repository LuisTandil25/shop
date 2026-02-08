
export interface Product {
  id: string; // Usaremos el SKU como ID interno
  sku: string;
  nombre: string;
  precio: number;
  descripcion: string;
  categoria: string;
  imagen: string;
  stock: number;
}

export interface Client {
  id: string;
  nombre: string;
  telefono: string;
  direccion: string;
  notas?: string;
  estado: 'pendiente' | 'sincronizado';
}

export interface SaleItem {
  productId: string;
  nombre: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface Sale {
  id: string;
  clientId: string;
  clientNombre: string;
  items: SaleItem[];
  total: number;
  fecha: string;
  estado: 'pendiente' | 'sincronizado';
}

export enum View {
  DASHBOARD = 'dashboard',
  PRODUCTS = 'products',
  CLIENTS = 'clients',
  NEW_SALE = 'new_sale',
  HISTORY = 'history',
  SETTINGS = 'settings'
}
