import { useEffect } from "react";
import { setCurrentTask } from "../redux/slices/taskSlice";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { TaskDescription } from "../components/Tasks/TaskDescription";
import {
  Divider,
} from "@nextui-org/react";
import { TaskComments } from "../components/Tasks/TaskComments";
import { TaskFields } from "../components/Tasks/TaskFields";
import { useParams } from "react-router-dom";
import { getHeaders, getOrUpdateTask } from "../api/urls";
import axios from "axios";
import { toast } from "react-toastify";
import { AddComment } from "../components/Tasks/AddComment";

export const DetailedTask = () => {
  const task = useAppSelector((state) => state.tasks.currentTask);
  const { taskId } = useParams();
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (taskId) {
      axios
        .get(getOrUpdateTask(taskId), {
          headers: getHeaders(),
        })
        .then((res) => {
          dispatch(setCurrentTask(res?.data));
        })
        .catch((err) => {
          console.error(err);
          toast.error(err?.message);
        });
    }
  }, []);

  return (
    <div className="flex justify-between m-4 md:m-10 flex-col md:flex-row gap-4 md:gap-2">
      <div className="flex flex-col md:w-3/4 gap-2">
        {task && <TaskDescription />}
        <Divider />
        {task?.comments.map((comment) => {
          return <TaskComments key={comment._id} comment={comment} />;
        })}
        <AddComment />
      </div>
      {task && <TaskFields task={task} />}
    </div>
  );
};
