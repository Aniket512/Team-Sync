import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { ProjectDetails, ProjectListProps, ProjectProps } from '../../utils/types';

const initialState: ProjectListProps = {
  projects: [],
  currentProject: null
};

export const projectSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    setProjects: (state, action: PayloadAction<ProjectProps[]>) => {
      state.projects = action.payload;
    },
    addProject: (state, action: PayloadAction<ProjectProps>) => {
      state.projects = [...state.projects, action.payload];
    },
    setCurrentProject: (state, action: PayloadAction<ProjectDetails | null>) => {
      state.currentProject = action.payload
    }
  },
});

export const { setProjects, addProject, setCurrentProject} = projectSlice.actions;

export default projectSlice.reducer;
