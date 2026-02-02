import axios from 'axios';

const apiURL = '/api';

export const api = axios.create({
  baseURL: apiURL,
});

// Contract Listesi
export const getContracts = () => api.get('/contracts');

// Görev Listesi
export const getTasks = () => api.get('/tasks');

// Görev Tamamlama (ID ve Cevaplar gönderir)
export const completeTask = (id: number, data: any) => {
  return api.post(`/tasks/${id}/complete`, data);
};

// Yeni Sözleşme Başlat
export const createContract = (data: any) => api.post('/contracts', data);

// Kullanıcı İşlemleri
export const getUsers = () => api.get('/users');
export const getUser = (id: number) => api.get(`/users/${id}`);
export const createUser = (data: { name: string; email: string; role: string; password?: string }) => 
  api.post('/users', data);
export const updateUser = (id: number, data: { name: string; email: string; role: string }) => 
  api.put(`/users/${id}`, data);
export const deleteUser = (id: number) => api.delete(`/users/${id}`);

// Birim İşlemleri
export const getUnits = () => api.get('/units');
export const createUnit = (data: { name: string; training_contact_user_id?: number }) => 
  api.post('/units', data);
export const updateUnit = (id: number, data: { name: string; training_contact_user_id?: number }) => 
  api.put(`/units/${id}`, data);
export const deleteUnit = (id: number) => api.delete(`/units/${id}`);

// Workflow Rolleri
export const getWorkflowRoles = () => api.get('/workflow-roles');

// Timeline
export const getContractTimeline = (contractId: number) => api.get(`/contracts/${contractId}/timeline`);
export const getUserContracts = (userId: number) => api.get(`/contracts/by-user/${userId}`);