import React, { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Input,
  Textarea,
} from "@nextui-org/react";
import { InputProject } from "../../utils/types";
import { MyButton } from "./MyButton";
import axios from "axios";
import { addProject } from "../../redux/slices/projectSlice";
import { useAppDispatch } from "../../redux/hooks";
import { toast } from "react-toastify";
import { getHeaders, getProjects } from "../../api/urls";

const initialState = {
  name: "",
  description: "",
};
export default function AddProject() {
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const [project, setProject] = useState<InputProject>(initialState);
  const dispatch = useAppDispatch();

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    axios
      .post(getProjects(), project, {
        headers: getHeaders(),
      })
      .then((res) => {
        dispatch(addProject(res?.data));
      })
      .catch((err) => {
        console.error(err);
        toast.error(err.response.data.message);
      })
    setProject(initialState);
    onClose();
  };

  return (
    <>
      <MyButton onPress={onOpen} color="slate">
        Create New
      </MyButton>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} placement="top-center">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Create New Project
              </ModalHeader>
              <ModalBody>
                <form onSubmit={handleCreate} id="project-form">
                  <Input
                    autoFocus
                    label="Name"
                    placeholder="Name of your project"
                    variant="bordered"
                    labelPlacement="outside"
                    isRequired
                    value={project.name}
                    onChange={(e) =>
                      setProject({ ...project, name: e.target.value })
                    }
                  />
                  <Textarea
                    label="Description"
                    placeholder="Project Description"
                    variant="bordered"
                    labelPlacement="outside"
                    isRequired
                    value={project.description}
                    onChange={(e) =>
                      setProject({ ...project, description: e.target.value })
                    }
                  />
                </form>
              </ModalBody>
              <ModalFooter>
                <MyButton color="danger" variant="flat" onPress={onClose}>
                  Close
                </MyButton>
                <MyButton type="submit" form="project-form" color="slate">
                  Create
                </MyButton>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
