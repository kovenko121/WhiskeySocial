import { getTestId } from '@helpers';
import { Icon } from '../../Icon/Icon';
import { Tag } from '../Tags';
import {
  AllFormattedTagButton,
  Empty,
  SearchButton,
  SelectFormattedTagsContainer,
  SelectFormattedTagsList,
  FormattedTagButton,
} from './styles';

export const FormattedTagFilter = ({
  formattedTags,
  selectedTags,
  setSelectedTags,
  mv = 0,
  ml = 24,
  isFavorite,
  setIsFavorite,
  search,
}: {
  formattedTags: {value: string, name: string}[];
  selectedTags: string[];
  setSelectedTags: (tags: string[]) => void;
  mv?: number;
  ml?: number;
  isFavorite?: boolean;
  setIsFavorite?: (value: boolean) => void;
  search?: () => void;
}) => {
  const onTagPress = (tagValue: string) => {
    if (selectedTags.includes(tagValue)) {
      setSelectedTags(selectedTags.filter((t) => t !== tagValue));
    } else {
      setSelectedTags([tagValue]);
    }
  };

  const onFavoritePress = () => {
    if (setIsFavorite) {
      setIsFavorite(!isFavorite);
    }
  };

  return (
    <SelectFormattedTagsContainer mv={mv} ml={ml}>
      {search && (
        <SearchButton onPress={search}>
          <Icon name="search" size={23} color="primary600" />
        </SearchButton>
      )}
      <AllFormattedTagButton
        testID={getTestId('all')}
        onPress={() => {
          setSelectedTags([]);
          if (setIsFavorite) setIsFavorite(false);
        }}
      >
        <Tag text="All" selected={!selectedTags.length && !isFavorite} />
      </AllFormattedTagButton>
      <SelectFormattedTagsList
        data={formattedTags}
        keyExtractor={(tag: {value: string, name: string}) => tag.value}
        renderItem={({ item, index }: { item: {value: string, name: string}, index: number }) => (
          <>
            {index === 0 && setIsFavorite && (
              <FormattedTagButton onPress={onFavoritePress}>
                <Tag text="favorites" selected={isFavorite} icon="favorite" />
              </FormattedTagButton>
            )}
            <FormattedTagButton onPress={() => onTagPress(item.value)}>
              <Tag text={item.name} selected={selectedTags.includes(item.value)} />
            </FormattedTagButton>
          </>
        )}
        ListFooterComponent={<Empty />}
      />
    </SelectFormattedTagsContainer>
  );
};
