import React, { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { getUserId } from "../configs/auth";
import { Divider, Input } from "@nextui-org/react";
import { MyButton } from "../components/ui/MyButton";
import { getHeaders, getOrUpdateProject } from "../api/urls";
import axios from "axios";
import { setCurrentProject } from "../redux/slices/projectSlice";
import { toast } from "react-toastify";

export default function Settings() {
  const [isLoading, setIsLoading] = useState(false);
  const { currentProject } = useAppSelector((state) => state.projects);
  const [formState, setFormState] = useState({ name: "", description: "" });
  const userId = getUserId();
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (currentProject) {
      setFormState({
        name: currentProject.name || "",
        description: currentProject.description || "",
      });
    }
  }, [currentProject]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpdate = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!currentProject?._id) {
      return;
    }
    setIsLoading(true);
    axios
      .patch(getOrUpdateProject(currentProject?._id), formState, {
        headers: getHeaders(),
      })
      .then((res) => {
        dispatch(setCurrentProject(res?.data));
        toast.success("Project Details updated Successfully");
      })
      .catch((err) => {
        toast.error(
          err.response.data.message ||
            "An error occured updating project details"
        );
      })
      .finally(() => setIsLoading(false));
  };
  const isAdmin = currentProject?.createdBy === userId;

  return (
    <div className="h-[calc(100vh-4.5rem)] flex flex-col p-4">
      <div className="">
        <div className="space-y-6 p-6">
          <div>
            <h3 className="text-lg font-medium">Project Settings</h3>
            <p className="text-sm text-muted-foreground">
              The owner and admins of this project will be able to change its
              settings.
            </p>
          </div>
          <Divider />
          <form className="space-y-8">
            <p>Project Name</p>
            <Input name="name" value={formState.name} onChange={handleChange} />
            <p>Project Description</p>
            <Input
              name="description"
              value={formState.description}
              onChange={handleChange}
            />
            <MyButton
              color="slate"
              type="submit"
              disabled={isLoading || !isAdmin}
              onClick={handleUpdate}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isAdmin ? "Update Project" : "Missing Privilege"}
            </MyButton>
          </form>
        </div>
      </div>
    </div>
  );
}
