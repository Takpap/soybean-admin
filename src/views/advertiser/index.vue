<script lang="tsx" setup>
import { emit } from 'node:process';
import { defineComponent, h, nextTick, ref } from 'vue';
import { NButton, NInput, DataTableInst } from 'naive-ui';
import dayjs from 'dayjs';
import { omit } from 'lodash-es';
import { createAdvertiserRelation, fetchGetAdvertiserList, delAdvertiserRelation } from '@/service/api';
import { useAppStore } from '@/store/modules/app';
import { useTable } from '@/hooks/common/table';
import { $t } from '@/locales';
import AdvertiserSearch from './modules/advertiser-search.vue';

const appStore = useAppStore();

const summaryCol = ref(() => { });
const tableRef = ref<DataTableInst>()

const postAdvertiserRelation = async row => {
  const start_end = localStorage.getItem('start_end');
  createAdvertiserRelation({ start_end, ...row });
};

const clearMark = async () => {
  const start_end = localStorage.getItem('start_end');
  await delAdvertiserRelation({ start_end });
  getData()
}

const ShowOrEdit = defineComponent({
  props: {
    value: [String, Number],
    onUpdateValue: [Function, Array]
  },
  emits: ['enter'],
  setup(props, ctx) {
    const isEdit = ref(false);
    const inputRef = ref(null);
    const inputValue = ref(props.value);
    function handleOnClick() {
      isEdit.value = true;
      nextTick().then(() => {
        inputRef.value.focus();
      });
    }
    function handleChange() {
      props.onUpdateValue(inputValue.value);
      isEdit.value = false;
    }
    function handleBlur(e) {
      props.onUpdateValue(inputValue.value);
      isEdit.value = false;
      ctx.emit('enter');
    }

    return () => (
      <div style="min-height: 22px" onClick={handleOnClick}>
        {isEdit.value ? (
          <NInput
            ref={inputRef}
            value={inputValue.value}
            onUpdateValue={v => (inputValue.value = v)}
            onChange={handleChange}
            onBlur={handleBlur}
          />
        ) : (
          props.value
        )}
      </div>
    );
  }
});

const { columns, data, loading, pagination, searchParams, getData, resetSearchParams } = useTable<
  Api.SystemManage.Advertiser,
  typeof fetchGetAdvertiserList,
  'index' | 'operate'
>({
  apiFn: fetchGetAdvertiserList,
  apiParams: {
    current: 1,
    size: 10,
    advertiser_id: '',
    advertiser_name: '',
    date: [dayjs().format('YYYY-MM-DD'), dayjs().format('YYYY-MM-DD')]
  },
  transformer: res => {
    const { records = [], current = 1, size = 10, total = 0 } = res.data || {};
    const summaryData = records.splice(0, 1)[0];

    const createSummary = () => {
      return Object.entries(summaryData).reduce((acc, [key, value]) => {
        if (key === 'mark') {
          acc[key] = {
            value: <NButton quaternary type="warning" onClick={clearMark}>清除备注</NButton>
          }
        } else {
          acc[key] = {
            value: <span>{value}</span>
          };
        }

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
      key: 'advertiser_name',
      title: $t('page.advertiser.advertiser_name'),
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
      key: 'mark',
      title: $t('page.advertiser.mark'),
      width: 150,
      resizable: true,
      render(row) {
        return (
          <ShowOrEdit
            value={row.mark}
            onUpdateValue={(value: string) => (row.mark = value)}
            onEnter={() => postAdvertiserRelation(row)}
          />
        );
      }
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
      key: 'order_count',
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

const onSort = (value: any) => {
  getData(omit(value, 'sorter'));
};

const downloadCsv = () =>
  tableRef.value?.downloadCsv({ fileName: `${searchParams.start_date}_${searchParams.end_date}-优化师` })

</script>

<template>
  <div class="flex-vertical-stretch gap-16px overflow-hidden <sm:overflow-auto">
    <AdvertiserSearch v-model:model="searchParams" @reset="resetSearchParams" @search="getData" @download="downloadCsv" />
    <NCard :bordered="false" size="small" class="card-wrapper sm:flex-1-hidden">
      <NDataTable :columns="columns" :data="data" size="small" :flex-height="!appStore.isMobile" :scroll-x="640"
        :loading="loading" striped :pagination="pagination" :row-key="item => item.id" :summary="summaryCol"
        summary-placement="top" virtual-scroll class="sm:h-full" @update:sorter="onSort" ref="tableRef" />
    </NCard>
  </div>
</template>
