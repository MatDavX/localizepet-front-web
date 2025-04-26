<template>
  <div class="container">
    <div class="logo-container">
      <img src="/localizepet-logo.svg" alt="Localize Pet" class="logo" />
      <h1>Localize Pet</h1>
      <p class="tagline">Entre na nossa lista de espera e seja um dos primeiros a usar</p>
      <div class="subscribers-counter">
        <span>{{ wishlist.subscribersCount }}</span> pessoas já se inscreveram
      </div>
    </div>
    
    <!-- Formulário principal - mostrado por padrão quando não há sucesso nem erro de email já cadastrado -->
    <div v-if="!submitted || (!wishlist.success && !wishlist.alreadyRegistered)" class="form-container">
      <form @submit.prevent="handleSubmit" class="auth-buttons">
        <div class="form-group">
          <input 
            type="email" 
            v-model="email" 
            class="form-control" 
            placeholder="Seu melhor email" 
            required
          />
        </div>
        
        <button 
          type="submit" 
          class="btn btn-primary" 
          :disabled="wishlist.loading ? true : email.length === 0"
        >
          {{ wishlist.loading ? 'Registrando...' : 'Entrar na lista de espera' }}
        </button>
        
        <div v-if="wishlist.error" class="error-message">
          {{ wishlist.error }}
        </div>
      </form>
    </div>
    
    <!-- Mensagem de email já cadastrado -->
    <div v-else-if="wishlist.alreadyRegistered" class="already-registered-container">
      <div class="already-registered-message">
        Este email já está cadastrado na nossa lista de espera.
      </div>
      <p>Fique tranquilo, você será notificado assim que o Localize Pet estiver disponível!</p>
      <button class="btn btn-primary try-again" @click="resetForm">Usar outro email</button>
    </div>
    
    <!-- Mensagem de sucesso -->
    <div v-else-if="wishlist.success" class="success-container">
      <div class="success-message">
        Obrigado! Seu email foi registrado com sucesso.
      </div>
      <p>Entraremos em contato assim que o Localize Pet estiver disponível!</p>
    </div>
    
    <p class="disclaimer">
      Ao entrar, você concorda com nossos Termos e Política de Privacidade
    </p>
  </div>
</template>

<script setup lang="ts">
const email = ref('')
const wishlist = useWishlist()
const submitted = ref(false)

const handleSubmit = async () => {
  if (!email.value) return
  
  submitted.value = true
  await wishlist.registerEmail(email.value)
  
  if (wishlist.success) {
    email.value = ''
  }
}

const resetForm = () => {
  email.value = ''
  wishlist.error.value = ''
  wishlist.alreadyRegistered.value = false
  submitted.value = false
}
</script>

<style scoped>
  .form-container, 
  .success-container,
  .already-registered-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    max-width: 500px;
    margin-bottom: 2rem;
  }

  .alternative-options {
    display: flex;
    flex-direction: column;
    width: 100%;
    gap: 1rem;
    margin-top: 1rem;
  }

  .success-container p,
  .already-registered-container p {
    margin-top: 1rem;
    text-align: center;
  }
  
  .subscribers-counter {
    margin-top: 1rem;
    font-size: 0.9rem;
    color: #666;
  }
  
  .subscribers-counter span {
    font-weight: bold;
    color: #333;
  }
  
  .error-message {
    color: #dc3545;
    margin-top: 0.5rem;
    font-size: 0.9rem;
  }
  
  .already-registered-message {
    color: #fd7e14;
    font-weight: bold;
    font-size: 1.1rem;
  }
  
  .try-again {
    margin-top: 1rem;
  }
</style>


