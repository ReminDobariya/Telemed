export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

// Base API URL from environment. No fallbacks, no dev tunnels.
const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

if (!BASE_URL) {
  throw new Error('NEXT_PUBLIC_API_URL must be set in environment variables');
}

export function getAuthToken(): string | null {
  try {
    return typeof window !== 'undefined' ? window.localStorage.getItem('tm_auth_token') : null;
  } catch {
    return null;
  }
}

async function apiRequest(path: string, options: { method?: HttpMethod; body?: any; headers?: Record<string, string>; responseType?: 'json' | 'blob' } = {}): Promise<Response> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  return res;
}

export async function apiFetch<T>(path: string, options: { method?: HttpMethod; body?: any; headers?: Record<string, string>; responseType?: 'json' | 'blob' } = {}): Promise<T> {
  const response = await apiRequest(path, options);

  if (!response.ok) {
    let message = `HTTP ${response.status}`;
    try { const data = await response.json(); message = data.error || message; } catch {}
    throw new Error(message);
  }

  if (options.responseType === 'blob') {
    return response.blob() as Promise<T>;
  }
  return response.json() as Promise<T>;
}

export const AuthAPI = {
  register: (payload: any) => apiFetch<{ success: true; token: string; user: any }>(`/api/auth/register`, { method: 'POST', body: payload }),
  login: (email: string, password: string) => apiFetch<{ success: true; token: string; user: any }>(`/api/auth/login`, { method: 'POST', body: { email, password } }),
  me: () => apiFetch<{ success: true; user: any }>(`/api/auth/me`),
};

export const UserAPI = {
  getProfile: () => apiFetch<{ success: true; profile: any }>(`/api/user/profile`),
  updateProfile: (data: any) => apiFetch<{ success: true; profile: any }>(`/api/user/profile`, { method: 'PUT', body: data }),
};

export const AppointmentsAPI = {
  list: () => apiFetch<{ success: true; appointments: any[] }>(`/api/appointments`),
  get: (id: string) => apiFetch<{ success: true; appointment: any }>(`/api/appointments/${id}`),
  create: (payload: { doctorId: string; time: string; reason?: string; mode?: 'virtual' | 'in-person' }) => apiFetch<{ success: true; appointment: any }>(`/api/appointments`, { method: 'POST', body: payload }),
  cancel: (id: string) => apiFetch<{ success: true; appointment: any }>(`/api/appointments/${id}/cancel`, { method: 'PUT' }),
};

export const PrescriptionsAPI = {
  list: () => apiFetch<{ success: true; prescriptions: any[] }>(`/api/prescriptions`),
  create: (payload: { medication: string; dosage: string; instructions?: string }) => apiFetch<{ success: true; prescription: any }>(`/api/prescriptions`, { method: 'POST', body: payload }),
  upload: (payload: { prescriptionDate: string; fileUrl?: string; doctorName?: string; hospitalName?: string; patientNotes?: string }) => 
    apiFetch<{ success: true; prescription: any }>(`/api/prescriptions/upload`, { method: 'POST', body: payload }),
};

export const HealthAPI = {
  overview: () => apiFetch<{ success: true; health: any }>(`/api/health/overview`),
  addVital: (payload: { type: string; value: string; unit?: string }) => apiFetch<{ success: true; vital: any }>(`/api/health/vitals`, { method: 'POST', body: payload }),
  getInsights: () => apiFetch<{ success: true; insights: string[] }>(`/api/health/insights`),
  uploadReport: (payload: { reportDate?: string; testType: string; fileUrl?: string; labName?: string; patientNotes?: string }) =>
    apiFetch<{ success: true; report: any }>(`/api/health/reports/upload`, { method: 'POST', body: payload }),
  uploadStructuredReport: (payload: { userId: string; testType: string; reportName: string; findings?: string; summary?: string; recommendations?: string; fileUrl?: string }) =>
    apiFetch<{ success: true; report: any }>(`/api/health/reports/structured`, { method: 'POST', body: payload }),
};

export const MedicationsAPI = {
  list: () => apiFetch<{ success: true; medications: any[] }>(`/api/medications`),
  create: (payload: { name: string; dosage: string; frequency: string; startedOn?: string; endDate?: string; notes?: string; status?: 'active'|'completed'|'paused' }) =>
    apiFetch<{ success: true; medication: any }>(`/api/medications`, { method: 'POST', body: payload }),
  delete: (id: string) => apiFetch<{ success: true; message: string }>(`/api/medications/${id}`, { method: 'DELETE' }),
  markTaken: (id: string) => apiFetch<{ success: true; medication: any }>(`/api/medications/${id}/taken`, { method: 'PUT' }),
  markUntaken: (id: string) => apiFetch<{ success: true; medication: any }>(`/api/medications/${id}/untaken`, { method: 'PUT' }),
};

export const AllergiesAPI = {
  list: () => apiFetch<{ success: true; allergies: any[] }>(`/api/allergies`),
  create: (payload: { substance: string; reaction: string; severity: 'mild'|'moderate'|'severe'; status?: 'active'|'resolved' }) =>
    apiFetch<{ success: true; allergy: any }>(`/api/allergies`, { method: 'POST', body: payload }),
  delete: (id: string) => apiFetch<{ success: true; message: string }>(`/api/allergies/${id}`, { method: 'DELETE' }),
};

export const ConversationsAPI = {
  list: () => apiFetch<{ success: true; conversations: any[] }>(`/api/conversations`),
  create: () => apiFetch<{ success: true; conversation: any }>(`/api/conversations`, { method: 'POST' }),
  get: (id: string) => apiFetch<{ success: true; conversation: any }>(`/api/conversations/${id}`),
  update: (id: string, data: { title?: string }) => apiFetch<{ success: true; conversation: any }>(`/api/conversations/${id}`, { method: 'PUT', body: data }),
  delete: (id: string) => apiFetch<{ success: true; message: string }>(`/api/conversations/${id}`, { method: 'DELETE' }),
};

export const DoctorAuthAPI = {
  register: (payload: any) => apiFetch<{ success: true; token: string; doctor: any }>(`/api/doctor/auth/register`, { method: 'POST', body: payload }),
  login: (email: string, password: string) => apiFetch<{ success: true; token: string; doctor: any }>(`/api/doctor/auth/login`, { method: 'POST', body: { email, password } }),
  me: () => apiFetch<{ success: true; doctor: any }>(`/api/doctor/auth/me`),
  updateProfile: (data: any) => apiFetch<{ success: true; doctor: any }>(`/api/doctor/auth/profile`, { method: 'PUT', body: data }),
};

export const DoctorAppointmentsAPI = {
  list: (params?: { status?: string; date?: string }) => {
    const query = new URLSearchParams()
    if (params?.status) query.append('status', params.status)
    if (params?.date) query.append('date', params.date)
    return apiFetch<{ success: true; appointments: any[] }>(`/api/doctor/appointments${query.toString() ? '?' + query.toString() : ''}`)
  },
  get: (id: string) => apiFetch<{ success: true; appointment: any; patient: any }>(`/api/doctor/appointments/${id}`),
  accept: (id: string, data?: { time?: string }) => apiFetch<{ success: true; appointment: any }>(`/api/doctor/appointments/${id}/accept`, { method: 'PUT', body: data }),
  reject: (id: string, reason?: string) => apiFetch<{ success: true; appointment: any }>(`/api/doctor/appointments/${id}/reject`, { method: 'PUT', body: { reason } }),
  reschedule: (id: string, time: string) => apiFetch<{ success: true; appointment: any }>(`/api/doctor/appointments/${id}/reschedule`, { method: 'PUT', body: { time } }),
  updateNotes: (id: string, notes: string) => apiFetch<{ success: true; appointment: any }>(`/api/doctor/appointments/${id}/notes`, { method: 'PUT', body: { notes } }),
  complete: (id: string) => apiFetch<{ success: true; appointment: any }>(`/api/doctor/appointments/${id}/complete`, { method: 'PUT' }),
};

export const DoctorPrescriptionsAPI = {
  create: (payload: { userId: string; appointmentId?: string; medications: any[]; notes?: string; followUpDate?: string; testsRecommended?: string[] }) =>
    apiFetch<{ success: true; prescription: any }>(`/api/doctor/prescriptions`, { method: 'POST', body: payload }),
  getPDF: (id: string) => apiFetch<Blob>(`/api/doctor/prescriptions/${id}/pdf`, { responseType: 'blob' }),
};

export const NotificationsAPI = {
  list: () => apiFetch<{ success: true; notifications: any[]; unreadCount: number }>(`/api/notifications`),
  markRead: (id: string) => apiFetch<{ success: true; notification: any }>(`/api/notifications/${id}/read`, { method: 'PUT' }),
  markAllRead: () => apiFetch<{ success: true }>(`/api/notifications/read-all`, { method: 'PUT' }),
};

export const DoctorsAPI = {
  list: () => apiFetch<{ success: true; doctors: any[] }>(`/api/doctors`),
  get: (id: string) => apiFetch<{ success: true; doctor: any }>(`/api/doctors/${id}`),
};




