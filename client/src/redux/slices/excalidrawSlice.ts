import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { ExcalidrawImperativeAPI } from '@excalidraw/excalidraw/types/types';

const initialState: { excalidrawAPI: ExcalidrawImperativeAPI | null } = {
  excalidrawAPI: null
};

export const excalidrawSlice = createSlice({
  name: 'excalidraw',
  initialState,
  reducers: {
    setExcalidrawAPI: (state, action: PayloadAction<ExcalidrawImperativeAPI>) => {
      state.excalidrawAPI = action.payload;
    },
  },
});

export const { setExcalidrawAPI } = excalidrawSlice.actions;

export default excalidrawSlice.reducer;
