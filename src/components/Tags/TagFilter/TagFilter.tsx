import { getTestId } from '@helpers';
import { Icon } from '../../Icon/Icon';
import { Tag } from '../Tags';
import {
  AllTagButton,
  Empty,
  SearchButton,
  SelectTagsContainer,
  SelectTagsList,
  TagButton,
} from './styles';

export const TagFilter = ({
  tags,
  selectedTags,
  setSelectedTags,
  mv = 0,
  ml = 24,
  isFavorite,
  setIsFavorite,
  search,
}: {
  tags: string[];
  selectedTags: string[];
  setSelectedTags: (tags: string[]) => void;
  mv?: number;
  ml?: number;
  isFavorite?: boolean;
  setIsFavorite?: (value: boolean) => void;
  search?: () => void;
}) => {
  const onTagPress = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([tag]);
    }
  };

  const onFavoritePress = () => {
    if (setIsFavorite) {
      setIsFavorite(!isFavorite);
    }
  };

  return (
    <SelectTagsContainer mv={mv} ml={ml}>
      {search && (
        <SearchButton onPress={search}>
          <Icon name="search" size={23} color="primary600" />
        </SearchButton>
      )}
      <AllTagButton
        testID={getTestId('all')}
        onPress={() => {
          setSelectedTags([]);
          if (setIsFavorite) setIsFavorite(false);
        }}
      >
        <Tag text="All" selected={!selectedTags.length && !isFavorite} />
      </AllTagButton>
      <SelectTagsList
        data={tags}
        keyExtractor={(tag: string) => tag}
        renderItem={({ item, index }: { item: string, index: number }) => (
          <>
            {index === 0 && setIsFavorite && (
              <TagButton onPress={onFavoritePress}>
                <Tag text="favorites" selected={isFavorite} icon="favorite" />
              </TagButton>
            )}
            <TagButton onPress={() => onTagPress(item)}>
              <Tag text={item} selected={selectedTags.includes(item)} />
            </TagButton>
          </>
        )}
        ListFooterComponent={<Empty />}
      />
    </SelectTagsContainer>
  );
};
