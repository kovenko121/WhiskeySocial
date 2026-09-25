import { GetServerSideProps } from 'next';

import { List, ShowButton, useTable } from '@refinedev/antd';
import {
  IResourceComponentsProps,
  useTranslate,
  useInvalidate,
} from '@refinedev/core';
import { Form, Select, Space, Table, Tag, Button, Tooltip } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import React, { useEffect, useState } from 'react';
import { handleServerSideProps } from '../../src/utils/serverSideProps';
import { ReviewClubRequestModal } from '../../src/components/clubRequest/ReviewClubRequestModal';
import { ClubRequestStatus } from '../../src/graphql-data-provider/utils/graphQlTypes';
import { booleanSorter, dateSorter, numberSorter, textSorter } from '../../src/utils/tableSorters';

interface IClubRequest {
  id: string;
  clubName: string;
  description: string;
  location: string | null;
  currentMemberCount: number;
  isPrivate: boolean;
  requestedBy: string;
  status: ClubRequestStatus;
  createdAt: string;
  createdClubId?: string | null;
  requestor?: {
    id: string;
    username: string;
    email: string;
  };
}

export const ClubRequestList: React.FC<IResourceComponentsProps> = () => {
  const translate = useTranslate();
  const invalidate = useInvalidate();
  const { tableProps, setFilters } =
    useTable<IClubRequest>({
      resource: 'clubRequest',
      pagination: {
        mode: 'server',
        pageSize: 25,
      },
      sorters: {
        initial: [
          {
            field: 'status',
            order: 'asc',
          },
          {
            field: 'createdAt',
            order: 'desc',
          },
        ],
      },
    });

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<IClubRequest | null>(null);

  const handleOpenModal = (record: IClubRequest) => {
    setSelectedRecord(record);
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setSelectedRecord(null);
  };

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

  const getStatusSortOrder = (status: ClubRequestStatus) => {
    switch (status) {
      case ClubRequestStatus.PENDING:
        return 0;
      case ClubRequestStatus.REJECTED:
        return 1;
      case ClubRequestStatus.APPROVED:
        return 2;
      default:
        return 3;
    }
  };

  useEffect(() => {
    // Set initial filter to PENDING
    setFilters([
      {
        field: 'status',
        operator: 'eq',
        value: ClubRequestStatus.PENDING,
      },
    ]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleStatusChange = (value: string | null) => {
    if (value === null || value === '') {
      // Clear all filters - show all statuses
      setFilters([], 'replace');
    } else {
      // Filter by selected status
      setFilters([
        {
          field: 'status',
          operator: 'eq',
          value: value,
        },
      ], 'replace');
    }
  };

  return (
    <List>
      <Form layout="inline">
        <Form.Item label="Filter by Status">
          <Select
            style={{ width: 200 }}
            defaultValue={ClubRequestStatus.PENDING}
            onChange={handleStatusChange}
          >
            <Select.Option value="">All Statuses</Select.Option>
            <Select.Option value={ClubRequestStatus.PENDING}>Pending</Select.Option>
            <Select.Option value={ClubRequestStatus.REJECTED}>Rejected</Select.Option>
            <Select.Option value={ClubRequestStatus.APPROVED}>Approved</Select.Option>
          </Select>
        </Form.Item>
      </Form>

      <Table
        {...tableProps}
        rowKey="id"
        style={{ marginTop: 16 }}
      >
        <Table.Column
          dataIndex="status"
          title={translate('clubRequest.fields.status')}
          width={120}
          render={(value: ClubRequestStatus) => (
            <Tag color={getStatusColor(value)}>{value}</Tag>
          )}
          sorter={(a: IClubRequest, b: IClubRequest) =>
            getStatusSortOrder(a.status) - getStatusSortOrder(b.status)
          }
        />

        <Table.Column
          dataIndex="clubName"
          title={translate('clubRequest.fields.clubName')}
          render={(value: string, record: IClubRequest) => {
            if (record.status === ClubRequestStatus.APPROVED && record.createdClubId) {
              return (
                <a href={`/club/show/${record.createdClubId}`} target="_blank" rel="noopener noreferrer">
                  {value}
                </a>
              );
            }
            return value;
          }}
          sorter={textSorter<IClubRequest>('clubName')}
        />

        <Table.Column
          dataIndex="description"
          title={translate('clubRequest.fields.description')}
          sorter={textSorter<IClubRequest>('description')}
          render={(value: string) => {
            const displayText = value?.length > 100 ? `${value.substring(0, 100)}...` : value;
            const shouldShowTooltip = value?.length > 100;

            return shouldShowTooltip ? (
              <Tooltip title={value} placement="topLeft">
                <span style={{
                  maxWidth: 300,
                  display: 'block',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  cursor: 'help'
                }}>
                  {displayText}
                </span>
              </Tooltip>
            ) : (
              <span style={{ maxWidth: 300, display: 'block' }}>
                {value}
              </span>
            );
          }}
        />

        <Table.Column
          dataIndex="location"
          title={translate('clubRequest.fields.location')}
          sorter={textSorter<IClubRequest>('location')}
          render={(value: string | null) => value || '-'}
        />

        <Table.Column
          dataIndex="currentMemberCount"
          title={translate('clubRequest.fields.currentMemberCount')}
          width={140}
          align="center"
          sorter={numberSorter<IClubRequest>('currentMemberCount')}
        />

        <Table.Column
          dataIndex="isPrivate"
          title={translate('clubRequest.fields.isPrivate')}
          width={100}
          align="center"
          render={(value: boolean) => (
            <Tag color={value ? 'red' : 'green'}>
              {value ? '🔒 Private' : '🌐 Public'}
            </Tag>
          )}
          sorter={booleanSorter<IClubRequest>('isPrivate')}
        />

        <Table.Column
          dataIndex={['requestor', 'username']}
          title={translate('clubRequest.fields.requestedBy')}
          sorter={textSorter<IClubRequest>(['requestor', 'username'])}
          render={(value: string, record: IClubRequest) => (
            <div>
              <div>{value || 'Unknown'}</div>
              {record.requestor?.email && (
                <div style={{ fontSize: '12px', color: '#888' }}>
                  {record.requestor.email}
                </div>
              )}
            </div>
          )}
        />

        <Table.Column
          dataIndex="createdAt"
          title={translate('clubRequest.fields.createdAt')}
          width={180}
          render={(value: string) => new Date(value).toLocaleDateString()}
          sorter={dateSorter<IClubRequest>('createdAt')}
          defaultSortOrder="descend"
        />

        <Table.Column
          title={translate('table.actions')}
          dataIndex="actions"
          width={120}
          render={(_, record: IClubRequest) => (
            <Space>
              <ShowButton hideText size="small" recordItemId={record.id} />
              {(record.status === ClubRequestStatus.PENDING || record.status === ClubRequestStatus.REJECTED) && (
                <Button
                  type="default"
                  size="small"
                  icon={<EditOutlined />}
                  onClick={() => handleOpenModal(record)}
                />
              )}
            </Space>
          )}
        />
      </Table>

      {/* Review Modal */}
      <ReviewClubRequestModal
        open={isModalVisible}
        onClose={handleCloseModal}
        clubRequestId={selectedRecord?.id || ''}
        clubName={selectedRecord?.clubName}
        clubDescription={selectedRecord?.description}
        isPrivate={selectedRecord?.isPrivate}
        requestedBy={selectedRecord?.requestedBy}
        onSuccess={() => {
          handleCloseModal();
          invalidate({
            resource: 'clubRequest',
            invalidates: ['list'],
          });
        }}
      />
    </List>
  );
};

export const getServerSideProps: GetServerSideProps<{}> = async (context) => {
  return handleServerSideProps(context, '/clubRequest');
};

export default ClubRequestList;
