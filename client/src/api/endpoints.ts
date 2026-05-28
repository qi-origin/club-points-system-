import apiClient from './client';

// ─── Auth ───────────────────────────────────────────────

export const authApi = {
  studentLogin: (name: string, studentNo: string) =>
    apiClient.post('/auth/student/login', { name, studentNo }),

  adminLogin: (username: string, password: string) =>
    apiClient.post('/auth/admin/login', { username, password }),
};

// ─── Student ────────────────────────────────────────────

export const studentApi = {
  getProfile: () => apiClient.get('/student/profile'),

  getPointsOverview: () => apiClient.get('/student/points/overview'),

  submitApplication: (data: {
    taskRuleId?: number;
    taskDescription: string;
    pointsApplied: number;
    evidenceUrl?: string;
    idempotencyKey: string;
  }) => apiClient.post('/student/point-applications', data),

  getMyApplications: (params?: { page?: number; pageSize?: number; status?: number }) =>
    apiClient.get('/student/point-applications', { params }),

  getMyPointRecords: (params?: { page?: number; pageSize?: number }) =>
    apiClient.get('/student/point-records', { params }),

  getResources: (params?: { page?: number; pageSize?: number }) =>
    apiClient.get('/student/resources', { params }),

  getResourceDetail: (id: number) => apiClient.get(`/student/resources/${id}`),

  createExchangeOrder: (data: { resourceId: number; idempotencyKey: string }) =>
    apiClient.post('/student/exchange-orders', data),

  getMyExchangeOrders: (params?: { page?: number; pageSize?: number }) =>
    apiClient.get('/student/exchange-orders', { params }),
};

// ─── Upload ─────────────────────────────────────────────

export const uploadApi = {
  uploadFile: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

// ─── Admin ──────────────────────────────────────────────

export const adminApi = {
  getDashboard: () => apiClient.get('/admin/dashboard'),

  // Students
  getStudents: (params?: { page?: number; pageSize?: number; keyword?: string; status?: number }) =>
    apiClient.get('/admin/students', { params }),

  createStudent: (data: { name: string; studentNo: string }) =>
    apiClient.post('/admin/students', data),

  updateStudent: (id: number, data: { name: string; studentNo: string }) =>
    apiClient.put(`/admin/students/${id}`, data),

  toggleStudentStatus: (id: number, status: number) =>
    apiClient.patch(`/admin/students/${id}/status`, { status }),

  manualPoints: (id: number, data: { type: 'earn' | 'spend'; amount: number; remark: string }) =>
    apiClient.post(`/admin/students/${id}/manual-points`, data),

  // Applications
  getApplications: (params?: { page?: number; pageSize?: number; status?: number }) =>
    apiClient.get('/admin/point-applications', { params }),

  reviewApplication: (id: number, data: { action: 'approve' | 'reject'; comment?: string }) =>
    apiClient.post(`/admin/point-applications/${id}/review`, data),

  // Point Records
  getPointRecords: (params?: { page?: number; pageSize?: number; studentId?: number; type?: string }) =>
    apiClient.get('/admin/point-records', { params }),

  // Resources
  getResources: (params?: { page?: number; pageSize?: number; status?: number }) =>
    apiClient.get('/admin/resources', { params }),

  createResource: (data: { name: string; description?: string; pointsRequired: number; stock: number; imageUrl?: string }) =>
    apiClient.post('/admin/resources', data),

  updateResource: (id: number, data: { name: string; description?: string; pointsRequired: number; stock: number; imageUrl?: string }) =>
    apiClient.put(`/admin/resources/${id}`, data),

  toggleResourceStatus: (id: number, status: number) =>
    apiClient.patch(`/admin/resources/${id}/status`, { status }),

  // Exchange Orders
  getExchangeOrders: (params?: { page?: number; pageSize?: number; status?: number }) =>
    apiClient.get('/admin/exchange-orders', { params }),

  processExchangeOrder: (id: number, data: { action: 'complete' | 'cancel'; cancelReason?: string }) =>
    apiClient.post(`/admin/exchange-orders/${id}/process`, data),

  // Operation Logs
  getOperationLogs: (params?: { page?: number; pageSize?: number; adminId?: number; action?: string }) =>
    apiClient.get('/admin/operation-logs', { params }),
};
