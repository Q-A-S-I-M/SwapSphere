import axios from 'axios';

const chatApi = axios.create({
  baseURL: 'http://localhost:8081', // chat server runs on 8081
  withCredentials: true,
});

chatApi.interceptors.request.use((config) => config);

chatApi.interceptors.response.use(
  response => response,
  error => Promise.reject(error)
);

export default chatApi;
