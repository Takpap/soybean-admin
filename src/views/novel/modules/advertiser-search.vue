<script setup lang="ts">
import { number } from 'echarts/core';
import dayjs from 'dayjs';
import { onMounted, reactive, ref } from 'vue';
import { $t } from '@/locales';
import { useNaiveForm } from '@/hooks/common/form';
import { fetchAdvertiserList } from '@/service/api';

defineOptions({
  name: 'AdvertiserSearch'
});

interface Emits {
  (e: 'reset'): void;
  (e: 'search'): void;
  (e: 'download'): void;
}

const emit = defineEmits<Emits>();

const disablePreviousDate = (ts: number) => ts > Date.now();

const rangeShortcuts = {
  今天: [dayjs().valueOf(), dayjs().valueOf()],
  昨天: [dayjs().subtract(1, 'day').valueOf(), dayjs().subtract(1, 'day').valueOf()],
  前天: [dayjs().subtract(2, 'day').valueOf(), dayjs().subtract(2, 'day').valueOf()],
  最近一周: [dayjs().subtract(1, 'week').valueOf(), dayjs().subtract(1, 'day').valueOf()],
  最近半个月: [dayjs().subtract(15, 'day').valueOf(), dayjs().subtract(1, 'day').valueOf()],
  最近一个月: [dayjs().subtract(1, 'month').valueOf(), dayjs().subtract(1, 'day').valueOf()],
  最近一个季度: [dayjs().subtract(3, 'month').valueOf(), dayjs().subtract(1, 'day').valueOf()]
};

const { formRef, validate, restoreValidation } = useNaiveForm();

const model = defineModel<Api.SystemManage.AdvertiserSearchParams>('model', { required: false });

const aliasOptions = ref([]);

onMounted(async () => {
  const { data } = await fetchAdvertiserList();
  aliasOptions.value = data;
});

async function reset() {
  await restoreValidation();
  emit('reset');
}

async function search() {
  await validate();
  emit('search');
}
async function download() {
  emit('download');
}
</script>

<template>
  <NCard :bordered="false" size="small" class="card-wrapper">
    <NForm ref="formRef" :model="model" :show-feedback="false" label-placement="left">
      <NGrid responsive="screen" item-responsive>
        <NFormItemGi span="24 s:12 m:6" :label="$t('common.date')" path="username" class="pr-24px">
          <NDatePicker
            v-model:formatted-value="model.date"
            value-format="yyyy-MM-dd"
            type="daterange"
            :is-date-disabled="disablePreviousDate"
            :shortcuts="rangeShortcuts"
            :clearable="false"
            @confirm="search"
          />
        </NFormItemGi>
        <NFormItemGi
          v-if="aliasOptions.length > 0"
          span="24 s:12 m:6"
          :label="$t('page.advertiser.advertiser_name')"
          path="username"
          class="pr-24px"
        >
          <NSelect v-model:value="model.advertiser_name" :options="aliasOptions" multiple clearable />
        </NFormItemGi>
        <NFormItemGi span="24 s:12 m:6" :label="$t('page.advertiser.advertiser_id')" path="username" class="pr-24px">
          <NInput v-model:value="model.advertiser_id" clearable @keyup.enter="search" />
        </NFormItemGi>
        <NFormItemGi span="24 s:6" class="pr-24px">
          <NSpace class="w-full" justify="end">
            <NButton @click="reset">
              <template #icon>
                <icon-ic-round-refresh class="text-icon" />
              </template>
              {{ $t('common.reset') }}
            </NButton>
            <NButton type="primary" ghost @click="search">
              <template #icon>
                <icon-ic-round-search class="text-icon" />
              </template>
              {{ $t('common.search') }}
            </NButton>
            <NButton type="tertiary" @click="download">
              下载
            </NButton>
          </NSpace>
        </NFormItemGi>
      </NGrid>
    </NForm>
  </NCard>
</template>
