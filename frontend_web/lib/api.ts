import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:4213",
  withCredentials: true, 
});
