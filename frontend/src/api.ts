import axios from 'axios';

const apiURL = 'http://localhost:3000/api';

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