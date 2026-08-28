<script setup lang="ts">
import { reactive } from 'vue'
import { useUiStore } from '../../store/ui'
import { NInput, NButton, NForm, NFormItem, NConfigProvider } from 'naive-ui'
const ui = useUiStore()
import useUserStore from '../../store/user'
const userStore = useUserStore()
// 表单数据,双向绑定到下面的 input
const form = reactive({ username: '', password: '' })

const themeOverrides = {
  common: {
    primaryColor: '#23ade5',
    primaryColorHover: '#3db9e8',
    primaryColorPressed: '#1f9ad0',
    primaryColorSuppl: '#3db9e8',
  },
}

// 统一关闭入口:点 × / 点遮罩 / 按 Esc 都调它
const close = () => ui.closeLogin()

// 提交登录
const handleLogin = async () => {
  if (!form.username || !form.password) return
  await userStore.login(form)
  ui.closeLogin()
}
const handleRegister = async () => {
  if (!form.username || !form.password) return
  await userStore.register(form)
  ui.closeLogin()
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="ui.loginVisible" class="backdrop" @click.self="close">
        <!-- 主题覆盖只包住弹窗，不影响全站其他组件 -->
        <n-config-provider :theme-overrides="themeOverrides">
          <div class="dialog">
            <button class="close" @click="close">×</button>
            <h3>登录</h3>
            <n-form :model="form" label-placement="left" :label-width="40" @submit.prevent>
              <n-form-item label="账号" path="username">
                <n-input
                    v-model:value="form.username"
                    type="text" placeholder="请输入账号"
                    @keydown.enter.prevent="handleLogin"/>
              </n-form-item>
              <n-form-item label="密码" path="password">
                <n-input
                    v-model:value="form.password"
                    type="password"
                    show-password-on="mousedown"
                    placeholder="请输入密码"
                    @keydown.enter.prevent="handleLogin"/>
              </n-form-item>
              <div class="btn-row">
                <n-button attr-type="button" ghost block class="submit" @click="handleRegister">注册</n-button>
                <n-button attr-type="button" type="primary" block class="submit" @click="handleLogin">登录</n-button>
              </div>
            </n-form>
          </div>
        </n-config-provider>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.dialog {
  position: relative;
  width: 320px;
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
}
.dialog h3 {
  margin: 0 0 16px;
  text-align: center;
  color: #333;
}
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
/* 按钮行：横向并排，中间留 12px 间隙 */
.btn-row {
  display: flex;
  gap: 12px;
  margin-top: 4px;
}
/* 两个按钮等分宽度；block 让内部填满 */
.submit {
  flex: 1;
}

/* Transition 动画:淡入 + 轻微放大 */
.modal-enter-from .dialog,
.modal-leave-to .dialog {
  transform: scale(0.92);
  opacity: 0;
}
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s;
}
.modal-enter-active .dialog,
.modal-leave-active .dialog {
  transition: transform 0.2s, opacity 0.2s;
}
</style>
