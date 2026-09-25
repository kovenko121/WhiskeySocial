import { DownloadOutlined } from '@ant-design/icons';
import { List } from '@refinedev/antd';
import { IResourceComponentsProps, useList } from '@refinedev/core';
import { Alert, Button, Select, Space, Table, Tag, Typography } from 'antd';
import { PermissionContext } from '@contexts';
import { GetServerSideProps } from 'next';
import React, { useContext, useMemo, useState } from 'react';
import { CMSUserRole } from 'src/graphql-data-provider/utils/graphQlTypes';
import {
  AttendanceRow,
  BoothRow,
  BoothStateRow,
  LeadRow,
  PourRow,
  PourStateRow,
  buildLeadRows,
  leadRowsToCsv,
} from 'src/components/tasting/buildLeadRows';
import { handleServerSideProps } from 'src/utils/serverSideProps';
import { numberSorter, textSorter } from 'src/utils/tableSorters';

const { Text } = Typography;

interface ITastingEvent {
  id: string;
  title: string;
  status: string;
}

const byEvent = (eventId?: string) =>
  eventId ? [{ field: 'eventId', operator: 'eq' as const, value: eventId }] : [];

const downloadCsv = (filename: string, csv: string) => {
  // A BOM keeps Excel from mangling accented distillery names.
  const blob = new Blob([`﻿${csv}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

export const TastingLeadList: React.FC<IResourceComponentsProps> = () => {
  const { role } = useContext(PermissionContext);
  const isAdmin = role === CMSUserRole.Admin;
  const [eventId, setEventId] = useState<string>();

  const { data: eventData, isLoading: eventsLoading } = useList<ITastingEvent>({
    resource: 'tastingEvent',
    pagination: { mode: 'off' },
    queryOptions: { enabled: isAdmin },
  });
  const events = eventData?.data ?? [];

  // Land on something useful: the live event if there is one, else the newest row.
  const selectedEventId = eventId ?? events.find((e) => e.status === 'PUBLISHED')?.id ?? events[0]?.id;
  // Attendee contact details never leave the admin role, so nothing is fetched without it.
  const enabled = { queryOptions: { enabled: isAdmin && !!selectedEventId } };
  const filters = byEvent(selectedEventId);

  const { data: boothData } = useList<BoothRow>({
    resource: 'tastingBooth',
    filters,
    pagination: { mode: 'off' },
    ...enabled,
  });

  const { data: boothStateData, isLoading: statesLoading } = useList<BoothStateRow>({
    resource: 'tastingBoothState',
    filters,
    pagination: { mode: 'off' },
    ...enabled,
  });

  const { data: pourStateData } = useList<PourStateRow>({
    resource: 'tastingPourState',
    filters,
    pagination: { mode: 'off' },
    ...enabled,
  });

  const { data: attendanceData } = useList<AttendanceRow>({
    resource: 'tastingAttendance',
    filters,
    pagination: { mode: 'off' },
    ...enabled,
  });

  // Pours hang off booths, not events, so there is nothing to filter on — pull them all
  // and let the booth join narrow it. One event's curated list is a few dozen rows.
  const { data: pourData } = useList<PourRow>({
    resource: 'tastingPour',
    pagination: { mode: 'off' },
    queryOptions: { enabled: isAdmin },
  });

  const { rows, suppressed } = useMemo(
    () =>
      buildLeadRows({
        booths: boothData?.data ?? [],
        pours: pourData?.data ?? [],
        boothStates: boothStateData?.data ?? [],
        pourStates: pourStateData?.data ?? [],
        attendances: attendanceData?.data ?? [],
      }),
    [boothData, pourData, boothStateData, pourStateData, attendanceData],
  );

  const selectedEvent = events.find((e) => e.id === selectedEventId);

  const onDownload = () => {
    const slug = (selectedEvent?.title ?? 'event').replace(/[^a-zA-Z0-9]+/g, '-').toLowerCase();
    downloadCsv(`leads-${slug}.csv`, leadRowsToCsv(rows));
  };

  if (!isAdmin) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>Access Denied</h2>
        <p>Only administrators can access attendee lead details.</p>
      </div>
    );
  }

  return (
    <List title="Lead Export" canCreate={false}>
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <Space wrap>
          <Select
            style={{ minWidth: 320 }}
            loading={eventsLoading}
            value={selectedEventId}
            onChange={setEventId}
            placeholder="Choose an event"
            options={events.map((event) => ({
              value: event.id,
              label: `${event.title} (${event.status})`,
            }))}
          />
          <Button
            icon={<DownloadOutlined />}
            onClick={onDownload}
            disabled={rows.length === 0}
            type="primary"
          >
            Download CSV
          </Button>
          <Text type="secondary">
            {rows.length} leads
            {suppressed > 0 && ` · ${suppressed} attendee(s) opted out and are excluded`}
          </Text>
        </Space>

        <Alert
          type="info"
          showIcon
          message="A lead is an attendee who opted in to sharing their email with that booth, or favorited one of its bottles. Attendees who turned sharing off hold no email in the passport, so they never appear here. Private booth notes are not exported."
        />

        <Table<LeadRow>
          dataSource={rows}
          rowKey="key"
          loading={statesLoading}
          pagination={{ pageSize: 50, showSizeChanger: true }}
        >
          <Table.Column
            dataIndex="boothName"
            title="Booth"
            sorter={textSorter<LeadRow>('boothName')}
          />
          <Table.Column
            dataIndex="attendee"
            title="Attendee"
            sorter={textSorter<LeadRow>('attendee')}
          />
          <Table.Column
            dataIndex="email"
            title="Email"
            sorter={textSorter<LeadRow>('email')}
          />
          <Table.Column
            title="Signals"
            render={(_, row: LeadRow) => (
              <Space size={4} wrap>
                {row.optedIn && <Tag color="green">email opt-in</Tag>}
                {row.favoriteBottles.length > 0 && <Tag color="red">favorited bottle</Tag>}
                {row.visited && <Tag>visited</Tag>}
              </Space>
            )}
          />
          <Table.Column
            title="Favorited bottles"
            render={(_, row: LeadRow) => row.favoriteBottles.join(', ') || '—'}
          />
          <Table.Column
            dataIndex="stamps"
            title="Stamps"
            width={90}
            sorter={numberSorter<LeadRow>('stamps')}
          />
        </Table>
      </Space>
    </List>
  );
};

export const getServerSideProps: GetServerSideProps<{}> = async (context) => {
  return handleServerSideProps(context, '/tastingLead');
};

export default TastingLeadList;
