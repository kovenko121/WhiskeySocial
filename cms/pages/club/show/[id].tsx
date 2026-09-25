import { GetServerSideProps } from 'next';
import { EditButton, Show, useSelect } from '@refinedev/antd';
import { useCustomMutation, useList, useShow } from '@refinedev/core';
import {
  Image,
  Typography,
  Descriptions,
  Card,
  Table,
  Tag,
  Space,
  Button,
  Tooltip,
  Divider,
  message,
  Statistic,
  Row,
  Col,
  Modal,
  Form,
  Select,
  Spin,
  Avatar,
} from 'antd';
import Icon, {
  ReloadOutlined,
  ExclamationCircleOutlined,
  TeamOutlined,
  LockOutlined,
  UnlockOutlined,
  FileTextOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  StopOutlined,
  UserAddOutlined,
} from '@ant-design/icons';
import { faWhiskeyGlass } from '@fortawesome/free-solid-svg-icons';
import { useContext, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { PermissionContext } from '@contexts';
import { getObject } from '../../../src/graphql-data-provider/utils/s3';
import { handleServerSideProps } from 'src/utils/serverSideProps';
import {
  CMSUserRole,
  ClubRole,
  MemberStatus,
  UserType,
} from 'src/graphql-data-provider/utils/graphQlTypes';
import { RemoveMemberModals } from '../../../src/components/club/RemoveMemberModals';
import { DeleteClubModal } from '../../../src/components/club/DeleteClubModal';

const { Title, Text } = Typography;

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

const createClubMemberMutation = `
        mutation CreateClubMember($input: CreateClubMemberInput!) {
          createClubMember(input: $input) {
            id
            clubId
            userId
            role
            status
            joinedAt
            requestedAt
          }
        }
      `;

const ClubShow = () => {
  const router = useRouter();
  const { role } = useContext(PermissionContext);

  // State for images
  const [coverPhoto, setCoverPhoto] = useState<string | undefined>();
  const [profilePicture, setProfilePicture] = useState<string | undefined>();

  // Fetch club data
  const { queryResult } = useShow({
    resource: 'club',
    meta: {
      refetchOnWindowFocus: true,
    },
  });
  const { data, isLoading, refetch } = queryResult;
  const record = data?.data;

  const { mutate } = useCustomMutation();

  // Check if user can manage clubs (Admin only)
  const canManageClubs = role === CMSUserRole.Admin;

  // Fetch club posts for post count statistics
  const {
    data: postsData,
    isLoading: postsLoading,
    refetch: refetchPosts,
  } = useList({
    resource: 'post',
    filters: [
      {
        field: 'clubId',
        operator: 'eq',
        value: record?.id,
      },
    ],
    pagination: {
      mode: 'off',
    },
    queryOptions: {
      enabled: !!record?.id,
    },
  });

  // Calculate post count
  const postCount = postsData?.data?.length || 0;

  // Fetch all club members using useList
  const {
    data: membersData,
    isLoading: membersLoading,
    refetch: refetchMembers,
  } = useList<IClubMember>({
    resource: 'clubMember',
    filters: [
      {
        field: 'clubId',
        operator: 'eq',
        value: record?.id,
      },
    ],
    pagination: {
      mode: 'off',
    },
    queryOptions: {
      enabled: !!record?.id,
    },
  });

  // Get all members from the response
  const allMembers = (membersData?.data || []) as IClubMember[];

  // Calculate statistics for all members in a single iteration
  const memberStats = allMembers.reduce(
    (stats, member) => {
      stats.total++;
      if (member.status === MemberStatus.ACTIVE) stats.active++;
      else if (member.status === MemberStatus.PENDING) stats.pending++;
      else if (member.status === MemberStatus.BLOCKED) stats.blocked++;
      return stats;
    },
    { total: 0, active: 0, pending: 0, blocked: 0 }
  );

  // State for member modals
  const [isEditMemberModalVisible, setIsEditMemberModalVisible] =
    useState(false);
  const [isRemoveMemberModalVisible, setIsRemoveMemberModalVisible] =
    useState(false);
  const [selectedMember, setSelectedMember] = useState<IClubMember | null>(
    null
  );

  // Form for editing member
  const [editMemberForm] = Form.useForm();

  // State for Add Member Modal
  const [isAddMemberModalVisible, setIsAddMemberModalVisible] = useState(false);
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [addMemberForm] = Form.useForm();

  // State for Delete Club Modal
  const [isDeleteClubModalVisible, setIsDeleteClubModalVisible] =
    useState(false);

  // User search for Add Member modal
  const { selectProps: userSelectProps, queryResult: userQueryResult } =
    useSelect({
      resource: 'user',
      optionLabel: 'username',
      optionValue: 'id',
      debounce: 500,
      filters: [
        {
          field: 'userType',
          operator: 'eq',
          value: UserType.PERSON,
        },
      ],
      onSearch: (value) => [
        {
          field: 'userType',
          operator: 'eq',
          value: UserType.PERSON,
        },
        {
          field: 'username',
          operator: 'contains',
          value,
        },
      ],
      queryOptions: {
        enabled: isAddMemberModalVisible && !!record?.id,
      },
    });

  // Filter out users who are already club members
  const availableUsers = useMemo(() => {
    if (!userQueryResult?.data?.data) return [];
    const existingMemberUserIds = allMembers.map((m) => m.userId);
    return userQueryResult.data.data.filter(
      (user: any) => !existingMemberUserIds.includes(user.id)
    );
  }, [userQueryResult?.data?.data, allMembers]);

  // Handle Edit Member
  const handleEditMember = async () => {
    if (!selectedMember) return;

    try {
      const values = await editMemberForm.validateFields();

      const updateClubMemberMutation = `
        mutation UpdateClubMember($input: UpdateClubMemberInput!) {
          updateClubMember(input: $input) {
            id
            role
            status
            joinedAt
            updatedAt
          }
        }
      `;

      // Set joinedAt when status changes from PENDING to ACTIVE
      const isBecomingActive =
        selectedMember.status === MemberStatus.PENDING &&
        values.status === MemberStatus.ACTIVE;

      mutate(
        {
          url: '',
          method: 'post',
          meta: {
            query: updateClubMemberMutation,
            queryName: 'updateClubMember',
            variables: {
              input: {
                id: selectedMember.id,
                role: values.role,
                status: values.status,
                ...(isBecomingActive && { joinedAt: new Date().toISOString() }),
              },
            },
          },
          values: {},
        },
        {
          onSuccess: () => {
            message.success('Member updated successfully');
            setIsEditMemberModalVisible(false);
            setSelectedMember(null);
            editMemberForm.resetFields();
            refetchMembers();
          },
          onError: (error: any) => {
            console.error('Error updating member:', error);
            message.error(error?.message || 'Failed to update member');
          },
        }
      );
    } catch (error) {
      console.error('Form validation failed:', error);
    }
  };

  // Show Edit Member Modal
  const showEditMemberModal = (member: IClubMember) => {
    setSelectedMember(member);
    editMemberForm.setFieldsValue({
      role: member.role,
      status: member.status,
    });
    setIsEditMemberModalVisible(true);
  };

  // Show Remove Member Modal
  const showRemoveMemberModal = (member: IClubMember) => {
    setSelectedMember(member);
    setIsRemoveMemberModalVisible(true);
  };

  // Handle Add Member
  const handleAddMember = async () => {
    if (isAddingMember) return;

    try {
      const values = await addMemberForm.validateFields();

      setIsAddingMember(true);

      const now = new Date().toISOString();

      // Note: joinedAt is set only when status is ACTIVE.
      // If a member is added as PENDING and later changed to ACTIVE via edit,
      mutate(
        {
          url: '',
          method: 'post',
          meta: {
            query: createClubMemberMutation,
            queryName: 'createClubMember',
            variables: {
              input: {
                clubId: record?.id,
                userId: values.userId,
                role: values.role,
                status: values.status,
                joinedAt: values.status === MemberStatus.ACTIVE ? now : null,
                requestedAt: now,
              },
            },
          },
          values: {},
        },
        {
          onSuccess: () => {
            message.success('Member added successfully');
            setIsAddMemberModalVisible(false);
            addMemberForm.resetFields();
            setIsAddingMember(false);
            refetchMembers();
          },
          onError: (error: any) => {
            console.error('Error adding member:', error);
            message.error(error?.message || 'Failed to add member');
            setIsAddingMember(false);
          },
        }
      );
    } catch (error) {
      console.error('Form validation failed:', error);
      setIsAddingMember(false);
    }
  };

  // Render role badge
  const renderRoleBadge = (memberRole: ClubRole) => {
    const roleConfig: Record<ClubRole, { color: string; text: string }> = {
      [ClubRole.CLUBOWNERROLE]: { color: 'red', text: 'Owner' },
      [ClubRole.CLUBADMINROLE]: { color: 'blue', text: 'Admin' },
      [ClubRole.CLUBMEMBERROLE]: { color: 'green', text: 'Member' },
    };
    const config = roleConfig[memberRole] || {
      color: 'default',
      text: memberRole,
    };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  // Render status badge
  const renderStatusBadge = (status: MemberStatus) => {
    const statusConfig: Record<
      MemberStatus,
      { color: string; icon: React.ReactNode; text: string }
    > = {
      [MemberStatus.ACTIVE]: {
        color: 'success',
        icon: <CheckCircleOutlined />,
        text: 'Active',
      },
      [MemberStatus.PENDING]: {
        color: 'warning',
        icon: <ClockCircleOutlined />,
        text: 'Pending',
      },
      [MemberStatus.BLOCKED]: {
        color: 'error',
        icon: <StopOutlined />,
        text: 'Blocked',
      },
    };
    const config = statusConfig[status] || {
      color: 'default',
      icon: null,
      text: status,
    };
    return (
      <Tag color={config.color} icon={config.icon}>
        {config.text}
      </Tag>
    );
  };

  // S3 Image loading functions
  const getCoverPhoto = async (key: string) => {
    const result = await getObject(key);
    setCoverPhoto(result);
  };

  const getProfilePicture = async (key: string) => {
    const result = await getObject(key);
    setProfilePicture(result);
  };

  // Load images when record changes
  useEffect(() => {
    // Clear previous images to avoid stale data
    setCoverPhoto(undefined);
    setProfilePicture(undefined);

    if (record && record.coverPhoto) {
      getCoverPhoto(record.coverPhoto);
    }
    if (record && record.profilePicture) {
      getProfilePicture(record.profilePicture);
    }
  }, [record]);

  // Toggle Privacy Handler
  const handleTogglePrivacy = async () => {
    if (!record?.id) return;

    const updateClubMutation = `
      mutation UpdateClub($input: UpdateClubInput!) {
        updateClub(input: $input) {
          id
          isPrivate
          updatedAt
        }
      }
    `;

    mutate(
      {
        url: '',
        method: 'post',
        meta: {
          query: updateClubMutation,
          queryName: 'updateClub',
          variables: {
            input: {
              id: record.id,
              isPrivate: !record.isPrivate,
            },
          },
        },
        values: {},
      },
      {
        onSuccess: () => {
          message.success(
            `Club is now ${record.isPrivate ? 'Public' : 'Private'}`
          );
          refetch();
        },
        onError: (error: any) => {
          console.error('Error toggling privacy:', error);
          message.error('Failed to update privacy setting');
        },
      }
    );
  };

  return (
    <Show
      isLoading={isLoading}
      title={`Club: ${record?.clubName || 'View Club'}`}
      headerButtons={({ editButtonProps }) => (
        <>
          <Tooltip title="Refresh data">
            <Button
              icon={<ReloadOutlined />}
              onClick={() => {
                refetch();
                refetchPosts();
                refetchMembers();
              }}
            >
              Refresh
            </Button>
          </Tooltip>

          {canManageClubs && record && (
            <>
              {editButtonProps && (
                <EditButton {...editButtonProps} resource="club" />
              )}

              <Tooltip
                title={
                  record.isPrivate ? 'Make club public' : 'Make club private'
                }
              >
                <Button
                  type="default"
                  icon={
                    record.isPrivate ? <UnlockOutlined /> : <LockOutlined />
                  }
                  onClick={handleTogglePrivacy}
                >
                  {record.isPrivate ? 'Make Public' : 'Make Private'}
                </Button>
              </Tooltip>
            </>
          )}
        </>
      )}
    >
      {/* Permission Check */}
      {!canManageClubs ? (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <ExclamationCircleOutlined
            style={{ fontSize: '48px', color: '#faad14', marginBottom: '16px' }}
          />
          <h2>Access Denied</h2>
          <p>Only administrators can view and manage clubs.</p>
        </div>
      ) : (
        <>
          {/* Cover Photo Section */}
          <Title level={5}>Club Cover Photo</Title>
          {coverPhoto ? (
            <Image
              style={{
                width: '100%',
                maxHeight: '400px',
                objectFit: 'cover',
                marginBottom: '20px',
                borderRadius: '8px',
              }}
              src={coverPhoto}
              alt="Club Cover"
            />
          ) : record?.coverPhoto ? (
            <div style={{ marginBottom: '20px', color: '#999' }}>
              Loading cover photo...
            </div>
          ) : (
            <div
              style={{
                width: '100%',
                height: '200px',
                backgroundColor: '#f0f0f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '20px',
                borderRadius: '8px',
                color: '#999',
              }}
            >
              No cover photo available
            </div>
          )}

          {/* Profile Picture and Club Name Card */}
          <Card style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
              <div style={{ width: '120px', height: '120px' }}>
                {profilePicture ? (
                  <Image
                    style={{
                      width: '120px',
                      height: '120px',
                      objectFit: 'cover',
                      borderRadius: '50%',
                    }}
                    src={profilePicture}
                    alt="Club Profile"
                  />
                ) : record?.profilePicture ? (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: '100%',
                      color: '#999',
                    }}
                  >
                    Loading...
                  </div>
                ) : (
                  <div
                    style={{
                      width: '120px',
                      height: '120px',
                      backgroundColor: '#1890ff',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      fontSize: '48px',
                      fontWeight: 'bold',
                    }}
                  >
                    {record?.clubName?.charAt(0).toUpperCase() || 'C'}
                  </div>
                )}
              </div>
              <div style={{ flex: 1 }}>
                <Space direction="vertical" size="small">
                  <div>
                    <Title level={2} style={{ margin: 0 }}>
                      {record?.clubName || 'Unnamed Club'}
                    </Title>
                  </div>
                  <div>
                    <Tag
                      color={record?.isPrivate ? 'orange' : 'green'}
                      style={{ fontSize: '14px' }}
                    >
                      {record?.isPrivate ? 'Private Club' : 'Public Club'}
                    </Tag>
                  </div>
                </Space>
              </div>
            </div>
          </Card>

          {/* Statistics Cards */}
          <Row gutter={16} style={{ marginBottom: '20px' }}>
            <Col span={8}>
              <Card>
                <Statistic
                  title="Total Members"
                  value={record?.memberCount || 0}
                  prefix={<TeamOutlined />}
                  valueStyle={{ color: '#3f8600' }}
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card>
                <Statistic
                  title="Total Posts"
                  value={postCount}
                  loading={postsLoading}
                  prefix={<FileTextOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card>
                <Statistic
                  title="Whiskeys"
                  value={record?.whiskeyCount || 0}
                  prefix={<WhiskeyGlassIcon />}
                  valueStyle={{ color: '#cf1322' }}
                />
              </Card>
            </Col>
          </Row>

          {/* Club Details */}
          <Descriptions bordered column={2} style={{ marginBottom: '20px' }}>
            <Descriptions.Item label="Club ID" span={2}>
              <Text copyable>{record?.id}</Text>
            </Descriptions.Item>

            <Descriptions.Item label="Club Name" span={2}>
              {record?.clubName || '-'}
            </Descriptions.Item>

            <Descriptions.Item label="Description" span={2}>
              <div style={{ whiteSpace: 'pre-wrap' }}>
                {record?.clubDetails || '-'}
              </div>
            </Descriptions.Item>

            <Descriptions.Item label="Privacy Status">
              <Tag color={record?.isPrivate ? 'orange' : 'green'}>
                {record?.isPrivate ? 'Private' : 'Public'}
              </Tag>
            </Descriptions.Item>

            <Descriptions.Item label="Pinned Post">
              {record?.pinnedPostId ? (
                <Text copyable>{record.pinnedPostId}</Text>
              ) : (
                <Text type="secondary">No pinned post</Text>
              )}
            </Descriptions.Item>

            <Descriptions.Item label="Created At">
              {record?.createdAt
                ? new Date(record.createdAt).toLocaleString()
                : '-'}
            </Descriptions.Item>

            <Descriptions.Item label="Updated At">
              {record?.updatedAt
                ? new Date(record.updatedAt).toLocaleString()
                : '-'}
            </Descriptions.Item>
          </Descriptions>

          {/* Club Members Section */}
          <Divider orientation="left">Club Members</Divider>
          <Card>
            {canManageClubs && (
              <div style={{ marginBottom: '16px', textAlign: 'right' }}>
                <Button
                  type="primary"
                  icon={<UserAddOutlined />}
                  onClick={() => setIsAddMemberModalVisible(true)}
                >
                  Add Member
                </Button>
              </div>
            )}
            {membersLoading ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <Spin size="large" />
                <div style={{ marginTop: '16px', color: '#999' }}>
                  Loading members...
                </div>
              </div>
            ) : (
              <>
                {/* Statistics Summary */}
                <Row gutter={16} style={{ marginBottom: '16px' }}>
                  <Col span={6}>
                    <Statistic
                      title="Total"
                      value={memberStats.total}
                      valueStyle={{ fontSize: '20px' }}
                    />
                  </Col>
                  <Col span={6}>
                    <Statistic
                      title="Active"
                      value={memberStats.active}
                      valueStyle={{ fontSize: '20px', color: '#52c41a' }}
                    />
                  </Col>
                  <Col span={6}>
                    <Statistic
                      title="Pending"
                      value={memberStats.pending}
                      valueStyle={{ fontSize: '20px', color: '#faad14' }}
                    />
                  </Col>
                  <Col span={6}>
                    <Statistic
                      title="Blocked"
                      value={memberStats.blocked}
                      valueStyle={{ fontSize: '20px', color: '#ff4d4f' }}
                    />
                  </Col>
                </Row>

                {allMembers.length > 0 ? (
                  <Table
                    dataSource={allMembers}
                    rowKey="id"
                    size="small"
                    pagination={{ pageSize: 10 }}
                  >
                    <Table.Column
                      title="Username"
                      dataIndex={['user', 'username']}
                      render={(username: string, member: IClubMember) => (
                        <div>
                          <Text strong>@{username || 'Unknown'}</Text>
                          {member.user?.personFullName && (
                            <div style={{ fontSize: '12px', color: '#999' }}>
                              {member.user.personFullName}
                            </div>
                          )}
                        </div>
                      )}
                    />

                    <Table.Column
                      title="Role"
                      dataIndex="role"
                      width={100}
                      render={(memberRole: ClubRole) =>
                        renderRoleBadge(memberRole)
                      }
                      filters={[
                        { text: 'Owner', value: ClubRole.CLUBOWNERROLE },
                        { text: 'Admin', value: ClubRole.CLUBADMINROLE },
                        { text: 'Member', value: ClubRole.CLUBMEMBERROLE },
                      ]}
                      onFilter={(value: any, member: IClubMember) =>
                        member.role === value
                      }
                    />

                    <Table.Column
                      title="Status"
                      dataIndex="status"
                      width={100}
                      render={(status: MemberStatus) =>
                        renderStatusBadge(status)
                      }
                      filters={[
                        { text: 'Active', value: MemberStatus.ACTIVE },
                        { text: 'Pending', value: MemberStatus.PENDING },
                        { text: 'Blocked', value: MemberStatus.BLOCKED },
                      ]}
                      onFilter={(value: any, member: IClubMember) =>
                        member.status === value
                      }
                    />

                    <Table.Column
                      title="Joined"
                      dataIndex="joinedAt"
                      width={120}
                      render={(date: string) =>
                        date ? new Date(date).toLocaleDateString() : '-'
                      }
                      sorter={(a: IClubMember, b: IClubMember) => {
                        if (!a.joinedAt) return 1;
                        if (!b.joinedAt) return -1;
                        return (
                          new Date(a.joinedAt).getTime() -
                          new Date(b.joinedAt).getTime()
                        );
                      }}
                    />

                    {canManageClubs && (
                      <Table.Column
                        title="Actions"
                        width={100}
                        render={(_, member: IClubMember) => (
                          <Space>
                            <Tooltip title="Edit member">
                              <Button
                                size="small"
                                icon={<EditOutlined />}
                                onClick={() => showEditMemberModal(member)}
                              />
                            </Tooltip>
                            <Tooltip title="Remove member">
                              <Button
                                size="small"
                                danger
                                icon={<DeleteOutlined />}
                                onClick={() => showRemoveMemberModal(member)}
                              />
                            </Tooltip>
                          </Space>
                        )}
                      />
                    )}
                  </Table>
                ) : (
                  <div
                    style={{
                      textAlign: 'center',
                      padding: '20px',
                      color: '#999',
                    }}
                  >
                    No members found for this club
                  </div>
                )}
              </>
            )}
          </Card>

          {/* Delete Club Section */}
          {canManageClubs && (
            <>
              <Divider orientation="left" style={{ marginTop: '40px' }}>
                Delete Club
              </Divider>
              <Card style={{ marginTop: '16px' }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <Text strong>Delete this club</Text>
                    <div style={{ color: '#666', marginTop: '4px' }}>
                      Once deleted, this club and all its data cannot be recovered.
                    </div>
                  </div>
                  <Button
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => setIsDeleteClubModalVisible(true)}
                  >
                    Delete Club
                  </Button>
                </div>
              </Card>
            </>
          )}
        </>
      )}

      {/* Edit Member Modal */}
      <Modal
        title="Edit Club Member"
        open={isEditMemberModalVisible}
        onOk={handleEditMember}
        onCancel={() => {
          setIsEditMemberModalVisible(false);
          setSelectedMember(null);
          editMemberForm.resetFields();
        }}
        okText="Update Member"
        cancelText="Cancel"
        width={400}
      >
        {selectedMember && (
          <>
            {/* Member Information Header */}
            <div style={{ marginBottom: '16px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '8px',
                }}
              >
                <Avatar size={48} style={{ backgroundColor: '#1890ff' }}>
                  {selectedMember.user?.username?.charAt(0).toUpperCase() ||
                    '?'}
                </Avatar>
                <div>
                  <Text strong style={{ fontSize: '16px' }}>
                    @{selectedMember.user?.username || 'Unknown User'}
                  </Text>
                  {selectedMember.user?.personFullName && (
                    <div style={{ fontSize: '12px', color: '#999' }}>
                      {selectedMember.user.personFullName}
                    </div>
                  )}
                </div>
              </div>

              {/* User ID */}
              <div style={{ marginTop: '8px' }}>
                <Text
                  type="secondary"
                  style={{ fontSize: '12px' }}
                  copyable={{ text: selectedMember.userId }}
                >
                  ID: {selectedMember.userId}
                </Text>
              </div>

              {/* Current Role Badge */}
              {selectedMember.role === ClubRole.CLUBOWNERROLE && (
                <div style={{ marginTop: '8px' }}>
                  <Tag color="red">Owner - Role cannot be changed</Tag>
                </div>
              )}
            </div>

            <Divider style={{ margin: '12px 0' }} />

            <Form form={editMemberForm} layout="vertical">
              <Form.Item
                label="Role"
                name="role"
                rules={[{ required: true, message: 'Please select a role' }]}
              >
                <Select
                  disabled={selectedMember.role === ClubRole.CLUBOWNERROLE}
                >
                  <Select.Option value={ClubRole.CLUBADMINROLE}>
                    Admin
                  </Select.Option>
                  <Select.Option value={ClubRole.CLUBMEMBERROLE}>
                    Member
                  </Select.Option>
                </Select>
              </Form.Item>
              <Form.Item
                label="Status"
                name="status"
                rules={[{ required: true, message: 'Please select a status' }]}
              >
                <Select>
                  <Select.Option value={MemberStatus.ACTIVE}>
                    Active
                  </Select.Option>
                  <Select.Option value={MemberStatus.PENDING}>
                    Pending
                  </Select.Option>
                  <Select.Option value={MemberStatus.BLOCKED}>
                    Blocked
                  </Select.Option>
                </Select>
              </Form.Item>
            </Form>

            <Divider style={{ margin: '12px 0' }} />

            {/* Membership Dates */}
            <div style={{ fontSize: '12px', color: '#999' }}>
              <div>
                <strong>Joined:</strong>{' '}
                {selectedMember.joinedAt
                  ? new Date(selectedMember.joinedAt).toLocaleDateString()
                  : 'Not yet joined'}
              </div>
              {selectedMember.requestedAt && (
                <div>
                  <strong>Requested:</strong>{' '}
                  {new Date(selectedMember.requestedAt).toLocaleDateString()}
                </div>
              )}
            </div>
          </>
        )}
      </Modal>

      {/* Remove Member Modals */}
      <RemoveMemberModals
        visible={isRemoveMemberModalVisible}
        member={selectedMember}
        club={
          record
            ? { id: record.id as string, clubName: record.clubName as string }
            : null
        }
        allMembers={allMembers}
        onClose={() => {
          setIsRemoveMemberModalVisible(false);
          setSelectedMember(null);
        }}
        onSuccess={() => {
          refetchMembers();
        }}
        renderRoleBadge={renderRoleBadge}
        renderStatusBadge={renderStatusBadge}
      />

      {/* Add Member Modal */}
      <Modal
        title="Add Member to Club"
        open={isAddMemberModalVisible}
        onOk={handleAddMember}
        onCancel={() => {
          if (isAddingMember) return;
          setIsAddMemberModalVisible(false);
          addMemberForm.resetFields();
        }}
        okText="Add Member"
        cancelText="Cancel"
        width={500}
        okButtonProps={{ loading: isAddingMember, disabled: isAddingMember }}
        cancelButtonProps={{ disabled: isAddingMember }}
      >
        <Form
          form={addMemberForm}
          layout="vertical"
          initialValues={{
            role: ClubRole.CLUBMEMBERROLE,
            status: MemberStatus.ACTIVE,
          }}
        >
          <Form.Item
            label="Select User"
            name="userId"
            rules={[{ required: true, message: 'Please select a user' }]}
          >
            <Select
              showSearch
              placeholder="Search for user by username..."
              filterOption={false}
              loading={userQueryResult?.isLoading}
              onSearch={userSelectProps.onSearch}
              notFoundContent={
                userQueryResult?.isLoading ? (
                  <Spin size="small" />
                ) : availableUsers.length === 0 ? (
                  'No users found or all users are already members'
                ) : null
              }
            >
              {availableUsers.map((user: any) => (
                <Select.Option key={user.id} value={user.id}>
                  <Space>
                    <Avatar size="small">
                      {user.username?.charAt(0).toUpperCase() || '?'}
                    </Avatar>
                    <span>
                      <strong>@{user.username}</strong>
                      {user.personFullName && (
                        <span style={{ color: '#666', marginLeft: 8 }}>
                          ({user.personFullName})
                        </span>
                      )}
                    </span>
                  </Space>
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Role"
            name="role"
            rules={[{ required: true, message: 'Please select a role' }]}
          >
            <Select>
              <Select.Option value={ClubRole.CLUBADMINROLE}>
                Admin
              </Select.Option>
              <Select.Option value={ClubRole.CLUBMEMBERROLE}>
                Member
              </Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Initial Status"
            name="status"
            rules={[{ required: true, message: 'Please select a status' }]}
          >
            <Select>
              <Select.Option value={MemberStatus.ACTIVE}>Active</Select.Option>
              <Select.Option value={MemberStatus.PENDING}>
                Pending
              </Select.Option>
              <Select.Option value={MemberStatus.BLOCKED}>
                Blocked
              </Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* Delete Club Modal */}
      <DeleteClubModal
        visible={isDeleteClubModalVisible}
        club={
          record
            ? { id: record.id as string, clubName: record.clubName as string }
            : null
        }
        onClose={() => setIsDeleteClubModalVisible(false)}
        onSuccess={() => {
          router.push('/club');
        }}
      />
    </Show>
  );
};

export const getServerSideProps: GetServerSideProps<{}> = async (context) => {
  return handleServerSideProps(context, '/club');
};

export default ClubShow;
