import { createSlice, PayloadAction } from '@reduxjs/toolkit';
// import type { AppState } from '../types';

export interface BusState {
    favorites: string[];
    recentSearches: string[];
    currentLocation: {
        latitude: number;
        longitude: number;
    } | null;
}

const initialState: BusState = {
    favorites: [],
    recentSearches: [],
    currentLocation: { latitude: 37.394726159, longitude: 127.111209047 },
};

const busSlice = createSlice({
    name: 'bus',
    initialState,
    reducers: {
        addFavorite: (state, action: PayloadAction<string>) => {
            if (!state.favorites.includes(action.payload)) {
                state.favorites.push(action.payload);
            }
        },
        removeFavorite: (state, action: PayloadAction<string>) => {
            state.favorites = state.favorites.filter(id => id !== action.payload);
        },
        addRecentSearch: (state, action: PayloadAction<string>) => {
            // 중복 제거 및 최근 검색어를 맨 앞으로
            state.recentSearches = [
                action.payload,
                ...state.recentSearches.filter(search => search !== action.payload)
            ].slice(0, 10); // 최대 10개까지만 저장
        },
        clearRecentSearches: (state) => {
            state.recentSearches = [];
        },
        setCurrentLocation: (state, action: PayloadAction<{ latitude: number; longitude: number } | null>) => {
            state.currentLocation = action.payload;
        },
    },
});

export const {
    addFavorite,
    removeFavorite,
    addRecentSearch,
    clearRecentSearches,
    setCurrentLocation,
} = busSlice.actions;

export default busSlice.reducer;
