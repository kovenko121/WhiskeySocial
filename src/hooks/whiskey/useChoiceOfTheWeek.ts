import { getS3Image } from '@helpers';
import { amplify } from '@services';
import { Whiskey } from '@types';
import { useQuery } from '@tanstack/react-query';
import { ChoiceOfTheWeek } from './query/getChoiceOfTheWeek';

function useChoiceOfTheWeek() {
  return useQuery({
    queryKey: ['get-choice-of-the-week'],
    queryFn: async () => {
      const { searchWhiskeys } = await amplify.request<{
        searchWhiskeys: {
          items: Whiskey[];
        };
      }>(ChoiceOfTheWeek);
      const whiskey = searchWhiskeys.items[0];
      if (!whiskey) return null;

      if (whiskey.brandUser?.brandLogo) {
        whiskey.brandUser.brandLogo = await getS3Image(whiskey.brandUser.brandLogo);
      }
      if (whiskey.picture) {
        whiskey.picture = await getS3Image(whiskey.picture);
      }

      return whiskey;
    },
  });
}

export { useChoiceOfTheWeek };
