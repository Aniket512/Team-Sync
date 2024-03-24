import {
  Card,
  CardBody,
  CardHeader,
  Divider,
  Textarea,
} from "@nextui-org/react";
import { Pencil } from "lucide-react";
import { useEffect, useState } from "react";
import { MyButton } from "../ui/MyButton";
import axios from "axios";
import { getHeaders, getOrUpdateTask } from "../../api/urls";
import { toast } from "react-toastify";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { setCurrentTask } from "../../redux/slices/taskSlice";
import moment from "moment";

export const TaskDescription = () => {
  const [description, setDescription] = useState("");
  const [shouldEdit, setShouldEdit] = useState(false);
  const task = useAppSelector((state) => state.tasks.currentTask);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (task?.description) {
      setDescription(task?.description);
    }
  }, [task]);

  const handleClick = () => {
    setShouldEdit(true);
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDescription(e.target.value);
  };

  const cancelDescriptionChange = () => {
    setShouldEdit(false);
  };

  const updateDescription = async () => {
    const body = {
      description,
    };
    if (task) {
      axios
        .patch(getOrUpdateTask(task?._id), body, {
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
    cancelDescriptionChange();
  };  

  return (
    <>
      {!shouldEdit ? (
        <Card>
          <CardHeader>
            <div className="flex justify-between w-full">
              <p className="text-sm font-semibold text-default-600">
                {task?.name}
              </p>
              <div className="flex gap-2">
                <p className="text-xs font-medium text-default-400 mt-1">
                  Created on {moment(task?.createdAt).format("MMM D, HH:mm A")}
                </p>
                <Pencil className="cursor-pointer" fontSize="small" onClick={handleClick} />
              </div>
            </div>
          </CardHeader>
          <Divider />
          <CardBody>
            <Textarea
              className="text-base font-normal"
              value={task?.description}
              isReadOnly
            />
          </CardBody>
        </Card>
      ) : (
        <div className="w-full p-2 rounded-lg">
          <Textarea
            variant="bordered"
            minRows={4}
            value={description}
            onChange={handleDescriptionChange}
          />
          <div className="flex justify-end gap-1.5 mt-2">
            <MyButton
              variant="bordered"
              color="danger"
              className="rounded-lg "
              onClick={cancelDescriptionChange}
            >
              Cancel
            </MyButton>
            <MyButton
              variant="solid"
              color="success"
              onClick={updateDescription}
              disabled={description === (task?.description ?? "")}
            >
              Update
            </MyButton>
          </div>
        </div>
      )}
    </>
  );
};
