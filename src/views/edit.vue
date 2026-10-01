<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  NAvatar, NButton, NCard, NForm, NFormItem, NIcon, NInput,
  NResult, NSkeleton, useMessage,
} from 'naive-ui'
import type { FormInst, FormRules } from 'naive-ui'
import { PersonOutline, ShieldCheckmarkOutline } from '@vicons/ionicons5'
import useUserStore from '../store/user.ts'
import useUiStore from '../store/ui.ts'
import type { psw, User } from '../api/types.ts'

type ProfileDraft = Pick<User, 'username' | 'image' | 'bio'>

const userStore = useUserStore()
const uiStore = useUiStore()
const router = useRouter()
const message = useMessage()
const profileFormRef = ref<FormInst | null>(null)
const pswFormRef = ref<FormInst | null>(null)

const formValue = ref<ProfileDraft>({ username: '', image: '', bio: '' })
const savedProfile = ref<ProfileDraft>({ ...formValue.value })
const formPsw = ref<psw>({ old_password: '', new_password: '' })
const loadingProfile = ref(false)
const profileReady = ref(false)
const loadError = ref('')
const savingProfile = ref(false)
const savingPassword = ref(false)
const submitting = computed(() => savingProfile.value || savingPassword.value)
const hasProfileChanges = computed(() =>
  formValue.value.username !== savedProfile.value.username
  || formValue.value.image !== savedProfile.value.image
  || formValue.value.bio !== savedProfile.value.bio,
)

const rules: FormRules = {
  username: [
    { required: true, whitespace: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 10, message: '用户名需为 3～10 个字符', trigger: ['input', 'blur'] },
  ],
  image: {
    required: true, whitespace: true, message: '请输入头像链接', trigger: 'blur',
  },
  bio: [
    { required: true, whitespace: true, message: '请输入个人简介', trigger: 'blur' },
    { min: 2, max: 100, message: '个人简介需为 2～100 个字符', trigger: ['input', 'blur'] },
  ],
}

const formPswRules: FormRules = {
  old_password: [
    { required: true, message: '请输入当前密码', trigger: 'blur' },
    { min: 3, max: 20, message: '密码需为 3～20 个字符', trigger: ['input', 'blur'] },
  ],
  new_password: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 3, max: 20, message: '密码需为 3～20 个字符', trigger: ['input', 'blur'] },
  ],
}

function resetProfile() {
  formValue.value = { ...savedProfile.value }
  profileFormRef.value?.restoreValidation()
}

async function loadProfile() {
  if (loadingProfile.value) return
  loadingProfile.value = true
  loadError.value = ''
  try {
    // 刷新页面时，先等用户资料就绪，再创建独立的编辑草稿。
    if (!userStore.id) await userStore.fetchMe()
    if (!userStore.id) throw new Error('请登录后查看个人资料')
    savedProfile.value = {
      username: userStore.name,
      image: userStore.image,
      bio: userStore.bio,
    }
    resetProfile()
    profileReady.value = true
  } catch (error) {
    loadError.value = error instanceof Error ? error.message : '暂时无法获取个人资料，请稍后重试'
  } finally {
    loadingProfile.value = false
  }
}

function requireLogin() {
  if (userStore.isLogin && userStore.id) return true
  uiStore.openLogin()
  return false
}

async function handleValidate() {
  if (submitting.value || !profileReady.value || !hasProfileChanges.value || !profileFormRef.value) return
  if (!requireLogin()) return
  savingProfile.value = true
  try {
    try {
      await profileFormRef.value.validate()
    } catch {
      return // 字段下方已显示校验提示，不再重复弹出错误消息。
    }
    const draft = { ...formValue.value }
    await userStore.updateMyUserinfo({ ...draft, id: userStore.id, password: '' })
    savedProfile.value = draft
    message.success('资料已保存')
  } catch (error) {
    message.error(error instanceof Error ? error.message : '保存失败，请稍后重试')
  } finally {
    savingProfile.value = false
  }
}

async function handleValidatePsw() {
  if (submitting.value || !pswFormRef.value) return
  if (!requireLogin()) return
  if (hasProfileChanges.value) {
    message.warning('请先保存或撤销资料修改，再修改密码')
    return
  }
  savingPassword.value = true
  try {
    try {
      await pswFormRef.value.validate()
    } catch {
      return
    }
    await userStore.updateMyPassword({ ...formPsw.value })
    formPsw.value = { old_password: '', new_password: '' }
    pswFormRef.value?.restoreValidation()
    message.success('密码已修改，请重新登录')
    await router.replace('/')
    uiStore.openLogin()
  } catch (error) {
    message.error(error instanceof Error ? error.message : '修改失败，请稍后重试')
  } finally {
    savingPassword.value = false
  }
}

onMounted(loadProfile)
</script>

<template>
  <main class="profile-settings" aria-labelledby="settings-title">
    <div class="page-heading">
      <h1 id="settings-title">编辑个人资料</h1>
      <p>完善你的个人名片，管理账号信息。</p>
    </div>

    <n-card v-if="loadingProfile" class="settings-card" :bordered="false" aria-busy="true">
      <div role="status" aria-label="正在加载个人资料">
        <n-skeleton text :width="120" :height="26" />
        <n-skeleton circle :width="80" :height="80" class="loading-avatar" />
        <n-skeleton text :repeat="3" :height="40" />
      </div>
    </n-card>

    <n-card v-else-if="loadError" class="settings-card" :bordered="false">
      <n-result status="error" title="个人资料加载失败" :description="loadError">
        <template #footer>
          <n-button v-if="userStore.isLogin" type="primary" @click="loadProfile">重新加载</n-button>
          <n-button v-else type="primary" @click="uiStore.openLogin">登录后重试</n-button>
        </template>
      </n-result>
    </n-card>
    <template v-else-if="profileReady">
    <n-tabs
        placement="left"
        type="line"
        default-value="profile"
        pane-style="padding: 0 24px;"
    >

      <n-tab-pane name="profile" tab="基本资料">
        <n-card class="settings-card" :bordered="false" content-style="padding: 0">
          <section class="card-body" aria-labelledby="profile-title">
            <div class="section-heading">
              <div>
                <h2 id="profile-title">基本资料</h2>
                <p>这些信息会展示在你的个人主页。</p>
              </div>
            </div>

            <n-form
                ref="profileFormRef"
                :model="formValue"
                :rules="rules"
                :disabled="submitting"
                label-placement="top"
                size="large"
                @submit.prevent="handleValidate"
            >
              <div class="avatar-field">
                <div class="avatar-preview">
                  <n-avatar
                      round
                      :size="80"
                      :src="formValue.image.trim() || undefined"
                      object-fit="cover"
                      :img-props="{ alt: '头像预览', referrerpolicy: 'no-referrer' }"
                  >
                    <template v-if="!formValue.image.trim()" #default>
                      <n-icon :size="32"><PersonOutline /></n-icon>
                    </template>
                    <template #fallback>
                      <n-icon :size="32"><PersonOutline /></n-icon>
                    </template>
                  </n-avatar>
                  <span>头像预览</span>
                </div>
                <div class="avatar-input">
                  <n-form-item label="头像链接" path="image">
                    <n-input v-model:value="formValue.image" placeholder="粘贴图片链接，预览你的新头像" clearable />
                  </n-form-item>
                  <p class="field-hint">建议使用正方形图片，保存后更新头像。</p>
                </div>
              </div>

              <n-form-item label="用户名" path="username">
                <n-input
                    v-model:value="formValue.username"
                    placeholder="给自己起个名字，3～10 个字符"
                    :maxlength="10"
                    show-count
                    :input-props="{ autocomplete: 'username' }"
                />
              </n-form-item>

              <n-form-item label="个人简介" path="bio">
                <n-input
                    v-model:value="formValue.bio"
                    type="textarea"
                    placeholder="聊聊你的兴趣，或用一句话介绍自己"
                    :autosize="{ minRows: 3, maxRows: 5 }"
                    :maxlength="100"
                    show-count
                />
              </n-form-item>

              <div class="form-footer">
                <span class="save-status" aria-live="polite">{{ hasProfileChanges ? '有尚未保存的修改' : '资料已与当前账号同步' }}</span>
                <div class="form-actions">
                  <n-button :disabled="!hasProfileChanges || submitting" @click="resetProfile">撤销修改</n-button>
                  <n-button type="primary" attr-type="submit" :loading="savingProfile" :disabled="!hasProfileChanges || submitting">
                    保存资料
                  </n-button>
                </div>
              </div>
            </n-form>
          </section>
        </n-card>
      </n-tab-pane>

      <n-tab-pane name="password" tab="修改密码">
        <n-card class="settings-card" :bordered="false" content-style="padding: 0">
          <section class="card-body" aria-labelledby="password-title">
            <div class="section-heading">
              <div>
                <h2 id="password-title">修改密码</h2>
                <p>修改成功后，需要使用新密码重新登录。</p>
              </div>
            </div>

            <n-form
                ref="pswFormRef"
                :model="formPsw"
                :rules="formPswRules"
                :disabled="submitting"
                label-placement="top"
                size="large"
                @submit.prevent="handleValidatePsw"
            >
              <div class="password-fields">
                <n-form-item label="当前密码" path="old_password">
                  <n-input
                      v-model:value="formPsw.old_password"
                      type="password"
                      show-password-on="click"
                      placeholder="请输入当前密码"
                      :input-props="{ autocomplete: 'current-password' }"
                  />
                </n-form-item>
                <n-form-item label="新密码" path="new_password">
                  <n-input
                      v-model:value="formPsw.new_password"
                      type="password"
                      show-password-on="click"
                      placeholder="设置新密码，3～20 个字符"
                      :input-props="{ autocomplete: 'new-password' }"
                  />
                </n-form-item>
              </div>
              <div class="form-footer">
                <span class="save-status">请使用不易被猜到的密码</span>
                <n-button type="primary" secondary attr-type="submit" :loading="savingPassword" :disabled="submitting">
                  修改密码
                </n-button>
              </div>
            </n-form>
          </section>
        </n-card>
      </n-tab-pane>
    </n-tabs>
    </template>
  </main>
</template>

<style scoped>
.profile-settings {
  width: 100%;
  max-width: 960px;
  margin: 0 auto;
  padding: 8px 0 56px;
  display: grid;
  gap: 10px;
  box-sizing: border-box;
}

.page-heading h1 {
  margin: 0;
  font-size: 26px;
  font-weight: 600;
  letter-spacing: -0.5px;
}

.page-heading p,
.section-heading p {
  margin: 6px 0 0;
  font-size: 14px;
  color: #7b8492;
  line-height: 1.6;
}

.settings-card {
  min-width: 0;
  border: 1px solid #e9edf2;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgb(25 42 70 / 3%);
}

.card-body { padding: 28px 32px; }

.section-heading {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 28px;
}

.section-heading h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.avatar-field {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 14px;
  padding: 20px;
  border: 1px solid #edf0f5;
  border-radius: 12px;
  background: #fafbfd;
}

.avatar-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
  color: #8a929f;
  font-size: 12px;
}

.avatar-input { flex: 1; min-width: 0; }
.field-hint { margin: 0; color: #8a929f; font-size: 12px; }

.form-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin-top: 4px;
  padding-top: 20px;
  border-top: 1px solid #eff1f5;
}

.save-status { color: #8a929f; font-size: 13px; }
.form-actions { display: flex; gap: 12px; }
.password-fields { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 20px; }
.loading-avatar { margin: 24px 0; }

@media (max-width: 640px) {
  .profile-settings { gap: 16px; padding-bottom: 32px; }
  .page-heading h1 { font-size: 22px; }
  .card-body { padding: 20px; }
  .section-heading { align-items: flex-start; gap: 12px; margin-bottom: 24px; }
  .avatar-field { flex-direction: column; align-items: stretch; gap: 16px; padding: 16px; }
  .avatar-preview { align-self: center; }
  .password-fields { grid-template-columns: minmax(0, 1fr); gap: 0; }
  .form-footer { flex-direction: column; align-items: stretch; }
  .form-actions > * { flex: 1; }
}
</style>
