import { configureStore } from '@reduxjs/toolkit';
import { combineReducers } from 'redux';
import projectReducer from './slices/projectSlice';
import taskReducer from './slices/taskSlice';
import surveyReducer from './slices/surveySlice';
import excalidrawReducer from './slices/excalidrawSlice';

const reducers = combineReducers({
  projects: projectReducer,
  tasks: taskReducer,
  surveys: surveyReducer,
  excalidraw: excalidrawReducer,
});

export const store = configureStore({
  reducer: reducers,
});

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch