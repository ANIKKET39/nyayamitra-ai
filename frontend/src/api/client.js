import axios from "axios";

// Base URL of the FastAPI backend. Override via .env -> VITE_API_BASE_URL
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// ---------- Rights Navigator ----------
export const askRights = (query, language, session_id) =>
  client.post("/api/rights/ask", { query, language, session_id }).then((r) => r.data);

export const getRightsHistory = (sessionId) =>
  client.get(`/api/rights/history/${sessionId}`).then((r) => r.data);

// ---------- RTI Generator ----------
export const generateRTI = (payload) =>
  client.post("/api/rti/generate", payload).then((r) => r.data);

export const listRTI = () => client.get("/api/rti/list").then((r) => r.data);

// ---------- Scheme Eligibility ----------
export const checkEligibility = (payload) =>
  client.post("/api/schemes/check", payload).then((r) => r.data);

export const getAllSchemes = () => client.get("/api/schemes/all").then((r) => r.data);

// ---------- Complaint Generator ----------
export const generateComplaint = (payload) =>
  client.post("/api/complaints/generate", payload).then((r) => r.data);

export const listComplaints = () => client.get("/api/complaints/list").then((r) => r.data);

// ---------- Dashboard ----------
export const getDashboardSummary = () =>
  client.get("/api/dashboard/summary").then((r) => r.data);

export default client;
