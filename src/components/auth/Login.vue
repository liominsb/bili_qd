<script setup lang="ts">
import { reactive } from 'vue'
import useUiStore from '../../store/ui'
import {NInput, NButton, NForm, useMessage} from 'naive-ui'
const ui = useUiStore()
import useUserStore from '../../store/user'
const userStore = useUserStore()
const message = useMessage()
// 表单数据,双向绑定到下面的 input
const loginform = reactive({ username: '', password: '' })
const registerform = reactive({ username: '', password1: '',password2: '' })

// 统一关闭入口:点 × / 点遮罩 / 按 Esc 都调它
const close = () => ui.closeLogin()

// 提交登录
const handleLogin = async () => {
  try {
    if (!loginform.username || !loginform.password) {
      message.warning('请输入完整')
      return
    }
    await userStore.login(loginform)
    ui.closeLogin()
  }
  catch (err) {
    message.error(err instanceof Error ? err.message : '操作失败')
  }
}
const handleRegister = async () => {
  try {
    if (!registerform.username || !registerform.password1 || !registerform.password2){
      message.warning('请输入完整')
      return
    }
    if (registerform.password1 != registerform.password2) {
      message.warning('两次输入的密码不一致')
      return
    }
    await userStore.register({
      username: registerform.username,
      password: registerform.password1,
    })
    ui.closeLogin()
  }
  catch (err) {
    message.error(err instanceof Error ? err.message : '操作失败')
  }
}

// 第三方登录：整页跳转到后端入口，由后端 302 到 GitHub 授权页。
// 不能用 axios —— 这是浏览器跳转，axios 只会把 302 响应体读回来，页面不会真的跳走。
const handleGithubLogin = function () {
  window.location.href = '/api/auth/github/login'
}
</script>

<template>
  <n-modal v-model:show="ui.loginVisible">
            <n-card  style="width: 420px;">
              <button class="close" @click="close">×</button>
              <n-tabs
                  class="card-tabs"
                  default-value="signin"
                  size="large"
                  animated
                  pane-wrapper-style="margin: 0 -4px"
                  pane-style="padding-left: 4px; padding-right: 4px; box-sizing: border-box;"
              >
                <n-tab-pane name="signin" tab="登录"  @keydown.enter.prevent="handleLogin">
                  <n-form :model="loginform">
                    <n-form-item-row label="用户名">
                      <n-input v-model:value="loginform.username" placeholder="请输入用户名"/>
                    </n-form-item-row>
                    <n-form-item-row label="密码 ">
                      <n-input v-model:value="loginform.password" placeholder="请输入密码" type="password"/>
                    </n-form-item-row>
                  </n-form>
                  <n-button @click="handleLogin" type="primary" block secondary strong>
                    登录
                  </n-button>
                </n-tab-pane>
                <n-tab-pane name="signup" tab="注册" @keydown.enter.prevent="handleRegister()">
                  <n-form :model="registerform">
                    <n-form-item-row label="用户名">
                      <n-input v-model:value="registerform.username" placeholder="请输入用户名"/>
                    </n-form-item-row>
                    <n-form-item-row label="密码">
                      <n-input v-model:value="registerform.password1" placeholder="请输入密码" type="password"/>
                    </n-form-item-row>
                    <n-form-item-row label="重复密码">
                      <n-input v-model:value="registerform.password2" placeholder="请再次输入密码" type="password"/>
                    </n-form-item-row>
                  </n-form>
                  <n-button @click="handleRegister" type="primary" block secondary strong>
                    注册
                  </n-button>
                </n-tab-pane>
              </n-tabs>
              <!-- 第三方登录：和上面的账号密码登录是两条独立的路 -->
              <n-divider style="font-size: 12px; margin: 18px 0 12px;color: #999999">
                其他登录方式
              </n-divider>
              <n-button attr-type="button" block @click="handleGithubLogin">
                <i class="iconfont icon-GitHub" style="padding: 10px"></i>
                使用 GitHub 登录
              </n-button>
            </n-card>
  </n-modal>
</template>

<style scoped>
.close {
  position: absolute;
  top: 12px;
  right: 12px;
  border: none;
  background: none;
  font-size: 20px;
  color: #999;
  cursor: pointer;
}


</style>
