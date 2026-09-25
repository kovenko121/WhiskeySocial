import { useState, useEffect } from 'react';
import { useUpdate, useCreate, useDataProvider } from '@refinedev/core';
import { useSession } from 'next-auth/react';
import {
  Modal,
  Radio,
  Input,
  Space,
  Card,
  Typography,
  message,
} from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import {
  ClubRequestStatus,
  ClubRole,
  MemberStatus,
} from '../../graphql-data-provider/utils/graphQlTypes';
import { createLogger } from '../../utils/logger';

const logger = createLogger('ReviewClubRequestModal');

const { Text } = Typography;
const { TextArea } = Input;

interface ReviewClubRequestModalProps {
  open: boolean;
  onClose: () => void;
  clubRequestId: string;
  clubName?: string;
  clubDescription?: string;
  isPrivate?: boolean;
  requestedBy?: string;
  onSuccess?: () => void;
}

export const ReviewClubRequestModal: React.FC<ReviewClubRequestModalProps> = ({
  open,
  onClose,
  clubRequestId,
  clubName,
  clubDescription,
  isPrivate,
  requestedBy,
  onSuccess,
}) => {
  const { data: session } = useSession();
  const dataProvider = useDataProvider();
  const { mutate: updateClubRequest } = useUpdate();
  const { mutate: createClub } = useCreate();
  const { mutate: createClubMember } = useCreate();

  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!open) {
      setSelectedStatus(null);
      setRejectionReason('');
    }
  }, [open]);

  const handleClose = () => {
    setSelectedStatus(null);
    setRejectionReason('');
    onClose();
  };

  const checkClubNameUniqueness = async (name: string): Promise<string> => {
    try {
      // Use the data provider to check for existing clubs with this name
      const { data } = await dataProvider().getList({
        resource: 'club',
        filters: [
          {
            field: 'searchName',
            operator: 'eq',
            value: name.toLowerCase(),
          },
        ],
        pagination: {
          current: 1,
          pageSize: 1,
        },
      });

      if (data && data.length > 0) {
        // Name exists, append random number
        const randomNum = Math.floor(Math.random() * 10000);
        return `${name} ${randomNum}`;
      } else {
        // Name is unique
        return name;
      }
    } catch (error) {
      logger.error('Error checking club name uniqueness', error as Error, {
        extra: {
          clubName: name,
        },
      });
      // On error, just use the original name
      return name;
    }
  };

  const handleSubmit = async () => {
    if (!selectedStatus) {
      message.error('Please select a status');
      return;
    }

    setIsSubmitting(true);

    if (selectedStatus === ClubRequestStatus.APPROVED) {
      // Check required data for club creation
      if (!clubName || !requestedBy) {
        message.error('Missing required club data');
        setIsSubmitting(false);
        return;
      }

      // Check for unique club name
      const finalClubName = await checkClubNameUniqueness(clubName);

      // Create the club
      createClub(
        {
          resource: 'club',
          values: {
            clubName: finalClubName,
            searchName: finalClubName.toLowerCase(),
            clubDetails: clubDescription || '',
            isPrivate: isPrivate ?? false,
            createdBy: requestedBy,
            memberCount: 0, // Lambda will update to 1
            whiskeyCount: 0,
          },
        },
        {
          onSuccess: (clubData: any) => {
            const createdClubId = clubData?.data?.id;

            // Create ClubMember for the owner
            createClubMember(
              {
                resource: 'clubMember',
                values: {
                  clubId: createdClubId,
                  userId: requestedBy,
                  role: ClubRole.CLUBOWNERROLE,
                  status: MemberStatus.ACTIVE,
                  joinedAt: new Date().toISOString(),
                  requestedAt: new Date().toISOString(),
                },
              },
              {
                onSuccess: () => {
                  // Update club request with club ID and approved status
                  const updateData: any = {
                    status: ClubRequestStatus.APPROVED,
                    reviewedBy: session?.user?.id,
                    reviewedAt: new Date().toISOString(),
                    createdClubId: createdClubId,
                  };

                  updateClubRequest(
                    {
                      resource: 'clubRequest',
                      id: clubRequestId,
                      values: updateData,
                    },
                    {
                      onSuccess: () => {
                        message.success('Club request approved and club created successfully!');
                        handleClose();
                        onSuccess?.();
                      },
                      onError: (error) => {
                        const err = error instanceof Error ? error : new Error(String(error));
                        message.error('Failed to update club request');
                        logger.error('Failed to update club request after approval', err, {
                          extra: {
                            clubRequestId,
                            createdClubId: clubData?.data?.id,
                          },
                        });
                      },
                      onSettled: () => {
                        setIsSubmitting(false);
                      },
                    }
                  );
                },
                onError: (error) => {
                  const err = error instanceof Error ? error : new Error(String(error));
                  message.error('Failed to create club member');
                  logger.error('Failed to create club member for owner', err, {
                    extra: {
                      clubRequestId,
                      createdClubId: clubData?.data?.id,
                      ownerId: requestedBy,
                    },
                  });
                  setIsSubmitting(false);
                },
              }
            );
          },
          onError: (error) => {
            const err = error instanceof Error ? error : new Error(String(error));
            message.error('Failed to create club');
            logger.error('Failed to create club from approved request', err, {
              extra: {
                clubRequestId,
                clubName: finalClubName,
                requestedBy,
              },
            });
            setIsSubmitting(false);
          },
        }
      );
    } else {
      // REJECTED - just update status
      const updateData: any = {
        status: selectedStatus,
        reviewedBy: session?.user?.id,
        reviewedAt: new Date().toISOString(),
      };

      if (selectedStatus === ClubRequestStatus.REJECTED && rejectionReason.trim()) {
        updateData.rejectionReason = rejectionReason.trim();
      }

      updateClubRequest(
        {
          resource: 'clubRequest',
          id: clubRequestId,
          values: updateData,
        },
        {
          onSuccess: () => {
            message.success(
              `Club request ${selectedStatus.toLowerCase()} successfully`
            );
            handleClose();
            onSuccess?.();
          },
          onError: (error) => {
            const err = error instanceof Error ? error : new Error(String(error));
            message.error('Failed to update club request');
            logger.error('Failed to update club request status', err, {
              extra: {
                clubRequestId,
                status: selectedStatus,
              },
            });
          },
          onSettled: () => {
            setIsSubmitting(false);
          },
        }
      );
    }
  };

  return (
    <Modal
      title="Review Club Request"
      open={open}
      onCancel={handleClose}
      onOk={handleSubmit}
      confirmLoading={isSubmitting}
      okText={
        selectedStatus === ClubRequestStatus.APPROVED
          ? 'Approve'
          : selectedStatus === ClubRequestStatus.REJECTED
          ? 'Reject'
          : 'Submit'
      }
      okButtonProps={{
        disabled: !selectedStatus,
      }}
      width={600}
    >
      <Space direction="vertical" size="large" style={{ width: '100%', marginTop: 20 }}>
        {clubName && (
          <div>
            <Text strong>Club Name: </Text>
            <Text>{clubName}</Text>
          </div>
        )}

        <div>
          <Text strong style={{ display: 'block', marginBottom: 12 }}>
            Select Status: <Text type="danger">*</Text>
          </Text>
          <Radio.Group
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            style={{ width: '100%' }}
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              <Radio value={ClubRequestStatus.APPROVED}>
                <Space>
                  <CheckCircleOutlined style={{ color: '#52c41a' }} />
                  <Text>Approve Request</Text>
                </Space>
              </Radio>
              <Radio value={ClubRequestStatus.REJECTED}>
                <Space>
                  <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
                  <Text>Reject Request</Text>
                </Space>
              </Radio>
            </Space>
          </Radio.Group>
        </div>

        {selectedStatus === ClubRequestStatus.REJECTED && (
          <div style={{ marginTop: 16, marginBottom: 24 }}>
            <Text strong style={{ display: 'block', marginBottom: 8 }}>
              Rejection Reason (Optional)
            </Text>
            <TextArea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Optionally provide a reason for rejecting this club request..."
              rows={4}
              maxLength={500}
              showCount
              style={{ marginBottom: 8 }}
            />
          </div>
        )}

        {selectedStatus === ClubRequestStatus.APPROVED && (
          <Card type="inner" style={{ backgroundColor: '#f6ffed', border: '1px solid #b7eb8f' }}>
            <Space>
              <CheckCircleOutlined style={{ color: '#52c41a' }} />
              <Text style={{ color: '#000000' }}>
                Note: After approval, the club will be created automatically and linked to this request.
              </Text>
            </Space>
          </Card>
        )}
      </Space>
    </Modal>
  );
};
