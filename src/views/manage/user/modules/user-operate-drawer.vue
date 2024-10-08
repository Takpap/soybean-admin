<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import { omit, omitBy } from 'lodash';
import { useFormRules, useNaiveForm } from '@/hooks/common/form';
import { createUser, fetchGetAllMembers, fetchGetAllRoles, updateUser } from '@/service/api';
import { $t } from '@/locales';
import { enableStatusOptions } from '@/constants/business';

defineOptions({
  name: 'UserOperateDrawer'
});

/**
 * the type of operation
 *
 * - add: add user
 * - edit: edit user
 */
export type OperateType = 'add' | 'edit';

interface Props {
  /** the type of operation */
  operateType: OperateType;
  /** the edit row data */
  rowData?: Api.SystemManage.User | null;
}

const props = defineProps<Props>();

interface Emits {
  (e: 'submitted'): void;
}

const emit = defineEmits<Emits>();

const visible = defineModel<boolean>('visible', {
  default: false
});

const { formRef, validate, restoreValidation } = useNaiveForm();
const { defaultRequiredRule } = useFormRules();

const title = computed(() => {
  const titles: Record<OperateType, string> = {
    add: $t('page.manage.user.addUser'),
    edit: $t('page.manage.user.editUser')
  };
  return titles[props.operateType];
});

type Model = Pick<
  Api.SystemManage.User,
  | 'username'
  | 'shortName'
  | 'alias'
  | 'phone'
  | 'email'
  | 'roles'
  | 'status'
  | 'password'
  | 'remark'
  | 'members'
  | 'menus'
>;

const model: Model = reactive(createDefaultModel());

function createDefaultModel(): Model {
  return {
    username: '',
    shortName: '',
    members: '',
    alias: '',
    remark: '',
    phone: '',
    email: '',
    password: '123456',
    roles: 'ghost',
    status: 1,
    menus: []
  };
}

type RuleKey = Extract<keyof Model, 'username' | 'status' | 'alias' | 'shortName'>;

const rules: Record<RuleKey, App.Global.FormRule> = {
  username: defaultRequiredRule,
  alias: defaultRequiredRule,
  shortName: defaultRequiredRule,
  status: defaultRequiredRule
};

/** the enabled role options */
const roleOptions = ref<CommonType.Option<string>[]>([]);
const memberOptions = ref<CommonType.Option<string>[]>([]);

async function getRoleOptions() {
  const { error, data } = await fetchGetAllRoles();

  if (!error) {
    roleOptions.value = data;
  }
}

async function getMembers() {
  const { error, data } = await fetchGetAllMembers();

  if (!error) {
    memberOptions.value = data;
  }
}

function handleUpdateModelWhenEdit() {
  if (props.operateType === 'add') {
    Object.assign(model, createDefaultModel());
    return;
  }

  if (props.operateType === 'edit' && props.rowData) {
    Object.assign(
      model,
      omitBy(props.rowData, (value, key) => key.includes('text'))
    );
  }
}

function closeDrawer() {
  visible.value = false;
}

async function handleSubmit() {
  await validate();
  // request
  const data = omit(model, ['userGender', 'updateAt', 'createAt']);
  try {
    if (props.operateType === 'edit') {
      await updateUser(omit({ ...data, members: data.members?.toString() }, 'password'));
    } else {
      await createUser({ ...data, members: data.members?.toString() });
    }
    window.$message?.success($t('common.updateSuccess'));
    closeDrawer();
    emit('submitted');
  } catch (error) {
    console.log('error', error);
  }
}

watch(visible, () => {
  if (visible.value) {
    handleUpdateModelWhenEdit();
    restoreValidation();
    getRoleOptions();
    getMembers();
  }
});
</script>

<template>
  <NDrawer v-model:show="visible" :title="title" display-directive="show" :width="360">
    <NDrawerContent :title="title" :native-scrollbar="false" closable>
      <NForm ref="formRef" :model="model" :rules="rules">
        <NFormItem :label="$t('page.manage.user.username')" path="username">
          <NInput v-model:value="model.username" :placeholder="$t('page.manage.user.form.username')" />
        </NFormItem>
        <NFormItem v-if="props.operateType === 'add'" :label="$t('page.manage.user.password')" path="password">
          <NInput v-model:value="model.password" :placeholder="$t('page.manage.user.form.password')" />
        </NFormItem>
        <NFormItem :label="$t('page.manage.user.shortName')" path="shortName">
          <NInput v-model:value="model.shortName" :placeholder="$t('page.manage.user.form.shortName')" />
        </NFormItem>
        <NFormItem :label="$t('page.manage.user.alias')" path="alias">
          <NInput v-model:value="model.alias" :placeholder="$t('page.manage.user.form.alias')" />
        </NFormItem>
        <NFormItem :label="$t('page.manage.user.remark')" path="remark">
          <NInput v-model:value="model.remark" :placeholder="$t('page.manage.user.form.remark')" type="textarea" />
        </NFormItem>
        <!--
 <NFormItem :label="$t('page.manage.user.phone')" path="phone">
          <NInput v-model:value="model.phone" :placeholder="$t('page.manage.user.form.phone')" />
        </NFormItem>
        <NFormItem :label="$t('page.manage.user.email')" path="email">
          <NInput v-model:value="model.email" :placeholder="$t('page.manage.user.form.email')" />
        </NFormItem> 
-->
        <NFormItem :label="$t('page.manage.user.status')" path="status">
          <NRadioGroup v-model:value="model.status">
            <NRadio v-for="item in enableStatusOptions" :key="item.value" :value="item.value" :label="$t(item.label)" />
          </NRadioGroup>
        </NFormItem>
        <NFormItem label="菜单权限" path="menus">
          <NSelect
            v-model:value="model.menus"
            multiple
            :options="[{ label: '小说看板', value: 'novel' }]"
            placeholder="请选择菜单权限"
          />
        </NFormItem>
        <NFormItem :label="$t('page.manage.user.roles')" path="roles">
          <NSelect
            v-model:value="model.roles"
            :options="roleOptions"
            :placeholder="$t('page.manage.user.form.roles')"
          />
        </NFormItem>
        <NFormItem v-if="['admin', 'editor'].includes(model.roles)" :label="$t('page.manage.user.members')" path="members">
          <NSelect
            v-model:value="model.members"
            multiple
            :options="memberOptions"
            :placeholder="$t('page.manage.user.form.members')"
          />
        </NFormItem>
      </NForm>
      <template #footer>
        <NSpace :size="16">
          <NButton @click="closeDrawer">{{ $t('common.cancel') }}</NButton>
          <NButton type="primary" @click="handleSubmit">{{ $t('common.confirm') }}</NButton>
        </NSpace>
      </template>
    </NDrawerContent>
  </NDrawer>
</template>
