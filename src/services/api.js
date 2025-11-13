const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  if (options.body) {
    config.body = JSON.stringify(options.body);
  }

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

export const portfolioAPI = {
  async getPortfolio() {
    return request('/portfolio');
  },

  async addPurchase(data) {
    return request('/portfolio/purchases', {
      method: 'POST',
      body: data,
    });
  },

  async sellHolding(data) {
    return request('/portfolio/sales', {
      method: 'POST',
      body: data,
    });
  },

  async resetPortfolio() {
    return request('/portfolio/reset', {
      method: 'DELETE',
    });
  },
};

