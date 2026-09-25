import { HorizontalCard, SectionTitle, Text, Title } from '@components';
import { AwardsFlatList, TextSection } from './styles';

export const Awards = ({ data }: any) => (
    <>
      <Title mt={20}  size={18} align="left">Awards</Title>
      <AwardsFlatList
        data={data}
        horizontal
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }: any) => (
          <HorizontalCard image={item.picture}>
            <TextSection>
              <SectionTitle bold size={15} align="left">
                {item.title}
              </SectionTitle>
              <Text mv={8}>{item.year}</Text>
            </TextSection>
          </HorizontalCard>
        )}
      />
    </>
  );
