import type {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { Mutex } from "async-mutex";
import { Platform } from "react-native";
import { logoutAuth, setAuth } from "../auth/authSlice";
import {
  getAccessToken,
  getRefreshToken,
  saveAccessToken,
} from "../auth/tokenManager";

interface RefreshResponse {
  access: string;
}

// create a new mutex
const mutex = new Mutex();

const baseQueryAndroid = fetchBaseQuery({
  baseUrl: `${process.env.EXPO_PUBLIC_HOST}/api`,
  prepareHeaders: async (headers) => {
    try {
      const accessToken = await getAccessToken();
      if (accessToken) {
        headers.set("Authorization", `Bearer ${accessToken}`);
      }
      // headers.set('Content-Type', 'application/json');
      // console.log("baseUrl===", `${process.env.EXPO_PUBLIC_HOST}/api`);
      return headers;
    } catch (error) {
      console.error("Error preparing headers:", error);
      // headers.set('Content-Type', 'application/json');
      return headers;
    }
  },
});

const baseQueryWeb = fetchBaseQuery({
  baseUrl: `${process.env.EXPO_PUBLIC_HOST}/api`,
  credentials: "include",
  prepareHeaders: (headers) => {
    // headers.set('Content-Type', 'application/json');
    return headers;
  },
});

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const baseQuery = Platform.OS === "web" ? baseQueryWeb : baseQueryAndroid;

  let result = await baseQuery(args, api, extraOptions);

  // 401 에러 처리 (웹과 안드로이드 공통 로직)
  if (result.error && result.error.status === 401) {
    try {
      const refreshResult = await mutex.runExclusive(async () => {
        try {
          // 먼저 다시 요청을 시도해보기 (다른 요청이 이미 토큰을 갱신했을 수 있음)
          const retryResult = await baseQuery(args, api, extraOptions);
          if (!retryResult.error || retryResult.error.status !== 401) {
            return retryResult;
          }

          // 여전히 401이면 토큰 갱신 진행
          let refreshResponse;

          if (Platform.OS === "web") {
            // 웹: 쿠키 기반 인증
            refreshResponse = await baseQuery(
              {
                url: "/jwt/refresh/",
                method: "POST",
              },
              api,
              extraOptions
            );
          } else {
            // 안드로이드: 토큰 기반 인증
            const refreshToken = await getRefreshToken();
            if (!refreshToken) {
              api.dispatch(logoutAuth());
              return null;
            }

            refreshResponse = await baseQuery(
              {
                url: "/jwt/refresh/",
                method: "POST",
                body: { refresh: refreshToken },
              },
              api,
              extraOptions
            );
          }

          // 토큰 갱신 성공 시 처리
          if (refreshResponse.data) {
            if (Platform.OS === "android") {
              // 안드로이드: 새 액세스 토큰 저장
              const refreshData = refreshResponse.data as RefreshResponse;
              if (refreshData.access) {
                await saveAccessToken(refreshData.access);
              } else {
                api.dispatch(logoutAuth());
                return null;
              }
            }

            // 인증 상태 업데이트 후 원래 요청 재시도
            api.dispatch(setAuth());
            return await baseQuery(args, api, extraOptions);
          } else {
            // 토큰 갱신 실패
            api.dispatch(logoutAuth());
            return null;
          }
        } catch (innerError) {
          // mutex 내부에서 발생한 에러 처리
          console.error("Error during token refresh process:", innerError);
          alert("토큰 갱신 중 오류가 발생했습니다. 다시 로그인해주세요.");
          api.dispatch(logoutAuth());
          return null;
        }
      });

      // refreshResult가 null이 아니면 갱신된 결과 사용
      if (refreshResult !== null) {
        result = refreshResult;
      }
    } catch (mutexError) {
      // mutex.runExclusive 자체에서 발생한 에러 처리
      console.error("Mutex error during token refresh:", mutexError);
      alert("인증 처리 중 오류가 발생했습니다. 다시 로그인해주세요.");
      api.dispatch(logoutAuth());

      // 원본 401 에러를 그대로 반환하거나 적절한 에러 응답을 생성
      result = {
        error: {
          status: "FETCH_ERROR",
          error: "Authentication refresh failed",
        } as FetchBaseQueryError,
      };
    }
  }

  return result;
};

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Todos", "Avatar", "Station", "Video", "WeatherPosition"],
  endpoints: (builder) => ({}),
});
