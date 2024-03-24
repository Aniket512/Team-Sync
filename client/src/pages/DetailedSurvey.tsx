import React, { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { SurveyAnswers, SurveyProps } from "../utils/types";
import { useParams } from "react-router-dom";
import { getUserId } from "../configs/auth";
import { Button, Chip } from "@nextui-org/react";
import axios from "axios";
import {
  BASE_URL,
  getHeaders,
  getOrSubmitSurveyAnswers,
  getOrUpdateSurvey,
} from "../api/urls";
import { toast } from "react-toastify";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { setSurveys } from "../redux/slices/surveySlice";
import { io } from "socket.io-client";

export const DetailedSurvey = () => {
  const [survey, setSurvey] = useState<SurveyProps | null>(null);
  const { surveyId } = useParams();
  const { projectId } = useParams();
  const { surveys } = useAppSelector((state) => state.surveys);
  const currentUserId = getUserId();
  const [answers, setAnswers] = useState<SurveyAnswers[]>([]);
  const [userAnswer, setUserAnswer] = useState<SurveyAnswers | null>(null);
  const dispatch = useAppDispatch();
  const userId = getUserId();
  const socket = io(BASE_URL);

  useEffect(() => {
    if (projectId) {
      socket.emit("add-user", userId, projectId);
    }
  }, [userId, projectId]);

  useEffect(() => {
    (async () => {
      if (surveyId) {
        axios
          .get(getOrUpdateSurvey(surveyId), {
            headers: getHeaders(),
          })
          .then((res) => {
            setSurvey(res?.data);
          })
          .catch((err) => {
            console.error(err);
            toast.error(err.response.data.message);
          });

        axios
          .get(getOrSubmitSurveyAnswers(surveyId), {
            headers: getHeaders(),
          })
          .then((res) => {
            const userAnswer = answers?.find(
              (ans) => ans.userId === currentUserId
            );
            setAnswers(res?.data);
            setUserAnswer(userAnswer ?? null);
          })
          .catch((err) => {
            console.error(err);
            toast.error(err.response.data.message);
          });
      }
    })();
  }, [surveyId]);

  const handleChoose = async (choiceId: string) => {
    if (!surveyId) {
      return;
    }
    const body = {
      choiceId,
    };
    axios
      .post(getOrSubmitSurveyAnswers(surveyId), body, {
        headers: getHeaders(),
      })
      .then((res) => {
        setUserAnswer(res?.data);
        setAnswers((prevAnswers) => {
          const existingAnswerIndex = prevAnswers.findIndex(
            (ans) => ans.userId === res?.data.userId
          );

          if (existingAnswerIndex !== -1) {
            prevAnswers[existingAnswerIndex] = res?.data;
          } else {
            prevAnswers.push(res?.data);
          }
          return [...prevAnswers];
        });

        socket.emit("answer-survey", { ...res?.data, projectId });
      })
      .catch((err) => {
        console.error(err);
        toast.error(err.message);
      });
  };

  const handleCloseSurvey = async () => {
    if (surveyId) {
      axios
        .patch(
          getOrUpdateSurvey(surveyId),
          {},
          {
            headers: getHeaders(),
          }
        )
        .then((res) => {
          setSurvey(res?.data);
          const updatedSurveys = surveys.map((survey) => {
            if (survey._id === surveyId) {
              return { ...survey, status: "closed" };
            }
            return survey;
          });
          dispatch(setSurveys(updatedSurveys));
        })
        .catch((err) => {
          console.error(err);
          toast.error(err.message);
        });
    }
  };

  const choiceDistribution: { [id: string]: number } = useMemo(() => {
    if (survey && answers.length > 0) {
      return survey.choices.reduce<{ [id: string]: number }>((obj, choice) => {
        obj[choice._id] =
          (answers.filter((ans) => ans.choiceId === choice._id).length /
            answers.length) *
          100;

        return obj;
      }, {});
    }

    return {};
  }, [survey, answers]);

  socket?.on("survey-answer-receive", (data: SurveyAnswers) => {
    if (data.userId !== getUserId()) {
      setAnswers((prevAnswers) => {
        const existingAnswerIndex = prevAnswers.findIndex(
          (ans) => ans.userId === data.userId
        );

        if (existingAnswerIndex !== -1) {
          prevAnswers[existingAnswerIndex] = data;
        } else {
          prevAnswers.push(data);
        }
        return [...prevAnswers];
      });
    }
  });

  return (
    <div className="p-4 h-[calc(100vh-4.5rem)] flex flex-col overflow-y-auto">
      {survey ? (
        <div className="space-y-6">
          <div>
            <p className="text-sm font-medium">Survey</p>
            <div className="flex justify-between">
              <h2 className="text-3xl font-bold tracking-tight">
                {survey.title}
              </h2>
              {survey.open ? (
                <Chip className="bg-green-400 hover:bg-green-400">Open</Chip>
              ) : (
                <Chip color="danger">Closed</Chip>
              )}
            </div>
          </div>
          <div className="space-y-2">
            {survey.choices.map((choice) => (
              <button
                onClick={() => handleChoose(choice._id)}
                key={choice._id}
                disabled={!survey.open}
                className={`block w-full relative overflow-hidden border border-border rounded-md hover:border-primary transition-all duration-200 ${
                  userAnswer?.choiceId === choice._id ? "ring rign-ring" : ""
                }`}
              >
                <div
                  className="absolute inset-y-0 bg-default"
                  style={{
                    width: `${choiceDistribution[choice._id]}%`,
                  }}
                ></div>
                <div className="relative p-2 flex justify-between">
                  <div>{choice.text}</div>
                  <div>{choiceDistribution[choice._id]}%</div>
                </div>
              </button>
            ))}
          </div>
          <div className="text-sm text-muted-foreground flex justify-end">
            {answers.length} answered
          </div>
          <div>
            {survey.description
              ? survey.description
              : "No description for this survey."}
          </div>
          {survey.open && survey.createdBy === currentUserId && (
            <div className="flex justify-end">
              <Button color="danger" onClick={() => handleCloseSurvey()}>
                Close Survey
              </Button>
            </div>
          )}
          {!survey.open && (
            <div className="">
              <hr className="my-8" />
              <div className="text-xl font-semibold">Survey is closed.</div>
            </div>
          )}
        </div>
      ) : (
        <div className="grow flex items-center justify-center">
          <Loader2 className="w-16 h-16 animate-spin" />
        </div>
      )}
    </div>
  );
};
