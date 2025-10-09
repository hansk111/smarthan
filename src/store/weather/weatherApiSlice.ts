import { apiSlice } from "@/store/services/apiSlice";
import type { WeatherPositionType } from '@/types';

const weatherpositonApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getAllWeatherPosition: builder.query<WeatherPositionType[], void>({
            query: () => '/weather/',
            providesTags: ['WeatherPosition'],
        }),
        saveWeatherPosition: builder.mutation({
            query: (formData) => ({
                url: "/weather/",
                method: "POST",
                body: formData,
            }),
            invalidatesTags: ['WeatherPosition']
        }),
        deleteWeatherPosition: builder.mutation({
            query: (id) => ({
                url: `/weather/${id}/`,
                method: "DELETE",
            }),
            invalidatesTags: ['WeatherPosition']
        }),
    }),
});

export const { useGetAllWeatherPositionQuery, useSaveWeatherPositionMutation, useDeleteWeatherPositionMutation, useLazyGetAllWeatherPositionQuery } = weatherpositonApiSlice;