import { createSlice, } from "@reduxjs/toolkit";

export type Theme = "light" | "dark";

const initialState: Theme =
  (localStorage.getItem("theme") as Theme) || "light";

const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    setTheme: (_, action) => {
      const theme = action.payload;
      localStorage.setItem("theme", theme);
      document.documentElement.setAttribute("data-theme", theme);
      return theme;
    },
    toggleTheme: (state) => {
      const newTheme = state === "light" ? "dark" : "light";
      localStorage.setItem("theme", newTheme);
      document.documentElement.setAttribute("data-theme", newTheme);
      return newTheme;
    },
  },
});

export const { setTheme, toggleTheme } = themeSlice.actions;
export default themeSlice.reducer;
