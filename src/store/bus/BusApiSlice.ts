import { apiSlice } from "@/store/services/apiSlice";
import type { BusStop } from '@/types';



const busApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getAllBusStation: builder.query<BusStop, void>({
            query: () => '/busstop/',
            providesTags: ['Station'],
        }),
        saveBusStation: builder.mutation({
            query: (formData) => ({
                url: "/busstop/",
                method: "POST",
                body: formData,
            }),
            invalidatesTags: ['Station']
        }),
        deleteBusStation: builder.mutation({
            query: (id) => ({
                url: `/busstop/${id}/`,
                method: "DELETE",
            }),
            invalidatesTags: ['Station']
        }),
    }),
});

export const { useGetAllBusStationQuery, useSaveBusStationMutation, useDeleteBusStationMutation, useLazyGetAllBusStationQuery } = busApiSlice;