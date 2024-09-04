<script lang="tsx" setup>
import { emit } from 'node:process';
import { defineComponent, h, nextTick, onMounted, ref } from 'vue';
import type { DataTableInst } from 'naive-ui';
import { NButton, NInput, NSelect } from 'naive-ui';
import dayjs from 'dayjs';
import { omit } from 'lodash-es';
import {
  createAdvertiserRelation,
  delAdvertiserRelation,
  fetchGetAdvertiserList,
  getAdvertiserOrders
} from '@/service/api';
import { useAppStore } from '@/store/modules/app';
import { useTable } from '@/hooks/common/table';
import { $t } from '@/locales';
import { request } from '@/service/request';
import AdvertiserSearch from './modules/advertiser-search.vue';

const appStore = useAppStore();

const summaryCol = ref(() => {});
const tableRef = ref<DataTableInst>();

const postAdvertiserRelation = async row => {
  const start_end = localStorage.getItem('start_end');
  createAdvertiserRelation({ start_end, ...row });
};

const clearMark = async () => {
  const start_end = localStorage.getItem('start_end');
  await delAdvertiserRelation({ start_end });
  getData();
};

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

const orderColumns = [
  {
    title: '广告 ID',
    key: 'promotionId',
    width: 170,
    ellipsis: { tooltip: true },
    fixed: 'left' // 固定左侧
  },
  {
    title: '订单编号',
    key: 'orderId',
    width: 190
  },
  { title: '代理商 ID', key: 'agent_id', width: 100, ellipsis: { tooltip: true } },
  { title: '用户 ID', key: 'user_id', width: 100, ellipsis: { tooltip: true } },
  { title: '影视 ID', key: 'theater_id', width: 100, ellipsis: { tooltip: true } },
  { title: '会员 ID', key: 'memberId', width: 250, ellipsis: { tooltip: true } },
  {
    title: '支付金额',
    key: 'payNotifyAmount',
    width: 120,
    ellipsis: { tooltip: true },
    render: (row: any) => <span>{(row.payNotifyAmount / 100).toFixed(2)}</span>
  },
  {
    title: '支付日期',
    key: 'payDate',
    width: 180,
    ellipsis: { tooltip: true },
    render: (row: any) => <span>{dayjs.unix(row.payDate).format('YYYY-MM-DD HH:mm:ss')}</span>
  },
  {
    title: '创建日期',
    key: 'createDate',
    width: 180,
    ellipsis: { tooltip: true },
    render: (row: any) => <span>{dayjs.unix(row.payDate).format('YYYY-MM-DD HH:mm:ss')}</span>
  },
  { title: '点击 ID', key: 'click_id', width: 250, ellipsis: { tooltip: true } },
  { title: '公众号 ID', key: 'gzh_id', width: 200, ellipsis: { tooltip: true } },
  { title: '公众号用户 ID', key: 'gzh_user_id', width: 250, ellipsis: { tooltip: true } },
  { title: '影视名称', key: 'theater_name', width: 200, ellipsis: { tooltip: true } },
  { title: '应用名称', key: 'app_name', width: 200, ellipsis: { tooltip: true } },
  { title: '链接 ID', key: 'link_id', width: 200, ellipsis: { tooltip: true } },
  { title: '公众号用户注册时间', key: 'gzh_user_register_time', width: 200, ellipsis: { tooltip: true } },
  { title: '用户注册时间', key: 'user_register_time', width: 200, ellipsis: { tooltip: true } },
  { title: '子代理商 ID', key: 'sub_agent_id', width: 100, ellipsis: { tooltip: true } },
  { title: '退款日期时间', key: 'refund_date_time', width: 150, ellipsis: { tooltip: true } },
  { title: '小程序应用 ID', key: 'mp_app_id', width: 200, ellipsis: { tooltip: true } },
  { title: '小程序用户 ID', key: 'mp_open_id', width: 250, ellipsis: { tooltip: true } },
  { title: '创建时间', key: 'create_time', width: 200, ellipsis: { tooltip: true } },
  {
    title: '操作',
    key: 'actions',
    width: 120,
    fixed: 'right', // 固定右侧
    render(row) {
      return (
        row.click_id.startsWith('B.') && (
          <NButton disabled={row.callback} onClick={() => handleAction(row)}>
            回传
          </NButton>
        )
      );
      // return h(NButton, { type: 'primary', size: 'small', onClick: () => handleAction(row) }, '回传');
    }
  }
];

const showModal = ref(false);
const orderLoading = ref(false);
const tableData = ref([]);
const ruleOptions = ref([]);

onMounted(async () => {
  const rules = await request({ method: 'get', url: '/setting' });
  ruleOptions.value = rules.data?.map(i => ({ label: i.name, value: i.id }));
});

const onRuleChange = async ({ row, rule }) => {
  const { advertiser_id } = row;

  await request({ url: '/advertiser/callback_rule', method: 'get', params: { advertiser_id, rule } });
  row.rule = rule;
  window.$message.success('规则修改成功');
};

const onRuleClear = async (row) => {
  const { advertiser_id } = row;

  await request({ url: '/advertiser/callback_rule', method: 'delete', params: { advertiser_id } });
  row.rule = null;
  window.$message.success('规则删除成功');
};

let adRow = null as any;

const viewOrders = async (row: any) => {
  showModal.value = true;
  orderLoading.value = true;
  adRow = row;
  const start_end = localStorage.getItem('start_end') || '_';
  const [start_date, end_date] = start_end.split('_');
  const { data } = await getAdvertiserOrders({ start_date, end_date, advertiser_id: row?.advertiser_id });
  tableData.value = data;
  orderLoading.value = false;
};

const handleAction = async row => {
  const { data } = await request({ method: 'get', url: '/advertiser/report', params: row });
  if (data.code === 0) {
    window.$message?.success('回传成功');
    viewOrders(adRow);
  } else {
    window.$message?.error('回传失败');
  }
};

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
            value: (
              <NButton quaternary type="warning" onClick={clearMark}>
                清除备注
              </NButton>
            )
          };
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
    },
    {
      key: 'rule',
      title: '回传规则',
      width: 100,
      render: row =>
        /^\d.*?/.test(row.advertiser_id) && (
          <NSelect
            value={row.rule}
            options={ruleOptions.value}
            clearable
            onClear={() => onRuleClear(row)}
            onChange={rule => onRuleChange({ row, rule })}
          />
        )
    },
    {
      key: 'operate',
      title: $t('common.operate'),
      align: 'center',
      width: 100,
      render: row =>
        /^\d.*?/.test(row.advertiser_id) && (
          <div class="flex-center gap-8px">
            <NButton type="primary" ghost size="small" onClick={() => viewOrders(row)}>
              查看订单
            </NButton>
          </div>
        )
    }
  ]
});

const onSort = (value: any) => {
  getData(omit(value, 'sorter'));
};

const downloadCsv = () =>
  tableRef.value?.downloadCsv({ fileName: `${searchParams.start_date}_${searchParams.end_date}-优化师` });
</script>

<template>
  <div class="flex-vertical-stretch gap-16px overflow-hidden <sm:overflow-auto">
    <AdvertiserSearch
      v-model:model="searchParams"
      @reset="resetSearchParams"
      @search="getData"
      @download="downloadCsv"
    />
    <NCard :bordered="false" size="small" class="card-wrapper sm:flex-1-hidden">
      <NDataTable
        ref="tableRef"
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
      />
    </NCard>

    <n-modal v-model:show="showModal">
      <n-card style="width: 80%" title="关联订单" size="huge" role="dialog" aria-modal="true">
        <n-data-table
          :max-height="550"
          :columns="orderColumns"
          :loading="orderLoading"
          :data="tableData"
          :scroll-x="1000"
          :pagination="{
            pageSizes: [10, 20, 30, 40, 50],
            showSizePicker: true,
            prefix: () => {
              return `订单总数 ${tableData.length}`;
            }
          }"
        />
      </n-card>
    </n-modal>
  </div>
</template>
