import axios from 'axios';

const todoApi = axios.create({
  baseURL: 'http://localhost:5001/api',
});

export const setTodoAuthToken = (token: string | null) => {
  if (token) {
    todoApi.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete todoApi.defaults.headers.common['Authorization'];
  }
};

export default todoApi;
