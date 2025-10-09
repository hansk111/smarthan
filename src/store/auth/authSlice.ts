import { createSlice } from "@reduxjs/toolkit";

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: any;
  avatar: any;
}

const initialState = {
  isAuthenticated: false,
  isLoading: true,
  user: null,
  avatar: null,
} as AuthState;

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuth: (state) => {
      state.isAuthenticated = true;
    },
    logoutAuth: (state) => {
      state.isAuthenticated = false;
    },
    finishInitialLoad: (state) => {
      state.isLoading = false;
    },
    setUser: (state, action) => {
      state.user = action.payload;
    },
    setAvatar: (state, action) => {
      state.avatar = action.payload;
    },
  },
});

export const { setAuth, logoutAuth, finishInitialLoad, setUser, setAvatar } =
  authSlice.actions;
export default authSlice.reducer;
