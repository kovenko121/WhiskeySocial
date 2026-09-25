import { useList } from '@refinedev/core';
import { Form, Select } from 'antd';
import React, { useContext, useMemo } from 'react';

import { PermissionContext } from '@contexts';
import {
  CMSUserRole,
  UserType,
} from '../../graphql-data-provider/utils/graphQlTypes';

interface ParentBrandFieldProps {
  label: string;
  name?: string;
  initialValue?: string | string[];
}

const useBrandOptions = () => {
  const { role, brandUserIds } = useContext(PermissionContext);

  const filters = useMemo(() => {
    const brandFilters: any[] = [
      {
        field: 'userType',
        operator: 'eq' as const,
        value: UserType.BRAND,
      },
    ];

    if (
      (role === CMSUserRole.BrandOwner || role === CMSUserRole.BrandEditor) &&
      brandUserIds &&
      brandUserIds.length > 0
    ) {
      brandFilters.push({
        operator: 'or' as const,
        value: brandUserIds.map((brandId) => ({
          field: 'id',
          operator: 'eq' as const,
          value: brandId,
        })),
      });
    }

    return brandFilters;
  }, [role, brandUserIds]);

  const { data, isLoading } = useList({
    resource: 'brand',
    pagination: { mode: 'off' },
    filters,
  });

  const options = useMemo(() => {
    if (isLoading || !data?.data) return [];
    return data.data.map((brand: any) => ({
      label: brand.brandName || brand.name || 'Unknown Brand',
      value: brand.id,
    }));
  }, [data, isLoading]);

  const hasNoAssignedBrands =
    (role === CMSUserRole.BrandOwner || role === CMSUserRole.BrandEditor) &&
    (!brandUserIds || brandUserIds.length === 0);

  return { options, isLoading, hasNoAssignedBrands };
};

export const ParentBrandField: React.FC<ParentBrandFieldProps> = ({
  label,
  name = 'brandId',
  initialValue,
}) => {
  const { options, isLoading, hasNoAssignedBrands } = useBrandOptions();

  const placeholder = hasNoAssignedBrands
    ? 'No brands assigned to your account'
    : 'Select a brand...';

  const selectedBrandId = Array.isArray(initialValue)
    ? initialValue[0]
    : initialValue;

  return (
    <Form.Item
      label={label}
      name={[name]}
      initialValue={selectedBrandId}
      extra="Optional. Links this venue to a parent brand so it shows on the brand's page in the app."
    >
      <Select
        placeholder={placeholder}
        options={options}
        loading={isLoading}
        disabled={hasNoAssignedBrands}
        allowClear
        showSearch
        filterOption={(input, option) =>
          option?.label?.toLowerCase().includes(input.toLowerCase()) ?? false
        }
      />
    </Form.Item>
  );
};
