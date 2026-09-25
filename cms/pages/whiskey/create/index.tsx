import { Create, useForm } from '@refinedev/antd';
import { useTranslate, useList } from '@refinedev/core';
import { Checkbox, Form, Input, Select, Upload, UploadProps } from 'antd';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import {
  WhiskeyTypes,
  ProofTypes,
} from 'src/graphql-data-provider/utils/selectTypes';
import { CMSUserRole, ProofType, UserType } from 'src/graphql-data-provider/utils/graphQlTypes';
import { useMemo, useContext, useEffect, useState } from 'react';

import { UploadPictureMessage } from '@components/upload-picture-msg';
import { PermissionContext } from '@contexts';
import { handleServerSideProps } from '../../../src/utils/serverSideProps';

const WhiskeyCreate = () => {
  const translate = useTranslate();
  const router = useRouter();
  const { role, brandUserIds } = useContext(PermissionContext);
  const [proofType, setProofType] = useState<ProofType>(ProofType.NUMERIC);

  const { formProps, saveButtonProps, onFinish } = useForm({
    redirect: 'show',
  });

  // Build filters for brands based on user role
  const brandFilters = useMemo(() => {
    const filters: any[] = [
      {
        field: 'userType',
        operator: 'eq' as const,
        value: UserType.BRAND,
      },
    ];

    // If BrandOwner or BrandEditor, filter to only their brands
    if (
      (role === CMSUserRole.BrandOwner || role === CMSUserRole.BrandEditor) &&
      brandUserIds &&
      brandUserIds.length > 0
    ) {
      console.log(`Filtering brands for ${role}:`, brandUserIds);
      // Use OR operator to match any of the brand IDs
      filters.push({
        operator: 'or' as const,
        value: brandUserIds.map((brandId) => ({
          field: 'id',
          operator: 'eq' as const,
          value: brandId,
        })),
      });
    }

    return filters;
  }, [role, brandUserIds]);

  // Query brands using useList with role-based filters
  const { data: brandsData, isLoading: brandsLoading } = useList({
    resource: 'brand',
    pagination: { mode: 'off' },
    filters: brandFilters,
  });

  const props: UploadProps = {
    maxCount: 1,
    listType: 'picture',
    accept: 'image/png, image/jpeg, image/jpg, image/webp',
  };

  // Custom onFinish - handles brand name mapping and form value processing
  const handleFinish = (values: any) => {
    // IF YOU'RE READING THIS: This function is left over from before where we needed to map brand names. I have left it here in case we need to do any processing in the future, or you need to debug the form submission/values.

    return onFinish(values);
  };

  // Prepare brand options for Select - using brandId as value and brand name as label
  const brandOptions = useMemo(() => {
    if (brandsLoading || !brandsData?.data) return [];
    console.log('Brand data sample:', brandsData.data[0]); // Debug log to see structure
    return brandsData.data.map((brand: any) => ({
      label:
        brand.brandName || brand.name || brand.brandname || 'Unknown Brand',
      value: brand.id, // Use brandId as the value
    }));
  }, [brandsData, brandsLoading]);

  // Set the brand ID from query parameter if provided
  useEffect(() => {
    const { brandId } = router.query;
    if (brandId && formProps.form && brandOptions.length > 0) {
      // Check if the brandId is in the available options (for permission checking)
      const brandExists = brandOptions.some(
        (option) => option.value === brandId
      );
      if (brandExists) {
        formProps.form.setFieldsValue({
          brandId,
        });
      }
    }
  }, [router.query, formProps.form, brandOptions]);

  return (
    <Create saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical" onFinish={handleFinish}>
        <Form.Item
          label={translate('whiskey.fields.picture')}
          name={['picture']}
        >
          <Upload.Dragger name="picture" {...props}>
            <UploadPictureMessage />
          </Upload.Dragger>
        </Form.Item>

        <Form.Item
          label={translate('whiskey.fields.brandPicture')}
          name={['brandPicture']}
        >
          <Upload.Dragger name="brandPicture" {...props}>
            <UploadPictureMessage />
          </Upload.Dragger>
        </Form.Item>

        <Form.Item
          label={translate('whiskey.fields.name')}
          name={['name']}
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label={translate('whiskey.fields.brand')}
          name={['brandId']}
          rules={[
            {
              required: true,
              message: 'Please select a brand',
            },
          ]}
        >
          <Select
            placeholder={
              (role === CMSUserRole.BrandOwner || role === CMSUserRole.BrandEditor) &&
              (!brandUserIds || brandUserIds.length === 0)
                ? 'No brands assigned to your account'
                : 'Select a brand...'
            }
            options={brandOptions}
            showSearch
            filterOption={(input, option) =>
              option?.label?.toLowerCase().includes(input.toLowerCase()) ??
              false
            }
            disabled={
              (role === CMSUserRole.BrandOwner || role === CMSUserRole.BrandEditor) &&
              (!brandUserIds || brandUserIds.length === 0)
            }
            notFoundContent={
              brandsLoading
                ? 'Loading...'
                : (role === CMSUserRole.BrandOwner || role === CMSUserRole.BrandEditor) &&
                  (!brandUserIds || brandUserIds.length === 0)
                ? 'No brands assigned to your account. Please contact an administrator.'
                : 'No brands found'
            }
            style={{ width: '100%' }}
          />
        </Form.Item>

        <Form.Item
          label={translate('whiskey.fields.description')}
          name={['description']}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label={translate('whiskey.fields.specialistChoice')}
          name={['specialistChoice']}
          valuePropName="checked"
        >
          <Checkbox
            value={['specialistChoice']}
            disabled={role === CMSUserRole.BrandOwner || role === CMSUserRole.BrandEditor}
          />
          {(role === CMSUserRole.BrandOwner || role === CMSUserRole.BrandEditor) && (
            <div style={{ color: '#999', fontSize: '12px', marginTop: '4px' }}>
              Only administrators can set this field
            </div>
          )}
        </Form.Item>

        <Form.Item
          label={translate('whiskey.fields.starterPick')}
          name={['starterPick']}
          valuePropName="checked"
        >
          <Checkbox
            disabled={role === CMSUserRole.BrandOwner || role === CMSUserRole.BrandEditor}
          />
          {(role === CMSUserRole.BrandOwner || role === CMSUserRole.BrandEditor) && (
            <div style={{ color: '#999', fontSize: '12px', marginTop: '4px' }}>
              Only administrators can set this field
            </div>
          )}
        </Form.Item>

        <Form.Item
          label={translate('whiskey.fields.singleBarrel')}
          name={['singleBarrel']}
          valuePropName="checked"
        >
          <Checkbox />
        </Form.Item>

        <Form.Item label={translate('whiskey.fields.barrel')} name={['barrel']}>
          <Input />
        </Form.Item>

        <Form.Item
          label={translate('whiskey.fields.distillery')}
          name={['distillery']}
        >
          <Input />
        </Form.Item>

        <Form.Item label={translate('whiskey.fields.origin')} name={['origin']}>
          <Input />
        </Form.Item>

        <Form.Item label={translate('whiskey.fields.batch')} name={['batch']}>
          <Input />
        </Form.Item>

        <Form.Item label={translate('whiskey.fields.rick')} name={['rick']}>
          <Input />
        </Form.Item>

        <Form.Item label={translate('whiskey.fields.bottle')} name={['bottle']}>
          <Input />
        </Form.Item>

        <Form.Item
          label={translate('whiskey.fields.storePick')}
          name={['storePick']}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label={translate('whiskey.fields.type')}
          name={['type']}
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Select options={WhiskeyTypes} mode="multiple" allowClear />
        </Form.Item>

        <Form.Item
          label={translate('whiskey.fields.proofType')}
          name={['proofType']}
          initialValue={ProofType.NUMERIC}
        >
          <Select
            options={ProofTypes}
            onChange={(value) => {
              setProofType(value);
              // Clear proof value when switching to non-numeric type
              if (value !== ProofType.NUMERIC) {
                formProps.form?.setFieldsValue({ proof: undefined });
              }
            }}
          />
        </Form.Item>

        {proofType === ProofType.NUMERIC && (
          <Form.Item
            label={translate('whiskey.fields.proof')}
            name={['proof']}
            rules={[
              // Only validate as number when proofType is NUMERIC
              ({ getFieldValue }) => ({
                validator(_, value) {
                  const currentProofType = getFieldValue('proofType');

                  // Skip validation for non-NUMERIC proof types
                  if (currentProofType !== ProofType.NUMERIC) {
                    return Promise.resolve();
                  }

                  // For NUMERIC proof type, require a value
                  if (value === undefined || value === null || value === '') {
                    return Promise.reject(new Error('Proof is required'));
                  }

                  const numValue = Number(value);

                  if (isNaN(numValue)) {
                    return Promise.reject(new Error('Proof must be a valid number'));
                  }

                  if (numValue < 0 || numValue > 200) {
                    return Promise.reject(new Error('Proof must be between 0 and 200'));
                  }

                  return Promise.resolve();
                },
              }),
            ]}
          >
            <Input
              type="number"
              step="0.1"
              min="0"
              max="200"
              placeholder="e.g. 90"
            />
          </Form.Item>
        )}

        <Form.Item
          label={translate('whiskey.fields.calculatedRating')}
          name={['calculatedRating']}
        >
          <Input type="number" step="0.1" placeholder="e.g. 4" />
        </Form.Item>

        <Form.Item label={translate('whiskey.fields.age')} name={['age']}>
          <Input type="number" min="0" placeholder="e.g. 12" />
        </Form.Item>

        <Form.Item
          label={translate('whiskey.fields.distilleryTastingNotes')}
          name={['distilleryTastingNotes']}
        >
          <Input.TextArea
            rows={4}
            placeholder="Enter distillery tasting notes..."
            maxLength={500}
          />
        </Form.Item>
      </Form>
    </Create>
  );
};

export const getServerSideProps: GetServerSideProps<{}> = async (context) => {
  return handleServerSideProps(context, '/whiskey');
};

export default WhiskeyCreate;
