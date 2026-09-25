import React, { useState, useEffect } from 'react';
import {
  Modal,
  Input,
  message,
  Alert,
  Space,
  Typography,
  Spin,
  Statistic,
  Row,
  Col,
} from 'antd';
import {
  DeleteOutlined,
  TeamOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import Icon from '@ant-design/icons';
import { faWhiskeyGlass } from '@fortawesome/free-solid-svg-icons';
import { useCustomMutation, useList } from '@refinedev/core';

const { Text, Title } = Typography;

// CMS Token for authentication
const CMS_TOKEN = process.env.NEXT_PUBLIC_CMS_TOKEN || '';

// Create custom Whiskey Glass icon from Font Awesome
const WhiskeyGlassSvg = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 512 512"
    fill="currentColor"
    width="1em"
    height="1em"
  >
    <path d={faWhiskeyGlass.icon[4] as string} />
  </svg>
);

const WhiskeyGlassIcon = (props: any) => (
  <Icon component={WhiskeyGlassSvg} {...props} />
);

// Interface for club
interface IClub {
  id: string;
  clubName: string;
  [key: string]: any;
}

// Props interface for the component
interface DeleteClubModalProps {
  visible: boolean;
  club: IClub | null;
  onClose: () => void;
  onSuccess: () => void;
}

// Response interface from deleteClub mutation
interface DeleteClubResponse {
  success: boolean;
  clubId: string | null;
  clubName: string | null;
  deletedCounts: {
    members: number;
    whiskeys: number;
    posts: number;
  } | null;
  message: string | null;
}

// Named export only - no default export to prevent Next.js routing
export const DeleteClubModal: React.FC<DeleteClubModalProps> = ({
  visible,
  club,
  onClose,
  onSuccess,
}) => {
  // GraphQL mutation hook
  const { mutate } = useCustomMutation();

  // State management
  const [confirmClubName, setConfirmClubName] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [showStatistics, setShowStatistics] = useState(false);

  // Reset state when modal visibility changes
  useEffect(() => {
    if (visible) {
      setConfirmClubName('');
      setIsDeleting(false);
      setShowStatistics(false);
    }
  }, [visible, club]);

  // Fetch member count
  const { data: membersData, isLoading: membersLoading } = useList({
    resource: 'clubMember',
    filters: [{ field: 'clubId', operator: 'eq', value: club?.id }],
    pagination: { mode: 'off' },
    queryOptions: {
      enabled: !!club?.id && visible,
    },
  });

  // Fetch whiskey count
  const { data: whiskeysData, isLoading: whiskeysLoading } = useList({
    resource: 'clubWhiskey',
    filters: [{ field: 'clubId', operator: 'eq', value: club?.id }],
    pagination: { mode: 'off' },
    queryOptions: {
      enabled: !!club?.id && visible,
    },
  });

  // Fetch post count
  const { data: postsData, isLoading: postsLoading } = useList({
    resource: 'post',
    filters: [{ field: 'clubId', operator: 'eq', value: club?.id }],
    pagination: { mode: 'off' },
    queryOptions: {
      enabled: !!club?.id && visible,
    },
  });

  const memberCount = membersData?.data?.length || 0;
  const whiskeyCount = whiskeysData?.data?.length || 0;
  const postCount = postsData?.data?.length || 0;

  const isLoadingCounts = membersLoading || whiskeysLoading || postsLoading;

  // Show statistics once counts are loaded
  useEffect(() => {
    if (visible && !isLoadingCounts && !showStatistics) {
      setShowStatistics(true);
    }
  }, [
    visible,
    isLoadingCounts,
    showStatistics,
    memberCount,
    whiskeyCount,
    postCount,
  ]);

  // Handle modal close
  const handleClose = () => {
    if (isDeleting) {
      return;
    }
    setConfirmClubName('');
    setIsDeleting(false);
    setShowStatistics(false);
    onClose();
  };

  // Handle club deletion
  const handleDeleteClub = async () => {
    if (!club) {
      return;
    }

    // Validate club name confirmation
    if (confirmClubName.trim() !== club.clubName.trim()) {
      message.error(
        'Club name does not match. Please type the exact club name to confirm.'
      );
      return;
    }

    setIsDeleting(true);

    const deleteClubAdminMutation = `
      mutation DeleteClubAdmin($input: DeleteClubAdminInput!) {
        deleteClubAdmin(input: $input) {
          success
          clubId
          clubName
          deletedCounts {
            members
            whiskeys
            posts
          }
          message
        }
      }
    `;

    mutate(
      {
        url: '',
        method: 'post',
        meta: {
          query: deleteClubAdminMutation,
          queryName: 'deleteClubAdmin',
          variables: {
            input: {
              clubId: club.id,
              token: CMS_TOKEN,
            },
          },
        },
        values: {},
      },
      {
        onSuccess: (response: any) => {
          // Extract the deleteClubAdmin result from response
          const result: DeleteClubResponse =
            response?.data?.deleteClubAdmin || response?.data;

          // Validate result structure before accessing properties
          if (
            typeof result !== 'object' ||
            result === null ||
            typeof result.success !== 'boolean'
          ) {
            message.error('Unexpected server response. Please try again.');
            setIsDeleting(false);
            return;
          }

          if (result.success) {
            const counts = result.deletedCounts;
            message.success(
              `Club "${result.clubName}" successfully deleted. ` +
                `Removed ${counts?.members || 0} member${
                  counts?.members !== 1 ? 's' : ''
                }, ` +
                `${counts?.whiskeys || 0} club whiskey${
                  counts?.whiskeys !== 1 ? 's' : ''
                }, and ` +
                `${counts?.posts || 0} post${counts?.posts !== 1 ? 's' : ''}.`,
              8
            );
            setIsDeleting(false);
            handleClose();
            onSuccess();
          } else {
            message.error(result.message || 'Failed to delete club');
            setIsDeleting(false);
          }
        },
        onError: (error: any) => {
          message.error(error?.message || 'Failed to delete club');
          setIsDeleting(false);
        },
      }
    );
  };

  const isClubNameValid = confirmClubName.trim() === club?.clubName?.trim();

  // Don't render if not visible or no club
  if (!visible || !club) return null;

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <DeleteOutlined style={{ color: '#ff4d4f', fontSize: '20px' }} />
          <span style={{ color: '#ff4d4f', fontSize: '18px' }}>
            Delete Club Permanently
          </span>
        </div>
      }
      open={visible}
      onOk={handleDeleteClub}
      onCancel={handleClose}
      okText="Delete Club Permanently"
      cancelText="Cancel"
      okButtonProps={{
        danger: true,
        loading: isDeleting,
        disabled: !isClubNameValid || isDeleting || isLoadingCounts,
      }}
      cancelButtonProps={{ disabled: isDeleting }}
      width={700}
      closable={!isDeleting}
      maskClosable={!isDeleting}
    >
      <div>
        {/* Critical Warning */}
        <Alert
          type="error"
          message="PERMANENT ACTION - CANNOT BE UNDONE"
          style={{ marginBottom: '20px' }}
          description={
            <>
              You are about to permanently delete the club{' '}
              <Text strong>"{club.clubName}"</Text>. This is a destructive
              action that cannot be reversed.
            </>
          }
        />

        {/* Loading State */}
        {isLoadingCounts && !showStatistics && (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <Spin size="large" />
            <div style={{ marginTop: '16px', color: '#999' }}>
              Loading club statistics...
            </div>
          </div>
        )}

        {/* Statistics Display */}
        {showStatistics && (
          <>
            <Title level={5} style={{ marginBottom: '16px' }}>
              Items that will be permanently deleted:
            </Title>

            <Row gutter={16} style={{ marginBottom: '24px' }}>
              <Col span={8}>
                <div
                  style={{
                    border: '1px solid #d9d9d9',
                    borderRadius: '8px',
                    padding: '16px',
                    textAlign: 'center',
                  }}
                >
                  <Statistic
                    title="Members"
                    value={memberCount}
                    prefix={<TeamOutlined />}
                    valueStyle={{ color: '#ff4d4f', fontSize: '24px' }}
                  />
                </div>
              </Col>
              <Col span={8}>
                <div
                  style={{
                    border: '1px solid #d9d9d9',
                    borderRadius: '8px',
                    padding: '16px',
                    textAlign: 'center',
                  }}
                >
                  <Statistic
                    title="Whiskeys"
                    value={whiskeyCount}
                    prefix={<WhiskeyGlassIcon />}
                    valueStyle={{ color: '#ff4d4f', fontSize: '24px' }}
                  />
                </div>
              </Col>
              <Col span={8}>
                <div
                  style={{
                    border: '1px solid #d9d9d9',
                    borderRadius: '8px',
                    padding: '16px',
                    textAlign: 'center',
                  }}
                >
                  <Statistic
                    title="Posts"
                    value={postCount}
                    prefix={<FileTextOutlined />}
                    valueStyle={{ color: '#ff4d4f', fontSize: '24px' }}
                  />
                </div>
              </Col>
            </Row>

            <Alert
              type="error"
              message="What will happen:"
              style={{ marginBottom: '20px' }}
              description={
                <Space direction="vertical" size="small">
                  <div>
                    <DeleteOutlined
                      style={{ color: '#ff4d4f', marginRight: '8px' }}
                    />
                    All {memberCount} club member
                    {memberCount !== 1 ? 's' : ''} will be removed
                  </div>
                  <div>
                    <DeleteOutlined
                      style={{ color: '#ff4d4f', marginRight: '8px' }}
                    />
                    All {whiskeyCount} club whiskey
                    {whiskeyCount !== 1 ? 's' : ''} will be removed from the
                    club
                  </div>
                  <div>
                    <DeleteOutlined
                      style={{ color: '#ff4d4f', marginRight: '8px' }}
                    />
                    All {postCount} post{postCount !== 1 ? 's' : ''} will be
                    permanently deleted
                  </div>
                  <div>
                    <DeleteOutlined
                      style={{ color: '#ff4d4f', marginRight: '8px' }}
                    />
                    The club record itself will be permanently deleted
                  </div>
                </Space>
              }
            />

            {/* Data Preservation Note */}
            <Alert
              type="info"
              message="Note: User accounts and whiskey entities are NOT deleted"
              style={{ marginBottom: '20px' }}
              description="Only the membership associations and club-specific content are removed. Members' user accounts and whiskey entities in their personal collections remain intact."
            />

            {/* Club Name Confirmation */}
            <div style={{ marginTop: '24px' }}>
              <Text strong>
                To confirm this permanent action, type the club name below:
              </Text>
              <div style={{ marginTop: '8px', marginBottom: '8px' }}>
                <Text code strong style={{ fontSize: '16px' }}>
                  {club.clubName}
                </Text>
              </div>
              <Input
                placeholder="Enter club name to confirm"
                value={confirmClubName}
                onChange={(e) => setConfirmClubName(e.target.value)}
                disabled={isDeleting}
                status={confirmClubName && !isClubNameValid ? 'error' : ''}
                style={{ marginTop: '8px' }}
                autoFocus
              />
              {confirmClubName && !isClubNameValid && (
                <Text
                  type="danger"
                  style={{
                    fontSize: '12px',
                    marginTop: '4px',
                    display: 'block',
                  }}
                >
                  Club name does not match
                </Text>
              )}
            </div>

            {/* Final Warning */}
            <Alert
              type="error"
              message="This action cannot be undone. All club data will be permanently deleted."
              style={{ marginTop: '20px' }}
            />
          </>
        )}
      </div>
    </Modal>
  );
};

// DO NOT add export default - this prevents Next.js from creating a route
