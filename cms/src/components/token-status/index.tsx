import { Alert, Badge, Button, Card, Descriptions, Space } from 'antd';
import { ReloadOutlined, ClockCircleOutlined, CheckCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { useTokenManager } from '../../hooks/useTokenManager';

export const TokenStatus: React.FC<{ showDetails?: boolean }> = ({ showDetails = false }) => {
  const { tokenInfo, isRefreshing, forceRefresh, isAuthenticated } = useTokenManager();

  if (!isAuthenticated) {
    return showDetails ? (
      <Alert
        message="Not Authenticated"
        description="Please sign in to view token status"
        type="warning"
        showIcon
      />
    ) : null;
  }

  if (!tokenInfo) {
    return showDetails ? (
      <Alert
        message="No Token Information"
        description="Unable to retrieve token information"
        type="error"
        showIcon
      />
    ) : null;
  }

  const formatTime = (milliseconds: number) => {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  const getStatusBadge = () => {
    if (tokenInfo.isExpiring) {
      return <Badge status="warning" text="Expiring Soon" />;
    }
    return <Badge status="success" text="Valid" />;
  };

  const getStatusIcon = () => {
    if (tokenInfo.isExpiring) {
      return <ExclamationCircleOutlined style={{ color: '#faad14' }} />;
    }
    return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
  };

  if (!showDetails) {
    // Compact view for header/status bar
    return (
      <Space>
        {getStatusIcon()}
        <span style={{ fontSize: '12px', color: '#666' }}>
          {tokenInfo.isExpiring ? 'Token Expiring' : 'Token Valid'}
        </span>
      </Space>
    );
  }

  // Detailed view for debugging/admin
  return (
    <Card 
      title={
        <Space>
          <ClockCircleOutlined />
          Token Status
        </Space>
      }
      size="small"
      extra={
        <Button
          icon={<ReloadOutlined />}
          loading={isRefreshing}
          onClick={forceRefresh}
          size="small"
        >
          Refresh
        </Button>
      }
    >
      <Descriptions column={1} size="small">
        <Descriptions.Item label="Status">
          {getStatusBadge()}
        </Descriptions.Item>
        <Descriptions.Item label="Admin Access">
          <Badge 
            status={tokenInfo.hasAdminAccess ? "success" : "error"} 
            text={tokenInfo.hasAdminAccess ? "Yes" : "No"} 
          />
        </Descriptions.Item>
        <Descriptions.Item label="Groups">
          {tokenInfo.groups && tokenInfo.groups.length > 0 ? tokenInfo.groups.join(', ') : 'None'}
        </Descriptions.Item>
        <Descriptions.Item label="Expires In">
          <Space>
            <span>{formatTime(tokenInfo.expiresIn)}</span>
            {tokenInfo.isExpiring && (
              <ExclamationCircleOutlined style={{ color: '#faad14' }} />
            )}
          </Space>
        </Descriptions.Item>
      </Descriptions>
      
      {tokenInfo.isExpiring && (
        <Alert
          message="Token expiring soon"
          description="Your session will be refreshed automatically, but you can manually refresh if needed."
          type="warning"
          showIcon
          style={{ marginTop: 16 }}
        />
      )}
    </Card>
  );
};