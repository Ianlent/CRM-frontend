import axios from "axios";
import { logout } from "../features/auth/authSlice";
// Ensure you have VITE_API_BASE_URL set in your .env file
// Example: VITE_API_BASE_URL=http://localhost:5000
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const axiosInstance = axios.create({
	baseURL: API_BASE_URL,
	headers: {
		"Content-Type": "application/json",
	},
});

let globalNavigate; // A variable to hold the navigate function from react-router-dom
let globalDispatch;

// Function to set the navigate function (called from App.js)
export const setAxiosInterceptorNavigator = (navigateFn) => {
	globalNavigate = navigateFn;
};

export const setAxiosInterceptorDispatch = (dispatchFn) => {
	globalDispatch = dispatchFn;
};

// Request Interceptor: Attach token before sending request
axiosInstance.interceptors.request.use(
	(config) => {
		// Retrieve token from local storage or session storage
		const token = localStorage.getItem("token") || "";
		if (token) {
			config.headers["Authorization"] = `Bearer ${token}`;
		}
		return config;
	},
	(error) => {
		return Promise.reject(error);
	}
);

// Response Interceptor: Handle errors, especially token expiration and authorization issues
axiosInstance.interceptors.response.use(
	(response) => {
		return response; // If the response is successful, just return it
	},
	(error) => {
		// Check if the error has a response from the server
		if (error.response) {
			const { status, data } = error.response;

			let shouldRedirectToLogin = false;
			let shouldRedirectToUnauthorized = false;
			let errorMessage = "";

			// Case 1: Status 401 with "Token missing"
			if (status === 401 && data.message === "Token missing") {
				console.warn("Token missing. Redirecting to login...");
				shouldRedirectToLogin = true;
				errorMessage = "Authentication required. Please log in.";
			}
			// Case 2: Status 403 with "Invalid token" (e.g., expired token)
			else if (status === 403 && data.message === "Invalid token") {
				console.warn("Invalid token. Redirecting to login...");
				shouldRedirectToLogin = true;
				errorMessage = "Session expired. Please log in again.";
			}
			// Case 3: Status 403 with "Forbidden" (e.g., user privilege too low)
			else if (status === 403 && data.message === "Forbidden") {
				console.warn(
					"Access Forbidden. Redirecting to unauthorized page..."
				);
				shouldRedirectToUnauthorized = true;
				errorMessage =
					"You do not have permission to access this resource.";
			}
			// You can add more specific error handling cases here if needed

			// Perform redirection and clean up if any of the above conditions met
			if (shouldRedirectToLogin) {
				// Use the globally set dispatch function for logout
				if (globalDispatch) {
					globalDispatch(logout()); // Ensure `logout` action is correctly imported or accessed where globalDispatch is set.
				}
				// Use the globally set navigate function for redirection
				if (globalNavigate) {
					globalNavigate("/login", { replace: true });
				} else {
					window.location.href = "/login"; // Fallback for edge cases
				}
				// Stop further processing of this error in the component
				return Promise.reject(new Error(errorMessage));
			} else if (shouldRedirectToUnauthorized) {
				if (globalNavigate) {
					globalNavigate("/unauthorized", { replace: true });
				} else {
					window.location.href = "/unauthorized"; // Fallback
				}
				return Promise.reject(new Error(errorMessage));
			}

			// If it's a 400 validation error with 'errors' array
			// This is typically handled by the component making the request
			if (status === 400 && data.errors && Array.isArray(data.errors)) {
				return Promise.reject(error);
			}
		}

		// For any other errors (including other 4xx/5xx or network errors), just re-throw them
		return Promise.reject(error);
	}
);

export default axiosInstance;
