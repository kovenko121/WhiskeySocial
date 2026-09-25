import React, { useState } from 'react';
import { Button, Modal, message } from 'antd';
import { DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { useUpdate, useNavigation, BaseKey } from '@refinedev/core';
import exp from 'constants';

interface SoftDeleteButtonProps {
  brandId: BaseKey;
  brandName: string;
  showLabel?: boolean;
}

export const SoftDeleteButton: React.FC<SoftDeleteButtonProps> = ({
  brandId,
  brandName,
  showLabel = true,
}) => {
  const [loading, setLoading] = useState(false);
  const { mutate: updateBrand } = useUpdate();
  const { push } = useNavigation();

  const handleDelete = () => {
    Modal.confirm({
      title: 'Delete Brand',
      icon: <ExclamationCircleOutlined />,
      content: (
        <div>
          <p>
            Are you sure you want to delete <strong>{brandName}</strong>?
          </p>
          <p>This action will:</p>
          <ul>
            <li>Hide the brand from all listings</li>
            <li>Mark the brand as deleted</li>
            <li>The brand can be restored later by an administrator</li>
          </ul>
          <p>
            <em>
              Note: Only the deleted flag will be changed. Brand owner
              assignments and other data remain unchanged.
            </em>
          </p>
        </div>
      ),
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        setLoading(true);
        try {
          await updateBrand(
            {
              resource: 'brand',
              id: brandId,
              values: {
                deleted: true,
              },
            },
            {
              onSuccess: () => {
                message.success('Brand deleted successfully');
                push('/brand');
              },
              onError: (error) => {
                message.error('Failed to delete brand');
                console.error('Delete error:', error);
              },
            }
          );
        } finally {
          setLoading(false);
        }
      },
    });
  };

  return (
    <Button
      danger
      icon={<DeleteOutlined />}
      loading={loading}
      onClick={handleDelete}
    >
      {showLabel && 'Delete Brand'}
    </Button>
  );
};

export default SoftDeleteButton;
