import axios from "axios";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { getHeaders, getTasks } from "../api/urls";
import TaskCard from "../components/Tasks/TaskCard";
import { toast } from "react-toastify";
import AddTask from "../components/Tasks/AddTask";
import { setTasks } from "../redux/slices/taskSlice";

export default function Tasks() {
  const { tasks } = useAppSelector((state) => state.tasks);
  const dispatch = useAppDispatch();
  const { projectId } = useParams();

  useEffect(() => {
    if (projectId) {
      axios
        .get(getTasks(projectId), {
          headers: getHeaders(),
        })
        .then((res) => {
          dispatch(setTasks(res?.data));
        })
        .catch((err) => {
          console.error(err);
          toast.error(err.response.data.message);
        });
    }
  }, []);

  return (
    <div className="min-h-[90vh] flex flex-col">
      <div className="p-4">
        <div className="flex justify-between mb-6">
          <h2 className="text-3xl font-bold tracking-tight">Tasks</h2>
          <AddTask />
        </div>
        {tasks.length > 0 ? (
          <div className="grid gap-2 grid-cols-12">
            {tasks.map((task) => (
              <div
                key={task._id}
                className="col-span-12 md:col-span-6 lg:col-span-3 mx-2"
              >
                <TaskCard task={task} />
              </div>
            ))}
          </div>
        ) : (
          <div>No tasks found for this project</div>
        )}
      </div>
    </div>
  );
}
