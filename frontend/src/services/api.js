/**
 * Centralized API Client Module for LUCY CSR
 * Connects directly to backend API routes using VITE_API_BASE_URL.
 * Handles request execution, error parsing, and fallback endpoint resolution.
 */

// Retrieve configured API base URL (env or runtime override)
export const getApiBaseUrl = () => {
  const customUrl = localStorage.getItem('LUCY_CSR_API_BASE_URL');
  if (customUrl && customUrl.trim() !== '') {
    return customUrl.trim().replace(/\/+$/, '');
  }
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (envUrl && envUrl.trim() !== '') {
    return envUrl.trim().replace(/\/+$/, '');
  }
  return (typeof window !== 'undefined' && window.location.port === '5173') ? '/api' : 'http://localhost:8787/api';
};

export const setApiBaseUrl = (url) => {
  if (!url || url.trim() === '') {
    localStorage.removeItem('LUCY_CSR_API_BASE_URL');
  } else {
    localStorage.setItem('LUCY_CSR_API_BASE_URL', url.trim().replace(/\/+$/, ''));
  }
};

/**
 * Standard HTTP Request Wrapper using native fetch
 */
async function request(endpoint, options = {}) {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const defaultHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);

    // Try parsing JSON response
    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json().catch(() => null);
    } else {
      const text = await response.text();
      try {
        data = JSON.parse(text);
      } catch {
        data = { message: text };
      }
    }

    if (!response.ok) {
      const errorMessage =
        (data && (data.detail || data.message || data.error)) ||
        `Request failed with status ${response.status} (${response.statusText})`;
      
      const error = new Error(errorMessage);
      error.status = response.status;
      error.data = data;
      error.url = url;
      throw error;
    }

    return data;
  } catch (err) {
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      const networkError = new Error(
        `Unable to connect to LUCY Backend at ${baseUrl}. Please ensure the server is running and CORS is configured.`
      );
      networkError.status = 0;
      networkError.isNetworkError = true;
      networkError.url = url;
      throw networkError;
    }
    throw err;
  }
}

/**
 * LUCY CSR API Service Endpoints
 */
export const api = {
  /**
   * Health Check
   */
  async checkHealth() {
    try {
      const data = await request('/health', { method: 'GET' });
      return { ok: true, data };
    } catch (err) {
      // If /health not implemented, test base URL
      try {
        const rootData = await request('/', { method: 'GET' });
        return { ok: true, data: rootData };
      } catch (rootErr) {
        return { ok: false, error: err.message };
      }
    }
  },

  /**
   * 1. GET Tickets (Inbox)
   * Retrieves available support tickets.
   */
  async getTickets(params = {}) {
    const query = new URLSearchParams();
    if (params.status && params.status !== 'all') query.append('status', params.status);
    if (params.priority && params.priority !== 'all') query.append('priority', params.priority);
    if (params.search) query.append('search', params.search);
    if (params.limit) query.append('limit', params.limit);
    if (params.offset) query.append('offset', params.offset);

    const queryString = query.toString() ? `?${query.toString()}` : '';
    const res = await request(`/tickets${queryString}`, { method: 'GET' });
    
    // Normalization: handle array, { tickets: [] }, or { data: [] }
    if (Array.isArray(res)) return res;
    if (res && Array.isArray(res.tickets)) return res.tickets;
    if (res && Array.isArray(res.data)) return res.data;
    if (res && Array.isArray(res.items)) return res.items;
    return [];
  },

  /**
   * 2. GET Single Ticket Details
   */
  async getTicketById(ticketId) {
    const res = await request(`/tickets/${encodeURIComponent(ticketId)}`, { method: 'GET' });
    if (res && res.ticket) return res.ticket;
    if (res && res.data) return res.data;
    return res;
  },

  /**
   * 2b. POST Create New Ticket
   */
  async createTicket(ticketData) {
    return await request('/tickets', {
      method: 'POST',
      body: JSON.stringify(ticketData)
    });
  },

  /**
   * 3. POST Start/Continue Investigation
   * Dispatches AI agent investigation on the selected ticket.
   */
  async investigateTicket(ticketId, payload = {}) {
    try {
      // Primary route: POST /tickets/:id/investigate
      return await request(`/tickets/${encodeURIComponent(ticketId)}/investigate`, {
        method: 'POST',
        body: JSON.stringify({ ticket_id: ticketId, ...payload }),
      });
    } catch (err) {
      // Fallback route: POST /investigate
      if (err.status === 404) {
        return await request('/investigate', {
          method: 'POST',
          body: JSON.stringify({ ticket_id: ticketId, ...payload }),
        });
      }
      throw err;
    }
  },

  /**
   * 4. POST Submit Clarification
   * Sends user-supplied missing information back to backend agent.
   */
  async submitClarification(ticketId, clarificationPayload) {
    const body = {
      ticket_id: ticketId,
      clarification: clarificationPayload.clarification || clarificationPayload.response || clarificationPayload.text || clarificationPayload,
      officer_notes: clarificationPayload.officer_notes,
      extra_fields: clarificationPayload.extra_fields || {},
    };

    try {
      // Primary route: POST /tickets/:id/clarify
      return await request(`/tickets/${encodeURIComponent(ticketId)}/clarify`, {
        method: 'POST',
        body: JSON.stringify(body),
      });
    } catch (err) {
      // Fallback route: POST /clarify
      if (err.status === 404) {
        return await request('/clarify', {
          method: 'POST',
          body: JSON.stringify(body),
        });
      }
      throw err;
    }
  },

  /**
   * 5. POST Submit Human Approval
   * Confirms and persists the finalized response and ticket status.
   */
  async submitApproval(ticketId, approvalPayload) {
    const body = {
      ticket_id: ticketId,
      final_response: approvalPayload.final_response || approvalPayload.response_draft,
      approved_status: approvalPayload.approved_status || 'approved',
      category: approvalPayload.category,
      officer_notes: approvalPayload.officer_notes || '',
      policy_citations: approvalPayload.policy_citations || [],
    };

    try {
      // Primary route: POST /tickets/:id/approve
      return await request(`/tickets/${encodeURIComponent(ticketId)}/approve`, {
        method: 'POST',
        body: JSON.stringify(body),
      });
    } catch (err) {
      // Fallback route: POST /approve
      if (err.status === 404) {
        return await request('/approve', {
          method: 'POST',
          body: JSON.stringify(body),
        });
      }
      throw err;
    }
  },

  /**
   * 6. GET Outbox Records
   * Retrieves saved/approved ticket records.
   */
  async getOutbox(params = {}) {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.limit) query.append('limit', params.limit);
    if (params.offset) query.append('offset', params.offset);

    const queryString = query.toString() ? `?${query.toString()}` : '';

    try {
      const res = await request(`/outbox${queryString}`, { method: 'GET' });
      if (Array.isArray(res)) return res;
      if (res && Array.isArray(res.outbox)) return res.outbox;
      if (res && Array.isArray(res.records)) return res.records;
      if (res && Array.isArray(res.data)) return res.data;
      return [];
    } catch (err) {
      // Fallback: If dedicated /outbox doesn't exist, query /tickets?status=approved
      if (err.status === 404) {
        const fallback = await request(`/tickets?status=approved`, { method: 'GET' });
        if (Array.isArray(fallback)) return fallback;
        if (fallback && Array.isArray(fallback.tickets)) return fallback.tickets;
        if (fallback && Array.isArray(fallback.data)) return fallback.data;
      }
      throw err;
    }
  },

  /**
   * 7. GET Outbox Single Record
   */
  async getOutboxRecordById(recordId) {
    try {
      const res = await request(`/outbox/${encodeURIComponent(recordId)}`, { method: 'GET' });
      if (res && res.record) return res.record;
      if (res && res.data) return res.data;
      return res;
    } catch (err) {
      if (err.status === 404) {
        return await this.getTicketById(recordId);
      }
      throw err;
    }
  },
};

export default api;
