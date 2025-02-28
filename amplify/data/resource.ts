import { type ClientSchema, a, defineData } from "@aws-amplify/backend";

const schema = a.schema({
  // User Model
  User: a
    .model({
      username: a.string(),
      fName: a.string(),
      lName: a.string(),
      phoneNumber: a.string(),
      email: a.string(),
      password: a.string(),
      address: a.string(),
      dob: a.date(),
      role: a.enum(["PARENT", "CAREGIVER", "CLINICIAN", "ADMIN", "SME"]),
      // Relationship
      kidProfiles: a.hasMany("KidProfile", "userId"), // References KidProfile.userId
    })
    .authorization((allow) => [allow.owner(), allow.publicApiKey()]),

  // Kid Profile
  KidProfile: a
    .model({
      name: a.string(),
      age: a.integer(),
      dob: a.date(),
      // Reference field
      userId: a.id(), // References User's auto-generated id
      // Relationship
      user: a.belongsTo("User", "userId"),
      milestones: a.hasMany("Milestone", "kidProfileId"), // References Milestone.kidProfileId
    })
    .authorization((allow) => [allow.owner()]),

  // Milestone
  Milestone: a
    .model({
      title: a.string(),
      description: a.string(),
      // Reference field
      kidProfileId: a.id(), // References KidProfile's auto-generated id
      // Relationship
      kidProfile: a.belongsTo("KidProfile", "kidProfileId"),
      tasks: a.hasMany("Task", "milestoneId"), // References Task.milestoneId
    })
    .authorization((allow) => [allow.owner(), allow.publicApiKey()]),

  // Task
  Task: a
    .model({
      title: a.string(),
      description: a.string(),
      videoLink: a.string(),
      // Reference field
      milestoneId: a.id(), // References Milestone's auto-generated id
      // Relationship
      milestone: a.belongsTo("Milestone", "milestoneId"),
      feedback: a.hasMany("TaskFeedback", "taskId"), // References TaskFeedback.taskId
    })
    .authorization((allow) => [allow.owner(), allow.publicApiKey()]),

  // Task Feedback
  TaskFeedback: a
    .model({
      rating: a.integer(),
      comment: a.string(),
      // Reference fields
      taskId: a.id(), // References Task's auto-generated id
      userId: a.id(), // References User's auto-generated id
      // Relationships
      task: a.belongsTo("Task", "taskId"),
      user: a.belongsTo("User", "userId"),
    })
    .authorization((allow) => [allow.owner()]),

  // Question Bank
  QuestionBank: a
    .model({
      question_text: a.string(),
      category: a.enum(["COGNITION", "LANGUAGE", "MOTOR", "SOCIAL", "EMOTIONAL"]),
      options: a.string().array(),
    })
    .authorization((allow) => [allow.groups(["ADMIN"]), allow.owner()]),

  // User Responses
  UserResponse: a
    .model({
      answer: a.string(),
      timestamp: a.datetime(),
      // Reference fields
      kidProfileId: a.id(), // References KidProfile's auto-generated id
      questionId: a.id(), // References QuestionBank's auto-generated id
      // Relationships
      kidProfile: a.belongsTo("KidProfile", "kidProfileId"),
      question: a.belongsTo("QuestionBank", "questionId"),
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
