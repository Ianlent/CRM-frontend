import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance"; // Use your configured axios instance

// Async Thunk for Login
export const loginUser = createAsyncThunk(
	"auth/loginUser",
	async ({ username, password }, { rejectWithValue }) => {
		try {
			// Use axiosInstance for the login request
			const response = await axiosInstance.post("/auth/login", {
				username,
				password,
			});

			if (response.status === 200 && response.data.success) {
				const { user, token } = response.data;
				// Store in localStorage (redundant with axiosInstance's request interceptor, but good for initial state)
				localStorage.setItem("user", JSON.stringify(user));
				localStorage.setItem("token", token);
				return { user, token };
			} else {
				return rejectWithValue(
					response.data.message || "Login failed."
				);
			}
		} catch (error) {
			const message =
				error.response?.data?.message ||
				error.message ||
				"An unexpected error occurred.";
			return rejectWithValue(message);
		}
	}
);

const authSlice = createSlice({
	name: "auth",
	initialState: {
		// Initialize state from localStorage (if values exist)
		user: JSON.parse(localStorage.getItem("user")) || null,
		token: localStorage.getItem("token") || null,
		isAuthenticated: !!localStorage.getItem("token"), // True if token exists
		status: "initializing", // 'ininitializing' | 'loading' | 'succeeded' | 'failed' | 'idle' | 'verifying'
		error: null,
	},
	reducers: {
		logout: (state) => {
			// Clear Redux state
			state.user = null;
			state.token = null;
			state.isAuthenticated = false;
			state.status = "idle";
			state.error = null;
			// Clear localStorage (handled by axiosInstance interceptor as well, but good to be explicit here)
			localStorage.removeItem("user");
			localStorage.removeItem("token");
			localStorage.removeItem("lastVisitedAdminPath");
			// axiosInstance.defaults.headers.common['Authorization'] will be cleaned by the interceptor on next call
		},
		// This action ensures Redux state is populated from localStorage on initial app load
		initializeAuth: (state) => {
			const storedUser = localStorage.getItem("user");
			const storedToken = localStorage.getItem("token");
			if (storedUser && storedToken) {
				try {
					state.user = JSON.parse(storedUser);
					state.token = storedToken;
					state.isAuthenticated = true;
				} catch (e) {
					console.error("Failed to parse stored user or token:", e);
					localStorage.removeItem("user");
					localStorage.removeItem("token");
					state.user = null;
					state.token = null;
					state.isAuthenticated = false;
				}
			}
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(loginUser.pending, (state) => {
				state.status = "verifying";
				state.error = null;
			})
			.addCase(loginUser.fulfilled, (state, action) => {
				state.status = "succeeded";
				state.isAuthenticated = true;
				state.user = action.payload.user;
				state.token = action.payload.token;
			})
			.addCase(loginUser.rejected, (state, action) => {
				state.status = "failed";
				state.error =
					action.payload || "Login failed due to an unknown error.";
				state.isAuthenticated = false;
				state.user = null;
				state.token = null;
			});
	},
});

export const { logout, initializeAuth } = authSlice.actions;

export default authSlice.reducer;
