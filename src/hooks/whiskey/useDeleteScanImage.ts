import { amplify } from '@services';
import { useCallback } from 'react';
import { DeleteScanImage } from './mutation/deleteScanImage';

const useDeleteScanImage = () =>
  useCallback(async (imageKey?: string | null) => {
    if (!imageKey) return;

    try {
      await amplify.request(DeleteScanImage, { input: { imageKey } });
    } catch (error) {
      // Cleanup is best effort; the object expires on its own.
    }
  }, []);

export { useDeleteScanImage };
