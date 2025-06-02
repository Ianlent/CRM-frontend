// src/app/store.js
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/authSlice"; // Your auth slice reducer

export const store = configureStore({
	reducer: {
		auth: authReducer,
		// Add other reducers here as you create more slices for other features
	},
});
