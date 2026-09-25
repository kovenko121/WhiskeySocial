import { GetServerSideProps } from 'next';
import Link from 'next/link';

import {
  ClearOutlined,
  CrownOutlined,
  SearchOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import { FalseIcon } from '@components/false-icon';
import { TrueIcon } from '@components/true-icon';
import { PermissionContext } from '@contexts';
import {
  BooleanField,
  CreateButton,
  EditButton,
  ExportButton,
  List,
  ShowButton,
  useTable,
} from '@refinedev/antd';
import {
  BaseRecord,
  CrudFilters,
  IResourceComponentsProps,
  useCustomMutation,
  useExport,
  useGo,
  useTranslate,
} from '@refinedev/core';
import {
  Button,
  Form,
  Input,
  Space,
  Switch,
  Table,
  TableProps,
  Tooltip,
  Upload,
} from 'antd';
import React, { useContext, useEffect } from 'react';
import { handleServerSideProps } from '../../src/utils/serverSideProps';
import { CMSUserRole } from '../../src/graphql-data-provider/utils/graphQlTypes';

interface IWhiskey {
  name: string;
  brand: string;
  distillery: string;
  age: string;
  proof: string;
  brandUser: {
    id: string;
    brandName: string;
  };
}

export const WhiskeysList: React.FC<IResourceComponentsProps> = () => {
  const translate = useTranslate();
  const { mutate, isLoading } = useCustomMutation();
  const { role, brandUserIds } = useContext(PermissionContext);

  const go = useGo();

  // Build permanent filters based on user role
  const permanentFilters: CrudFilters = [];
  if (
    (role === CMSUserRole.BrandOwner || role === CMSUserRole.BrandEditor) &&
    brandUserIds &&
    brandUserIds.length > 0
  ) {
    console.log(`Applying ${role} filter for brands:`, brandUserIds);
    // Add filter to only show whiskeys from the user's brands
    permanentFilters.push({
      operator: 'or',
      value: brandUserIds.map((id) => ({
        field: 'brandId',
        operator: 'eq',
        value: id,
      })),
    });
  }

  const { tableProps, searchFormProps, setCurrent } = useTable<IWhiskey>({
    resource: 'whiskey',
    meta: { searchable: true },
    pagination: {
      mode: 'server',
    },
    permanentFilter: permanentFilters,
    onSearch: (values: any) => {
      setCurrent(1);
      const filters: CrudFilters = [];
      console.log('onSearch has fired with these values', values);
      // Add search filter for both name
      filters.push({
        field: 'fullName',
        operator: 'contains',
        value: values?.name?.toLowerCase(),
      });

      filters.push({
        field: 'specialistChoice',
        operator: 'eq',
        value: values?.specialistChoice,
      });

      filters.push({
        field: 'starterPick',
        operator: 'eq',
        value: values?.starterPick,
      });

      filters.push({
        field: 'singleBarrel',
        operator: 'eq',
        value: values?.singleBarrel,
      });

      return filters;
    },
  });

  useEffect(() => {
    searchFormProps.form?.resetFields();
    searchFormProps.form?.submit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const { triggerExport, isLoading: exportLoading } = useExport();

  const onTableChange: NonNullable<TableProps<IWhiskey>['onChange']> = (
    tablePagination,
    tableFilters,
    sorter,
    extra
  ) => {
    tableProps.onChange?.(tablePagination, tableFilters, sorter, extra);

    if (extra.action === 'sort') {
      setCurrent(1);
    }
  };

  const importWhiskeysMutation = `
    mutation ImportWhiskeysByCSV($fileKey: String!) {
      importWhiskeysByCSV(fileKey: $fileKey)
    }
  `;

  const importWhiskeys = async (_fileName: string, file: any) => {
    mutate({
      url: '',
      method: 'post',
      meta: {
        query: importWhiskeysMutation,
        queryName: 'importWhiskeysByCSV',
        file,
        variables: {
          fileKey: `public/${file.uid}.csv`,
        },
      },
      errorNotification: () => ({
        message: `Something went wrong`,
        description: 'Error',
        type: 'error',
      }),
      successNotification: () => ({
        message: `Whiskeys imported successfully`,
        description: 'Success',
        type: 'success',
      }),
      values: {},
    });
  };

  return (
    <List
      headerButtons={
        <>
          <ExportButton onClick={triggerExport} loading={exportLoading} />
          <Upload
            showUploadList={false}
            accept="text/csv"
            maxCount={1}
            onChange={async (info) => {
              if (info.file && info.file.status === 'uploading' && !isLoading) {
                await importWhiskeys(info.file.name, info.file);
              }
            }}
          >
            <Button loading={isLoading}>
              {' '}
              <UploadOutlined /> Import
            </Button>
          </Upload>
          <CreateButton />
        </>
      }
    >
      <Form {...searchFormProps} layout="inline">
        <Form.Item name="name">
          <Input placeholder="Search by name or brand" />
        </Form.Item>
        <Button
          style={{ marginBottom: 20, marginRight: 20 }}
          onClick={() => {
            searchFormProps.form?.submit();
          }}
        >
          <SearchOutlined />
          Search
        </Button>

        <Form.Item name="specialistChoice">
          <Switch
            checkedChildren="specialist choice"
            unCheckedChildren="specialist choice"
            onChange={(checked: boolean) => {
              if (checked) {
                searchFormProps.form?.setFieldValue('specialistChoice', true);
              } else {
                searchFormProps.form?.setFieldValue(
                  'specialistChoice',
                  undefined
                );
              }

              searchFormProps.form?.submit();
            }}
          />
        </Form.Item>
        <Form.Item name="starterPick">
          <Switch
            checkedChildren="starter pick"
            unCheckedChildren="starter pick"
            onChange={(checked: boolean) => {
              if (checked) {
                searchFormProps.form?.setFieldValue('starterPick', true);
              } else {
                searchFormProps.form?.setFieldValue('starterPick', undefined);
              }

              searchFormProps.form?.submit();
            }}
          />
        </Form.Item>
        <Form.Item name="singleBarrel">
          <Switch
            checkedChildren={translate('whiskey.fields.singleBarrel')}
            unCheckedChildren={translate('whiskey.fields.singleBarrel')}
            onChange={(checked: boolean) => {
              if (checked) {
                searchFormProps.form?.setFieldValue('singleBarrel', true);
              } else {
                searchFormProps.form?.setFieldValue('singleBarrel', undefined);
              }

              searchFormProps.form?.submit();
            }}
          />
        </Form.Item>

        <Button
          style={{ marginLeft: 5 }}
          onClick={() => {
            searchFormProps.form?.setFieldsValue({
              name: undefined,
              specialistChoice: undefined,
              starterPick: undefined,
              singleBarrel: undefined,
            });
            searchFormProps.form?.resetFields();
            searchFormProps.form?.submit();
          }}
        >
          <ClearOutlined />
          Clear filters
        </Button>
      </Form>
      <Table {...tableProps} onChange={onTableChange} rowKey="id">
        <Table.Column
          dataIndex="name"
          title={translate('whiskey.fields.name')}
          sorter
        />
        <Table.Column
          key="brand"
          dataIndex={['brandUser', 'brandName']}
          title={translate('whiskey.fields.brand')}
          sorter
          // TODO this is redundant, but this is a pattern in multiple places right now and should be rolled into a single fix
          render={(_: any, record: any) => {
            if (record?.brandUser?.id && record?.brandUser?.brandName) {
              return (
                <Link href={`/brand/show/${record.brandUser.id}`}>
                  {record.brandUser.brandName}
                </Link>
              );
            }
            return '-';
          }}
        />
        <Table.Column
          dataIndex="specialistChoice"
          title={translate('whiskey.fields.specialistChoice')}
          sorter
          render={(value: boolean) => (
            <BooleanField
              trueIcon={<TrueIcon />}
              falseIcon={<FalseIcon />}
              value={value}
            />
          )}
        />

        <Table.Column
          dataIndex="starterPick"
          title={translate('whiskey.fields.starterPick')}
          sorter
          render={(value: boolean) => (
            <BooleanField
              trueIcon={<TrueIcon />}
              falseIcon={<FalseIcon />}
              value={value}
            />
          )}
        />
        <Table.Column
          dataIndex="singleBarrel"
          title={translate('whiskey.fields.singleBarrel')}
          sorter
          render={(value: boolean) => (
            <BooleanField
              trueIcon={<TrueIcon />}
              falseIcon={<FalseIcon />}
              value={value}
            />
          )}
        />

        <Table.Column
          title={translate('table.actions')}
          dataIndex="actions"
          render={(_, record: BaseRecord) => (
            <Space style={{ alignItems: 'center' }}>
              <ShowButton hideText size="small" recordItemId={record.id} />
              <EditButton hideText size="small" recordItemId={record.id} />
              {role !== CMSUserRole.BrandEditor && (
                <Tooltip title="Add review">
                  <Button
                    type="primary"
                    size="small"
                    icon={<CrownOutlined />}
                    onClick={() => {
                      go({
                        to: {
                          resource: 'review',
                          action: 'create',
                          meta: {
                            whiskeyId: record.id,
                          },
                        },
                        query: {
                          whiskeyId: record.id,
                        },
                      });
                    }}
                  />
                </Tooltip>
              )}
            </Space>
          )}
        />
      </Table>
    </List>
  );
};

export const getServerSideProps: GetServerSideProps<{}> = async (context) => {
  return handleServerSideProps(context, '/whiskey');
};

export default WhiskeysList;
