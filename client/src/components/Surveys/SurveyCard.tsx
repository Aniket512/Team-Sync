import React, { useState } from "react";
import {
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Chip,
} from "@nextui-org/react";
import { Loader2 } from "lucide-react";
import { SurveyProps } from "../../utils/types";
import { getUserId } from "../../configs/auth";
import { MyButton } from "../ui/MyButton";
import { Link } from "react-router-dom";
import { getHeaders, getOrUpdateSurvey } from "../../api/urls";
import axios from "axios";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { setSurveys } from "../../redux/slices/surveySlice";
import { toast } from "react-toastify";

export default function SurveyCard({ survey }: { survey: SurveyProps }) {
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  const {surveys} = useAppSelector((state) => state.surveys);
  const dispatch = useAppDispatch();
  const currentUserId = getUserId();

  const handleDeleteSurvey = async () => {
    setIsDeleteLoading(true);
    if(survey._id){
      axios.delete(getOrUpdateSurvey(survey._id), {
        headers: getHeaders()
      }).then((res) => {        
        const updatedSurveys = surveys.filter((sur) => sur._id !== survey._id);
        dispatch(setSurveys(updatedSurveys));
      })
      .catch((err) => {
        console.error(err);
        toast.error(err.message)
      })
    }
    setIsDeleteLoading(false);
  };

  return (
    <Card className="">
      <CardHeader>
        <div className="flex flex-col">
          <h4 className="text-md font-semibold leading-none text-default-700">
            {survey.title}
          </h4>
          <p className="text-small font-normal text-default-500">
            {survey.description ? survey.description : "No description."}
          </p>
        </div>
      </CardHeader>
      <CardBody>
        <div>
          {survey.open ? (
            <Chip className="bg-green-400">Open</Chip>
          ) : (
            <Chip color="danger">Closed</Chip>
          )}
        </div>
      </CardBody>
      <CardFooter className="flex justify-end gap-2">
        {survey.createdBy === currentUserId && (
          <MyButton
            color="danger"
            onClick={handleDeleteSurvey}
            disabled={isDeleteLoading}
          >
            {isDeleteLoading && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Delete
          </MyButton>
        )}
        <Link
          to={`/projects/${survey.projectId}/surveys/${survey._id}`}
          className=""
        >
          <MyButton color="slate">View</MyButton>
        </Link>
      </CardFooter>
    </Card>
  );
}
