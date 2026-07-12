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
import {
  getUserImage,
  getUserMail,
  getUserName,
  setUserLoggedOut,
} from "../../configs/auth";

export function UserNav() {
  const userName = getUserName();
  const userEmail = getUserMail();
  const userImage = getUserImage();
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
            src={userImage || ""}
            name={userName
              ?.split(" ")
              ?.map((word) => word[0]?.toUpperCase())
              ?.join("")}
          />
        </Button>
      </DropdownTrigger>
      <DropdownMenu className="w-56">
        <DropdownItem className="font-normal">
          <div className="flex items-center gap-3">
            <Avatar
              src={userImage || ""}
              name={userName
                ?.split(" ")
                ?.map((word) => word[0]?.toUpperCase())
                ?.join("")}
              className="w-10 h-10 rounded-full"
            />
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{userName}</p>
              <p className="text-xs leading-none text-muted-foreground">
                {userEmail}
              </p>
            </div>
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
