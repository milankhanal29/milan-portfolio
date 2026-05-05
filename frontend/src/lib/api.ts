/**
 * Typed API client for the FastAPI backend.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://api-production-0ff6.up.railway.app/api/v1";

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE}${endpoint}`;

  const config: RequestInit = {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    credentials: "include",
  };

  const response = await fetch(url, config);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Request failed" }));
    throw new ApiError(error.detail || "Request failed", response.status);
  }

  if (response.status === 204) return {} as T;
  return response.json();
}

// Auth
export const api = {
  auth: {
    login: (data: { email: string; password: string }) =>
      request<{ access_token: string }>("/auth/login", { method: "POST", body: JSON.stringify(data) }),
    logout: () => request("/auth/logout", { method: "POST" }),
    me: () => request<import("@/types").User>("/auth/me"),
    refresh: () => request<{ access_token: string }>("/auth/refresh", { method: "POST" }),
  },

  profile: {
    get: () => request<import("@/types").Profile>("/profile"),
    update: (data: Partial<import("@/types").Profile>) =>
      request<import("@/types").Profile>("/profile", { method: "PUT", body: JSON.stringify(data) }),
  },

  experiences: {
    list: () => request<import("@/types").Experience[]>("/experiences"),
    create: (data: Partial<import("@/types").Experience>) =>
      request<import("@/types").Experience>("/experiences", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: Partial<import("@/types").Experience>) =>
      request<import("@/types").Experience>(`/experiences/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: string) => request(`/experiences/${id}`, { method: "DELETE" }),
  },

  projects: {
    list: (tech?: string) => request<import("@/types").Project[]>(`/projects${tech ? `?tech=${tech}` : ""}`),
    create: (data: Partial<import("@/types").Project>) =>
      request<import("@/types").Project>("/projects", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: Partial<import("@/types").Project>) =>
      request<import("@/types").Project>(`/projects/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: string) => request(`/projects/${id}`, { method: "DELETE" }),
  },

  blog: {
    list: (all?: boolean) => request<import("@/types").BlogPostListItem[]>(`/blog${all ? "?all_posts=true" : ""}`),
    get: (slug: string) => request<import("@/types").BlogPost>(`/blog/${slug}`),
    create: (data: Partial<import("@/types").BlogPost>) =>
      request<import("@/types").BlogPost>("/blog", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: Partial<import("@/types").BlogPost>) =>
      request<import("@/types").BlogPost>(`/blog/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: string) => request(`/blog/${id}`, { method: "DELETE" }),
  },

  skills: {
    grouped: () => request<Record<string, import("@/types").Skill[]>>("/skills"),
    flat: () => request<import("@/types").Skill[]>("/skills/flat"),
    create: (data: Partial<import("@/types").Skill>) =>
      request<import("@/types").Skill>("/skills", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: Partial<import("@/types").Skill>) =>
      request<import("@/types").Skill>(`/skills/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: string) => request(`/skills/${id}`, { method: "DELETE" }),
  },

  testimonials: {
    list: (all?: boolean) =>
      request<import("@/types").Testimonial[]>(`/testimonials${all ? "?featured_only=false" : ""}`),
    create: (data: Partial<import("@/types").Testimonial>) =>
      request<import("@/types").Testimonial>("/testimonials", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: Partial<import("@/types").Testimonial>) =>
      request<import("@/types").Testimonial>(`/testimonials/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: string) => request(`/testimonials/${id}`, { method: "DELETE" }),
  },

  settings: {
    get: () => request<import("@/types").SiteSettings>("/settings"),
    update: (data: Partial<import("@/types").SiteSettings>) =>
      request<import("@/types").SiteSettings>("/settings", { method: "PUT", body: JSON.stringify(data) }),
  },

  contact: {
    submit: (data: { name: string; email: string; subject?: string; message: string }) =>
      request<import("@/types").ContactMessage>("/contact", { method: "POST", body: JSON.stringify(data) }),
    list: () => request<import("@/types").ContactMessage[]>("/contact/messages"),
    markRead: (id: string) => request<import("@/types").ContactMessage>(`/contact/messages/${id}/read`, { method: "PUT" }),
  },

  birthday: {
    active: () => request<import("@/types").BirthdayActiveResponse>("/birthday/active"),
    menu: () => request<Record<string, import("@/types").MenuItem[]>>("/birthday/menu"),
    submitRSVP: (data: import("@/types").RSVPCreate) =>
      request<import("@/types").RSVP>("/birthday/rsvp", { method: "POST", body: JSON.stringify(data) }),
    wishes: () => request<import("@/types").Wish[]>("/birthday/wishes"),
    // Admin
    stats: () => request<import("@/types").AdminStats>("/birthday/stats"),
    rsvps: (eventId?: string) =>
      request<import("@/types").RSVP[]>(`/birthday/rsvps${eventId ? `?event_id=${eventId}` : ""}`),
    events: () => request<import("@/types").BirthdayEvent[]>("/birthday/events"),
    createEvent: (data: Partial<import("@/types").BirthdayEvent>) =>
      request<import("@/types").BirthdayEvent>("/birthday/events", { method: "POST", body: JSON.stringify(data) }),
    updateEvent: (id: string, data: Partial<import("@/types").BirthdayEvent>) =>
      request<import("@/types").BirthdayEvent>(`/birthday/events/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    menuItems: () => request<import("@/types").MenuItem[]>("/birthday/menu-items"),
    createMenuItem: (data: Partial<import("@/types").MenuItem>) =>
      request<import("@/types").MenuItem>("/birthday/menu-items", { method: "POST", body: JSON.stringify(data) }),
    updateMenuItem: (id: string, data: Partial<import("@/types").MenuItem>) =>
      request<import("@/types").MenuItem>(`/birthday/menu-items/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    deleteMenuItem: (id: string) => request(`/birthday/menu-items/${id}`, { method: "DELETE" }),
  },

  upload: (file: File, folder?: string) => {
    const formData = new FormData();
    formData.append("file", file);
    return request<{ url: string; filename: string }>(
      `/upload${folder ? `?folder=${folder}` : ""}`,
      { method: "POST", body: formData, headers: {} }
    );
  },
};
