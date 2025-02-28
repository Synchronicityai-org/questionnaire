import { type ClientSchema, a, defineData } from "@aws-amplify/backend";

// == STEP 1: Define Database Schema ==
const schema = a.schema({
  // User Model
  User: a
    .model({
      id: a.id(), // Ensure id exists
      username: a.string(),
      fName: a.string(),
      lName: a.string(),
      phoneNumber: a.string(),
      email: a.string(),
      password: a.string(),
      address: a.string(),
      dob: a.date(),
      role: a.enum(["PARENT", "CAREGIVER", "CLINICIAN", "ADMIN", "SME"]),
      kidProfiles: a.hasMany("KidProfile", "parent"), // Add this line to define the relationship
    })
    .authorization((allow) => [allow.owner(), allow.publicApiKey()]),

  // Kid Profile
  KidProfile: a
    .model({
      id: a.id(),
      name: a.string(),
      age: a.integer(),
      dob: a.date(),
      parent: a.belongsTo("User", "id"), // Ensure "id" exists in User model
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
      kidProfile: a.belongsTo("KidProfile", "id"),
    })
    .authorization((allow) => [allow.owner(), allow.publicApiKey()]),

  // Task
  Task: a
    .model({
      id: a.id(),
      title: a.string(),
      description: a.string(),
      videoLink: a.string(),
      milestone: a.belongsTo("Milestone", "id"),
      feedback: a.hasMany("TaskFeedback", "id"),
    })
    .authorization((allow) => [allow.owner(), allow.publicApiKey()]),

  // Task Feedback
  TaskFeedback: a
    .model({
      id: a.id(),
      task: a.belongsTo("Task", "id"),
      user: a.belongsTo("User", "id"),
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