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
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { getHeaders, getInvitations } from "../../api/urls";

export default function InviteMember() {
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const [email, setEmail] = useState("");
  const { projectId } = useParams();

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const body = {
      projectId,
      email,
    };
    axios
      .post(getInvitations(), body, {
        headers: getHeaders(),
      })
      .then((res) => {
        toast.success('Invitation sent successfully')
      })
      .catch((err) => {
        console.error(err);
        toast.error(err.response.data.message);
      });
    onClose();
    setEmail("");
  };

  return (
    <>
      <MyButton onPress={onOpen} color="slate">
        + Invite
      </MyButton>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} placement="top-center">
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            Invite Team Member
          </ModalHeader>
          <ModalBody>
            <form onSubmit={handleCreate} id="project-form">
              <Input
                autoFocus
                label="Email"
                variant="bordered"
                labelPlacement="outside"
                isRequired
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </form>
          </ModalBody>
          <ModalFooter>
            <MyButton type="submit" form="project-form" color="slate">
              Invite
            </MyButton>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
