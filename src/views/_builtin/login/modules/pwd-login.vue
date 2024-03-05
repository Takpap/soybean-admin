<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import { $t } from '@/locales';
// import { loginModuleRecord } from '@/constants/app';
// import { useRouterPush } from '@/hooks/common/router';
import { useFormRules, useNaiveForm } from '@/hooks/common/form';
import { useAuthStore } from '@/store/modules/auth';

defineOptions({
  name: 'PwdLogin'
});

const authStore = useAuthStore();
// const { toggleLoginModule } = useRouterPush();
const { formRef, validate } = useNaiveForm();

interface FormModel {
  username: string;
  password: string;
}

const loginInfo = JSON.parse(localStorage.getItem('loginInfo') || '{}');
console.log('loginInfo.remember', loginInfo.remember);
const rememberMe = ref(loginInfo.remember);

const model: FormModel = reactive({
  username: loginInfo.remember ? loginInfo.username : '',
  password: loginInfo.remember ? loginInfo.password : ''
});

const rules = computed<Record<keyof FormModel, App.Global.FormRule[]>>(() => {
  const { formRules } = useFormRules(); // inside computed to make locale reactive

  return {
    username: formRules.username,
    password: formRules.pwd
  };
});

async function handleSubmit() {
  await validate();
  if (rememberMe.value) localStorage.setItem('loginInfo', JSON.stringify({ ...model, remember: rememberMe.value }));
  await authStore.login(model.username, model.password);
}
</script>

<template>
  <NForm ref="formRef" :model="model" :rules="rules" size="large" :show-label="false">
    <NFormItem path="username">
      <NInput v-model:value="model.username" :placeholder="$t('page.login.common.userNamePlaceholder')" />
    </NFormItem>
    <NFormItem path="password">
      <NInput
        v-model:value="model.password"
        type="password"
        :placeholder="$t('page.login.common.passwordPlaceholder')"
      />
    </NFormItem>
    <NSpace vertical :size="24">
      <div class="flex-y-center justify-between">
        <NCheckbox v-model:checked="rememberMe">{{ $t('page.login.pwdLogin.rememberMe') }}</NCheckbox>
        <NButton quaternary>{{ $t('page.login.pwdLogin.forgetPassword') }}</NButton>
      </div>
      <NButton type="primary" size="large" block round :loading="authStore.loginLoading" @click="handleSubmit">
        {{ $t('common.confirm') }}
      </NButton>
      <!--
 <div class="flex-y-center justify-between gap-12px">
        <NButton class="flex-1" block @click="toggleLoginModule('code-login')">
          {{ $t(loginModuleRecord['code-login']) }}
        </NButton>
        <NButton class="flex-1" block @click="toggleLoginModule('register')">
          {{ $t(loginModuleRecord.register) }}
        </NButton>
      </div> 
-->
    </NSpace>
  </NForm>
</template>

<style scoped></style>
