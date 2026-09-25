import { GetServerSideProps } from 'next';
import { useState } from 'react';

import { Show } from '@refinedev/antd';
import { useShow } from '@refinedev/core';
import {
  Tag,
  Typography,
  Card,
  Row,
  Col,
  Space,
  Avatar,
  Button,
} from 'antd';
import {
  UserOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  TeamOutlined,
  EnvironmentOutlined,
  LockOutlined,
  GlobalOutlined,
  EditOutlined,
} from '@ant-design/icons';
import { handleServerSideProps } from '../../../src/utils/serverSideProps';
import { ReviewClubRequestModal } from '../../../src/components/clubRequest/ReviewClubRequestModal';
import { ClubRequestStatus } from '../../../src/graphql-data-provider/utils/graphQlTypes';

const { Title, Link, Text } = Typography;

const ClubRequestShow = () => {
  const { queryResult } = useShow({
    resource: 'clubRequest',
  });

  const { data, isLoading } = queryResult;
  const record = data?.data;

  const [isModalVisible, setIsModalVisible] = useState(false);

  const getStatusColor = (status: ClubRequestStatus) => {
    switch (status) {
      case ClubRequestStatus.PENDING:
        return 'orange';
      case ClubRequestStatus.APPROVED:
        return 'green';
      case ClubRequestStatus.REJECTED:
        return 'red';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: ClubRequestStatus) => {
    switch (status) {
      case ClubRequestStatus.PENDING:
        return <ClockCircleOutlined />;
      case ClubRequestStatus.APPROVED:
        return <CheckCircleOutlined />;
      case ClubRequestStatus.REJECTED:
        return <CloseCircleOutlined />;
      default:
        return null;
    }
  };

  const canReview = record?.status === ClubRequestStatus.PENDING || record?.status === ClubRequestStatus.REJECTED;

  return (
    <>
      <Show
        isLoading={isLoading}
        headerButtons={() => (
          <>
            {record && canReview && (
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={() => setIsModalVisible(true)}
              >
                Review Request
              </Button>
            )}
          </>
        )}
      >
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Status Banner */}
        <Card>
          <Row align="middle" gutter={16}>
            <Col>
              <Space size="middle">
                {getStatusIcon(record?.status)}
                <Tag
                  color={getStatusColor(record?.status)}
                  style={{ fontSize: 16, padding: '8px 16px' }}
                >
                  {record?.status}
                </Tag>
              </Space>
            </Col>
            <Col flex="auto">
              <Text type="secondary">
                Requested on{' '}
                {record?.createdAt
                  ? new Date(record.createdAt).toLocaleString()
                  : '-'}
              </Text>
            </Col>
          </Row>
        </Card>

        {/* Club Information */}
        <Card title="Club Information" bordered={false}>
          <Row gutter={[16, 24]}>
            <Col span={24}>
              <Title level={4} style={{ marginTop: 0 }}>
                {record?.status === ClubRequestStatus.APPROVED && record?.createdClubId ? (
                  <Link href={`/club/show/${record.createdClubId}`}>
                    {record?.clubName}
                  </Link>
                ) : (
                  record?.clubName
                )}
              </Title>
              <Text>{record?.description}</Text>
            </Col>

            <Col xs={24} md={12}>
              <Space direction="vertical" size="small">
                <Text type="secondary">
                  <EnvironmentOutlined /> Location
                </Text>
                <Text strong>{record?.location || 'Not specified'}</Text>
              </Space>
            </Col>

            <Col xs={24} md={12}>
              <Space direction="vertical" size="small">
                <Text type="secondary">
                  <TeamOutlined /> Current Members
                </Text>
                <Text strong>{record?.currentMemberCount}</Text>
              </Space>
            </Col>

            <Col xs={24} md={12}>
              <Space direction="vertical" size="small">
                <Text type="secondary">Privacy</Text>
                <Tag
                  icon={record?.isPrivate ? <LockOutlined /> : <GlobalOutlined />}
                  color={record?.isPrivate ? 'red' : 'green'}
                >
                  {record?.isPrivate ? 'Private' : 'Public'}
                </Tag>
              </Space>
            </Col>
          </Row>
        </Card>

        {/* Requestor Information */}
        <Card title="Requestor" bordered={false}>
          <Space size="middle">
            <Avatar icon={<UserOutlined />} size="large" />
            <Space direction="vertical" size={0}>
              <Link href={`/user/show/${record?.requestedBy}`}>
                <Text strong>@{record?.requestor?.username || record?.requestedBy}</Text>
              </Link>
              <Text type="secondary">User ID: {record?.requestedBy}</Text>
            </Space>
          </Space>
        </Card>

        {/* Review Information - Conditional based on status */}
        {record?.status === ClubRequestStatus.REJECTED && (
          <Card
            title={
              <Space>
                <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
                <Text>Rejection Details</Text>
              </Space>
            }
            bordered={false}
            style={{ borderLeft: '4px solid #ff4d4f' }}
          >
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <Row gutter={[16, 16]}>
                {record?.reviewedBy && (
                  <Col span={24}>
                    <Text type="secondary">Rejected By</Text>
                    <br />
                    <Text strong>
                      {record?.reviewer?.email || record?.reviewedBy}
                    </Text>
                    {record?.reviewer?.role && (
                      <Tag style={{ marginLeft: 8 }}>{record.reviewer.role}</Tag>
                    )}
                  </Col>
                )}

                {record?.reviewedAt && (
                  <Col span={24}>
                    <Text type="secondary">Rejected At</Text>
                    <br />
                    <Text>
                      {new Date(record.reviewedAt).toLocaleString()}
                    </Text>
                  </Col>
                )}

                <Col span={24}>
                  <Text type="secondary">Rejection Reason</Text>
                  <br />
                  <Card type="inner" style={{ marginTop: 8, backgroundColor: '#fff2f0', color: '#000' }}>
                    <Text style={{ color: '#000' }}>
                      {record?.rejectionReason || 'No reason provided'}
                    </Text>
                  </Card>
                </Col>
              </Row>
            </Space>
          </Card>
        )}

        {record?.status === ClubRequestStatus.APPROVED && record?.reviewedBy && (
          <Card
            title={
              <Space>
                <CheckCircleOutlined style={{ color: '#52c41a' }} />
                <Text>Approval Details</Text>
              </Space>
            }
            bordered={false}
            style={{ borderLeft: '4px solid #52c41a' }}
          >
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <Row gutter={[16, 16]}>
                <Col span={24}>
                  <Text type="secondary">Approved By</Text>
                  <br />
                  <Text strong>
                    {record?.reviewer?.email || record?.reviewedBy}
                  </Text>
                  {record?.reviewer?.role && (
                    <Tag style={{ marginLeft: 8 }}>{record.reviewer.role}</Tag>
                  )}
                </Col>

                <Col span={24}>
                  <Text type="secondary">Approved At</Text>
                  <br />
                  <Text>
                    {record?.reviewedAt
                      ? new Date(record.reviewedAt).toLocaleString()
                      : '-'}
                  </Text>
                </Col>

                {record?.createdClubId && (
                  <Col span={24}>
                    <Text type="secondary">Created Club</Text>
                    <br />
                    <Card type="inner" style={{ marginTop: 8, backgroundColor: '#f6ffed', color: '#000' }}>
                      <Space direction="vertical">
                        <Link href={`/club/show/${record.createdClubId}`}>
                          <Text strong style={{ fontSize: 16, color: '#000' }}>
                            {record?.createdClub?.clubName || 'View Club'}
                          </Text>
                        </Link>
                        <Text style={{ color: '#595959' }} copyable>
                          Club ID: {record.createdClubId}
                        </Text>
                      </Space>
                    </Card>
                  </Col>
                )}
              </Row>
            </Space>
          </Card>
        )}

        {record?.status === ClubRequestStatus.PENDING && (
          <Card
            style={{ borderLeft: '4px solid #faad14' }}
            bordered={false}
          >
            <Space>
              <ClockCircleOutlined style={{ color: '#faad14', fontSize: 20 }} />
              <Text type="secondary">
                This club request is pending review. Use the "Review Request" button above
                to approve or reject this request.
              </Text>
            </Space>
          </Card>
        )}
      </Space>
    </Show>

      {/* Review Modal */}
      {record?.id && (
        <ReviewClubRequestModal
          open={isModalVisible}
          onClose={() => setIsModalVisible(false)}
          clubRequestId={String(record.id)}
          clubName={record.clubName}
          clubDescription={record.description}
          isPrivate={record.isPrivate}
          requestedBy={record.requestedBy}
          onSuccess={() => queryResult.refetch()}
        />
      )}
    </>
  );
};

export const getServerSideProps: GetServerSideProps<{}> = async (context) => {
  return handleServerSideProps(context, '/clubRequest');
};

export default ClubRequestShow;
