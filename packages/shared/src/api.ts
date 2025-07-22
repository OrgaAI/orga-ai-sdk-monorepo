import axios from 'axios';

export const api = axios.create({
  baseURL: 'https://api.example.com',
});

export async function fetchData<T>(endpoint: string): Promise<T> {
  const response = await api.get<T>(endpoint);
  return response.data;
}