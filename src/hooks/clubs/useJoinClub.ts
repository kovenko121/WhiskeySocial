import { useAuth } from '@contexts';
import { amplify, queryClient } from '@services';
import { ClubMember, ClubRole, MemberStatus } from '@types';
import { useMutation } from '@tanstack/react-query';
import { gql } from 'graphql-request';

const CreateClubMember = gql`
  mutation CreateClubMember($input: CreateClubMemberInput!) {
    createClubMember(input: $input) {
      id
      clubId
      userId
      role
      status
      joinedAt
      requestedAt
      createdAt
      updatedAt
      __typename
    }
  }
`;

function useJoinClub() {
  const {
    user: { sub },
  } = useAuth();

  return useMutation({
    mutationFn: async ({ clubId }: { clubId: string }) => {
      const now = new Date().toISOString();

      const { createClubMember } = await amplify.request<{
        createClubMember: ClubMember;
      }>(CreateClubMember, {
        input: {
          clubId,
          userId: sub,
          role: ClubRole.CLUBMEMBERROLE,
          status: MemberStatus.ACTIVE,
          joinedAt: now,
          requestedAt: now,
        },
      });

      return createClubMember;
    },
    onMutate: async (variables) => {
      // Cancel any outgoing refetches to prevent race conditions
      await queryClient.cancelQueries({ queryKey: ['club', variables.clubId] });
      await queryClient.cancelQueries({ queryKey: ['search-clubs'] });
      await queryClient.cancelQueries({ queryKey: ['clubs', 'list'] });

      // Snapshot the previous values
      const previousClub = queryClient.getQueryData(['club', variables.clubId]);
      const previousSearchClubs = queryClient.getQueriesData({ queryKey: ['search-clubs'] });
      const previousClubsList = queryClient.getQueriesData({ queryKey: ['clubs', 'list'] });

      // Optimistically update member count in individual club cache
      queryClient.setQueryData(['club', variables.clubId], (oldData: any) => {
        if (oldData) {
          return {
            ...oldData,
            memberCount: (oldData.memberCount || 0) + 1,
          };
        }
        return oldData;
      });

      // Optimistically update member count in search results cache
      queryClient.setQueriesData(
        { queryKey: ['search-clubs'] },
        (oldData: any) => {
          if (oldData?.pages) {
            return {
              ...oldData,
              pages: oldData.pages.map((page: any) => ({
                ...page,
                items: page.items.map((club: any) =>
                  club.id === variables.clubId
                    ? { ...club, memberCount: (club.memberCount || 0) + 1 }
                    : club
                ),
              })),
            };
          }
          return oldData;
        }
      );

      // Optimistically update member count in clubs list cache
      queryClient.setQueriesData(
        { queryKey: ['clubs', 'list'] },
        (oldData: any) => {
          if (oldData?.clubs) {
            return {
              ...oldData,
              clubs: oldData.clubs.map((club: any) =>
                club.id === variables.clubId
                  ? { ...club, memberCount: (club.memberCount || 0) + 1 }
                  : club
              ),
            };
          }
          return oldData;
        }
      );

      // Return snapshots for potential rollback
      return { previousClub, previousSearchClubs, previousClubsList };
    },
    onError: (_err, variables, context) => {
      // Rollback to previous values on error
      if (context?.previousClub) {
        queryClient.setQueryData(['club', variables.clubId], context.previousClub);
      }
      if (context?.previousSearchClubs) {
        context.previousSearchClubs.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      if (context?.previousClubsList) {
        context.previousClubsList.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSuccess: (_data, variables) => {
      // Invalidate membership status and club data to refetch real counts from Lambda
      queryClient.invalidateQueries({
        queryKey: ['club-membership', variables.clubId, sub],
      });
      queryClient.invalidateQueries({
        queryKey: ['club', variables.clubId],
      });
      queryClient.invalidateQueries({ queryKey: ['search-clubs'] });
      queryClient.invalidateQueries({ queryKey: ['clubs', 'list'] });
      // Invalidate user's club list so Home feed includes posts from new club
      queryClient.invalidateQueries({ queryKey: ['user-clubs', sub] });
    },
  });
}

export { useJoinClub };
