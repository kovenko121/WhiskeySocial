import { Routes } from '@types';

const navigateUserProfile = (id: String, sub: string | undefined, navigation: any) => {
  if (id === sub) {
    navigation.navigate(Routes.MyCollection);
  } else {
    navigation.navigate(Routes.UserProfile, { id });
  }
};

export { navigateUserProfile };
