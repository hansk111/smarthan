import { CurrentWeatherAndForecastType, WeatherOverviewType, WeatherType } from "@/types";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";


const API_KEY = process.env.EXPO_PUBLIC_WEATHER_API_KEY;

export const weatherApi = createApi({
    reducerPath: "weatherApi",
    baseQuery: fetchBaseQuery({
        baseUrl: "https://api.openweathermap.org",
    }),
    tagTypes: ["Weather"],
    endpoints: (builder) => ({
        /////////////////////////////////// free api call /////////////////////////////////
        getWeather: builder.query<WeatherType, { lat: number; lon: number }>({
            query: ({ lat, lon }) =>
                `/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&lang=kr&appid=${API_KEY}`,
            providesTags: ["Weather"],
        }),
        get5DayForecast: builder.query<any, { lat: number; lon: number }>({
            query: ({ lat, lon }) =>
                `/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&lang=kr&appid=${API_KEY}`,
            providesTags: ["Weather"],
            transformResponse: (response: any) => {
                return response.list || []
            },
        }),
        getGeocoord: builder.query({
            query: ({ query }) =>
                `/geo/1.0/direct?q=${query}&limit=5&appid=${API_KEY}`,
            providesTags: ["Weather"],
        }),
        ////////////////////////////// One Call API 3.0 ////////////////////////////////////////////
        // Current and forecasts weather data

        getCurrentAndForecast: builder.query<CurrentWeatherAndForecastType, { lat: number; lon: number }>({
            query: ({ lat, lon }) =>
                `/data/3.0/onecall?lat=${lat}&lon=${lon}&units=metric&lang=kr&appid=${API_KEY}`,
            providesTags: ["Weather"],
        }),
        getWeatherOverview: builder.query<WeatherOverviewType, { lat: number; lon: number }>({
            query: ({ lat, lon }) =>
                `/data/3.0/onecall/overview?lat=${lat}&lon=${lon}&units=metric&lang=kr&appid=${API_KEY}`,
            providesTags: ["Weather"],
        }),

    })
});

export const {
    useGetWeatherQuery,
    useGet5DayForecastQuery,
    useGetGeocoordQuery,
    useGetCurrentAndForecastQuery,
    useGetWeatherOverviewQuery,
    useLazyGetWeatherQuery,
    useLazyGetGeocoordQuery,
    useLazyGet5DayForecastQuery,
    useLazyGetCurrentAndForecastQuery,
    useLazyGetWeatherOverviewQuery,
} = weatherApi;
