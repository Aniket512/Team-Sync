import React, { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Input,
} from "@nextui-org/react";
import { MyButton } from "../ui/MyButton";
import axios from "axios";
import { useAppDispatch } from "../../redux/hooks";
import { toast } from "react-toastify";
import { addTask, getHeaders } from "../../api/urls";
import { useParams } from "react-router-dom";
import { addNewTask } from "../../redux/slices/taskSlice";

export default function AddTask() {
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const [taskName, setTaskName] = useState("");
  const dispatch = useAppDispatch();
  const { projectId } = useParams();

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const body = {
      name: taskName,
      projectId,
    };
    axios
      .post(addTask(), body, {
        headers: getHeaders(),
      })
      .then((res) => {
        dispatch(addNewTask(res?.data));
      })
      .catch((err) => {
        console.error(err);
        toast.error(err.response.data.message);
      });
    setTaskName("");
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
                Create New Task
              </ModalHeader>
              <ModalBody>
                <form onSubmit={handleCreate} id="project-form">
                  <Input
                    autoFocus
                    label="Title"
                    placeholder="Title of your task"
                    variant="bordered"
                    labelPlacement="outside"
                    isRequired
                    value={taskName}
                    onChange={(e) => setTaskName(e.target.value)}
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
