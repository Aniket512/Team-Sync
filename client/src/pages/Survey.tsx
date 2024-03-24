import { useEffect } from "react";
import SurveyCard from "../components/Surveys/SurveyCard";
import CreateSurvey from "../components/Surveys/CreateSurvey";
import axios from "axios";
import { getHeaders, getSurveys } from "../api/urls";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { setSurveys } from "../redux/slices/surveySlice";
import { useParams } from "react-router-dom";

export default function Survey() {
  const { surveys } = useAppSelector((state) => state.surveys);
  const dispatch = useAppDispatch();
  const { projectId } = useParams();

  useEffect(() => {
    if (!projectId) {
      return;
    }
    axios
      .get(getSurveys(projectId), {
        headers: getHeaders(),
      })
      .then((res) => {
        dispatch(setSurveys(res?.data));
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);

  return (
    <div className="h-[calc(100vh-4.5rem)] flex flex-col p-4">
      <div className="space-y-6">
        <div className="flex justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Surveys</h2>
          <CreateSurvey />
        </div>
        {surveys.length > 0 ? (
          <div className="grid grid-cols-12 gap-2">
            {surveys.map((survey) => (
              <div key={survey._id} className="col-span-12 lg:col-span-6">
                <SurveyCard survey={survey} />
              </div>
            ))}
          </div>
        ) : (
          <div>
            The team hasn&apos;t conducted any surveys. Start the first one!
          </div>
        )}
      </div>
    </div>
  );
}
