import {
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@nextui-org/react";
import { ProjectDetails } from "../utils/types";

export const TeamMembers = ({ project }: { project: ProjectDetails }) => {
  return (
    <Table>
      {/* <TableCaption>A list of {community?.name}&apos;s members</TableCaption> */}
      <TableHeader>
        <TableColumn className="">Avatar</TableColumn>
        <TableColumn>Email</TableColumn>
        <TableColumn>Full Name</TableColumn>
        <TableColumn className="">Role</TableColumn>
        {/* <TableColumn className="">Status</TableColumn> */}
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
            {/* <TableCell className="">
              {members.find((ablyMember) => {
                return ablyMember.profileData?.id === cm.id;
              })?.isConnected ? (
                <Badge className="bg-green-400">Online</Badge>
              ) : (
                <Badge variant="secondary">Offline</Badge>
              )}
            </TableCell> */}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
