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

export const TeamMembers = ({ project, onlineUsers }: { project: ProjectDetails; onlineUsers: string[] }) => {
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
        {project?.members?.map((pr) => {
          // Compare as strings — socket presence always sends string ids
          const isOnline = onlineUsers.includes(String(pr.user._id));
          return (
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
                {isOnline ? (
                  <Chip className="bg-green-400 text-white text-xs">Online</Chip>
                ) : (
                  <Chip color="default" variant="flat" className="text-xs">Offline</Chip>
                )}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};
