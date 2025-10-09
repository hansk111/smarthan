import { Platform } from "react-native";
import { apiSlice } from "../services/apiSlice";
interface User {
  first_name: string;
  last_name: string;
  email: string;
}

interface Avatar {
  image: string;
}
interface SocialAuthArgs {
  provider: string;
  state: string;
  code: string;
}

interface CreateUserResponse {
  success: boolean;
  user: User;
}

const authApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    retrieveUser: builder.query<User, void>({
      query: () => "/users/me/",
    }),
    getUserAvatar: builder.query<Avatar, void>({
      query: () => "/users/profile/avatar/",
      providesTags: ["Avatar"],
    }),
    putUserAvatar: builder.mutation({
      query: (avatarImage) => {
        const formData = new FormData();

        if (Platform.OS === "web") {
          // Web: File 객체 직접 사용
          if (avatarImage instanceof File) {
            formData.append("image", avatarImage);
          } else {
            throw new Error("웹에서는 File 객체가 필요합니다.");
          }
        } else {
          // Native: URI, name, type이 있는 객체 확인
          console.log("aaaaaaaaaaaaaaa");
          if (avatarImage && avatarImage.uri) {
            formData.append("image", {
              uri: avatarImage.uri,
              name: avatarImage.name || `avatar_${Date.now()}.jpg`,
              type: avatarImage.type || "image/jpeg",
            } as any);
          } else {
            throw new Error(
              "React Native에서는 URI가 포함된 객체가 필요합니다."
            );
          }
        }

        return {
          url: "/users/profile/avatar/",
          method: "PUT",
          body: formData,
          formData: true,
        };
      },
      invalidatesTags: ["Avatar"],
    }),
    // putUserAvatar: builder.mutation({
    //   query: (formData) => ({
    //     url: "/users/profile/avatar/",
    //     method: "PUT",
    //     body: formData,
    //   }),
    //   invalidatesTags: ["Avatar"],
    // }),
    socialAuthenticate: builder.mutation<CreateUserResponse, SocialAuthArgs>({
      query: ({ provider, state, code }) => ({
        url: `/o/${provider}/?state=${encodeURIComponent(
          state
        )}&code=${encodeURIComponent(code)}`,
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }),
    }),
    login: builder.mutation({
      query: ({ email, password }) => ({
        url: "/jwt/create/",
        method: "POST",
        body: { email, password },
      }),
    }),
    register: builder.mutation({
      query: ({ first_name, last_name, email, password, re_password }) => ({
        url: "/users/",
        method: "POST",
        body: { first_name, last_name, email, password, re_password },
      }),
    }),
    verify: builder.mutation({
      query: () => ({
        url: "/jwt/verify/",
        method: "POST",
      }),
    }),
    logout: builder.mutation({
      query: () => ({
        url: "/logout/",
        method: "POST",
      }),
    }),
    activation: builder.mutation({
      query: ({ uid, token }) => ({
        url: "/users/activation/",
        method: "POST",
        body: { uid, token },
      }),
    }),
    resetPassword: builder.mutation({
      query: (email) => ({
        url: "/users/reset_password/",
        method: "POST",
        body: { email },
      }),
    }),
    resetPasswordConfirm: builder.mutation({
      query: ({ uid, token, new_password, re_new_password }) => ({
        url: "/users/reset_password_confirm/",
        method: "POST",
        body: { uid, token, new_password, re_new_password },
      }),
    }),
  }),
});

export const {
  useRetrieveUserQuery,
  useGetUserAvatarQuery,
  usePutUserAvatarMutation,
  useSocialAuthenticateMutation,
  useLoginMutation,
  useRegisterMutation,
  useVerifyMutation,
  useLogoutMutation,
  useActivationMutation,
  useResetPasswordMutation,
  useResetPasswordConfirmMutation,
} = authApiSlice;
