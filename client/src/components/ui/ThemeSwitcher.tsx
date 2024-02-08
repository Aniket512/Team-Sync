import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@nextui-org/button";
import {
  Dropdown,
  DropdownMenu,
  DropdownItem,
  DropdownTrigger,
} from "@nextui-org/dropdown";

export function ThemeSwitcher() {
  const { setTheme } = useTheme();

  return (
    <div>
      <Dropdown>
        <DropdownTrigger>
          <Button variant="bordered" isIconOnly>
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </DropdownTrigger>
        <DropdownMenu>
          <DropdownItem onClick={() => setTheme("light")}>Light</DropdownItem>
          <DropdownItem onClick={() => setTheme("dark")}>Dark</DropdownItem>
          <DropdownItem onClick={() => setTheme("system")}>System</DropdownItem>
        </DropdownMenu>
      </Dropdown>
    </div>
  );
}
