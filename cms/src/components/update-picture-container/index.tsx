import { CloseOutlined, DeleteOutlined } from '@ant-design/icons';
import { UploadPictureMessage } from '@components/upload-picture-msg';
import {
  Button,
  Col,
  Flex,
  Row,
  Image,
  Typography,
  Upload,
  UploadProps,
} from 'antd';
import { UploadChangeParam } from 'antd/es/upload';

const { Title } = Typography;

const uploadProps: UploadProps = {
  maxCount: 1,
  listType: 'picture',
  accept: 'image/png, image/jpeg, image/jpg, image/webp',
};

export const UpdatePictureContainer = ({
  currentPicture,
  onDeleteCurrentPicture,
  deleteDisabled,
  onRemoveUploadedPicture,
  onChangeDragger,
  noCurrentPicture = false,
}: {
  currentPicture?: string | undefined;
  onDeleteCurrentPicture?: () => void;
  deleteDisabled?: boolean;
  onRemoveUploadedPicture: () => void;
  onChangeDragger: (e: UploadChangeParam) => void;
  noCurrentPicture?: boolean;
}) => (
  <Row justify="space-around" style={{ marginBottom: 50 }}>
    <Col span={10}>
      <Title style={{ textAlign: 'center' }} level={5}>
        Choose a new picture:
      </Title>

      <Upload.Dragger
        name="picture"
        {...uploadProps}
        onChange={(e) => onChangeDragger(e)}
        onRemove={() => onRemoveUploadedPicture()}
      >
        <UploadPictureMessage />
      </Upload.Dragger>
    </Col>

    {!noCurrentPicture && (
      <Col span={10}>
        {' '}
        <Title style={{ textAlign: 'center' }} level={5}>
          Current picture:
        </Title>
        <Flex style={{ justifyContent: 'center', flexDirection: 'column' }}>
          {noCurrentPicture ? (
            <CloseOutlined style={{ alignSelf: 'center', color: 'red' }} />
          ) : (
            <>
              <Button
                danger
                style={{ alignSelf: 'center', marginBottom: 16 }}
                type="primary"
                shape="circle"
                icon={<DeleteOutlined />}
                disabled={deleteDisabled}
                onClick={() => {
                  if (onDeleteCurrentPicture) onDeleteCurrentPicture();
                }}
              />
              <Image
                wrapperStyle={{
                  maxWidth: '30%',
                  alignSelf: 'center',
                  marginBottom: 20,
                }}
                src={currentPicture}
              />
            </>
          )}
        </Flex>
      </Col>
    )}
  </Row>
);
