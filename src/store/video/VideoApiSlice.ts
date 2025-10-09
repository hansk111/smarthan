import { apiSlice } from "@/store/services/apiSlice";
import { Platform } from "react-native";

interface Video {
  id: string;
  title: string;
  description: string;
  type: string;
  thumbnail: string;
  video_file: string;
  created_at: string;
}

const videoApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAllVideo: builder.query<Video[], void>({
      query: () => "/video/",
      providesTags: ["Video"],
    }),
    getVideoById: builder.query({
      query: (id: string) => `/video/${id}/`,
      providesTags: ["Video"],
    }),
    deleteVideo: builder.mutation({
      query: (id: string) => ({
        url: `/video/${id}/`,
        method: "DELETE",
      }),
      invalidatesTags: ["Video"],
    }),
    createVideo: builder.mutation({
      query: (formData) => {
        const formDataToSend = new FormData();

        if (Platform.OS === "web") {
          formDataToSend.append("title", formData.title);
          formDataToSend.append("description", formData.description);
          formDataToSend.append("type", formData.type);
          formDataToSend.append("thumbnail", formData.thumbnail);
          formDataToSend.append("video_file", formData.video_file);
        } else {
          formDataToSend.append("title", formData.title);
          formDataToSend.append("description", formData.description);
          formDataToSend.append("type", formData.type);
          formDataToSend.append("thumbnail", {
            uri: formData.thumbnail.uri,
            name: formData.thumbnail.name || `thumbnail_${Date.now()}.jpg`,
            type: formData.thumbnail.type || "image/jpeg",
          } as any);
          formDataToSend.append("video_file", {
            uri: formData.video_file.uri,
            name: formData.video_file.name || `video_${Date.now()}.mp4`,
            type: formData.video_file.type || "video/mp4",
          } as any);
        }

        return {
          url: "/video/",
          method: "POST",
          body: formDataToSend,
        };
      },
      invalidatesTags: ["Video"],
    }),
    // 플랫폼별 자동 선택 뮤테이션
    updateVideoThumbnail: builder.mutation({
      query: ({ id, thumbnail }) => {
        const formData = new FormData();

        if (Platform.OS === "web") {
          // Web: File 객체 직접 사용
          if (thumbnail instanceof File) {
            formData.append("thumbnail", thumbnail);
          } else {
            throw new Error("웹에서는 File 객체가 필요합니다.");
          }
        } else {
          // Native: URI, name, type이 있는 객체 확인
          if (thumbnail && thumbnail.uri) {
            formData.append("thumbnail", {
              uri: thumbnail.uri,
              name: thumbnail.name || `thumbnail_${Date.now()}.jpg`,
              type: thumbnail.type || "image/jpeg",
            } as any);
          } else {
            throw new Error(
              "React Native에서는 URI가 포함된 객체가 필요합니다."
            );
          }
        }

        return {
          url: `/video/${id}/update_thumbnail/`,
          method: "PATCH",
          body: formData,
          formData: true,
        };
      },
      invalidatesTags: ["Video"],
    }),
  }),
});

export const {
  useGetAllVideoQuery,
  useGetVideoByIdQuery,
  useDeleteVideoMutation,
  useUpdateVideoThumbnailMutation,
  useLazyGetAllVideoQuery,
  useLazyGetVideoByIdQuery,

  useCreateVideoMutation,
} = videoApiSlice;
