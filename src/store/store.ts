import authReducer from "@/store/auth/authSlice";
import busReducer from "@/store/bus/busSlice";
import mp3Reducer from "@/store/mp3player/mp3Slice";
import { configureStore } from "@reduxjs/toolkit";
import { busApi } from "./bus/busApi";
import { apiSlice } from "./services/apiSlice";
import { streetmapApi } from "./weather/streetmapApi";
import { weatherApi } from "./weather/weatherApi";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    bus: busReducer,
    mp3: mp3Reducer,
    [busApi.reducerPath]: busApi.reducer,
    [weatherApi.reducerPath]: weatherApi.reducer,
    [streetmapApi.reducerPath]: streetmapApi.reducer,
    [apiSlice.reducerPath]: apiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      apiSlice.middleware,
      busApi.middleware,
      weatherApi.middleware,
      streetmapApi.middleware
    ),
  devTools: process.env.NODE_ENV !== "production",
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
