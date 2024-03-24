// @ts-nocheck
import { useEffect, useState } from "react";
import { TaskCardProps, TaskDetailsProps } from "../../utils/types";
import {
  Avatar,
  Card,
  CardBody,
  Chip,
  Input,
  Select,
  SelectItem,
  Tooltip,
} from "@nextui-org/react";
import { getColor, getStatus } from "../../utils/utils";
import { Edit2Icon } from "lucide-react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { useParams } from "react-router-dom";
import axios from "axios";
import { getHeaders, getOrUpdateTask } from "../../api/urls";
import { toast } from "react-toastify";
import moment from "moment";
import { MyButton } from "../ui/MyButton";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { setCurrentTask } from "../../redux/slices/taskSlice";

export const TaskFields = ({ task }: { task: TaskDetailsProps }) => {
  const [edit, setEdit] = useState(false);
  const { handleSubmit, control, setValue } = useForm<TaskDetailsProps>();

  const { taskId } = useParams();
  const { currentProject } = useAppSelector((state) => state.projects);

  const members = currentProject?.members.map((member) => member.user);
  const dispatch = useAppDispatch();

  useEffect(() => {
    setValue("status", task?.status);
    setValue("deadline", moment(task.deadline).format("yyyy-MM-DD"));
    setValue(
      "assignees",
      task?.assignees?.map((ass) => ass._id)
    );
  }, []);

  const handleClick = () => {
    setEdit(true);
  };

  const onSubmit: SubmitHandler<TaskCardProps> = (data) => {
    const body: any = {};
    if (data.status !== task.status) body.status = data.status;

    if (data.status !== task.status) body.status = data.status;

    if (
      !data.deadline ||
      data.deadline !== moment(task.deadline).format("YYYY-MM-DD")
    ) {
      body.deadline = data.deadline;
    }

    if (typeof data.assignees === "string") {
      const assigneesArray = data.assignees
        .split(",")
        .map((assignee) => assignee.trim());

      if (
        JSON.stringify(assigneesArray) !==
        JSON.stringify(task.assignees.map((ass) => ass._id))
      ) {
        body.assignees = assigneesArray;
      }
    } else {
      if (
        JSON.stringify(data.assignees) !==
        JSON.stringify(task.assignees.map((ass) => ass._id))
      ) {
        body.assignees = data.assignees;
      }
    }

    if (taskId) {
      axios
        .patch(getOrUpdateTask(taskId), body, {
          headers: getHeaders(),
        })
        .then((res) => {
          dispatch(setCurrentTask(res?.data?.task));
        })
        .catch((err) => {
          console.error(err);
          toast.error(err?.message);
        });
    }
    setEdit(false);
  };

  return (
    <div className="flex flex-col min-w-[200px]">
      <Card>
        <CardBody>
          {!edit ? (
            <div className="flex justify-between">
              <div className="flex flex-col gap-2">
                <p className="text-sm text-default-700 font-medium">Status</p>
                <Chip color={getColor(task.status)}>
                  {getStatus(task.status)}
                </Chip>
                <p className="text-sm text-default-700 font-medium">Deadline</p>
                <p className="text-sm text-default-600 font-normal">
                  {moment(task.deadline).format("DD-MM-YYYY")}
                </p>
                <div className="flex flex-col gap-2">
                  <p className="text-sm text-default-700 font-medium">
                    Assignees
                  </p>
                  <div className="flex flex-wrap">
                    {task.assignees.map((assignee) => (
                      <Tooltip key={assignee._id} content={assignee?.name}>
                        <div className="mr-2">
                          <Avatar
                            name={
                              assignee?.avatar || assignee?.name[0]
                            }
                            className="w-8 h-8 rounded-full"
                          />
                        </div>
                      </Tooltip>
                    ))}
                  </div>
                </div>
              </div>
              <Edit2Icon
                className="cursor-pointer"
                className="mr-4"
                onClick={handleClick}
              />
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="flex flex-col gap-2">
                <div className="flex flex-col gap-2">
                  <p className="text-sm text-default-700 font-medium">Status</p>

                  <p className="text-sm text-default-700 font-medium">Status</p>
                  <Controller
                    control={control}
                    name="status"
                    render={({ field }) => (
                      <Select
                        label="Status"
                        defaultSelectedKeys={[task.status]}
                        {...field}
                        className="max-w-xs"
                      >
                        <SelectItem value="backlog" key="backlog">
                          {getStatus("backlog")}
                        </SelectItem>
                        <SelectItem value="todo" key="todo">
                          {getStatus("todo")}
                        </SelectItem>
                        <SelectItem value="in_progress" key="in_progress">
                          {getStatus("in_progress")}
                        </SelectItem>
                        <SelectItem value="in_review" key="in_review">
                          {getStatus("in_review")}
                        </SelectItem>
                        <SelectItem value="done" key="done">
                          {getStatus("done")}
                        </SelectItem>
                      </Select>
                    )}
                  />

                  <p className="text-sm text-default-700 font-medium">
                    Assignees
                  </p>
                  {members && (
                    <Controller
                      control={control}
                      name="assignees"
                      render={({ field }) => (
                        <Select
                          label="Assignees"
                          placeholder="Select assignees"
                          {...field}
                          className="max-w-xs"
                          selectionMode="multiple"
                          defaultSelectedKeys={task.assignees.map(
                            (ass) => ass._id
                          )}
                        >
                          {members?.map((member) => (
                            <SelectItem key={member._id} value={member._id}>
                              {member.name}
                            </SelectItem>
                          ))}
                        </Select>
                      )}
                    />
                  )}

                  <p className="text-sm text-default-700 font-medium">
                    Deadline
                  </p>

                  <Controller
                    control={control}
                    name="deadline"
                    render={({ field }) => (
                      <Input
                        label="Deadline"
                        type="date"
                        placeholder="Select deadline"
                        {...field}
                      />
                    )}
                  />
                </div>

                <MyButton color="slate" type="submit">
                  Save
                </MyButton>
              </div>
            </form>
          )}
        </CardBody>
      </Card>
    </div>
  );
};
