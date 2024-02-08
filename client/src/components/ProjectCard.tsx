import { ProjectProps } from "../utils/types";
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
import { MyButton } from "./ui/MyButton";

export default function ProjectCard({ project }: {project: ProjectProps}) {
  return (
    <Card className="max-w-[400px] min-h-[200px]">
      <CardHeader className="flex gap-3">
        <div className="flex flex-col">
          <h4 className="text-md font-semibold leading-none text-default-600">
            {project.name}
          </h4>
        </div>
      </CardHeader>
      <Divider />
      <CardBody>
        <p className="text-small text-default-500">{project.description}</p>
        {/* <p className="mr-4">
          Status:
          {project.isActive ? (
            <Chip color="success">Active</Chip>
          ) : (
            <Chip color="danger">Inactive</Chip>
          )}
        </p> */}
      </CardBody>
      <Divider />
      <CardFooter>
        <MyButton
          color="slate"
          as={Link}
          href={`/projects/${project._id}/dashboard`}
        >
          View
        </MyButton>
      </CardFooter>
    </Card>
  );
}
