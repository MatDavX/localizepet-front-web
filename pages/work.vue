<script setup lang="ts">
    const open = ref(false)
</script>
<template>
    <button @click="open = true">
      Open Modal
    </button>
    <Teleport to="#teleports">
        <NuxtTime :datetime="new Date()" />

        <div v-if="open" class="modal">
            <p>Hello from the modal!</p>
            <button @click="open = false">
            Close
            </button>
        </div>
    </Teleport>
  </template>