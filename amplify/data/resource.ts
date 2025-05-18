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
    role: a.enum(["PARENT", "CAREGIVER", "CLINICIAN", "ADMIN", "SME", "DOCTOR"]),
    kidProfiles: a.hasMany("KidProfile", "parentId"),
    teamMemberships: a.hasMany("TeamMember", "userId"),
    taskFeedbacks: a.hasMany("TaskFeedback", "userId"),
    teamAccessRequests: a.hasMany("TeamAccessRequest", "userId"),
    status: a.enum(["ACTIVE", "PENDING", "INACTIVE"]),
    admin: a.boolean().default(false),
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
    milestoneTasks: a.hasMany("MilestoneTask", "kidProfileId"),
    userResponses: a.hasMany("UserResponse", "kidProfileId"),
    parentConcerns: a.hasMany("ParentConcerns", "kidProfileId"),
    isDummy: a.boolean().required().default(false),
    isAutismDiagnosed: a.boolean().required().default(false),
  })
  .authorization((allow) => [allow.owner(), allow.publicApiKey()]),

  // Team
  Team: a.model({
    id: a.id(),
    name: a.string(),
    kidProfileId: a.id(),
    kidProfile: a.belongsTo("KidProfile", "kidProfileId"),
    members: a.hasMany("TeamMember", "teamId"),
    accessRequests: a.hasMany("TeamAccessRequest", "teamId"),
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
    kidProfileId: a.id().required(),  // Make required since it's a foreign key
    kidProfile: a.belongsTo("KidProfile", "kidProfileId"),
    concernText: a.string().required(),  // Make required since it's the main data
    timestamp: a.datetime().required(),  // Make required for proper ordering
    assessmentId: a.string().required(), // Make required to ensure proper linking
  })
  .authorization((allow) => [allow.owner(), allow.publicApiKey()]),

  // Team Access Request
  TeamAccessRequest: a.model({
    id: a.id(),
    teamId: a.id().required(),
    userId: a.id().required(),
    team: a.belongsTo("Team", "teamId"),
    user: a.belongsTo("User", "userId"),
    status: a.enum(["PENDING", "APPROVED", "REJECTED"]),
    requestedAt: a.datetime().required(),
    respondedAt: a.datetime(),
    message: a.string(), // Optional message from requester
    responseMessage: a.string(), // Optional response message from admin
  })
  .authorization((allow) => [allow.owner(), allow.publicApiKey()]),

  MilestoneTask: a.model({
    id: a.id(),
    kidProfileId: a.string().required(),
    KidProfile: a.belongsTo("KidProfile", "kidProfileId"),
    title: a.string().required(),
    type: a.enum(['MILESTONE', 'TASK']),
    parentId: a.string(),
    developmentalOverview: a.string(),
    parentFriendlyDescription: a.string(),
    strategies: a.string(),
    status: a.enum(['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'ARCHIVED']),
    parentFeedback: a.string(),
    isEffective: a.boolean(),
    feedbackDate: a.datetime(),
    createdAt: a.datetime(),
    updatedAt: a.datetime(),
  })
  .authorization((allow) => [allow.owner(), allow.publicApiKey()]),

  // Contact Form
  ContactForm: a.model({
    id: a.id(),
    name: a.string().required(),
    email: a.string().required(),
    kidConcerns: a.string(),
    feedback: a.string(),
    createdAt: a.datetime().required(),
  })
  .authorization((allow) => [allow.owner(), allow.publicApiKey()]),

  GamePrompt: a.model({
    id: a.id(),
    gameType: a.string().required(),
    promptText: a.string().required(),
    promptOrder: a.integer().required(),
    imageURL: a.string(),
    soundURL: a.string(),
    options: a.string(),
    correctAnswer: a.string(),
  })
  .authorization((allow) => [allow.publicApiKey()]),

  DLMEntry: a.model({
    id: a.id(), // Unique DLM ID (from JSONL or generated)
    title: a.string().required(),
    description: a.string(),
    relationships: a.string(), // JSON or structured string of relationships
    dlmRating: a.float().default(0), // Effectiveness score, updated via review
    feedbackCount: a.integer().default(0), // Number of feedback entries
    lastFeedback: a.string(), // Most recent feedback summary
    reviewedBy: a.id(), // Reference to User (doctor/admin)
    reviewedAt: a.datetime(),
    createdBy: a.id(), // Who created this DLM entry (admin/doctor)
    createdAt: a.datetime().required(),
    updatedAt: a.datetime(),
  })
  .authorization((allow) => [allow.owner(), allow.groups(["ADMIN", "DOCTOR"]), allow.publicApiKey()]),

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
