export type ProjectProps = {
  _id: string,
  name: string,
  description: string,
  isActive: boolean
}

export type ProjectDetails = {
  _id: string,
  name: string,
  description: string,
  isActive: boolean,
  pendingInvites: number,
  createdBy: string,
  members: {
    _id: string,
    isAdmin: Boolean,
    user: {
      _id: string,
      email: string,
      name: string,
      avatar: string,
    }
  }[]
}

export type ProjectListProps = {
  projects: ProjectProps[],
  currentProject: ProjectDetails | null
}

export type TaskCardProps = {
  _id: string,
  name: string,
  status: "backlog" | "todo" | "in_progress" | "in_review" | "done",
  deadline?: string,
  createdBy: {
    name: string
  },
  assignees: {
    _id: string,
    user: {
      _id: string,
      avatar: string,
    }
  }[]
}

export type TaskDetailsProps = {
  _id: string,
  name: string,
  title: string,
  description?: string,
  status: "backlog" | "todo" | "in_progress" | "in_review" | "done",
  deadline?: string,
  createdBy: {
    name: string
  },
  createdAt: Date
  assignees: {
    _id: string,
    user: {
      _id: string,
      avatar: string,
      name: string
    }
  }[],
  comments: TaskComment[]
}

export type TaskComment = {
  _id: string
  text: string
  user: {
    _id: string
    avatar: string
    name: string
  },
  createdAt: Date
}
export type NotificationSchema = {
  _id: string,
  projectId: string,
  contentId?: string,
  type: string,
  title: string,
  description?: string
}

export type InvitationSchema = {
  _id: string,
  projectId: {
    name: string
  },
  status: string,
}

export type SidebarProps = {
  open: Boolean,
  setOpen: (value: boolean) => void;
}

export type InputProject = {
  name: string,
  description: string
}

export type SurveyInput = {
  description?: string
  title: string
  choices: { text: string }[]
};

export type SurveyProps = {
  projectId?: string
  createdBy?: string
  description?: string
  _id?: string
  open?: boolean
  title: string
  choices: SurveyChoiceProps[]
};

export type SurveyChoiceProps = {
  _id: string
  text: string
}

export type SurveyAnswers = {
  choiceId: string,
  userId: string
}

export type MessageSegment = {
  type: "text" | "mention" | "task"
  value: string
  userId?: {
    _id: string
    name: string
    email?: string
    avatar?: string
  } | null
  taskId?: {
    _id: string
    name: string
    status: string
    description?: string
  } | null
}

export type Message = {
  _id: string
  fromSelf: Boolean
  message: string
  createdAt: Date
  sender: {
    _id: string
    name: string
    avatar?: string
  }
  segments?: MessageSegment[]
}

// ============== API CLIENT TYPES ==============
export interface ApiErrorResponse {
  status: number;
  code?: string;
  message: string;
  error?: string;
}

export interface AxiosErrorConfig {
  url?: string;
  method?: string;
  baseURL?: string;
  headers?: Record<string, string>;
}

// ============== REDUX STATE TYPES ==============
export interface UserProfile {
  _id: string;
  name: string;
  email: string;
  image?: string;
  access_token: string;
}

export interface SocketMessage {
  _id: string;
  fromSelf: boolean;
  message: string;
  sender: UserProfile;
  createdAt: string;
}

// ============== COMPONENT CALLBACK TYPES ==============
export type OnTaskUpdate = (task: any, notification?: any) => void;
export type OnSurveySubmit = (surveyId: string, answers: Record<string, any>) => void;
export type OnMessageSend = (message: SocketMessage) => void;
export type OnNotification = (notification: NotificationSchema) => void;
export type OnProjectCreate = (project: ProjectProps) => void;

// ============== FORM TYPES ==============
export interface TaskFormData {
  name: string;
  description: string;
  deadline?: string;
  projectId: string;
  assignees: string[];
}

export interface ProjectFormData {
  name: string;
  description: string;
  projectType?: string;
}

export interface SurveyFormData {
  name: string;
  description: string;
  questions: Array<{
    question: string;
    type: "text" | "radio" | "checkbox" | "rating";
    options?: string[];
  }>;
  projectId: string;
}

export interface InvitationFormData {
  email: string;
  projectId: string;
  role?: "admin" | "member";
}

// ============== API RESPONSE TYPES ==============
export interface ApiResponse<T> {
  status: number;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

// ============== CHAT TYPES ==============
export interface TypingUser {
  userId: string;
  name: string;
  projectId: string;
  isTyping: boolean;
}

// ============== ANALYTICS TYPES ==============
export interface ProjectAnalytics {
  tasksCompletedOverTime: { date: string; count: number }[];
  surveyParticipationRate: number;
  mostActiveChatDay: string;
  totalTasks: number;
  completedTasks: number;
  totalSurveys: number;
  totalMessages: number;
}