<script setup lang="ts">
import { useMessage } from 'naive-ui'
import type { FormInst, FormRules } from 'naive-ui'
import { ref } from 'vue'
import useUserStore from '../../store/user.ts'
import type {psw, User} from "../../api/types.ts";

const profileFormRef = ref<FormInst | null>(null)
const pswFormRef = ref<FormInst | null>(null)
const userStore = useUserStore()
const message = useMessage()

const formValue = ref<User>({
  id: userStore.id,
  username: userStore.name,
  image: userStore.image,
  bio: userStore.bio,
  password: ''
})

const formPsw = ref<psw>({
  old_password:'',
  new_password:'',
})

const rules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 10, message: '长度需在 3 到 10 个字符之间', trigger: 'input' }
  ],
  image: {
    required: true,
    message: '请输入头像',
    trigger: 'blur'
  },
  bio: [
    {required: true, message: '请输入个人简介', trigger: 'blur'},
    { min: 2, max: 100, message: '长度需在 2 到 100 个字符之间', trigger: 'input' }
  ]
}

const formPswRules: FormRules = {
  old_password: [
    { required: true, message: '请输入旧密码', trigger: 'blur' },
    { min: 3, max: 20, message: '长度需在 3 到 20 个字符之间', trigger: 'input' }
  ],
  new_password: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 3, max: 20, message: '长度需在 3 到 20 个字符之间', trigger: 'input' }
  ]
}

function handleValidate() {
  if (formValue.value.username==userStore.name&&formValue.value.bio==userStore.bio&&formValue.value.image==userStore.image) {
    message.warning('没有修改任何信息，取消提交')
    return
  }
  profileFormRef.value?.validate((errors) => {
    if (!errors) {
      message.success('验证通过，提交表单')
      userStore.updateMyUserinfo(formValue.value)
    }
    else {
      message.error('表单验证失败')
    }
  })
}

function handleValidatePsw() {
  pswFormRef.value?.validate(async (errors) => {
    if (!errors) {
      try {
        await userStore.updateMyPassword(formPsw.value)
        message.success('修改密码成功，请重新登录')
        } catch (error:any) {
        message.error(error.message)
        console.log(error.message)
      }
    }
    else {
      const msg = errors.flat().map(function (e) { return e.message }).join('\n')
      message.error(msg)
      return
    }
  })
}
</script>

<template>
  <n-form
      ref="profileFormRef"
      inline
      :label-width="80"
      :model="formValue"
      :rules="rules"
  >
    <n-form-item label="用户名" path="username">
      <n-input v-model:value="formValue.username" placeholder="输入用户名" />
    </n-form-item>
    <n-form-item label="头像" path="image">
      <n-input v-model:value="formValue.image" placeholder="输入头像链接" />
    </n-form-item>
    <n-form-item label="个人简介" path="bio">
      <n-input v-model:value="formValue.bio" placeholder="输入个人简介" />
    </n-form-item>
    <n-form-item>
      <n-button @click="handleValidate">
        提交
      </n-button>
    </n-form-item>
  </n-form>

  <n-form
      ref="pswFormRef"
      inline
      :label-width="80"
      :model="formPsw"
      :rules="formPswRules"
  >
    <n-form-item label="旧密码" path="old_password">
      <n-input v-model:value="formPsw.old_password" placeholder="输入旧密码" />
    </n-form-item>
    <n-form-item label="新密码" path="new_password">
      <n-input v-model:value="formPsw.new_password" placeholder="输入新密码" />
    </n-form-item>
    <n-form-item>
      <n-button @click="handleValidatePsw">
        提交
      </n-button>
    </n-form-item>
  </n-form>
</template>

<style scoped>

</style>