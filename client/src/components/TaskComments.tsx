import {
  Card,
  CardBody,
  CardHeader,
  Divider,
  Image,
  Textarea,
} from "@nextui-org/react";
import { TaskComment } from "../utils/types";
import moment from "moment";

export const TaskComments = ({ comment }: { comment: TaskComment }) => {
  const formattedDate = moment(comment.createdAt).format("MMM D, HH:mm A");

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between w-full">
          <p className="text-xs font-semibold text-default-600">
            {comment.user.name}
          </p>
          <p className="text-xs font-medium text-default-400">
            Commented on {formattedDate}
          </p>
        </div>
      </CardHeader>
      <Divider />
      <CardBody>
        <p className="text-base font-normal">{comment.text}</p>
      </CardBody>
    </Card>
  );
};
