import { Header, Link } from '@components';
import { useNavigation } from '@react-navigation/native';
import type { NavigationProps, RootStackParams } from '@types';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import ConversationList from '../../components/ConversationList/ConversationList';
import MessageRequestList from '../../components/MessageRequestList/MessageRequestList';
import {
  ActiveIndicator,
  ContentContainer,
  ScreenContainer,
  TabContainer,
  TabsContainer,
} from './styles';

type Props = NativeStackScreenProps<RootStackParams, 'Messages'>;

export const MessagesScreen = ({ route }: Props) => {
  const navigation = useNavigation<NavigationProps>();
  const initialTab = route.params?.initialTab ?? 'Chats';
  const [activeTab, setActiveTab] = useState<string>(initialTab);

  return (
    <ScreenContainer>
      <ContentContainer>
        <Header
          title="Messages"
          navBack={() => navigation.goBack()}
          actionText=""
        />
        <TabsContainer>
          <TabContainer>
            <Link
              onPress={async () => setActiveTab('Chats')}
              color="white"
              bold
            >
              Chats
            </Link>
            {activeTab === 'Chats' && <ActiveIndicator />}
          </TabContainer>
          <TabContainer>
            <Link
              onPress={async () => setActiveTab('Requests')}
              color="white"
              bold
            >
              Requests
            </Link>
            {activeTab === 'Requests' && <ActiveIndicator />}
          </TabContainer>
        </TabsContainer>

        {activeTab === 'Chats' && <ConversationList />}

        {activeTab === 'Requests' && <MessageRequestList />}
      </ContentContainer>
    </ScreenContainer>
  );
};
