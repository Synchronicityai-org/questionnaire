import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../amplify/data/resource';

async function cleanup() {
  try {
    const client = generateClient<Schema>();
    const userId = '313b9530-80b1-70a7-75b0-2271a2e30839';
    
    console.log('Starting cleanup...');

    // 1. Delete the team access request
    const requestId = '8f3b0b4a-df59-46da-9e6d-fb2acf9c558b';
    await client.models.TeamAccessRequest.delete({
      id: requestId
    });
    console.log('Deleted team access request:', requestId);

    // 2. Find and delete any team memberships
    const teamMembersResponse = await client.models.TeamMember.list({
      filter: { userId: { eq: userId } }
    });

    if (teamMembersResponse.data) {
      await Promise.all(
        teamMembersResponse.data.map(member =>
          client.models.TeamMember.delete({
            id: member.id
          })
        )
      );
      console.log('Deleted team memberships:', teamMembersResponse.data.length);
    }

    // 3. Finally delete the user
    await client.models.User.delete({
      id: userId
    });
    console.log('Deleted user:', userId);

    console.log('Cleanup completed successfully');
  } catch (err) {
    console.error('Error during cleanup:', err);
  }
}

cleanup(); 