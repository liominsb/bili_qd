<template>
  <n-button class="del-btn">×</n-button>
</template>

<style scoped>
.del-btn {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 22px;
  height: 22px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 50%;
  background: rgb(255 255 255 / 0.56);
  color: #000000;
  font-size: 15px;
  line-height: 1;
  cursor: pointer;
  opacity: 0;
  transition: opacity .2s ease;
}

:global(.video:hover .del-btn) {
  opacity: 1;
}
</style>
