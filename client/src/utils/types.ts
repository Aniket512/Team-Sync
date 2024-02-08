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