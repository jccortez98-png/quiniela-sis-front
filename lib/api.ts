const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

class ApiClient {
  private getHeaders(token?: string | null): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    // Fetch token from localStorage if not passed
    const authToken = token || (typeof window !== 'undefined' ? localStorage.getItem('quiniela_token') : null);
    
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }
    
    return headers;
  }

  private async handleResponse(response: Response) {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Ocurrió un error en la solicitud');
    }
    return response.json();
  }

  async get(path: string, token?: string | null) {
    const response = await fetch(`${API_URL}${path}`, {
      method: 'GET',
      headers: this.getHeaders(token),
    });
    return this.handleResponse(response);
  }

  async post(path: string, body: any, token?: string | null) {
    const response = await fetch(`${API_URL}${path}`, {
      method: 'POST',
      headers: this.getHeaders(token),
      body: JSON.stringify(body),
    });
    return this.handleResponse(response);
  }

  async patch(path: string, body: any, token?: string | null) {
    const response = await fetch(`${API_URL}${path}`, {
      method: 'PATCH',
      headers: this.getHeaders(token),
      body: JSON.stringify(body),
    });
    return this.handleResponse(response);
  }

  async delete(path: string, token?: string | null) {
    const response = await fetch(`${API_URL}${path}`, {
      method: 'DELETE',
      headers: this.getHeaders(token),
    });
    return this.handleResponse(response);
  }
}

export const api = new ApiClient();

// Auth service API
export const authApi = {
  register: (body: any) => api.post('/users/register', body),
  login: (body: any) => api.post('/users/login', body),
  getMe: (token: string) => api.get('/users/me', token),
  updateProfile: (body: any) => api.patch('/users/profile', body),
  getLeaderboard: () => api.get('/users/leaderboard'),
  toggleEnrollment: (userId: string, isEnrolled: boolean) => api.patch(`/users/${userId}/general-enrollment`, { isEnrolled }),
  resetPassword: (userId: string, body: { password: string }) => api.patch(`/users/${userId}/reset-password`, body),
};

// Matches service API
export const matchesApi = {
  getAll: () => api.get('/matches'),
  getById: (id: string) => api.get(`/matches/${id}`),
  create: (body: any) => api.post('/matches', body),
  update: (id: string, body: any) => api.patch(`/matches/${id}`, body),
  delete: (id: string) => api.delete(`/matches/${id}`),
  syncCalendar: () => api.post('/matches/sync-calendar', {}),
  syncMatchScore: (id: string) => api.post(`/matches/${id}/sync-score`, {}),
  updateJackpotFee: (id: string, fee: number) => api.patch(`/matches/${id}/jackpot-fee`, { fee }),
  getJackpotWinners: (id: string) => api.get(`/matches/${id}/jackpot-winners`),
};

// Predictions service API
export const predictionsApi = {
  createOrUpdate: (body: { matchId: string; type: 'general' | 'jackpot'; predictedScore: { home: number; away: number } }) => 
    api.post('/predictions', body),
  getMyPredictions: () => api.get('/predictions/me'),
};

// Jackpot Requests API
export const jackpotRequestsApi = {
  request: (matchId: string) => api.post('/jackpot-requests/request', { matchId }),
  getMyRequests: () => api.get('/jackpot-requests/me'),
  getAllPending: () => api.get('/jackpot-requests/pending'),
  getAll: () => api.get('/jackpot-requests'),
  approve: (id: string) => api.patch(`/jackpot-requests/${id}/approve`, {}),
  reject: (id: string) => api.patch(`/jackpot-requests/${id}/reject`, {}),
  rollover: (fromMatchId: string, toMatchId: string) => api.post('/jackpot-requests/rollover', { fromMatchId, toMatchId }),
  payout: (matchId: string) => api.post(`/jackpot-requests/${matchId}/payout`, {}),
};

// Teams service API
export const teamsApi = {
  getAll: () => api.get('/teams'),
};
