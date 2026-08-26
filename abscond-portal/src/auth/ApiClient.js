const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

export class ApiClient {
  static async request(endpoint, options = {}, getAccessToken, refreshAccessToken) {
    const url = `${API_URL}${endpoint}`;
    const headers = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    const accessToken = getAccessToken();
    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
    }

    let response = await fetch(url, {
      ...options,
      headers,
    });

    // If 401, try to refresh token and retry
    if (response.status === 401 && refreshAccessToken) {
      try {
        const newToken = await refreshAccessToken();
        headers.Authorization = `Bearer ${newToken}`;
        response = await fetch(url, {
          ...options,
          headers,
        });
      } catch {
        // Refresh failed, let the 401 propagate
      }
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const error = new Error(errorData.message || `HTTP ${response.status}`);
      error.status = response.status;
      error.data = errorData;
      throw error;
    }

    if (response.status === 204) {
      return null;
    }

    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      return null;
    }

    return response.json();
  }

  static get(endpoint, options, getAccessToken, refreshAccessToken) {
    return this.request(
      endpoint,
      { ...options, method: "GET" },
      getAccessToken,
      refreshAccessToken,
    );
  }

  static post(endpoint, body, options, getAccessToken, refreshAccessToken) {
    return this.request(
      endpoint,
      { ...options, method: "POST", body: JSON.stringify(body) },
      getAccessToken,
      refreshAccessToken,
    );
  }

  static patch(endpoint, body, options, getAccessToken, refreshAccessToken) {
    return this.request(
      endpoint,
      { ...options, method: "PATCH", body: JSON.stringify(body) },
      getAccessToken,
      refreshAccessToken,
    );
  }

  static delete(endpoint, options, getAccessToken, refreshAccessToken) {
    return this.request(
      endpoint,
      { ...options, method: "DELETE" },
      getAccessToken,
      refreshAccessToken,
    );
  }
}
