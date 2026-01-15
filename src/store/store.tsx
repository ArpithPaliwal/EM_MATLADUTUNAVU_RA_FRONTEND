import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../redux/authSlice";
import themeReducer from "../redux/themeSlice"
export const store = configureStore({
  reducer: {
    auth: authReducer,
    theme: themeReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;