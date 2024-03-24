import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { TaskCardProps, TaskDetailsProps } from '../../utils/types';

const initialState: { tasks: TaskCardProps[], currentTask: TaskDetailsProps | undefined } = {
  tasks: [],
  currentTask: undefined
};

export const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    setTasks: (state, action: PayloadAction<TaskCardProps[]>) => {
      state.tasks = action.payload;
    },
    addNewTask: (state, action: PayloadAction<TaskCardProps>) => {
      state.tasks = [...state.tasks, action.payload];
    },
    setCurrentTask: (state, action: PayloadAction<TaskDetailsProps | undefined>) => {
      state.currentTask = action.payload
    }
  },
});

export const { setTasks, addNewTask, setCurrentTask } = taskSlice.actions;

export default taskSlice.reducer;
