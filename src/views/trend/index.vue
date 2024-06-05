<template>
  <div class="box">
    <n-radio-group v-model:value="type" name="radiogroup" @change="fetchChartData">
      <n-space>
        <n-radio v-for="song in [{ label: '月视图', value: 'month' }, { label: '周视图', value: 'week' }]" :key="song.value"
          :value="song.value">
          {{ song.label }}
        </n-radio>
      </n-space>
    </n-radio-group>
    <v-chart class="chart" :option="option" />
  </div>
</template>

<script setup>
import { ref, provide, onMounted } from 'vue';
import VChart, { THEME_KEY } from "vue-echarts";
import { getAdvertiserTrend } from '@/service/api';

import { use, graphic } from 'echarts/core'
import { LineChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  ToolboxComponent,
  GridComponent
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

use([
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  ToolboxComponent,
  GridComponent,
  LineChart,
  CanvasRenderer
])

const chartRef = ref(null);
const option = ref({})
const type = ref('month')

onMounted(() => {
  fetchChartData()
})

const fetchChartData = async () => {
  const { data } = await getAdvertiserTrend({ type: type.value })
  const labels = ['消耗', '充值', '利润']
  const dates = data.map(i => {
    const date = i.date.split('-')
    return `${date[1]}.${date[2]}`
  })
  option.value = {
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: labels
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    toolbox: {
      feature: {
        saveAsImage: {}
      }
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: dates
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '消耗',
        type: 'line',
        stack: 'Total',
        smooth: true,
        label: {
          show: true,
          position: 'top'
        },
        areaStyle: {
          color: new graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#5470c6' },
            { offset: 1, color: '#fff' }
          ])
        },
        data: data.map(i => i.cost.toFixed(0))
      },
      {
        name: '充值',
        type: 'line',
        stack: 'Total',
        smooth: true,
        areaStyle: {
          color: new graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#91cc75' },
            { offset: 1, color: '#fff' }
          ])
        },
        data: data.map(i => i.pay.toFixed(0))
      },
      {
        name: '利润',
        type: 'line',
        stack: 'Total',
        smooth: true,
        areaStyle: {
          color: new graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#fac858' },
            { offset: 1, color: '#fff' }
          ])
        },
        data: data.map(i => i.profit.toFixed(0))
      },
    ]
  };
}

const interval = setInterval(() => fetchChartData, 1000 * 60 * 3)

</script>

<style scoped>
.box {
  margin-top: 12px;
  display: flex;
  flex-direction: column;
}

.chart {
  flex: 1;
  height: 100%;
  width: 100%;
  /* height: 400px; */
  /* width: 800px */
}
</style>