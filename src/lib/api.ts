const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

interface RequestOptions extends RequestInit {
  headers?: Record<string, string>;
}

export interface BankDetails {
  bank_name: string;
  account_number: string;
  ifsc_code: string;
  account_holder: string;
}

export interface SellerProfile {
  id: string;
  business_name: string;
  gst_number: string;
  pan: string;
  business_address: string;
  pickup_address: string;
  bank_details: BankDetails;
  verification_status: "PENDING" | "APPROVED" | "REJECTED";
  commission_percentage: string;
  contact_phone: string;
  contact_email: string;
  created_at: string;
  updated_at: string;
}

export interface UserMe {
  id: number;
  username: string;
  email: string;
  role: string;
}

class ApiClient {
  private getStorageItem(key: string): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem(key);
    }
    return null;
  }

  private setStorageItem(key: string, value: string): void {
    if (typeof window !== "undefined") {
      localStorage.setItem(key, value);
    }
  }

  private removeStorageItem(key: string): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem(key);
    }
  }

  get accessToken(): string | null {
    return this.getStorageItem("riwaaya_seller_access");
  }

  set accessToken(token: string | null) {
    if (token) this.setStorageItem("riwaaya_seller_access", token);
    else this.removeStorageItem("riwaaya_seller_access");
  }

  get refreshToken(): string | null {
    return this.getStorageItem("riwaaya_seller_refresh");
  }

  set refreshToken(token: string | null) {
    if (token) this.setStorageItem("riwaaya_seller_refresh", token);
    else this.removeStorageItem("riwaaya_seller_refresh");
  }

  public logout(): void {
    this.accessToken = null;
    this.refreshToken = null;
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  }

  private async refreshAccessToken(): Promise<string | null> {
    const refresh = this.refreshToken;
    if (!refresh) return null;

    try {
      const response = await fetch(`${API_BASE}/accounts/token/refresh/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh }),
      });

      if (!response.ok) {
        throw new Error("Refresh token expired or invalid");
      }

      const resData = await response.json();
      const newAccess = resData.access || resData.data?.access;
      const newRefresh = resData.refresh || resData.data?.refresh;

      if (newAccess) {
        this.accessToken = newAccess;
        if (newRefresh) this.refreshToken = newRefresh;
        return newAccess;
      }
      return null;
    } catch (err) {
      console.error("Token refresh failed:", err);
      this.logout();
      return null;
    }
  }

  public async request<T = any>(path: string, options: RequestOptions = {}): Promise<T> {
    const url = `${API_BASE}${path}`;
    
    // Set headers
    const headers = {
      "Content-Type": "application/json",
      ...options.headers,
    } as Record<string, string>;

    const access = this.accessToken;
    if (access) {
      headers["Authorization"] = `Bearer ${access}`;
    }

    const config = { ...options, headers };

    try {
      let response = await fetch(url, config);

      // Handle token expiration (401 Unauthorized)
      if (response.status === 401 && this.refreshToken && !path.includes("/accounts/token/")) {
        console.log("Access token expired, attempting to refresh...");
        const newAccess = await this.refreshAccessToken();
        if (newAccess) {
          headers["Authorization"] = `Bearer ${newAccess}`;
          response = await fetch(url, config);
        }
      }

      const contentType = response.headers.get("content-type") || "";
      let responseData: any = null;

      if (contentType.includes("application/json")) {
        responseData = await response.json();
      } else {
        const text = await response.text();
        throw new Error(text || `Request failed with status ${response.status}`);
      }

      // Check success based on backend response format middleware
      if (response.status >= 400) {
        const errorMsg = responseData?.error?.message || responseData?.message || "An error occurred";
        throw new Error(errorMsg);
      }

      // Backend wraps successes in: { success: true, data: ..., error: null }
      if (responseData && typeof responseData === "object" && "success" in responseData) {
        return responseData.data as T;
      }

      return responseData as T;
    } catch (err: any) {
      throw err;
    }
  }

  public get<T = any>(path: string, options: RequestOptions = {}): Promise<T> {
    return this.request<T>(path, { ...options, method: "GET" });
  }

  public post<T = any>(path: string, body?: any, options: RequestOptions = {}): Promise<T> {
    return this.request<T>(path, {
      ...options,
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  public put<T = any>(path: string, body?: any, options: RequestOptions = {}): Promise<T> {
    return this.request<T>(path, {
      ...options,
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  public patch<T = any>(path: string, body?: any, options: RequestOptions = {}): Promise<T> {
    return this.request<T>(path, {
      ...options,
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  public delete<T = any>(path: string, options: RequestOptions = {}): Promise<T> {
    return this.request<T>(path, { ...options, method: "DELETE" });
  }
}

export const api = new ApiClient();
