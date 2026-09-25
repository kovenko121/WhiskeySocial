import { GetServerSideProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import { getServerSession } from 'next-auth';

import { ClearOutlined, SearchOutlined } from '@ant-design/icons';
import {
  DeleteButton,
  EditButton,
  List,
  ShowButton,
  useTable,
} from '@refinedev/antd';
import {
  BaseRecord,
  IResourceComponentsProps,
  useTranslate,
} from '@refinedev/core';
import { Button, Form, Input, Space, Table } from 'antd';
import React, { useEffect } from 'react';
import { authOptions } from '../api/auth/[...nextauth]';
import { textSorter } from '../../src/utils/tableSorters';

interface IArticle {
  title: string;
  id: string;
}

export const ArticlesList: React.FC<IResourceComponentsProps> = () => {
  const translate = useTranslate();
  const { tableProps, searchFormProps } = useTable<IArticle>({
    resource: 'article',
    pagination: {
      mode: 'client',
    },

    onSearch: (values: any) => [
      {
        field: 'title',
        operator: 'contains',
        value: values?.title,
      },
    ],
  });

  useEffect(() => {
    searchFormProps.form?.resetFields();
    searchFormProps.form?.submit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <List>
      <Form {...searchFormProps} layout="inline">
        <Form.Item name="title">
          <Input placeholder="Search by title" />
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

        <Button
          style={{ marginLeft: 5 }}
          onClick={() => {
            searchFormProps.form?.resetFields();
            searchFormProps.form?.submit();
          }}
        >
          <ClearOutlined />
          Clear filters
        </Button>
      </Form>
      <Table {...tableProps} rowKey="id">
        <Table.Column
          dataIndex="title"
          title={translate('article.fields.title')}
          sorter={textSorter<IArticle>('title')}
        />
        <Table.Column
          dataIndex="subtitle"
          title={translate('article.fields.subtitle')}
          sorter={textSorter<IArticle>('subtitle')}
        />
        <Table.Column
          dataIndex="tag"
          title={translate('article.fields.tag')}
          sorter={textSorter<IArticle>('tag')}
        />

        <Table.Column
          title={translate('table.actions')}
          dataIndex="actions"
          render={(_, record: BaseRecord) => (
            <Space>
              <ShowButton hideText size="small" recordItemId={record.id} />
              <EditButton hideText size="small" recordItemId={record.id} />
              <DeleteButton hideText size="small" recordItemId={record.id} />
            </Space>
          )}
        />
      </Table>
    </List>
  );
};

export const getServerSideProps: GetServerSideProps<{}> = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions);

  const translateProps = await serverSideTranslations(context.locale ?? 'en', [
    'common',
  ]);

  if (!session) {
    return {
      props: {
        ...translateProps,
      },
      redirect: {
        destination: `/login?to=${encodeURIComponent('/article')}`,
        permanent: false,
      },
    };
  }

  return {
    props: {
      ...translateProps,
    },
  };
};

export default ArticlesList;
