import React, { useState, useEffect } from 'react';
import {
  Modal,
  Button,
  Card,
  Space,
  Typography,
  Avatar,
  Divider,
  Input,
  message,
  Alert,
} from 'antd';
import {
  DeleteOutlined,
  StopOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { useCustomMutation, useList } from '@refinedev/core';
import {
  ClubRole,
  MemberStatus,
} from '../../graphql-data-provider/utils/graphQlTypes';
import { createLogger } from '../../utils/logger';

const logger = createLogger('RemoveMemberModals');
const { Text, Title } = Typography;

// Interface for club member (matches the one in show/[id].tsx)
interface IClubMember {
  id: string;
  clubId: string;
  userId: string;
  role: ClubRole;
  status: MemberStatus;
  joinedAt?: string;
  requestedAt?: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    username: string;
    personFullName?: string;
    profilePicture?: {
      bucket: string;
      key: string;
      region: string;
    };
    userType?: string;
  };
}

// Interface for club
interface IClub {
  id: string;
  clubName: string;
  [key: string]: any;
}

// Props interface for the component
interface RemoveMemberModalsProps {
  visible: boolean;
  member: IClubMember | null;
  club: IClub | null;
  allMembers: IClubMember[];
  onClose: () => void;
  onSuccess: () => void;
  renderRoleBadge: (role: ClubRole) => React.ReactNode;
  renderStatusBadge: (status: MemberStatus) => React.ReactNode;
}

// Named export only - no default export to prevent Next.js routing
export const RemoveMemberModals: React.FC<RemoveMemberModalsProps> = ({
  visible,
  member,
  club,
  allMembers,
  onClose,
  onSuccess,
  renderRoleBadge,
  renderStatusBadge,
}) => {
  // Modal visibility state
  const [showActionChoice, setShowActionChoice] = useState(true);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const [showBlockConfirm, setShowBlockConfirm] = useState(false);

  // Form state
  const [confirmUsername, setConfirmUsername] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Reset modal state when visibility changes to true
  useEffect(() => {
    if (visible) {
      setShowActionChoice(true);
      setShowRemoveConfirm(false);
      setShowBlockConfirm(false);
      setConfirmUsername('');
      setIsProcessing(false);
    }
  }, [visible]);

  // GraphQL mutation hook
  const { mutate } = useCustomMutation();

  // Fetch member's posts in club (only when block confirm is visible)
  const { data: memberPostsData, isLoading: memberPostsLoading } = useList({
    resource: 'post',
    filters: [
      { field: 'clubId', operator: 'eq', value: club?.id },
      { field: 'authorId', operator: 'eq', value: member?.userId },
    ],
    pagination: { mode: 'off' },
    queryOptions: {
      enabled: !!club?.id && !!member?.userId && showBlockConfirm,
    },
  });

  const memberPostsCount = memberPostsData?.data?.length || 0;

  // Reset state when modal closes
  const handleClose = () => {
    setShowActionChoice(true);
    setShowRemoveConfirm(false);
    setShowBlockConfirm(false);
    setConfirmUsername('');
    setIsProcessing(false);
    onClose();
  };

  // Validation: Check if member can be removed
  const canRemoveMember = (): { allowed: boolean; reason?: string } => {
    if (!member) return { allowed: false, reason: 'No member selected' };

    // Cannot remove club owner
    if (member.role === ClubRole.CLUBOWNERROLE) {
      return {
        allowed: false,
        reason: 'The club owner cannot be removed. Transfer ownership first.',
      };
    }

    // Check if this is the last admin (applies when removing an admin)
    // We require at least one admin to remain (owner doesn't count as admin)
    if (member.role === ClubRole.CLUBADMINROLE) {
      // Count how many admins would remain after removing this member
      const remainingAdmins = allMembers.filter(
        (m) =>
          m.id !== member.id && // Exclude the member being removed
          m.role === ClubRole.CLUBADMINROLE &&
          m.status === MemberStatus.ACTIVE
      ).length;

      if (remainingAdmins < 1) {
        return {
          allowed: false,
          reason:
            'Cannot remove the last admin. Promote another member to admin first.',
        };
      }
    }

    return { allowed: true };
  };

  // Handle choosing Remove option
  const handleChooseRemove = () => {
    const validation = canRemoveMember();
    if (!validation.allowed) {
      message.error(validation.reason);
      return;
    }
    setShowActionChoice(false);
    setShowRemoveConfirm(true);
  };

  // Handle choosing Block option
  const handleChooseBlock = () => {
    const validation = canRemoveMember();
    if (!validation.allowed) {
      message.error(validation.reason);
      return;
    }
    setShowActionChoice(false);
    setShowBlockConfirm(true);
  };

  // Go back to action choice
  const handleBackToChoice = () => {
    setShowRemoveConfirm(false);
    setShowBlockConfirm(false);
    setShowActionChoice(true);
    setConfirmUsername('');
  };

  // Handle Remove Member (DELETE - user can rejoin)
  const handleRemoveMember = async () => {
    if (!member) return;

    setIsProcessing(true);

    const deleteClubMemberMutation = `
      mutation DeleteClubMember($input: DeleteClubMemberInput!) {
        deleteClubMember(input: $input) {
          id
        }
      }
    `;

    mutate(
      {
        url: '',
        method: 'post',
        meta: {
          query: deleteClubMemberMutation,
          queryName: 'deleteClubMember',
          variables: {
            input: { id: member.id },
          },
        },
        values: {},
      },
      {
        onSuccess: () => {
          message.success(
            `@${member.user?.username} has been removed from the club. They can rejoin or be re-added later.`
          );
          setIsProcessing(false);
          handleClose();
          onSuccess();
        },
        onError: (error: any) => {
          const err = error instanceof Error ? error : new Error(String(error));
          logger.error('Error removing member', err, {
            extra: {
              memberId: member.id,
              clubId: member.clubId,
              userId: member.userId,
              username: member.user?.username,
              errorMessage: err.message,
            },
          });
          message.error(err.message || 'Failed to remove member');
          setIsProcessing(false);
        },
      }
    );
  };

  // Handle Block Member (UPDATE status to BLOCKED + delete all posts)
  const handleBlockMember = async () => {
    if (!member) return;

    // Validate username confirmation
    if (confirmUsername !== member.user?.username) {
      message.error(
        'Username does not match. Please type the exact username to confirm.'
      );
      return;
    }

    setIsProcessing(true);

    try {
      // Step 1: Update member status to BLOCKED
      const updateClubMemberMutation = `
        mutation UpdateClubMember($input: UpdateClubMemberInput!) {
          updateClubMember(input: $input) {
            id
            status
            updatedAt
          }
        }
      `;

      await new Promise<void>((resolve, reject) => {
        mutate(
          {
            url: '',
            method: 'post',
            meta: {
              query: updateClubMemberMutation,
              queryName: 'updateClubMember',
              variables: {
                input: {
                  id: member.id,
                  status: MemberStatus.BLOCKED,
                },
              },
            },
            values: {},
          },
          {
            onSuccess: () => resolve(),
            onError: (error: any) => reject(error),
          }
        );
      });

      // Step 2: Delete all member's posts in the club
      const posts = memberPostsData?.data || [];
      let deletedCount = 0;
      let failedCount = 0;

      if (posts.length > 0) {
        const deleteClubPostAdminMutation = `
          mutation DeleteClubPostAdmin($postId: ID!) {
            deleteClubPostAdmin(postId: $postId) {
              success
              postId
              message
            }
          }
        `;

        for (const post of posts) {
          try {
            await new Promise<void>((resolve) => {
              mutate(
                {
                  url: '',
                  method: 'post',
                  meta: {
                    query: deleteClubPostAdminMutation,
                    queryName: 'deleteClubPostAdmin',
                    variables: { postId: post.id },
                  },
                  values: {},
                },
                {
                  onSuccess: (data: any) => {
                    if (data?.data?.deleteClubPostAdmin?.success) {
                      deletedCount++;
                    } else {
                      failedCount++;
                    }
                    resolve();
                  },
                  onError: () => {
                    failedCount++;
                    resolve();
                  },
                }
              );
            });
          } catch {
            failedCount++;
          }
        }
      }

      // Step 3: Show success message
      let successMessage = `@${member.user?.username} has been permanently blocked from the club.`;
      if (deletedCount > 0) {
        successMessage += ` ${deletedCount} post${deletedCount === 1 ? ' was' : 's were'} deleted.`;
      }
      if (failedCount > 0) {
        successMessage += ` Warning: ${failedCount} post${failedCount > 1 ? 's' : ''} could not be deleted.`;
      }

      message.success(successMessage, 6);
      setIsProcessing(false);
      handleClose();
      onSuccess();
    } catch (error: any) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error('Error blocking member', err, {
        extra: {
          memberId: member.id,
          clubId: member.clubId,
          userId: member.userId,
          username: member.user?.username,
          errorMessage: err.message,
        },
      });
      message.error(err.message || 'Failed to block member');
      setIsProcessing(false);
    }
  };

  const isUsernameValid = confirmUsername === member?.user?.username;

  // Don't render if not visible or no member
  if (!visible || !member) return null;

  return (
    <>
      {/* Step 1: Action Choice Modal */}
      <Modal
        title="Remove or Block Member"
        open={visible && showActionChoice}
        onCancel={handleClose}
        footer={null}
        width={600}
      >
        <div>
          {/* Member Information */}
          <div style={{ marginBottom: '24px', textAlign: 'center' }}>
            <Avatar
              size={64}
              style={{ backgroundColor: '#1890ff', marginBottom: '12px' }}
            >
              {member.user?.username?.charAt(0).toUpperCase() || '?'}
            </Avatar>
            <div>
              <Text strong style={{ fontSize: '18px' }}>
                @{member.user?.username || 'Unknown User'}
              </Text>
            </div>
            {member.user?.personFullName && (
              <div style={{ fontSize: '14px', color: '#999' }}>
                {member.user.personFullName}
              </div>
            )}
            <div style={{ marginTop: '8px' }}>
              {renderRoleBadge(member.role)}
              {renderStatusBadge(member.status)}
            </div>
          </div>

          <Divider>Choose Action</Divider>

          <p style={{ marginBottom: '24px', textAlign: 'center', color: '#666' }}>
            Please select how you want to remove this member from the club:
          </p>

          {/* Remove Option */}
          <Card
            hoverable
            style={{ marginBottom: '16px', cursor: 'pointer' }}
            onClick={handleChooseRemove}
          >
            <div style={{ display: 'flex', gap: '16px', alignItems: 'start' }}>
              <div style={{ fontSize: '32px', color: '#1890ff' }}>
                <DeleteOutlined />
              </div>
              <div style={{ flex: 1 }}>
                <Title level={5} style={{ margin: '0 0 8px 0' }}>
                  Remove from Club
                </Title>
                <Text>
                  Member will be removed but can rejoin or be re-added later.
                  <br />
                  <Text type="secondary">
                    • User can request to join again
                    <br />
                    • All posts remain in the club
                    <br />• No data is deleted
                  </Text>
                </Text>
              </div>
            </div>
          </Card>

          {/* Block Option */}
          <Card
            hoverable
            style={{
              marginBottom: '16px',
              cursor: 'pointer',
              border: '1px solid #ff4d4f',
            }}
            onClick={handleChooseBlock}
          >
            <div style={{ display: 'flex', gap: '16px', alignItems: 'start' }}>
              <div style={{ fontSize: '32px', color: '#ff4d4f' }}>
                <StopOutlined />
              </div>
              <div style={{ flex: 1 }}>
                <Title level={5} style={{ margin: '0 0 8px 0', color: '#ff4d4f' }}>
                  Block Permanently
                </Title>
                <Text>
                  Member will be permanently blocked and all their club posts
                  deleted.
                  <br />
                  <Text type="danger">
                    • User CANNOT rejoin or be re-added
                    <br />
                    • All user's posts in this club will be DELETED
                    <br />• This action requires username confirmation
                  </Text>
                </Text>
              </div>
            </div>
          </Card>

          <div style={{ marginTop: '24px', textAlign: 'center' }}>
            <Button onClick={handleClose}>Cancel</Button>
          </div>
        </div>
      </Modal>

      {/* Step 2a: Remove Confirmation Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ExclamationCircleOutlined style={{ color: '#1890ff' }} />
            Confirm Member Removal
          </div>
        }
        open={visible && showRemoveConfirm}
        onOk={handleRemoveMember}
        onCancel={handleBackToChoice}
        okText="Remove Member"
        cancelText="Back"
        okButtonProps={{ danger: true, loading: isProcessing }}
        cancelButtonProps={{ disabled: isProcessing }}
        width={500}
        closable={!isProcessing}
        maskClosable={!isProcessing}
      >
        <div>
          <div style={{ marginBottom: '16px' }}>
            <Text>
              You are about to remove{' '}
              <Text strong>@{member.user?.username || 'this member'}</Text> from
              the club.
            </Text>
          </div>

          <Alert
            type="info"
            message="What will happen:"
            style={{ marginBottom: '16px' }}
            description={
              <Space direction="vertical" size="small">
                <div>
                  <CheckCircleOutlined
                    style={{ color: '#52c41a', marginRight: '8px' }}
                  />
                  Member will be removed from the club
                </div>
                <div>
                  <CheckCircleOutlined
                    style={{ color: '#52c41a', marginRight: '8px' }}
                  />
                  User can request to join again later
                </div>
                <div>
                  <CheckCircleOutlined
                    style={{ color: '#52c41a', marginRight: '8px' }}
                  />
                  All posts will remain in the club
                </div>
              </Space>
            }
          />

          <Alert
            type="warning"
            message="This member can be re-added by an admin at any time."
          />
        </div>
      </Modal>

      {/* Step 2b: Block Confirmation Modal with Username Input */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <StopOutlined style={{ color: '#ff4d4f' }} />
            <span style={{ color: '#ff4d4f' }}>Confirm Permanent Block</span>
          </div>
        }
        open={visible && showBlockConfirm}
        onOk={handleBlockMember}
        onCancel={handleBackToChoice}
        okText="Block Member Permanently"
        cancelText="Back"
        okButtonProps={{
          danger: true,
          loading: isProcessing,
          disabled: !isUsernameValid,
        }}
        cancelButtonProps={{ disabled: isProcessing }}
        width={600}
        closable={!isProcessing}
        maskClosable={!isProcessing}
      >
        <div>
          {/* Critical Warning */}
          <Alert
            type="error"
            message="PERMANENT ACTION - CANNOT BE UNDONE"
            style={{ marginBottom: '20px' }}
            description={
              <>
                You are about to permanently block{' '}
                <Text strong>@{member.user?.username}</Text> from this club. This
                is a destructive action that cannot be reversed.
              </>
            }
          />

          {/* What Will Happen */}
          <Alert
            type="error"
            message="What will happen:"
            style={{ marginBottom: '16px' }}
            description={
              <Space direction="vertical" size="small">
                <div>
                  <StopOutlined style={{ color: '#ff4d4f', marginRight: '8px' }} />
                  Member status will be set to BLOCKED
                </div>
                <div>
                  <StopOutlined style={{ color: '#ff4d4f', marginRight: '8px' }} />
                  User CANNOT request to join again
                </div>
                <div>
                  <StopOutlined style={{ color: '#ff4d4f', marginRight: '8px' }} />
                  User CANNOT be re-added by admins
                </div>
                <div>
                  <DeleteOutlined style={{ color: '#ff4d4f', marginRight: '8px' }} />
                  <strong>
                    {memberPostsLoading ? (
                      <>Loading posts count...</>
                    ) : (
                      <>
                        {memberPostsCount} post
                        {memberPostsCount !== 1 ? 's' : ''} will be PERMANENTLY
                        DELETED
                      </>
                    )}
                  </strong>
                </div>
              </Space>
            }
          />

          {/* Username Confirmation */}
          <div style={{ marginTop: '24px' }}>
            <Text strong>
              To confirm this permanent action, type the member's username below:
            </Text>
            <div style={{ marginTop: '8px', marginBottom: '8px' }}>
              <Text code strong style={{ fontSize: '16px' }}>
                {member.user?.username}
              </Text>
            </div>
            <Input
              placeholder="Enter username to confirm"
              value={confirmUsername}
              onChange={(e) => setConfirmUsername(e.target.value)}
              disabled={isProcessing}
              status={confirmUsername && !isUsernameValid ? 'error' : ''}
              style={{ marginTop: '8px' }}
              autoFocus
            />
            {confirmUsername && !isUsernameValid && (
              <Text
                type="danger"
                style={{ fontSize: '12px', marginTop: '4px', display: 'block' }}
              >
                Username does not match
              </Text>
            )}
          </div>

          {/* Final Warning */}
          <Alert
            type="error"
            message="This action cannot be undone. All of this member's posts in the club will be permanently deleted."
            style={{ marginTop: '20px' }}
          />
        </div>
      </Modal>
    </>
  );
};

// DO NOT add export default - this prevents Next.js from creating a route
