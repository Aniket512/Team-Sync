import { useState } from "react";
import { setCurrentTask } from "../../redux/slices/taskSlice";
import { useAppDispatch } from "../../redux/hooks";
import {
  Button,
  Textarea,
} from "@nextui-org/react";
import { MyButton } from "../ui/MyButton";
import { useParams } from "react-router-dom";
import { addTaskComment } from "../../api/urls";
import { toast } from "react-toastify";
import apiClient from "../../api/apiClient";

export const AddComment = () => {
  const [addComment, setAddComment] = useState(false);
  const [comment, setComment] = useState("");
  const { taskId } = useParams();
  const dispatch = useAppDispatch();

  const handleAddComment = () => {
    if (taskId) {
      apiClient
        .post(addTaskComment(taskId), { comment })
        .then((res) => {
          dispatch(setCurrentTask(res?.data?.task));
        })
        .catch((err) => {
          console.error(err);
          toast.error(err?.message);
        });
      setAddComment(false);
      setComment("");
    }
  };
  return (
    <div>
      {!addComment ? (
        <MyButton onClick={() => setAddComment(true)} color="slate">
          Add Comment +
        </MyButton>
      ) : (
        <>
          <Textarea
            variant="bordered"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <div className="mt-2 flex gap-2">
            <Button
              variant="bordered"
              color="danger"
              onClick={() => setAddComment(false)}
            >
              Cancel
            </Button>
            <Button color="success" onClick={handleAddComment}>
              Comment
            </Button>
          </div>
        </>
      )}
    </div>
  );
};
