import { BusRouteResponse, BusStop, StationType } from "@/types";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const API_KEY = process.env.EXPO_PUBLIC_GYEONGGI_BUS_API_KEY;

// const BASE_URL = process.env.EXPO_PUBLIC_GYEONGGI_BUS_API_URL;

export const busApi = createApi({
  reducerPath: "busApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "https://apis.data.go.kr/6410000",
  }),
  tagTypes: ["BusRoute", "BusStop", "BusArrival", "BusInfo", "BusLocation"],
  endpoints: (builder) => ({
    // 근처 버스 정류장 검색
    getNearbyBusStops: builder.query<
      BusStop[],
      { x?: number; y?: number; radius?: number }
    >({
      query: ({ x = 127.111209047, y = 37.394726159, radius = 500 }) =>
        `/busstationservice/v2/getBusStationAroundListv2?serviceKey=${API_KEY}&x=${x}&y=${y}&radius=${radius}`,
      transformResponse: (response: any) => {
        return response.response.msgBody?.busStationAroundList || [];
      },
      providesTags: ["BusStop"],
    }),

    // 버스 정류장 검색
    getBusStops: builder.query<
      BusStop[],
      { keyword?: string; pageNo?: number }
    >({
      query: ({ keyword = "", pageNo = 1 }) =>
        `/busstationservice/v2/getBusStationListv2?serviceKey=${API_KEY}&keyword=${encodeURIComponent(
          keyword
        )}&pageNo=${pageNo}`,
      transformResponse: (response) => {
        const parsed = response as {
          response?: {
            msgBody?: {
              busStationList?: BusStop[];
            };
          };
        };
        return parsed.response?.msgBody?.busStationList || [];
      },
      providesTags: ["BusStop"],
    }),

    getBusRoutes: builder.query({
      query: ({ keyword = "", pageNo = 1 }) =>
        `/busrouteservice/v2/getBusRouteListv2?serviceKey=${API_KEY}&keyword=${encodeURIComponent(
          keyword
        )}&pageNo=${pageNo}`,
      transformResponse: (response) => {
        return response.response.msgBody?.busRouteList || [];
      },
      providesTags: ["BusRoute"],
    }),

    getBusArrivalInfo: builder.query({
      query: ({ id }) =>
        `/busarrivalservice/v2/getBusArrivalListv2?serviceKey=${API_KEY}&stationId=${id}`,
      transformResponse: (response) => {
        return response.response.msgBody?.busArrivalList || [];
      },
      providesTags: ["BusArrival"],
    }),

    // 특정 노선의 정류장 목록
    getRouteStations: builder.query<StationType[], { routeId: string }>({
      query: ({ routeId }) =>
        `/busrouteservice/v2/getBusRouteStationListv2?serviceKey=${API_KEY}&routeId=${routeId}`,
      transformResponse: (response: BusRouteResponse) => {
        return response.response.msgBody?.busRouteStationList || [];
      },
      providesTags: ["BusStop"],
    }),

    // 특정 노선의 정보
    getRouteInfoItem: builder.query({
      query: ({ routeId }) =>
        `/busrouteservice/v2/getBusRouteInfoItemv2?serviceKey=${API_KEY}&routeId=${routeId}`,
      transformResponse: (response) => {
        return response.response.msgBody.busRouteInfoItem || null;
      },
      providesTags: ["BusInfo"],
    }),

    // 특정 노선의 위치정보보
    getRouteLocation: builder.query({
      query: ({ routeId }) =>
        `/buslocationservice/v2/getBusLocationListv2?serviceKey=${API_KEY}&routeId=${routeId}`,
      transformResponse: (response) => {
        return response.response.msgBody.busLocationList || null;
      },
      providesTags: ["BusLocation"],
    }),

    // 버스 정류장 검색
    // getBusStops: builder.query<BusStop[], { keyword?: string; pageNo?: number }>({
    //     query: ({ keyword = '', pageNo = 1 }) =>
    //         `/getBusStationList?serviceKey=${API_KEY}&keyword=${encodeURIComponent(keyword)}&pageNo=${pageNo}`,
    //     transformResponse: (response: ApiResponse<BusStopListResponse>) => {
    //         return response.msgBody?.busStationAroundList || [];
    //     },
    //     providesTags: ['BusStop'],
    // }),

    // 근처 버스 정류장 검색
    // getNearbyBusStops: builder.query<BusStop[], { x: number; y: number; radius?: number }>({
    //     query: ({ x = 127.111209047, y = 37.394726159, radius = 500 }) =>
    //         `/getBusStationAroundListv2?serviceKey=${API_KEY}&x=${x}&y=${y}&radius=${radius}`,
    //     transformResponse: (response: ApiResponse<BusStopListResponse>) => {
    //         return response.msgBody?.busStationAroundList || [];
    //     },
    //     providesTags: ['BusStop'],
    // }),

    // 버스 도착 정보
    // getBusArrivalInfo: builder.query<BusArrival[], { stationId: string }>({
    //     query: ({ stationId }) =>
    //         `/getBusArrivalList?serviceKey=${API_KEY}&stationId=${stationId}`,
    //     transformResponse: (response: ApiResponse<BusArrivalResponse>) => {
    //         return response.msgBody?.busArrivalList || [];
    //     },
    //     providesTags: ['BusArrival'],
    // }),

    // 특정 노선의 정류장 목록
    // getRouteStations: builder.query<BusStop[], { routeId: string }>({
    //     query: ({ routeId }) =>
    //         `/getBusRouteStationList?serviceKey=${API_KEY}&routeId=${routeId}`,
    //     transformResponse: (response: ApiResponse<BusStopListResponse>) => {
    //         return response.msgBody?.busStationAroundList || [];
    //     },
    //     providesTags: ['BusStop'],
    // }),
  }),
});

export const {
  useGetBusRoutesQuery,
  useGetBusStopsQuery,
  useGetNearbyBusStopsQuery,
  useGetBusArrivalInfoQuery,
  useGetRouteStationsQuery,
  useGetRouteInfoItemQuery,
  useGetRouteLocationQuery,
  useLazyGetBusRoutesQuery,
  useLazyGetBusStopsQuery,

  useLazyGetNearbyBusStopsQuery,
  useLazyGetBusArrivalInfoQuery,
  useLazyGetRouteStationsQuery,
} = busApi;
