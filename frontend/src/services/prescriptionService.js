import axios from 'axios';

const API_URL = 'http://localhost:8000';

// Get auth token from localStorage
const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

// Create prescription (doctors only)
export const createPrescription = async (prescriptionData) => {
    try {
        const response = await axios.post(
            `${API_URL}/prescriptions/create`,
            prescriptionData,
            { headers: getAuthHeader() }
        );
        return response.data;
    } catch (error) {
        console.error('Error creating prescription:', error);
        throw error;
    }
};

// Get my prescriptions (patients)
export const getMyPrescriptions = async () => {
    try {
        const response = await axios.get(
            `${API_URL}/prescriptions/me`,
            { headers: getAuthHeader() }
        );
        return response.data;
    } catch (error) {
        console.error('Error fetching prescriptions:', error);
        throw error;
    }
};

// Get active prescriptions (patients)
export const getActivePrescriptions = async () => {
    try {
        const response = await axios.get(
            `${API_URL}/prescriptions/active/me`,
            { headers: getAuthHeader() }
        );
        return response.data;
    } catch (error) {
        console.error('Error fetching active prescriptions:', error);
        throw error;
    }
};

// Get patient prescriptions (doctors)
export const getPatientPrescriptions = async (patientId) => {
    try {
        const response = await axios.get(
            `${API_URL}/prescriptions/patient/${patientId}`,
            { headers: getAuthHeader() }
        );
        return response.data;
    } catch (error) {
        console.error('Error fetching patient prescriptions:', error);
        throw error;
    }
};

// Get prescription details
export const getPrescriptionDetails = async (prescriptionId) => {
    try {
        const response = await axios.get(
            `${API_URL}/prescriptions/${prescriptionId}`,
            { headers: getAuthHeader() }
        );
        return response.data;
    } catch (error) {
        console.error('Error fetching prescription details:', error);
        throw error;
    }
};
