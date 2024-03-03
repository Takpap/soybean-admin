<script lang="tsx" setup>
import { ref } from 'vue';
import { fetchGetAdvertiserList } from '@/service/api';
import { useAppStore } from '@/store/modules/app';
import { useTable } from '@/hooks/common/table';
import { $t } from '@/locales';
import AdvertiserSearch from './modules/advertiser-search.vue';

const appStore = useAppStore();

const { columns, filteredColumns, data, loading, pagination, getData, searchParams, resetSearchParams } = useTable<
  Api.SystemManage.Advertiser,
  typeof fetchGetAdvertiserList,
  'index' | 'operate'
>({
  apiFn: fetchGetAdvertiserList,
  apiParams: {
    current: 1,
    size: 10
  },
  transformer: res => {
    const { records = [], current = 1, size = 10, total = 0 } = res.data || {};

    return {
      data: records,
      pageNum: current,
      pageSize: size,
      total
    };
  },
  columns: () => [
    {
      key: 'advertiser_name',
      title: $t('page.advertiser.advertiser_name'),
      align: 'left',
      minWidth: 380,
      ellipsis: {
        tooltip: true
      }
    },
    {
      key: 'advertiser_id',
      title: $t('page.advertiser.advertiser_id'),
      align: 'center',
      minWidth: 100
    },
    {
      key: 'cost',
      title: $t('page.advertiser.cost'),
      align: 'center',
      minWidth: 80
    },
    {
      key: 'pay_notify_amount',
      title: $t('page.advertiser.pay_notify_amount'),
      align: 'center',
      minWidth: 80
    },
    {
      key: 'profit',
      title: $t('page.advertiser.profit'),
      align: 'center',
      minWidth: 50
    },
    {
      key: 'roi',
      title: $t('page.advertiser.roi'),
      align: 'center',
      minWidth: 50
    },
    {
      key: 'really_roi',
      title: $t('page.advertiser.really_roi'),
      align: 'center',
      minWidth: 50
    },
    {
      key: 'order_profit',
      title: $t('page.advertiser.order_profit'),
      align: 'center',
      minWidth: 50
    },
    {
      key: 'customer_order',
      title: $t('page.advertiser.customer_order'),
      align: 'center',
      minWidth: 50
    },
    {
      key: 'order_count',
      title: $t('page.advertiser.order_count'),
      align: 'center',
      minWidth: 80
    },
    {
      key: 'convert',
      title: $t('page.advertiser.convert'),
      align: 'center',
      minWidth: 50
    },
    {
      key: 'convert_cost',
      title: $t('page.advertiser.convert_cost'),
      align: 'center',
      minWidth: 50
    },
    {
      key: 'reward_cost',
      title: $t('page.advertiser.reward_cost'),
      align: 'center',
      minWidth: 50
    }
  ]
});
</script>

<template>
  <div class="flex-vertical-stretch gap-16px overflow-hidden <sm:overflow-auto">
    <AdvertiserSearch v-model:model="searchParams" @reset="resetSearchParams" @search="getData" />
    <NCard :bordered="false" size="small" class="card-wrapper sm:flex-1-hidden">
      <NDataTable :columns="columns" :data="data" size="small" :flex-height="!appStore.isMobile" :scroll-x="640"
        :loading="loading" :pagination="pagination" :row-key="item => item.id" class="sm:h-full" />
    </NCard>
  </div>
</template>
