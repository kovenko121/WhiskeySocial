import { useNavigation } from '@react-navigation/native';
import { amplify } from '@services';
import { NavigationProps, ReportContentType, Suggestion } from '@types';
import { useMutation } from '@tanstack/react-query';
import { CreateReport } from './mutation/createReport';

const useCreateReport = (nextPage: any) => {
  const navigation = useNavigation<NavigationProps>();

  return useMutation<
    Suggestion,
    unknown,
    {
      contentId: string;
      contentType: ReportContentType;
      reason: string;
      reportedUserId: string;
      description?: string;
    }
  >({
    mutationFn: async (data) => {
      const { createReport } = await amplify.request<{
        createReport: Suggestion;
      }>(CreateReport, {
        ...data,
      });

      return createReport;
    },
    onSuccess() {
      return navigation.navigate(
        nextPage.page,
        nextPage.id && { id: nextPage.id }
      );
    },
  });
};

export { useCreateReport };
