import { defineAuth } from '@aws-amplify/backend';

/**
 * Define and configure your auth resource
 * @see https://docs.amplify.aws/gen2/build-a-backend/auth
 */
export const auth = defineAuth({
  loginWith: {
    email: true
  },
  userAttributes: {
    'custom:profileType': {
      dataType: 'String',
      mutable: true
    },
    'custom:role': {
      dataType: 'String',
      mutable: true
    },
    email: {
      required: true,
      mutable: true
    },
    givenName: {
      required: true,
      mutable: true
    },
    familyName: {
      required: true,
      mutable: true
    },
    phoneNumber: {
      required: false,
      mutable: true
    }
  },
  multifactor: {
    mode: 'OFF'
  }
});
