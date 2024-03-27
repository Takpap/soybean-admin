<script setup lang="ts">
import { computed, reactive, watch } from 'vue';
import { omit, omitBy } from 'lodash';
import { useFormRules, useNaiveForm } from '@/hooks/common/form';
import { createRelation, updateRelation } from '@/service/api';
import { $t } from '@/locales';

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
    add: $t('page.manage.relation.addRelation'),
    edit: $t('page.manage.relation.editRelation')
  };
  return titles[props.operateType];
});

type Model = Pick<Api.SystemManage.Relation, 'advertiser_id' | 'link'>;

const model: Model = reactive(createDefaultModel());

function createDefaultModel(): Model {
  return {
    advertiser_id: '',
    link: ''
  };
}

type RuleKey = Extract<keyof Model, 'advertiser_id' | 'link'>;

const rules: Record<RuleKey, App.Global.FormRule> = {
  advertiser_id: defaultRequiredRule,
  link: defaultRequiredRule
};

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
      await updateRelation(data);
    } else {
      await createRelation(data);
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
  }
});
</script>

<template>
  <NDrawer v-model:show="visible" :title="title" display-directive="show" :width="360">
    <NDrawerContent :title="title" :native-scrollbar="false" closable>
      <NForm ref="formRef" :model="model" :rules="rules">
        <NFormItem :label="$t('page.manage.relation.advertiser_id')" path="advertiser_id">
          <NInput v-model:value="model.advertiser_id" :placeholder="$t('page.manage.relation.form.advertiser_id')" />
        </NFormItem>
        <NFormItem :label="$t('page.manage.relation.link')" path="link">
          <NInput v-model:value="model.link" :placeholder="$t('page.manage.relation.form.link')" />
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
