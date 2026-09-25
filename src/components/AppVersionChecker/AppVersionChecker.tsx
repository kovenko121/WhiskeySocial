import React, { useEffect, useState } from 'react';
import { useAppVersion } from '@hooks';
import { AppVersionModal } from '../AppVersionModal/AppVersionModal';

interface AppVersionCheckerProps {
  children: React.ReactNode;
}

const AppVersionChecker: React.FC<AppVersionCheckerProps> = ({ children }) => {
  const { data: versionInfo, isLoading } = useAppVersion();
  const [modalVisible, setModalVisible] = useState(false);
  const [hasShownModal, setHasShownModal] = useState(false);

  useEffect(() => {
    // Show modal if update is needed and we haven't shown it yet
    if (!isLoading && versionInfo) {
      if (versionInfo.needsUpdate && !hasShownModal) {
        setModalVisible(true);
        setHasShownModal(true);
      }
    }
  }, [versionInfo, isLoading, hasShownModal]);

  const handleCloseModal = () => {
    if (!versionInfo?.forceUpdate) {
      setModalVisible(false);
    }
  };

  return (
    <>
      {children}
      <AppVersionModal
        visible={modalVisible}
        versionInfo={versionInfo}
        onClose={handleCloseModal}
      />
    </>
  );
};

export { AppVersionChecker };