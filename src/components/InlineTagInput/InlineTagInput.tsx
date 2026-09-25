import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { TextInput, NativeSyntheticEvent, TextInputSelectionChangeEventData } from 'react-native';
import { randomUUID } from 'expo-crypto';
import { InlineTagInput, EntitySearchResult } from '@types';
import { UnifiedEntitySearch } from '../UnifiedEntitySearch/UnifiedEntitySearch';
import { Input } from '../Input/Input';

interface TaggableTextInputProps {
  value: string;
  onChangeText: (text: string) => void;
  tags: InlineTagInput[];
  onTagsChange: (tags: InlineTagInput[]) => void;
  onEntityTagged?: (entity: EntitySearchResult) => void;
  placeholder?: string;
  multiline?: boolean;
  numberOfLines?: number;
  maxLength?: number;
  counter?: string;
  onContentSizeChange?: (event: any) => void;
  clubId?: string | null;
}

export interface TaggableTextInputRef {
  focus: () => void;
}

export const TaggableTextInput = forwardRef<TaggableTextInputRef, TaggableTextInputProps>(({
  value,
  onChangeText,
  tags,
  onTagsChange,
  onEntityTagged,
  placeholder = 'Write something...',
  multiline = true,
  numberOfLines = 4,
  maxLength,
  counter,
  onContentSizeChange,
  clubId = null,
}, ref) => {
  const [showSearch, setShowSearch] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [currentMentionStart, setCurrentMentionStart] = useState<number | null>(null);
  const [triggerSymbol, setTriggerSymbol] = useState<'@' | '#'>('@');
  const inputRef = useRef<TextInput>(null);

  // Expose focus method to parent components
  useImperativeHandle(ref, () => ({
    focus: () => {
      inputRef.current?.focus();
    },
  }));

  // Detect @ or # symbol and trigger search
  useEffect(() => {
    if (value.length === 0) {
      setCurrentMentionStart(null);
      setShowSearch(false);
      return;
    }

    // Find the last @ or # symbol before the cursor position
    const textBeforeCursor = value.substring(0, cursorPosition);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');
    const lastHashIndex = textBeforeCursor.lastIndexOf('#');
    const lastTriggerIndex = Math.max(lastAtIndex, lastHashIndex);

    if (lastTriggerIndex !== -1) {
      // Only show search if cursor is immediately after @ or # (at the beginning of the tag)
      // This UX decision prevents the search modal from popping up when users place their
      // cursor within or at the end of an existing tag to edit or delete it. The search
      // only triggers when starting a new tag (cursor right after @ or #), making tag deletion
      // and editing more intuitive without unwanted modal interruptions.
      if (cursorPosition === lastTriggerIndex + 1) {
        setCurrentMentionStart(lastTriggerIndex);
        setTriggerSymbol(value[lastTriggerIndex] as '@' | '#');
        setShowSearch(true);
        return;
      }
    }

    setCurrentMentionStart(null);
    setShowSearch(false);
  }, [value, cursorPosition]);

  const handleSelectionChange = (
    e: NativeSyntheticEvent<TextInputSelectionChangeEventData>
  ) => {
    setCursorPosition(e.nativeEvent.selection.start);
  };

  const handleEntitySelected = (entity: EntitySearchResult) => {
    if (currentMentionStart === null) return;

    // Get the text from @ or # to cursor
    const textBeforeMention = value.substring(0, currentMentionStart);
    const textAfterCursor = value.substring(cursorPosition);

    // Determine which trigger symbol was used, read from the text rather than state
    const activeTriggerSymbol = value[currentMentionStart];

    // Format whiskey names: remove spaces, punctuation, and capitalize first letter of each word
    const formatWhiskeyName = (name: string): string =>
      name
        .split(' ')
        .map((word) => word.replace(/[\W_]/g, '')) // Remove punctuation and underscores
        .filter((cleanWord) => cleanWord.length > 0) // Filter out empty words
        .map((cleanWord) => cleanWord.charAt(0).toUpperCase() + cleanWord.slice(1)) // Capitalize
        .join('');

    // Create the mention text based on the trigger symbol
    // For whiskeys, use whiskeyFullName if available, otherwise use name
    const mentionText = activeTriggerSymbol === '#'
      ? `#${formatWhiskeyName(entity.whiskeyFullName || entity.name)}`
      : `@${entity.username || entity.name}`;
    const newText = `${textBeforeMention + mentionText  } ${  textAfterCursor}`;

    // Calculate tag positions
    const startIndex = currentMentionStart;
    const endIndex = startIndex + mentionText.length;

    // Create new tag
    const newTag: InlineTagInput = {
      id: randomUUID(),
      type: entity.type,
      entityId: entity.id,
      text: mentionText,
      startIndex,
      endIndex,
    };

    // Update existing tags that come after this insertion
    const updatedTags = tags.map((tag) => {
      if (tag.startIndex > currentMentionStart) {
        const diff = newText.length - value.length;
        return {
          ...tag,
          startIndex: tag.startIndex + diff,
          endIndex: tag.endIndex + diff,
        };
      }
      return tag;
    });

    onTagsChange([...updatedTags, newTag]);
    onChangeText(newText);

    // Notify parent component of the entity being tagged (with full details)
    onEntityTagged?.(entity);

    // Calculate new cursor position
    const newCursorPosition = endIndex + 1;

    // Reset mention state
    setCurrentMentionStart(null);
    setShowSearch(false);
    setCursorPosition(newCursorPosition);

    // Set cursor position after the mention
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.setNativeProps({
          selection: { start: newCursorPosition, end: newCursorPosition },
        });
      }
    }, 0);
  };

  const handleTextChange = (newText: string) => {
    // Calculate where text was modified
    const oldLength = value.length;
    const newLength = newText.length;
    const lengthDiff = newLength - oldLength;

    // Find the position where text was modified
    let modificationStart = 0;
    while (
      modificationStart < Math.min(oldLength, newLength) &&
      value[modificationStart] === newText[modificationStart]
    ) {
      modificationStart += 1;
    }

    // Find the position from the end where text matches
    let modificationEnd = 0;
    while (
      modificationEnd < Math.min(oldLength, newLength) - modificationStart &&
      value[oldLength - 1 - modificationEnd] === newText[newLength - 1 - modificationEnd]
    ) {
      modificationEnd += 1;
    }

    const modificationEndPos = oldLength - modificationEnd;

    // Update or remove tags based on the modification
    const updatedTags = tags
      .map((tag) => {
        // Case 1: Tag is completely before the modification - no change needed
        if (tag.endIndex <= modificationStart) {
          return tag;
        }

        // Case 2: Tag is completely after the modification - adjust indices
        if (tag.startIndex >= modificationEndPos) {
          return {
            ...tag,
            startIndex: tag.startIndex + lengthDiff,
            endIndex: tag.endIndex + lengthDiff,
          };
        }

        // Case 3: Modification overlaps with tag - check if tag is still valid
        // Tag is partially or fully within the modification range
        const newStartIndex = tag.startIndex;
        const newEndIndex = tag.endIndex + lengthDiff;

        // Check if the tag bounds are valid and the text still matches
        if (newStartIndex >= 0 && newEndIndex <= newLength) {
          const tagTextInNew = newText.substring(newStartIndex, newEndIndex);
          if (tagTextInNew === tag.text) {
            return {
              ...tag,
              startIndex: newStartIndex,
              endIndex: newEndIndex,
            };
          }
        }

        // Tag was invalidated by the modification
        return null;
      })
      .filter((tag): tag is InlineTagInput => tag !== null);

    onTagsChange(updatedTags);
    onChangeText(newText);
  };

  return (
    <>
      <Input
        ref={inputRef}
        value={value}
        onChangeText={handleTextChange}
        onSelectionChange={handleSelectionChange}
        placeholder={placeholder}
        multiline={multiline}
        numberOfLines={numberOfLines}
        maxLength={maxLength}
        counter={counter}
        onContentSizeChange={onContentSizeChange}
        autoCapitalize="sentences"
      />
      <UnifiedEntitySearch
        visible={showSearch}
        onBackButtonPress={() => setShowSearch(false)}
        onEntitySelected={handleEntitySelected}
        triggerSymbol={triggerSymbol}
        clubId={clubId}
      />
    </>
  );
});

TaggableTextInput.displayName = 'TaggableTextInput';
