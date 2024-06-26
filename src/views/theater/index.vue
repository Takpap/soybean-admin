<script lang="tsx" setup>
import { ref } from 'vue';
import dayjs from 'dayjs';
import { omit } from 'lodash-es';
import { fetchGetTheaterList } from '@/service/api';
import { useAppStore } from '@/store/modules/app';
import { useTable } from '@/hooks/common/table';
import { $t } from '@/locales';
import AdvertiserSearch from './modules/advertiser-search.vue';

const appStore = useAppStore();

const summaryCol = ref(() => {});

const { columns, data, loading, pagination, searchParams, getData, resetSearchParams } = useTable<
  Api.SystemManage.Advertiser,
  typeof fetchGetTheaterList,
  'index' | 'operate'
>({
  apiFn: fetchGetTheaterList,
  apiParams: {
    current: 1,
    size: 50,
    advertiser_id: '',
    advertiser_name: '',
    date: [dayjs().format('YYYY-MM-DD'), dayjs().format('YYYY-MM-DD')]
  },
  transformer: res => {
    const { records = [], current = 1, size = 10, total = 0 } = res.data || {};
    const summaryData = records.splice(0, 1)[0];

    const createSummary: any = () => {
      return Object.entries(summaryData).reduce((acc, [key, value]) => {
        acc[key] = {
          value: <span>{value}</span>
        };
        return acc;
      }, {});
    };

    summaryCol.value = createSummary;

    return {
      data: records,
      pageNum: current,
      pageSize: size,
      total
    };
  },
  columns: () => [
    {
      key: 'theater_name',
      title: $t('page.advertiser.theater_name'),
      resizable: true,
      width: 300,
      ellipsis: {
        tooltip: true
      }
    },
    {
      key: 'advertiser_id',
      title: $t('page.advertiser.advertiser_id'),
      resizable: true,
      width: 180
    },
    {
      key: 'cost',
      title: $t('page.advertiser.cost'),
      resizable: true,
      sorter: true,
      defaultSortOrder: 'ascend',
      minWidth: 80
    },
    {
      key: 'pay_notify_amount',
      title: $t('page.advertiser.pay_notify_amount'),
      resizable: true,
      sorter: true,
      minWidth: 60
    },
    {
      key: 'profit',
      title: $t('page.advertiser.profit'),
      resizable: true,
      sorter: true,
      minWidth: 40
    },
    {
      key: 'roi',
      title: $t('page.advertiser.roi'),
      resizable: true,
      sorter: true,
      minWidth: 40
    },
    {
      key: 'really_roi',
      title: $t('page.advertiser.really_roi'),
      resizable: true,
      sorter: true,
      minWidth: 40,
      render: row => <div style={{ color: Number(row.really_roi) < 1 ? 'red' : '' }}> {row.really_roi} </div>
    },
    {
      key: 'order_profit',
      title: $t('page.advertiser.order_profit'),
      resizable: true,
      minWidth: 40
    },
    {
      key: 'customer_order',
      title: $t('page.advertiser.customer_order'),
      resizable: true,
      minWidth: 40
    },
    {
      key: 'charge_count',
      title: $t('page.advertiser.order_count'),
      resizable: true,
      minWidth: 40
    },
    {
      key: 'convert',
      title: $t('page.advertiser.convert'),
      resizable: true,
      minWidth: 40
    },
    {
      key: 'convert_cost',
      title: $t('page.advertiser.convert_cost'),
      resizable: true,
      minWidth: 40
    },
    {
      key: 'reward_cost',
      title: $t('page.advertiser.reward_cost'),
      resizable: true,
      minWidth: 40
    }
  ]
});

const tableRef = ref<DataTableInst>()

const onSort = (value: any) => {
  getData(omit(value, 'sorter'));
};

const downloadCsv = () =>
  tableRef.value?.downloadCsv({ fileName: `${searchParams.start_date}_${searchParams.end_date}-剧集` })

</script>

<template>
  <div class="flex-vertical-stretch gap-16px overflow-hidden <sm:overflow-auto">
    <AdvertiserSearch v-model:model="searchParams" @reset="resetSearchParams" @search="getData" @download="downloadCsv" />
    <NCard :bordered="false" size="small" class="card-wrapper sm:flex-1-hidden">
      <NDataTable
        :columns="columns"
        :data="data"
        size="small"
        :flex-height="!appStore.isMobile"
        :scroll-x="640"
        :loading="loading"
        striped
        :pagination="pagination"
        :row-key="item => item.id"
        :summary="summaryCol"
        summary-placement="top"
        virtual-scroll
        class="sm:h-full"
        @update:sorter="onSort"
        ref="tableRef"
      />
    </NCard>
  </div>
</template>
