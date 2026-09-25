import { GetServerSideProps } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';

import { SearchOutlined, PlusOutlined } from '@ant-design/icons';
import {
  CreateButton,
  EditButton,
  List,
  ShowButton,
  useTable,
} from '@refinedev/antd';
import {
  BaseRecord,
  CrudFilters,
  IResourceComponentsProps,
  useTranslate,
} from '@refinedev/core';
import { Button, Form, Input, Space, Select, Table, Avatar, Tag } from 'antd';
import React, { useContext, useEffect, useState } from 'react';
import { PermissionContext } from '@contexts';
import { handleServerSideProps } from 'src/utils/serverSideProps';
import { booleanSorter, dateSorter, numberSorter, textSorter } from 'src/utils/tableSorters';
import { CMSUserRole, ClubRole } from 'src/graphql-data-provider/utils/graphQlTypes';
import { getObject } from 'src/graphql-data-provider/utils/s3';

interface IClubSearchValues {
  clubName?: string;
  privacy?: string;
}

interface IClubMember {
  id: string;
  role: ClubRole;
  userId: string;
  user: {
    id: string;
    username: string;
  };
}

interface IClub {
  id: string;
  clubName: string;
  searchName?: string;
  clubDetails?: string;
  coverPhoto?: string;
  profilePicture?: string;
  isPrivate: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  memberCount?: number;
  whiskeyCount?: number;
  pinnedPostId?: string;
  clubMembers?: {
    items: IClubMember[];
  };
}

const ownerUsername = (record: IClub) =>
  record.clubMembers?.items?.find(
    (member) => member.role === ClubRole.CLUBOWNERROLE
  )?.user?.username ?? '';

export const ClubsList: React.FC<IResourceComponentsProps> = () => {
  const translate = useTranslate();
  const router = useRouter();
  const { role } = useContext(PermissionContext);
  const [imageUrls, setImageUrls] = useState<{ [key: string]: string }>({});

  // Only Admin can access clubs management
  const canManageClubs = role === CMSUserRole.Admin;

  const { tableProps, searchFormProps, setFilters } = useTable<IClub>({
    resource: 'club',
    pagination: {
      mode: 'client',
    },
    syncWithLocation: false,
    onSearch: (data: unknown) => {
      const values = data as IClubSearchValues;
      const filters: CrudFilters = [];

      // Add search filter for clubName or searchName
      if (values?.clubName) {
        filters.push({
          field: 'searchName',
          operator: 'contains',
          value: values.clubName.toLowerCase(),
        });
      }

      // Add privacy filter - only add if explicitly 'public' or 'private'
      if (values?.privacy === 'public' || values?.privacy === 'private') {
        filters.push({
          field: 'isPrivate',
          operator: 'eq',
          value: values.privacy === 'private',
        });
      }

      return filters;
    },
  });

  // Apply filters based on current form values
  const applyFilters = (values: IClubSearchValues) => {
    const filters: CrudFilters = [];

    if (values?.clubName) {
      filters.push({
        field: 'searchName',
        operator: 'contains',
        value: values.clubName.toLowerCase(),
      });
    }

    if (values?.privacy === 'public' || values?.privacy === 'private') {
      filters.push({
        field: 'isPrivate',
        operator: 'eq',
        value: values.privacy === 'private',
      });
    }

    setFilters(filters, 'replace');
  };

  useEffect(() => {
    searchFormProps.form?.resetFields();
    searchFormProps.form?.submit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load signed URLs for profile pictures
  useEffect(() => {
    const loadImageUrls = async () => {
      const clubs = tableProps.dataSource || [];

      // Filter clubs that need URLs loaded (check against current state)
      setImageUrls(currentUrls => {
        const clubsNeedingUrls = clubs.filter(
          club => club.profilePicture && !currentUrls[club.id]
        );

        if (clubsNeedingUrls.length === 0) return currentUrls;

        // Fetch all URLs concurrently
        const urlPromises = clubsNeedingUrls.map(async club => {
          try {
            if (!club.profilePicture) return null;
            const signedUrl = await getObject(club.profilePicture);
            return { id: club.id, url: signedUrl };
          } catch (error) {
            console.error('Error loading image for club:', club.id, error);
            return null;
          }
        });

        Promise.all(urlPromises).then(results => {
          const urls: { [key: string]: string } = {};
          results.forEach(result => {
            if (result) urls[result.id] = result.url;
          });

          if (Object.keys(urls).length > 0) {
            setImageUrls(prev => ({ ...prev, ...urls }));
          }
        });

        return currentUrls;
      });
    };

    loadImageUrls();
  }, [tableProps.dataSource]);

  return (
    <List
      headerButtons={
        canManageClubs ? (
          <CreateButton
            resource="club"
            icon={<PlusOutlined />}
            onClick={() => router.push('/club/create')}
          >
            Create Club
          </CreateButton>
        ) : undefined
      }
    >
      <Form
        {...searchFormProps}
        layout="inline"
        onValuesChange={(_, allValues) => {
          applyFilters(allValues as IClubSearchValues);
        }}
      >
        <Form.Item name="clubName">
          <Input
            placeholder="Search by club name"
            prefix={<SearchOutlined />}
            allowClear
          />
        </Form.Item>
        <Form.Item name="privacy" initialValue="all">
          <Select style={{ width: 150 }}>
            <Select.Option value="all">All Privacy</Select.Option>
            <Select.Option value="public">Public</Select.Option>
            <Select.Option value="private">Private</Select.Option>
          </Select>
        </Form.Item>
      </Form>

      <Table {...tableProps} rowKey="id" style={{ marginTop: 16 }}>
        <Table.Column
          dataIndex="id"
          title="ID"
          width={100}
          render={(value) => (
            <span title={value}>{value.substring(0, 8)}...</span>
          )}
        />
        <Table.Column
          dataIndex="profilePicture"
          title="Picture"
          width={80}
          render={(value, record: IClub) => {
            // Use the signed URL from state if available
            const imageUrl = imageUrls[record.id];

            return (
              <Avatar
                src={imageUrl}
                size={40}
                shape="circle"
                style={{ backgroundColor: '#1890ff' }}
              >
                {!imageUrl && (record.clubName?.charAt(0).toUpperCase() || 'C')}
              </Avatar>
            );
          }}
        />
        <Table.Column
          dataIndex="clubName"
          title="Club Name"
          sorter={textSorter<IClub>('clubName')}
          render={(value, record: IClub) => (
            <Link
              href={`/club/show/${record.id}`}
              style={{
                fontWeight: 600,
                color: '#1890ff',
                textDecoration: 'underline'
              }}
            >
              {value || 'Unnamed Club'}
            </Link>
          )}
        />
        <Table.Column
          dataIndex="isPrivate"
          title="Privacy"
          width={100}
          sorter={booleanSorter<IClub>('isPrivate')}
          render={(value) => (
            <Tag color={value ? 'orange' : 'green'}>
              {value ? '🔒 Private' : '🌐 Public'}
            </Tag>
          )}
        />
        <Table.Column
          dataIndex="clubMembers"
          title="Owner"
          width={150}
          sorter={textSorter<IClub>(ownerUsername)}
          render={(_, record: IClub) => {
            const username = ownerUsername(record);

            if (!username) {
              return <span style={{ color: '#999' }}>-</span>;
            }

            return <div>{username}</div>;
          }}
        />
        <Table.Column
          dataIndex="memberCount"
          title="# Users"
          width={80}
          sorter={numberSorter<IClub>('memberCount')}
          render={(value) => value || 0}
        />
        <Table.Column
          dataIndex="createdAt"
          title="Created"
          width={120}
          sorter={dateSorter<IClub>('createdAt')}
          render={(value) =>
            value ? new Date(value).toLocaleDateString() : '-'
          }
        />
        <Table.Column
          title={translate('table.actions')}
          dataIndex="actions"
          width={120}
          render={(_, record: BaseRecord) => {
            return (
              <Space style={{ alignItems: 'center' }}>
                <ShowButton
                  hideText
                  size="small"
                  recordItemId={record.id}
                  resource="club"
                />
                {canManageClubs && (
                  <EditButton
                    hideText
                    size="small"
                    recordItemId={record.id}
                    resource="club"
                  />
                )}
              </Space>
            );
          }}
        />
      </Table>
    </List>
  );
};

export const getServerSideProps: GetServerSideProps<{}> = async (context) => {
  return handleServerSideProps(context, '/club');
};

export default ClubsList;
