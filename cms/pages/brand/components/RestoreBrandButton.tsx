import React, { useState } from 'react';
import { Button, Popconfirm, message } from 'antd';
import { RedoOutlined } from '@ant-design/icons';
import { useUpdate, useInvalidate, BaseKey } from '@refinedev/core';
import exp from 'constants';

interface RestoreBrandButtonProps {
  brandId: BaseKey;
  brandName: string;
}

export const RestoreBrandButton: React.FC<RestoreBrandButtonProps> = ({
  brandId,
  brandName,
}) => {
  const [loading, setLoading] = useState(false);
  const { mutate: updateBrand } = useUpdate();
  const invalidate = useInvalidate();

  const handleRestore = async () => {
    setLoading(true);
    try {
      await updateBrand(
        {
          resource: 'brand',
          id: brandId,
          values: {
            deleted: false,
          },
        },
        {
          onSuccess: () => {
            message.success(`Brand "${brandName}" restored successfully`);
            invalidate({
              resource: 'brand',
              invalidates: ['list', 'detail'],
            });
          },
          onError: () => {
            message.error('Failed to restore brand');
          },
        }
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Popconfirm
      title={`Restore "${brandName}"?`}
      description="This will make the brand active again and visible in all listings."
      onConfirm={handleRestore}
      okText="Yes, Restore"
      cancelText="Cancel"
    >
      <Button type="primary" icon={<RedoOutlined />} loading={loading}>
        Restore Brand
      </Button>
    </Popconfirm>
  );
};

export default RestoreBrandButton;
