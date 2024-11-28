import axios, { AxiosRequestConfig, InternalAxiosRequestConfig } from "axios";

// Function to get the default configuration
const getDefaultConfig = (config: InternalAxiosRequestConfig<any>) => {
    const token = localStorage.getItem("token");

    config.headers.timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    if (!config.headers["Content-Type"]) {
        config.headers["Content-Type"] = "application/json";
    }

    if (!config.headers["module_name"]) {
        config.headers["module_name"] = "Meet";
    }
    // SELECTED_MODULE
    if (!config.headers["x-module"]) {
        config.headers["x-module"] = "USER";
    }
    return config; // Return updated config
};

// Create an Axios instance
const baseApi = axios.create({
    baseURL: "https://spacedesk.digital-pages.work/api/v1",
    timeout: 10000,
});

// Request interceptor
baseApi.interceptors.request.use(
    (config) => {
        // Apply default configuration and cast it as InternalAxiosRequestConfig
        return getDefaultConfig(config as InternalAxiosRequestConfig<any>);
    },
    (error) => {
        // General request error handling
        console.error("Request error:", error);
        return Promise.reject(error);
    }
);

// Response interceptor
baseApi.interceptors.response.use(
    (response) => {
        // General response success handling
        return response;
    },
    (error) => {
        // General response error handling
        if (error.response) {
            // Server responded with a status other than 2xx
            console.error("Response error:", error.response);
            switch (error.response.status) {
                case 401: // Unauthorized
                    console.warn("Unauthorized. Redirecting to login...");
                    // Optional: Add redirect logic to login page
                    break;
                case 403: // Forbidden
                    console.warn("Forbidden. You do not have access.");
                    break;
                case 404: // Not found
                    console.error("Resource not found:", error.response.config.url);
                    break;
                case 500: // Server error
                    console.error("Server error. Try again later.");
                    break;
                default:
                    console.error("Unhandled error:", error.response.status);
            }
        } else if (error.request) {
            // No response received from the server
            console.error("No response from server:", error.request);
        } else {
            // Error during request setup
            console.error("Request setup error:", error.message);
        }
        return Promise.reject(error); // Propagate the error for further handling
    }
);

export default baseApi;
