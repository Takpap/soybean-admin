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
  id: '',
  ratioA: -1,
  ratioB: -1,
  ratioC: -1
});

const novel_model = reactive({
  id: '',
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
  const { data: playlet } = await fetchRatio({ type: 'playlet' });
  const data = playlet.value;
  model.id = playlet.id;
  model.ratioA = Number(data.ratioA);
  model.ratioB = Number(data.ratioB);
  model.ratioC = Number(data.ratioC);

  const { data: novel } = await fetchRatio({ type: 'novel' });
  const novel_data = novel.value;
  novel_model.id = novel.id;
  novel_model.ratioA = Number(novel_data.ratioA);
  novel_model.ratioB = Number(novel_data.ratioB);
  novel_model.ratioC = Number(novel_data.ratioC);

  const result = await request({ method: 'get', url: 'setting' });
  dynamicForm.configs = result.data;
  page_loading.value = false;
});

async function submit(type: string) {
  loading.value = true;
  await updateRatio({ ...(type === 'playlet' ? model : novel_model), type });
  window.$message?.success('修改成功');
  loading.value = false;
}

const removeItem = async (index: number) => {
  const configId = dynamicForm.configs[index]?.id;

  if (configId) {
    const { data } = await request({ method: 'delete', url: `setting/${configId}` });
    if (data) {
      dynamicForm.configs.splice(index, 1);
      window.$message?.success('删除成功');
    }
  } else {
    dynamicForm.configs.splice(index, 1);
  }
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
              <n-tag type="primary">规则名称</n-tag>
              <n-input v-model:value="item.name" laceholder="请输入" :style="{ width: '50%' }" />
            </n-input-group>
            <span>当金额在</span>
            <n-input-number v-model:value="item.min" clearable :precision="0">
              <template #prefix>￥</template>
            </n-input-number>
            <span>至</span>
            <n-input-number v-model:value="item.max" clearable :precision="0">
              <template #prefix>￥</template>
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
    <NCard :bordered="false" title="短剧计算系数" size="small" class="card-wrapper sm:flex-1">
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
          <NButton type="primary" :loading="loading" @click="submit('playlet')">确定</NButton>
        </n-form-item>
      </n-form>
    </NCard>
    <NCard :bordered="false" title="小说计算系数" size="small" class="card-wrapper sm:flex-1">
      <n-skeleton v-if="page_loading" text size="large" :repeat="4" width="52%" />
      <n-form v-else :model="novel_model">
        <n-form-item path="ratioA" label="A">
          <NInputNumber v-model:value="novel_model.ratioA" @keydown.enter.prevent />
        </n-form-item>
        <n-form-item path="ratioB" label="B">
          <NInputNumber v-model:value="novel_model.ratioB" @keydown.enter.prevent />
        </n-form-item>
        <n-form-item first path="ratioC" label="C">
          <NInputNumber v-model:value="novel_model.ratioC" @keydown.enter.prevent />
        </n-form-item>
        <n-form-item>
          <NButton type="primary" :loading="loading" @click="submit('novel')">确定</NButton>
        </n-form-item>
      </n-form>
    </NCard>
  </div>
</template>
