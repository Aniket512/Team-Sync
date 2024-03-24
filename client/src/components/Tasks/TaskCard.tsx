import { TaskCardProps } from "../../utils/types";
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Chip,
  Divider,
  Link,
} from "@nextui-org/react";
import { MyButton } from "../ui/MyButton";
import { getColor, getStatus } from "../../utils/utils";
import { useNavigate } from "react-router-dom";
import moment from "moment";

export default function TaskCard({ task }: { task: TaskCardProps }) {
  const navigate = useNavigate();

  const handleTaskClick = () => {
    navigate(`${task._id}`);
  };

  return (
    <Card className="max-w-[400px] min-h-[150px]">
      <CardHeader className="flex gap-3">
        <div className="flex flex-col">
          <h4 className="text-md font-semibold leading-none text-default-600">
            {task.name}
          </h4>
        </div>
      </CardHeader>
      <Divider />
      <CardBody>
        <div className="flex justify-between md:flex-col gap-2">
          <Chip color={getColor(task.status)}>{getStatus(task.status)}</Chip>
          <Chip color="default">
            {moment(task.deadline).format("DD-MM-YYYY")}
          </Chip>
        </div>
      </CardBody>
      <Divider />
      <CardFooter>
        <MyButton color="slate" onClick={handleTaskClick}>
          View
        </MyButton>
      </CardFooter>
    </Card>
  );
}
