<script setup lang="tsx">
import { reactive, ref } from 'vue';
import { NButton, NPopconfirm, NTag } from 'naive-ui';
import { useBoolean } from '@sa/hooks';
import { changePwd, deleteUser, fetchGetUserList } from '@/service/api';
import { useAppStore } from '@/store/modules/app';
import { useTable } from '@/hooks/common/table';
import { $t } from '@/locales';
import { enableStatusRecord } from '@/constants/business';
import UserOperateDrawer, { type OperateType } from './modules/user-operate-drawer.vue';
import UserSearch from './modules/user-search.vue';

const appStore = useAppStore();
const { bool: drawerVisible, setTrue: openDrawer } = useBoolean();

const { columns, filteredColumns, data, loading, pagination, getData, searchParams, resetSearchParams } = useTable<
  Api.SystemManage.User,
  typeof fetchGetUserList,
  'index' | 'operate'
>({
  apiFn: fetchGetUserList,
  apiParams: {
    current: 1,
    size: 100,
    // if you want to use the searchParams in Form, you need to define the following properties, and the value is null
    // the value can not be undefined, otherwise the property in Form will not be reactive
    status: null,
    username: null,
    userGender: null,
    shortName: null,
    members: null,
    alias: null,
    phone: null,
    email: null
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
      type: 'selection',
      align: 'center',
      width: 48
    },
    // {
    //   key: 'index',
    //   title: $t('common.index'),
    //   render: (_, index): string => getIndex(index),
    //   align: 'center',
    //   width: 64
    // },
    {
      key: 'username',
      title: $t('page.manage.user.username'),
      align: 'center',
      minWidth: 100
    },
    {
      key: 'shortName',
      title: $t('page.manage.user.shortName'),
      align: 'center',
      minWidth: 100
    },
    {
      key: 'alias',
      title: $t('page.manage.user.alias'),
      align: 'center',
      minWidth: 100
    },
    {
      key: 'members_text',
      title: $t('page.manage.user.members'),
      align: 'center',
      minWidth: 100
    },
    {
      key: 'remark',
      title: $t('page.manage.user.remark'),
      align: 'center',
      minWidth: 100
    },
    {
      key: 'roles',
      title: $t('page.manage.user.roles'),
      align: 'center',
      minWidth: 100,
      render: row => {
        const roleMap = {
          admin: 'success',
          editor: 'warning',
          ghost: 'info'
        };
        return <NTag type={roleMap[row.roles]}>{row.roles_text}</NTag>;
      }
    },
    {
      key: 'status',
      title: $t('page.manage.user.status'),
      align: 'center',
      width: 100,
      render: row => {
        if (row.status === null) {
          return null;
        }

        const tagMap: Record<Api.Common.EnableStatus, NaiveUI.ThemeColor> = {
          1: 'success',
          0: 'warning'
        };

        const label = $t(enableStatusRecord[row.status]);

        return <NTag type={tagMap[row.status]}> {label} </NTag>;
      }
    },
    {
      key: 'operate',
      title: $t('common.operate'),
      align: 'center',
      width: 230,
      render: row => (
        <div class="flex-center gap-8px">
          <NButton type="primary" ghost size="small" onClick={() => handleChangePwd(row)}>
            {$t('common.changePwd')}
          </NButton>
          <NButton type="primary" ghost size="small" onClick={() => handleEdit(row.id)}>
            {$t('common.edit')}
          </NButton>
          <NPopconfirm onPositiveClick={() => handleDelete(row.id)}>
            {{
              default: () => $t('common.confirmDelete'),
              trigger: () => (
                <NButton type="error" ghost size="small">
                  {$t('common.delete')}
                </NButton>
              )
            }}
          </NPopconfirm>
        </div>
      )
    }
  ]
});

const operateType = ref<OperateType>('add');

function handleAdd() {
  operateType.value = 'add';
  openDrawer();
}

const checkedRowKeys = ref<string[]>([]);

async function handleBatchDelete() {
  // request
  window.$message?.success($t('common.deleteSuccess'));

  checkedRowKeys.value = [];

  getData('');
}

/** the editing row data */
const editingData = ref<Api.SystemManage.User | null>(null);

const showModal = ref(false);
let currentRow;
const password = ref('');
const newPassword = ref('');

function handleEdit(id: number) {
  operateType.value = 'edit';
  editingData.value = data.value.find(item => item.id === id) || null;
  openDrawer();
}

async function handleDelete(id: string) {
  await deleteUser(id);
  window.$message?.success($t('common.deleteSuccess'));

  getData('');
}

async function handleChangePwd(row: object) {
  currentRow = row;
  showModal.value = true;
}

async function submitPwd() {
  if (password.value === newPassword.value) {
    await changePwd({ id: currentRow.id, password: newPassword.value });
    showModal.value = false;
    window.$message?.success('修改成功');
    getData('');
  } else {
    window.$message?.error('两次密码不一致');
  }
}
</script>

<template>
  <div class="flex-vertical-stretch gap-16px overflow-hidden <sm:overflow-auto">
    <UserSearch v-model:model="searchParams" @reset="resetSearchParams" @search="getData" />
    <NCard :title="$t('page.manage.user.title')" :bordered="false" size="small" class="card-wrapper sm:flex-1-hidden">
      <template #header-extra>
        <TableHeaderOperation
          v-model:columns="filteredColumns"
          :disabled-delete="checkedRowKeys.length === 0"
          :loading="loading"
          @add="handleAdd"
          @delete="handleBatchDelete"
          @refresh="getData"
        />
      </template>
      <NDataTable
        v-model:checked-row-keys="checkedRowKeys"
        :columns="columns"
        :data="data"
        size="small"
        :flex-height="!appStore.isMobile"
        :scroll-x="640"
        :loading="loading"
        :pagination="pagination"
        :row-key="item => item.id"
        class="sm:h-full"
      />
      <UserOperateDrawer
        v-model:visible="drawerVisible"
        :operate-type="operateType"
        :row-data="editingData"
        @submitted="getData"
      />
      <n-modal v-model:show="showModal" title="修改密码" preset="dialog">
        <div>
          <span>新密码</span>
          <NInput v-model:value="password" type="password" />
          <div class="mt-2"></div>
          <span>确定密码</span>
          <NInput v-model:value="newPassword" type="password" />
        </div>
        <template #action>
          <NButton type="primary" @click="submitPwd">确定</NButton>
        </template>
      </n-modal>
    </NCard>
  </div>
</template>

<style scoped></style>
