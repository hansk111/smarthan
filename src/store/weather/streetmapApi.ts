import { StreetNameType } from "@/types";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const streetmapApi = createApi({
  reducerPath: "streetmapApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "https://nominatim.openstreetmap.org",
    prepareHeaders: (headers) => {
      headers.set("User-Agent", "smarthan/1.0 (hanseokhee.han@gmail.com)");
      return headers;
    },
  }),
  tagTypes: ["Street"],
  endpoints: (builder) => ({
    /////////////////////////////////// free api call /////////////////////////////////
    getStreetName: builder.query<StreetNameType, { lat: number; lon: number }>({
      query: ({ lat, lon }) => `/reverse?lat=${lat}&lon=${lon}&format=json`,
      providesTags: ["Street"],
    }),
  }),
});

export const { useGetStreetNameQuery } = streetmapApi;
