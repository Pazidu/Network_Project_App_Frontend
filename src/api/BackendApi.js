
import AsyncStorage from '@react-native-async-storage/async-storage';

import axios from "axios";
import { API_BASE_URL } from "@env";

const BackendApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});




BackendApi.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default BackendApi;
