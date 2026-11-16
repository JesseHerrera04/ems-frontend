import axios from 'axios';

const LOCAL_REST_API_BASE_URL = 'http://localhost:8080/api/employees';
const REST_API_BASE_URL = import.meta.env.VITE_API_BASE_URL ||
    (import.meta.env.PROD ? "" : LOCAL_REST_API_BASE_URL);

if (!REST_API_BASE_URL) {
    throw new Error("VITE_API_BASE_URL must be configured for production");
}

// Get all employees
export const listEmployees = () => axios.get(REST_API_BASE_URL);

// Add a new employee
export const createEmployee = (employee) => axios.post(REST_API_BASE_URL, employee);

// Get an employee by ID
export const getEmployee = (id) => axios.get(`${REST_API_BASE_URL}/${id}`);

// Update an employee
export const updateEmployee = (id, employee) => axios.put(`${REST_API_BASE_URL}/${id}`, employee);

// Delete an employee
export const deleteEmployee = (id) => axios.delete(`${REST_API_BASE_URL}/${id}`);
