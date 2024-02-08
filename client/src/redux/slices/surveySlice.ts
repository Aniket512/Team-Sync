import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { SurveyProps } from '../../utils/types';

const initialState: { surveys: SurveyProps[] } = {
  surveys: [],
};

export const surveySlice = createSlice({
  name: 'surveys',
  initialState,
  reducers: {
    setSurveys: (state, action: PayloadAction<SurveyProps[]>) => {
      state.surveys = action.payload;
    },
    addSurvey: (state, action: PayloadAction<SurveyProps>) => {
      state.surveys = [...state.surveys, action.payload];
    },
  },
});

export const { setSurveys, addSurvey } = surveySlice.actions;

export default surveySlice.reducer;
