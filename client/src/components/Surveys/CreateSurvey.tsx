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
import { SurveyInput } from "../../utils/types";
import { MyButton } from "../ui/MyButton";
import { useForm, SubmitHandler, useFieldArray } from "react-hook-form";
import { Trash2 } from "lucide-react";
import axios from "axios";
import { createSurvey, getHeaders } from "../../api/urls";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useAppDispatch } from "../../redux/hooks";
import { addSurvey } from "../../redux/slices/surveySlice";

const initialState = {
  title: "",
  description: "",
  choices: [{ text: "" }],
};

export default function CreateSurvey() {
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    reset,
  } = useForm({
    defaultValues: initialState,
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "choices",
  });

  const { projectId } = useParams();
  const disptach = useAppDispatch();

  const onSubmit: SubmitHandler<SurveyInput> = (data) => {
    const body = {
      ...data,
      projectId,
    };

    axios
      .post(createSurvey(), body, {
        headers: getHeaders(),
      })
      .then((res) => {
        disptach(addSurvey(res?.data));
        toast.success("Survey created successfully.");
      })
      .catch((err) => {
        console.error(err);
        toast.error(err.response.data.message);
      });
    reset(initialState);
    fields.forEach((_, index) => remove(index));
    onClose();
  };

  return (
    <>
      <MyButton onPress={onOpen} color="slate">
        Create+
      </MyButton>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} placement="top-center">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Create New Survey
              </ModalHeader>
              <ModalBody>
                <form onSubmit={handleSubmit(onSubmit)} id="survey-form">
                  <Input
                    autoFocus
                    label="Title"
                    placeholder="Title of your survey"
                    variant="bordered"
                    labelPlacement="outside"
                    {...register("title", { required: "Title is required" })}
                  />
                  {errors.title && (
                    <span className="text-red-500 font-normal">
                      {errors.title.message}
                    </span>
                  )}

                  <Textarea
                    label="Description"
                    placeholder="Survey Description"
                    variant="bordered"
                    labelPlacement="outside"
                    {...register("description")}
                  />
                  <p className="font-medium text-base text-default-700">
                    Choices
                  </p>
                  <p className="font-normal text-sm">
                    Add choices for the survey
                  </p>
                  {fields.map((choice, index) => (
                    <div key={choice.id}>
                      <div className="flex justify-between mt-2">
                        <Input
                          variant="bordered"
                          labelPlacement="outside"
                          {...register(`choices.${index}.text`, {
                            required:
                              "String must contain at least 2 character(s)",
                          })}
                        />
                        <MyButton
                          className="bg-transparent"
                          onClick={() => remove(index)}
                        >
                          <Trash2 />
                        </MyButton>
                      </div>
                      {errors.choices?.[index]?.text && (
                        <span className="text-red-500 font-normal">
                          {errors?.choices[index]?.text?.message}
                        </span>
                      )}
                    </div>
                  ))}
                  <MyButton
                    color="slate"
                    className="mt-2"
                    onClick={() => {
                      append({ text: "" });
                    }}
                  >
                    Add Choice
                  </MyButton>
                  <ModalFooter>
                    <MyButton color="danger" variant="flat" onPress={onClose}>
                      Close
                    </MyButton>
                    <MyButton type="submit" form="survey-form" color="slate">
                      Create
                    </MyButton>
                  </ModalFooter>
                </form>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
