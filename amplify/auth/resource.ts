import { defineAuth } from '@aws-amplify/backend';

/**
 * Define and configure your auth resource
 * @see https://docs.amplify.aws/gen2/build-a-backend/auth
 */
export const auth = defineAuth({
  loginWith: {
    email: {
      // Configure password requirements
      validation: {
        minLength: 8,
        containsLower: true,
        containsUpper: true,
        containsNumbers: true,
        containsSpecial: true
      }
    }
  },
  userAttributes: {
    // Custom attributes for user role and profile type
    'custom:profileType': {
      dataType: 'String',
      mutable: true
    },
    'custom:role': {
      dataType: 'String',
      mutable: true
    },
    // Standard required attributes
    email: {
      mutable: true
    },
    givenName: {
      mutable: true
    },
    familyName: {
      mutable: true
    },
    phoneNumber: {
      mutable: true
    }
  },
  // Enable MFA if needed
  multifactor: {
    mode: 'OFF' // Change to 'OPTIONAL' or 'REQUIRED' if you want MFA
  }
});
