<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { fetchRatio, updateRatio } from '@/service/api/system-manage';

const loading = ref(false);

const model = reactive({
  ratioA: -1,
  ratioB: -1,
  ratioC: -1
});

onMounted(async () => {
  const { data } = await fetchRatio();
  model.ratioA = Number(data.a);
  model.ratioB = Number(data.b);
  model.ratioC = Number(data.c);
});

async function submit() {
  loading.value = true;
  await updateRatio(model);
  window.$message?.success('修改成功');
  loading.value = false;
}
</script>

<template>
  <div class="flex-vertical-stretch gap-16px overflow-hidden <sm:overflow-auto">
    <NCard :bordered="false" title="计算系数" size="small" class="card-wrapper sm:flex-1-hidden">
      <n-form :model="model">
        <n-form-item path="ratioA" label="A">
          <NInputNumber v-model:value="model.ratioA" @keydown.enter.prevent />
        </n-form-item>
        <n-form-item path="ratioB" label="B">
          <NInputNumber v-model:value="model.ratioB" @keydown.enter.prevent />
        </n-form-item>
        <n-form-item first path="ratioC" label="C">
          <NInputNumber v-model:value="model.ratioC" @keydown.enter.prevent />
        </n-form-item>
      </n-form>
      <NButton type="primary" :loading="loading" @click="submit">确定</NButton>
    </NCard>
  </div>
</template>

<style scoped></style>
