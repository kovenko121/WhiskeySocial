import { capitalize } from '@helpers';
import { useState } from 'react';
import { Icon } from '../Icon/Icon';
import { PopUpMenu } from '../PopUpMenu/PopUpMenu';
import { Text } from '../Text/Text';
import { DropDownContainer, IconContainer, TagContainer } from './styles';

export const RoundedDropdown = ({
  sortType,
  setSortType,
  right = false,
  testID,
}: {
  sortType: string;
  setSortType: (value: string) => void;
  right?: boolean;
  testID?: string;
}) => {
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const sortOptions = [
    {
      id: 'date-added',
      title: 'Date Added',
      icon: 'list',
      action: () => {
        setSortType('default');
        setShowSortMenu(false);
      },
    },
    {
      id: 'alphabetical',
      title: 'Alphabetical',
      icon: 'alphabetical',
      action: () => {
        setSortType('alphabetical');
        setShowSortMenu(false);
      },
    },
  ];
  return (
    <DropDownContainer>
      <TagContainer
        onPress={() => {
          if (showSortMenu && !isClosing) setShowSortMenu(false);
          if (!showSortMenu && !isClosing) setShowSortMenu(true);
        }}
        testID={testID}
      >
        <IconContainer>
          <Icon name="sort" size={12} color="white" />
        </IconContainer>

        <Text size={12}>
          {sortType === 'default' ? 'Sort by' : capitalize(sortType)}
        </Text>
        <IconContainer>
          <Icon name="dropdown-down" size={8} color="white" />
        </IconContainer>
      </TagContainer>
      {showSortMenu && (
        <PopUpMenu
          width={150}
          options={sortOptions}
          alignItems={right ? 'flex-end' : 'flex-start'}
          paddingBottom={30}
          paddingLeft={0}
          setVisibleStatus={setShowSortMenu}
          setIsClosingStatus={setIsClosing}
          showLoading={false}
        />
      )}
    </DropDownContainer>
  );
};
