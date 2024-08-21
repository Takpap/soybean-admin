<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { fetchRatio, updateRatio } from '@/service/api/system-manage';
import { request } from '@/service/request';

const loading = ref(false);
const dynamic_loading = ref(false);
const page_loading = ref(false);

type config = {
  name: string;
  min?: number;
  max?: number;
  total?: number;
  count?: number;
};

const model = reactive({
  ratioA: -1,
  ratioB: -1,
  ratioC: -1
});

const dynamicForm = reactive({
  configs: [] as config[]
});

const formRef = ref(null);

onMounted(async () => {
  page_loading.value = true;
  const { data } = await fetchRatio();
  model.ratioA = Number(data.a);
  model.ratioB = Number(data.b);
  model.ratioC = Number(data.c);

  const result = await request({ method: 'get', url: 'setting' });
  dynamicForm.configs = result.data;
  page_loading.value = false;
});

async function submit() {
  loading.value = true;
  await updateRatio(model);
  window.$message?.success('修改成功');
  loading.value = false;
}

const removeItem = (index: number) => {
  dynamicForm.configs.splice(index, 1);
};

const addItem = () => {
  dynamicForm.configs.push({ name: '', min: undefined, max: undefined, total: undefined, count: undefined });
};

const handleValidateClick = async () => {
  try {
    dynamic_loading.value = true;
    const { data } = await request({ method: 'post', url: 'setting', data: dynamicForm });
    if (data) {
      window.$message?.success('修改成功');
    }
  } catch (error) {
    console.log('error', error);
  } finally {
    dynamic_loading.value = false;
  }
};
</script>

<template>
  <div class="flex-vertical-stretch gap-16px <sm:overflow-auto">
    <NCard :bordered="false" title="回传配置" size="small" class="card-wrapper sm:flex-1">
      <n-skeleton v-if="page_loading" text size="large" :repeat="5" width="65%" />
      <n-form v-else ref="formRef" :model="dynamicForm" size="small" :show-feedback="false">
        <n-form-item v-for="(item, index) in dynamicForm.configs" :key="index" :path="`configs[${index}].hobby`">
          <div class="flex-inline justify-center gap-2 whitespace-nowrap items-center">
            <n-input-group style="width: unset">
              <n-tag type="primary">
                规则名称
              </n-tag>
              <n-input v-model:value="item.name"laceholder="请输入" :style="{ width: '50%' }"  />
            </n-input-group>
            <span>当金额在</span>
            <n-input-number v-model:value="item.min" clearable :precision="0">
              <template #prefix>
                ￥
              </template>
            </n-input-number>
            <span>至</span>
            <n-input-number v-model:value="item.max" clearable :precision="0">
              <template #prefix>
                ￥
              </template>
            </n-input-number>
            <span>范围时，每</span>
            <n-input-number v-model:value="item.total" :min="1" clearable :precision="0" />
            <span>笔订单扣掉</span>
            <n-input-number v-model:value="item.count" :min="0" :max="item.total || 0" clearable :precision="0" />
            <span>笔</span>
          </div>
          <n-button v-if="index > 0" style="margin-left: 16px" plain ghost type="error" @click="removeItem(index)">
            删除
          </n-button>
        </n-form-item>

        <n-form-item>
          <n-space>
            <n-button attr-type="button" @click="addItem">增加</n-button>
            <n-button attr-type="button" :loading="dynamic_loading" type="primary" @click="handleValidateClick">
              确定
            </n-button>
          </n-space>
        </n-form-item>
      </n-form>
    </NCard>
    <NCard :bordered="false" title="计算系数" size="small" class="card-wrapper sm:flex-1">
      <n-skeleton v-if="page_loading" text size="large" :repeat="4" width="52%" />
      <n-form v-else :model="model">
        <n-form-item path="ratioA" label="A">
          <NInputNumber v-model:value="model.ratioA" @keydown.enter.prevent />
        </n-form-item>
        <n-form-item path="ratioB" label="B">
          <NInputNumber v-model:value="model.ratioB" @keydown.enter.prevent />
        </n-form-item>
        <n-form-item first path="ratioC" label="C">
          <NInputNumber v-model:value="model.ratioC" @keydown.enter.prevent />
        </n-form-item>
        <n-form-item>
          <NButton type="primary" :loading="loading" @click="submit">确定</NButton>
        </n-form-item>
      </n-form>
    </NCard>
  </div>
</template>
