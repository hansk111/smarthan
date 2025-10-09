import * as SecureStore from "expo-secure-store";

const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";

// Access Token 저장
export const saveAccessToken = async (token: string): Promise<void> => {
  try {
    await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, token);
    // alert("엑세스토큰 저장");
  } catch (error) {
    console.error("Access Token 저장 실패", error);
  }
};

// Refresh Token 저장
export const saveRefreshToken = async (token: string): Promise<void> => {
  try {
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token);
  } catch (error) {
    console.error("Refresh Token 저장 실패", error);
  }
};

// Access Token 불러오기
export const getAccessToken = async (): Promise<string | null> => {
  try {
    return await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
  } catch (error) {
    console.error("Access Token 불러오기 실패", error);
    return null;
  }
};

// Refresh Token 불러오기
export const getRefreshToken = async (): Promise<string | null> => {
  try {
    return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
  } catch (error) {
    console.error("Refresh Token 불러오기 실패", error);
    return null;
  }
};

// Access Token 삭제
export const deleteAccessToken = async (): Promise<void> => {
  try {
    await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
    // alert("엑세스토큰 삭제");
  } catch (error) {
    console.error("Access Token 삭제 실패", error);
  }
};

// Refresh Token 삭제
export const deleteRefreshToken = async (): Promise<void> => {
  try {
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
  } catch (error) {
    console.error("Refresh Token 삭제 실패", error);
  }
};

// 모든 토큰 삭제 (로그아웃 시)
export const deleteAllTokens = async (): Promise<void> => {
  await deleteAccessToken();
  await deleteRefreshToken();
};
