import { createSlice } from "@reduxjs/toolkit";

interface MP3File {
  uri: string;
  name: string;
  size: number;
  mimeType: string;
}
const initialState = {
  isPlaying: false,
  mp3Files: [] as MP3File[],
};

const mp3Slice = createSlice({
  name: "mp3",
  initialState: initialState,
  reducers: {
    togglePlay: (state) => {
      state.isPlaying = !state.isPlaying;
    },
    addMp3File: (state, action) => {
      const newMp3Files = action.payload.filter(
        (newFile: MP3File) =>
          !state.mp3Files.some(
            (existingFile) =>
              existingFile.name === newFile.name &&
              existingFile.size === newFile.size
          )
      );
      state.mp3Files.push(...newMp3Files);
      console.log("Updated mp3Files:", state.mp3Files);
    },
    removeMp3File: (state, action) => {
      state.mp3Files = state.mp3Files.filter(
        (file) => file.uri !== action.payload.uri
      );
    },
    clearMp3Files: (state) => {
      state.mp3Files = [];
    },
    setMp3Files: (state, action) => {
      state.mp3Files = action.payload;
    },
  },
});

export const {
  togglePlay,
  addMp3File,
  removeMp3File,
  clearMp3Files,
  setMp3Files,
} = mp3Slice.actions;
export default mp3Slice.reducer;
