//@ts-nocheck
import {
  Avatar,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@nextui-org/react";
import { ProjectDetails } from "../../utils/types";

export const TeamMembers = ({ project, users }: { project: ProjectDetails, users: any[] }) => {
  return (
    <Table>
      <TableHeader>
        <TableColumn className="">Avatar</TableColumn>
        <TableColumn>Email</TableColumn>
        <TableColumn>Full Name</TableColumn>
        <TableColumn className="">Role</TableColumn>
        <TableColumn className="">Status</TableColumn>
      </TableHeader>
      <TableBody>
        {project?.members?.map((pr) => (
          <TableRow key={pr._id}>
            <TableCell className="font-medium">
              <Avatar src={pr.user?.avatar} />
            </TableCell>
            <TableCell>{pr.user?.email}</TableCell>
            <TableCell>{pr.user?.name}</TableCell>
            <TableCell className="">
              {pr.isAdmin ? "Admin" : "Member"}
            </TableCell>
            <TableCell className="">
              {users.find((user) => {
                return user.userId === pr.user._id;
              })?.userId ? (
                <Chip className="bg-green-400">Online</Chip>
              ) : (
                <Chip color="default">Offline</Chip>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
