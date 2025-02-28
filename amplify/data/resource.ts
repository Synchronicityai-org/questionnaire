import { type ClientSchema, a, defineData } from "@aws-amplify/backend";

// == STEP 1: Define Database Schema ==
const schema = a.schema({
  // User Model
  User: a.model({
    id: a.id(),
    username: a.string(),
      fName: a.string(),
      lName: a.string(),
      phoneNumber: a.string(),
      email: a.string(),
      password: a.string(),
      address: a.string(),
      dob: a.date(),
      role: a.enum(["PARENT", "CAREGIVER", "CLINICIAN", "ADMIN", "SME"]),
    })
    .authorization((allow) => [allow.owner(), allow.publicApiKey()]),

  // Kid Profile
  KidProfile: a
    .model({
      id: a.id(),
    name: a.string(),
      age: a.integer(),
      dob: a.date(),
      parentId: a.id(), // Reference to User
    parent: a.belongsTo("User", "parentId"),
      milestones: a.hasMany("Milestone", "id"),
    })
    .authorization((allow) => [allow.owner()]),

  // Milestone
  Milestone: a
    .model({
      id: a.id(),
    title: a.string(),
      description: a.string(),
      tasks: a.hasMany("Task", "id"),
      kidProfileId: a.id(), // Reference to KidProfile
    kidProfile: a.belongsTo("KidProfile", "kidProfileId"),
    })
    .authorization((allow) => [allow.owner(), allow.publicApiKey()]),

  // Task
  Task: a
    .model({
      id: a.id(),
    title: a.string(),
      description: a.string(),
      videoLink: a.string(),
      milestoneId: a.id(), // Reference to Milestone
    milestone: a.belongsTo("Milestone", "milestoneId"),
      feedback: a.hasMany("TaskFeedback", "id"),
    })
    .authorization((allow) => [allow.owner(), allow.publicApiKey()]),

  // Task Feedback
  TaskFeedback: a.model({
    userId: a.id(), // Reference field to User
    taskId: a.id(), // Reference field to Task
    task: a.belongsTo("Task", "taskId"), // Corrected
    user: a.belongsTo("User", "userId"), // Corrected
    rating: a.integer(),
    comment: a.string(),
})
.authorization((allow) => [allow.owner()]),


  // Question Bank
  QuestionBank: a
    .model({
      id: a.id(),
      question_text: a.string(),
      category: a.enum(["COGNITION", "LANGUAGE", "MOTOR", "SOCIAL", "EMOTIONAL"]),
      options: a.string().array(),
    })
    .authorization((allow) => [allow.groups(["ADMIN"]), allow.owner()]),

  // User Responses
  UserResponse: a
    .model({
      id: a.id(),
      kidProfile: a.belongsTo("KidProfile", "id"),
      question: a.belongsTo("QuestionBank", "id"),
      answer: a.string(),
      timestamp: a.datetime(),
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
