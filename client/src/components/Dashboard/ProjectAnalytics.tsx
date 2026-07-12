import { useEffect, useState } from "react";
import { Card, CardBody, CardHeader, Chip } from "@nextui-org/react";
import {
  BarChart3,
  MessageSquare,
  CheckCircle,
  ClipboardList,
  Loader2,
  Target,
  Vote,
  Users,
} from "lucide-react";
import apiClient from "../../api/apiClient";
import { useParams, Link } from "react-router-dom";
import { getAnalytics } from "../../api/urls";

const STATUS_ORDER = ["backlog", "todo", "in_progress", "in_review", "done"];

const statusColorMap: Record<string, string> = {
  backlog: "bg-slate-400",
  todo: "bg-sky-500",
  in_progress: "bg-amber-500",
  in_review: "bg-violet-500",
  done: "bg-emerald-500",
};

const statusLabelMap: Record<string, string> = {
  backlog: "Backlog",
  todo: "To Do",
  in_progress: "In Progress",
  in_review: "In Review",
  done: "Done",
};

const CHOICE_BAR_COLORS = [
  "bg-violet-500",
  "bg-sky-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-indigo-500",
];

/** Simple completion ring using conic-gradient — no chart library needed */
const CompletionRing = ({
  rate,
  label = "Done",
  color = "#10b981",
}: {
  rate: number;
  label?: string;
  color?: string;
}) => {
  const clamped = Math.min(Math.max(rate, 0), 100);
  return (
    <div className="relative mx-auto h-36 w-36">
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: `conic-gradient(${color} ${clamped}%, #e5e7eb ${clamped}%)`,
        }}
      />
      <div className="absolute inset-3 rounded-full bg-content1 dark:bg-content1 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold tracking-tight text-foreground">
          {clamped}%
        </span>
        <span className="text-[11px] uppercase tracking-wide text-default-400">
          {label}
        </span>
      </div>
    </div>
  );
};

const ProjectAnalytics = () => {
  const { projectId } = useParams();
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!projectId) return;

    let cancelled = false;
    setLoading(true);

    apiClient
      .get(getAnalytics(projectId))
      .then((res) => {
        if (!cancelled) setAnalytics(res.data);
      })
      .catch((err) => {
        console.error("Failed to fetch analytics", err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [projectId]);

  if (loading) {
    return (
      <div className="space-y-4">
        <h3 className="text-xl font-semibold tracking-tight">Overview</h3>
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-default-400" />
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="space-y-4">
        <h3 className="text-xl font-semibold tracking-tight">Overview</h3>
        <p className="text-sm text-default-400 text-center py-8">
          No analytics data available yet
        </p>
      </div>
    );
  }

  const tasksByStatus = analytics.tasksByStatus || {};
  const messagesByDay = analytics.messagesByDay || {};
  const maxMessages = Math.max(
    ...(Object.values(messagesByDay) as number[]),
    1
  );
  const completionRate =
    analytics.completionRate ??
    (analytics.totalTasks
      ? Math.round((analytics.completedTasks / analytics.totalTasks) * 100)
      : 0);

  const chatBars = Object.entries(messagesByDay)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-14);

  const statusEntries = STATUS_ORDER.filter(
    (s) => tasksByStatus[s] != null
  ).map((s) => [s, tasksByStatus[s]] as [string, number]);

  Object.keys(tasksByStatus).forEach((s) => {
    if (!STATUS_ORDER.includes(s)) {
      statusEntries.push([s, tasksByStatus[s]]);
    }
  });

  const surveyBreakdown = analytics.surveyBreakdown || [];

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between gap-2">
        <div>
          <h3 className="text-xl font-semibold tracking-tight">Overview</h3>
          <p className="text-sm text-default-400 mt-0.5">
            Project health at a glance
          </p>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        <Card shadow="sm" className="border border-default-100">
          <CardBody className="flex flex-row items-center gap-3 py-4">
            <div className="rounded-lg bg-sky-500/10 p-2.5">
              <ClipboardList className="h-5 w-5 text-sky-600" />
            </div>
            <div>
              <p className="text-xs text-default-500">Total Tasks</p>
              <p className="text-2xl font-bold leading-none mt-1">
                {analytics.totalTasks || 0}
              </p>
            </div>
          </CardBody>
        </Card>
        <Card shadow="sm" className="border border-default-100">
          <CardBody className="flex flex-row items-center gap-3 py-4">
            <div className="rounded-lg bg-emerald-500/10 p-2.5">
              <CheckCircle className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-default-500">Completed</p>
              <p className="text-2xl font-bold leading-none mt-1">
                {analytics.completedTasks || 0}
              </p>
            </div>
          </CardBody>
        </Card>
        <Card shadow="sm" className="border border-default-100">
          <CardBody className="flex flex-row items-center gap-3 py-4">
            <div className="rounded-lg bg-orange-500/10 p-2.5">
              <MessageSquare className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-xs text-default-500">Messages</p>
              <p className="text-2xl font-bold leading-none mt-1">
                {analytics.totalMessages || 0}
              </p>
            </div>
          </CardBody>
        </Card>
        <Card shadow="sm" className="border border-default-100">
          <CardBody className="flex flex-row items-center gap-3 py-4">
            <div className="rounded-lg bg-violet-500/10 p-2.5">
              <Vote className="h-5 w-5 text-violet-600" />
            </div>
            <div>
              <p className="text-xs text-default-500">Surveys</p>
              <p className="text-2xl font-bold leading-none mt-1">
                {analytics.totalSurveys || 0}
              </p>
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">
        <Card shadow="sm" className="border border-default-100">
          <CardHeader className="pb-0 flex items-center gap-2">
            <Target className="h-4 w-4 text-emerald-600" />
            <p className="text-sm font-semibold">Completion rate</p>
          </CardHeader>
          <CardBody className="pt-4 pb-5">
            <CompletionRing rate={completionRate} />
            <div className="mt-4 flex justify-center gap-6 text-center">
              <div>
                <p className="text-lg font-semibold text-emerald-600">
                  {analytics.completedTasks || 0}
                </p>
                <p className="text-[11px] text-default-400">Done</p>
              </div>
              <div>
                <p className="text-lg font-semibold text-amber-600">
                  {analytics.openTasks ??
                    Math.max(
                      (analytics.totalTasks || 0) -
                        (analytics.completedTasks || 0),
                      0
                    )}
                </p>
                <p className="text-[11px] text-default-400">Open</p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card shadow="sm" className="border border-default-100 lg:col-span-2">
          <CardHeader className="pb-2">
            <p className="text-sm font-semibold">Tasks by status</p>
          </CardHeader>
          <CardBody className="pt-2 space-y-4">
            {statusEntries.length > 0 ? (
              statusEntries.map(([status, count]) => {
                const total = analytics.totalTasks || 1;
                const percentage = Math.round((count / total) * 100);
                return (
                  <div key={status} className="space-y-1.5">
                    <div className="flex justify-between text-sm">
                      <span className="text-default-600 font-medium">
                        {statusLabelMap[status] || status}
                      </span>
                      <span className="text-default-500 tabular-nums">
                        {count}{" "}
                        <span className="text-default-400 text-xs">
                          ({percentage}%)
                        </span>
                      </span>
                    </div>
                    <div className="w-full bg-default-100 rounded-full h-2.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          statusColorMap[status] || "bg-default-400"
                        }`}
                        style={{ width: `${Math.max(percentage, 2)}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-default-400 text-center py-10">
                No tasks yet — create one to see the breakdown
              </p>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Survey stats section */}
      <Card shadow="sm" className="border border-default-100">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-1">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-violet-600" />
            <p className="text-sm font-semibold">Survey stats</p>
          </div>
          {projectId && (
            <Link
              to={`/projects/${projectId}/surveys`}
              className="text-xs text-violet-600 hover:underline"
            >
              View all surveys
            </Link>
          )}
        </CardHeader>
        <CardBody className="pt-3 space-y-5">
          {/* Survey KPI row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="rounded-lg bg-default-50 dark:bg-default-100/40 px-3 py-3">
              <p className="text-[11px] text-default-400 uppercase tracking-wide">
                Open
              </p>
              <p className="text-xl font-bold mt-0.5">
                {analytics.openSurveys || 0}
              </p>
            </div>
            <div className="rounded-lg bg-default-50 dark:bg-default-100/40 px-3 py-3">
              <p className="text-[11px] text-default-400 uppercase tracking-wide">
                Closed
              </p>
              <p className="text-xl font-bold mt-0.5">
                {analytics.closedSurveys || 0}
              </p>
            </div>
            <div className="rounded-lg bg-default-50 dark:bg-default-100/40 px-3 py-3">
              <p className="text-[11px] text-default-400 uppercase tracking-wide">
                Total responses
              </p>
              <p className="text-xl font-bold mt-0.5">
                {analytics.totalSurveyAnswers || 0}
              </p>
            </div>
            <div className="rounded-lg bg-default-50 dark:bg-default-100/40 px-3 py-3">
              <p className="text-[11px] text-default-400 uppercase tracking-wide">
                Avg / survey
              </p>
              <p className="text-xl font-bold mt-0.5">
                {analytics.avgResponsesPerSurvey || 0}
              </p>
            </div>
          </div>

          <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">
            {/* Overall participation ring */}
            <div className="flex flex-col items-center justify-center rounded-lg border border-default-100 p-4">
              <CompletionRing
                rate={analytics.surveyParticipationRate || 0}
                label="Reach"
                color="#8b5cf6"
              />
              <div className="mt-3 flex items-center gap-1.5 text-xs text-default-400">
                <Users className="h-3.5 w-3.5" />
                {analytics.totalMembers || 0} members · overall reach
              </div>
            </div>

            {/* Per-survey breakdown */}
            <div className="lg:col-span-2 space-y-4">
              {surveyBreakdown.length === 0 ? (
                <p className="text-sm text-default-400 text-center py-10">
                  No surveys yet — create one to see response stats
                </p>
              ) : (
                surveyBreakdown.slice(0, 4).map((survey: any) => {
                  const maxChoice = Math.max(
                    ...(survey.choices || []).map((c: any) => c.count || 0),
                    1
                  );
                  return (
                    <div
                      key={survey._id}
                      className="rounded-lg border border-default-100 p-3 space-y-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <Link
                            to={`/projects/${projectId}/surveys/${survey._id}`}
                            className="text-sm font-semibold text-foreground hover:text-violet-600 truncate block"
                          >
                            {survey.title}
                          </Link>
                          <p className="text-[11px] text-default-400 mt-0.5">
                            {survey.uniqueRespondents} of{" "}
                            {analytics.totalMembers} members ·{" "}
                            {survey.participation}% participation
                          </p>
                        </div>
                        <Chip
                          size="sm"
                          variant="flat"
                          color={survey.open ? "success" : "default"}
                          className="shrink-0"
                        >
                          {survey.open ? "Open" : "Closed"}
                        </Chip>
                      </div>

                      {/* Choice distribution bars */}
                      <div className="space-y-2">
                        {(survey.choices || []).map(
                          (choice: any, idx: number) => {
                            const pct = Math.round(
                              ((choice.count || 0) / maxChoice) * 100
                            );
                            const share =
                              survey.responseCount > 0
                                ? Math.round(
                                    ((choice.count || 0) /
                                      survey.responseCount) *
                                      100
                                  )
                                : 0;
                            return (
                              <div key={idx} className="space-y-1">
                                <div className="flex justify-between text-xs">
                                  <span className="text-default-600 truncate max-w-[70%]">
                                    {choice.text}
                                  </span>
                                  <span className="text-default-400 tabular-nums">
                                    {choice.count} ({share}%)
                                  </span>
                                </div>
                                <div className="w-full bg-default-100 rounded-full h-1.5 overflow-hidden">
                                  <div
                                    className={`h-full rounded-full ${
                                      CHOICE_BAR_COLORS[
                                        idx % CHOICE_BAR_COLORS.length
                                      ]
                                    }`}
                                    style={{
                                      width: `${Math.max(pct, choice.count > 0 ? 4 : 0)}%`,
                                    }}
                                  />
                                </div>
                              </div>
                            );
                          }
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Chat activity */}
      <Card shadow="sm" className="border border-default-100">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 pb-1">
          <p className="text-sm font-semibold">Chat activity (last 14 days)</p>
          <p className="text-xs text-default-400">
            Peak day:{" "}
            <span className="font-medium text-default-600">
              {analytics.mostActiveDay
                ? new Date(analytics.mostActiveDay).toLocaleDateString(
                    "en-US",
                    { weekday: "short", month: "short", day: "numeric" }
                  )
                : "—"}
            </span>
          </p>
        </CardHeader>
        <CardBody className="pt-4 pb-5">
          {chatBars.length > 0 ? (
            <div className="flex items-end gap-1.5 h-40 px-1">
              {chatBars.map(([day, count]) => {
                const heightPct = ((count as number) / maxMessages) * 100;
                return (
                  <div
                    key={day}
                    className="flex-1 flex flex-col items-center justify-end gap-1.5 h-full group"
                    title={`${day}: ${count} messages`}
                  >
                    <span className="text-[10px] text-default-400 opacity-0 group-hover:opacity-100 transition-opacity tabular-nums">
                      {count as number}
                    </span>
                    <div
                      className="w-full max-w-[28px] rounded-t-md bg-gradient-to-t from-orange-500 to-orange-300 dark:from-orange-600 dark:to-orange-400 transition-all"
                      style={{
                        height: `${Math.max(heightPct, 4)}%`,
                      }}
                    />
                    <span className="text-[9px] text-default-400 whitespace-nowrap">
                      {new Date(day).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-default-400 text-center py-10">
              No chat activity yet
            </p>
          )}
        </CardBody>
      </Card>
    </div>
  );
};

export default ProjectAnalytics;
