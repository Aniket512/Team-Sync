import {
  Avatar,
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownSection,
  DropdownTrigger,
} from "@nextui-org/react";
import { useNavigate } from "react-router-dom";
import { getUserMail, getUserName, setUserLoggedOut } from "../../configs/auth";

export function UserNav() {
  const userName = getUserName();
  const userEmail = getUserMail();
  const navigate = useNavigate();

  const handleLogout = () => {
    setUserLoggedOut();
    navigate("/");
  };
  return (
    <Dropdown>
      <DropdownTrigger>
        <Button isIconOnly>
          <Avatar
            name={userName
              .split(" ")
              .map((word) => word[0]?.toUpperCase())
              .join("")}
          />
        </Button>
      </DropdownTrigger>
      <DropdownMenu className="w-56">
        <DropdownItem className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{userName}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {userEmail}
            </p>
          </div>
        </DropdownItem>
        <DropdownSection>
          <DropdownItem href="/invitations">Invitations</DropdownItem>
          <DropdownItem href="/projects">Projects</DropdownItem>
        </DropdownSection>
        <DropdownItem
          color="danger"
          className="text-danger"
          onClick={handleLogout}
        >
          Log out
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
}
