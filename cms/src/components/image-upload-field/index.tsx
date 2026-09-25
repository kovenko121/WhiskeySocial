import { DeleteOutlined } from '@ant-design/icons';
import { UploadPictureMessage } from '@components/upload-picture-msg';
import {
  Button,
  Card,
  Form,
  Image,
  Popconfirm,
  Tag,
  Typography,
  Upload,
  UploadProps,
} from 'antd';
import { UploadChangeParam, UploadFile } from 'antd/es/upload';
import { FormInstance } from 'antd/es/form';
import { useEffect, useState } from 'react';

const { Title } = Typography;

const uploadProps: UploadProps = {
  maxCount: 1,
  listType: 'picture',
  accept: 'image/png, image/jpeg, image/jpg, image/webp',
  beforeUpload: () => false, // Prevent auto upload, we handle it manually
};

/**
 * Props for the ImageUploadField component.
 *
 * @example
 * ```tsx
 * <ImageUploadField
 *   name="profilePicture"
 *   label="Profile Picture"
 *   currentImageUrl={signedS3Url}
 *   form={formProps.form}
 *   variant="circle"
 *   previewSize={{ width: 200, height: 200 }}
 * />
 * ```
 */
export interface ImageUploadFieldProps {
  /**
   * Form field name used for form state management.
   * Only single-level field names are supported (e.g., 'profilePicture' or ['profilePicture']).
   */
  name: string | string[];

  /**
   * Label displayed above the upload field.
   */
  label: string;

  /**
   * Current image URL (typically a signed S3 URL) to display as preview.
   * When provided, shows the existing image with a remove option.
   */
  currentImageUrl?: string;

  /**
   * Ant Design Form instance from useForm() hook.
   * Required for proper form state management when uploading/removing images.
   *
   * @example
   * ```tsx
   * const { formProps } = useForm();
   * <ImageUploadField form={formProps.form} ... />
   * ```
   */
  form: FormInstance;

  /**
   * Callback fired when the current image is removed via the remove button.
   * Use this to clear any local state holding the image URL.
   */
  onImageRemove?: () => void;

  /**
   * Callback fired when a new image is selected or the uploaded file is removed.
   * Receives the UploadFile object when a file is selected, or null when removed.
   */
  onImageChange?: (file: UploadFile | null) => void;

  /**
   * Display variant for the image preview.
   * - `'circle'`: Renders image with 50% border-radius (ideal for profile pictures)
   * - `'rectangle'`: Renders image with no border-radius (ideal for cover photos)
   *
   * @default 'rectangle'
   */
  variant?: 'circle' | 'rectangle';

  /**
   * Dimensions for the image preview.
   * For `'circle'` variant, width and height should be equal for proper rendering.
   *
   * @default { width: 200, height: 200 }
   */
  previewSize?: {
    width: number;
    height: number;
  };

  /**
   * Title for the remove confirmation popover.
   *
   * @default 'Remove Image'
   */
  removeConfirmTitle?: string;

  /**
   * Description text for the remove confirmation popover.
   *
   * @default 'Are you sure you want to remove this image?'
   */
  removeConfirmDescription?: string;
}

/**
 * A reusable image upload field component for Ant Design forms that properly handles
 * image preview, removal, and replacement workflows.
 *
 * ## Features
 * - Displays current image preview with configurable styling (circle or rectangle)
 * - Provides remove button with confirmation dialog
 * - Handles new image uploads that properly replace existing values
 * - Manages form state to ensure data provider receives correct format
 *
 * ## Why Use This Component
 * When using Ant Design's Upload component directly with forms, uploading a new image
 * doesn't properly replace the existing S3 key string value. This component ensures
 * the form value is explicitly set to the new file object structure, fixing the
 * "new image doesn't replace old image" bug.
 *
 * ## Usage
 * ```tsx
 * import { ImageUploadField } from '@components/image-upload-field';
 *
 * const MyEditForm = () => {
 *   const { formProps } = useForm();
 *   const [imageUrl, setImageUrl] = useState<string>();
 *
 *   return (
 *     <Form {...formProps}>
 *       <ImageUploadField
 *         name="profilePicture"
 *         label="Profile Picture"
 *         currentImageUrl={imageUrl}
 *         form={formProps.form!}
 *         onImageRemove={() => setImageUrl(undefined)}
 *         variant="circle"
 *       />
 *     </Form>
 *   );
 * };
 * ```
 *
 * @param props - {@link ImageUploadFieldProps}
 * @returns A Form.Item containing the image preview card and upload dragger
 */
export const ImageUploadField = ({
  name,
  label,
  currentImageUrl,
  form,
  onImageRemove,
  onImageChange,
  variant = 'rectangle',
  previewSize = { width: 200, height: 200 },
  removeConfirmTitle = 'Remove Image',
  removeConfirmDescription = 'Are you sure you want to remove this image?',
}: ImageUploadFieldProps) => {
  // Local state to track the preview URL (can be cleared when new image uploaded)
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(currentImageUrl);
  // Track if user has uploaded a new file (to hide old preview)
  const [hasNewUpload, setHasNewUpload] = useState(false);
  // Store the local blob URL for newly uploaded files
  const [newFilePreviewUrl, setNewFilePreviewUrl] = useState<string | undefined>();

  // Sync preview URL with prop when it changes (e.g., on initial load)
  useEffect(() => {
    if (currentImageUrl && !hasNewUpload) {
      setPreviewUrl(currentImageUrl);
    }
  }, [currentImageUrl, hasNewUpload]);

  // Cleanup blob URL when component unmounts or when new file changes
  useEffect(() => {
    return () => {
      if (newFilePreviewUrl) {
        URL.revokeObjectURL(newFilePreviewUrl);
      }
    };
  }, [newFilePreviewUrl]);

  const handleRemove = () => {
    // Clear the preview
    setPreviewUrl(undefined);
    setHasNewUpload(false);

    // Set form value to null to trigger removal in data provider
    const fieldName = Array.isArray(name) ? name : [name];
    form.setFieldsValue({
      [fieldName[0]]: null,
    });

    onImageRemove?.();
  };

  const handleUploadChange = (info: UploadChangeParam) => {
    const { fileList } = info;

    if (fileList.length > 0) {
      const uploadedFile = fileList[0];

      // Clear old preview and mark that we have a new upload
      setPreviewUrl(undefined);
      setHasNewUpload(true);

      // Generate a local blob URL for preview of the new file
      if (uploadedFile.originFileObj) {
        // Revoke old blob URL if exists
        if (newFilePreviewUrl) {
          URL.revokeObjectURL(newFilePreviewUrl);
        }
        const blobUrl = URL.createObjectURL(uploadedFile.originFileObj);
        setNewFilePreviewUrl(blobUrl);
      }

      // Explicitly set the form value to the new file object structure
      // This ensures the old string value is completely replaced
      const fieldName = Array.isArray(name) ? name : [name];
      form.setFieldsValue({
        [fieldName[0]]: {
          file: uploadedFile.originFileObj || uploadedFile,
          fileList: [uploadedFile],
        },
      });

      onImageChange?.(uploadedFile);
    }
  };

  const imageStyle = variant === 'circle'
    ? {
        width: previewSize.width,
        height: previewSize.height,
        objectFit: 'cover' as const,
        borderRadius: '50%',
      }
    : {
        maxWidth: previewSize.width,
        maxHeight: previewSize.height,
        objectFit: 'cover' as const,
      };

  // Show existing image preview if we have a URL and haven't uploaded a new file
  const showExistingPreview = previewUrl && !hasNewUpload;
  // Show new file preview if we have uploaded a new file and have a blob URL
  const showNewFilePreview = hasNewUpload && newFilePreviewUrl;

  // Handler to clear the new file (used in the new file preview card)
  const handleClearNewFile = () => {
    setHasNewUpload(false);
    if (newFilePreviewUrl) {
      URL.revokeObjectURL(newFilePreviewUrl);
      setNewFilePreviewUrl(undefined);
    }
    // Restore original image if exists
    if (currentImageUrl) {
      setPreviewUrl(currentImageUrl);
    }
    // Reset form field
    const fieldName = Array.isArray(name) ? name : [name];
    form.setFieldsValue({
      [fieldName[0]]: currentImageUrl ? undefined : null,
    });
    onImageChange?.(null);
  };

  return (
    <Form.Item label={label} name={Array.isArray(name) ? name : [name]}>
      {/* Show existing image preview */}
      {showExistingPreview && (
        <Card
          style={{ marginBottom: 16 }}
          actions={[
            <Popconfirm
              title={removeConfirmTitle}
              description={removeConfirmDescription}
              onConfirm={handleRemove}
              okText="Yes"
              cancelText="No"
              key="remove"
            >
              <Button type="text" danger icon={<DeleteOutlined />}>
                Remove
              </Button>
            </Popconfirm>,
          ]}
        >
          <Title level={5}>Image Preview</Title>
          <Image
            src={previewUrl}
            alt={label}
            style={imageStyle}
          />
        </Card>
      )}

      {/* Show new file preview */}
      {showNewFilePreview && (
        <Card
          style={{ marginBottom: 16 }}
          actions={[
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={handleClearNewFile}
              key="clear"
            >
              Clear
            </Button>,
          ]}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <Title level={5} style={{ margin: 0 }}>Image Preview</Title>
            <Tag color="orange">Unsaved</Tag>
          </div>
          <Image
            src={newFilePreviewUrl}
            alt={`New ${label}`}
            style={imageStyle}
          />
        </Card>
      )}

      <Upload.Dragger
        name={Array.isArray(name) ? name[0] : name}
        {...uploadProps}
        showUploadList={false}
        onChange={handleUploadChange}
      >
        <UploadPictureMessage />
      </Upload.Dragger>
    </Form.Item>
  );
};

export default ImageUploadField;
