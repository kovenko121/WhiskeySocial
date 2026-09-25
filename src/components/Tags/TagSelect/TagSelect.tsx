import { capitalize } from '@helpers';
import { Tag } from '../Tags';
import { SelectTags, SelectTagsContainer, TagButton } from './styles';

export const TagSelect = ({
  tags,
  selectedTags,
  setSelectedTags,
  mv = 0,
}: {
  tags: string[];
  selectedTags: string[];
  setSelectedTags: (tags: string[]) => void;
  mv?: number;
}) => {
  const onTagPress = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([tag, ...selectedTags]);
    }
  };

  return (
    <SelectTagsContainer mv={mv}>
      <SelectTags
        data={tags}
        contentContainerStyle={{ alignItems: 'center' }}
        keyExtractor={(tag: string) => tag}
        renderItem={({ item }: { item: string }) => (
          <TagButton onPress={() => onTagPress(item)}>
            <Tag
              text={capitalize(item)}
              selected={selectedTags.includes(item)}
            />
          </TagButton>
        )}
      />
    </SelectTagsContainer>
  );
};
