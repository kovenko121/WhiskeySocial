import { Button, Divider, Header, Text } from '@components';
import { useBlockUnblockUser, useCreateReport } from '@hooks';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParams } from '@types';
import {
  BottomButtonWrapper,
  ContentContainer,
  InfoContainer,
  InfoWrapper,
  ScreenContainer,
  SectionTitleWrapper,
  TextWrapper,
} from './styles';

type Props = NativeStackScreenProps<RootStackParams, 'ReportConfirmation'>;

export const ReportConfirmationScreen = ({ navigation, route }: Props) => {
  const {
    contentId,
    contentType,
    reportedUserId,
    from,
    reason,
    description,
    ownerName,
  } = route.params;
  const { mutate: createReport } = useCreateReport(from);
  const { mutate: blockUnblockUser } = useBlockUnblockUser();

  const handleSendReport = () => {
    createReport({
      contentId,
      contentType,
      reportedUserId,
      reason,
      description,
    });
  };

  const handleSendReportAndBlock = () => {
    handleSendReport();
    blockUnblockUser({ id: reportedUserId });
  };

  const handleCancelReport = () => {
    if (from.id) return navigation.navigate(from.page, { id: from.id });
    return navigation.navigate(from.page as never);
  };

  return (
    <ScreenContainer>
      <Header title="Report" />
      <ContentContainer>
        <Text size={12} align="center">
          Review the following info and confirm the report if it's correct. You
          can choose to block the user immediately or send the report only and
          return to the app.
        </Text>

        <InfoContainer>
          <InfoWrapper>
            <SectionTitleWrapper>
              <Text size={13} bold>
                User
              </Text>
            </SectionTitleWrapper>
            <TextWrapper>
              <Text size={13}>{ownerName}</Text>
            </TextWrapper>
          </InfoWrapper>
          <Divider />
          <InfoWrapper>
            <SectionTitleWrapper>
              <Text size={13} bold>
                Category
              </Text>
            </SectionTitleWrapper>
            <TextWrapper>
              <Text size={13}>{reason}</Text>
            </TextWrapper>
          </InfoWrapper>
          <Divider />
          {description && (
            <InfoWrapper>
              <SectionTitleWrapper>
                <Text size={13} bold>
                  Reason
                </Text>
              </SectionTitleWrapper>
              <TextWrapper>
                <Text size={13}>{description}</Text>
              </TextWrapper>
            </InfoWrapper>
          )}
        </InfoContainer>
      </ContentContainer>
      <BottomButtonWrapper>
        <Button
          label="Cancel Report"
          onPress={handleCancelReport}
          variant="outlineDefault"
          full
        />

        <Button
          label="Send Report and Block User"
          onPress={handleSendReportAndBlock}
          variant="outlineDefault"
          full
        />

        <Button
          label="Send Report and Return"
          onPress={handleSendReport}
          full
        />
      </BottomButtonWrapper>
    </ScreenContainer>
  );
};
