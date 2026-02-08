const API_BASE_URL = 'http://localhost:3001/api';

export interface CreateAuctionData {
  title: string;
  description: string;
  startingPrice: number;
  metalType: string;
  weight?: number;
  purity?: number;
  endTime: string;
}

class ApiService {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  getToken(): string | null {
    return this.token || localStorage.getItem('auth_token');
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  // Auth endpoints
  async register(email: string, password: string, name: string) {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ email, password, name }),
    });
    return response.json();
  }

  async login(email: string, password: string) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    if (data.success && data.data?.token) {
      this.setToken(data.data.token);
    }
    return data;
  }

  async getProfile() {
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      headers: this.getHeaders(),
    });
    return response.json();
  }

  // Auction endpoints
  async createAuction(auctionData: CreateAuctionData) {
    const response = await fetch(`${API_BASE_URL}/auctions`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(auctionData),
    });
    return response.json();
  }

  async getAuctions(filters?: { metalType?: string; status?: string }) {
    const params = new URLSearchParams();
    if (filters?.metalType) params.append('metalType', filters.metalType);
    if (filters?.status) params.append('status', filters.status);

    const url = `${API_BASE_URL}/auctions${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await fetch(url, {
      headers: this.getHeaders(),
    });
    return response.json();
  }

  async getAuction(id: string) {
    const response = await fetch(`${API_BASE_URL}/auctions/${id}`, {
      headers: this.getHeaders(),
    });
    return response.json();
  }

  async placeBid(auctionId: string, amount: number) {
    const response = await fetch(`${API_BASE_URL}/auctions/${auctionId}/bid`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ amount }),
    });
    return response.json();
  }
}

export const api = new ApiService();
