import { type ClientSchema, a, defineData } from "@aws-amplify/backend";

const schema = a.schema({

  Todo: a.model({
   content: a.string(),
  })
  .authorization((allow) => [allow.owner(), allow.publicApiKey()]),

  // User Model
  User: a.model({ 
    id: a.id(), // Auto-generated ID by Amplify
    username: a.string(),
    fName: a.string(),
    mName: a.string(),
    lName: a.string(),
    phoneNumber: a.string(),
    email: a.string(),
    password: a.string(),
    address: a.string(),
    dob: a.date(),
    role: a.enum(["PARENT", "CAREGIVER", "CLINICIAN", "ADMIN", "SME"]),
    kidProfiles: a.hasMany("KidProfile", "parentId"),
    teamMemberships: a.hasMany("TeamMember", "userId"),
    taskFeedbacks: a.hasMany("TaskFeedback", "userId"),
    status: a.enum(["ACTIVE", "PENDING", "INACTIVE"]),
  })
  .authorization((allow) => [allow.owner(), allow.publicApiKey()]),

  // Kid Profile
  KidProfile: a.model({
    id: a.id(),
    name: a.string(),
    age: a.integer(),
    dob: a.date(),
    parentId: a.id(), // Reference to User.id
    parent: a.belongsTo("User", "parentId"),
    team: a.hasOne("Team", "kidProfileId"),
    milestones: a.hasMany("Milestone", "kidProfileId"),
    userResponses: a.hasMany("UserResponse", "kidProfileId"),
    isDummy: a.boolean().required().default(false),
  })
  .authorization((allow) => [allow.owner(), allow.publicApiKey()]),

  // Team
  Team: a.model({
    id: a.id(),
    name: a.string(),
    kidProfileId: a.id(),
    kidProfile: a.belongsTo("KidProfile", "kidProfileId"),
    members: a.hasMany("TeamMember", "teamId"),
    adminId: a.id(), // Reference to the team admin (usually the parent)
  })
  .authorization((allow) => [allow.owner(), allow.publicApiKey()]),

  // Team Member
  TeamMember: a.model({
    id: a.id(),
    teamId: a.id(),
    userId: a.id(),
    team: a.belongsTo("Team", "teamId"),
    user: a.belongsTo("User", "userId"),
    role: a.enum(["ADMIN", "MEMBER"]),
    status: a.enum(["ACTIVE", "PENDING", "INACTIVE"]),
    invitedBy: a.string(), // Email of the person who sent the invite
    invitedAt: a.datetime(),
    joinedAt: a.datetime(),
  })
  .authorization((allow) => [allow.owner(), allow.publicApiKey()]),

  // Team Invitation
  TeamInvitation: a.model({
    id: a.id(),
    teamId: a.id(),
    email: a.string(),
    role: a.enum(["MEMBER"]),
    status: a.enum(["PENDING", "ACCEPTED", "DECLINED", "EXPIRED"]),
    expiresAt: a.datetime(),
    token: a.string(),
  })
  .authorization((allow) => [allow.owner(), allow.publicApiKey()]),

  // Milestone
  Milestone: a.model({
    id: a.id(),
    title: a.string(),
    description: a.string(),
    kidProfileId: a.id(), // Reference to KidProfile
    kidProfile: a.belongsTo("KidProfile", "kidProfileId"),
    tasks: a.hasMany("Task", "milestoneId"),
  })
  .authorization((allow) => [allow.owner(), allow.publicApiKey()]),

  // Task
  Task: a.model({
    id: a.id(),
    title: a.string(),
    description: a.string(),
    videoLink: a.string(),
    milestoneId: a.id(), // Reference to Milestone
    milestone: a.belongsTo("Milestone", "milestoneId"),
    feedback: a.hasMany("TaskFeedback", "taskId"),
  })
  .authorization((allow) => [allow.owner(), allow.publicApiKey()]),

  // Task Feedback
  TaskFeedback: a.model({
    id: a.id(),
    taskId: a.id(), // Reference to Task
    userId: a.id(), // Reference to User
    task: a.belongsTo("Task", "taskId"),
    user: a.belongsTo("User", "userId"),
    rating: a.integer(),
    comment: a.string(),
  })
  .authorization((allow) => [allow.owner(), allow.publicApiKey()]),

  // ✅ Fix: Allowed Public API access to create questions
  QuestionBank: a.model({
    id: a.id(),
    question_text: a.string(),
    category: a.enum(["COGNITION", "LANGUAGE", "MOTOR", "SOCIAL", "EMOTIONAL"]),
    options: a.string().array(),
    userResponses: a.hasMany("UserResponse", "questionId"),
  })
  .authorization((allow) => [allow.groups(["ADMIN"]), allow.owner(), allow.publicApiKey()]),

  // User Responses
  UserResponse: a.model({
    id: a.id(),
    kidProfileId: a.id(), // Reference to KidProfile
    questionId: a.id(), // Reference to QuestionBank
    kidProfile: a.belongsTo("KidProfile", "kidProfileId"),
    question: a.belongsTo("QuestionBank", "questionId"),
    answer: a.string(),
    timestamp: a.datetime(),
  })
  .authorization((allow) => [allow.owner(), allow.publicApiKey()]),

  // Parent Concerns
  ParentConcerns: a.model({
    id: a.id(),
    kidProfileId: a.id(),
    kidProfile: a.belongsTo("KidProfile", "kidProfileId"),
    concernText: a.string(),
    timestamp: a.datetime(),
    assessmentId: a.string(), // To link with the questionnaire responses
  })
  .authorization((allow) => [allow.owner(), allow.publicApiKey()]),
});

// == STEP 2: Define Authorization Modes ==
export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "apiKey",
    apiKeyAuthorizationMode: {
      expiresInDays: 30,
    },
    oidcAuthorizationMode: {
      oidcProviderName: "MyOIDCProvider",
      oidcIssuerUrl: "https://example.com",
      tokenExpiryFromAuthInSeconds: 3600,
      tokenExpireFromIssueInSeconds: 7200,
    },
  },
});
