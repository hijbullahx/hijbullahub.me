import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api",
});

export const fetchList = async (path) => {
  const { data } = await api.get(path);
  return data.results ?? data;
};

export default api;
