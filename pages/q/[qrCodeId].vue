<template>
  <div class="pet-profile">
    <!-- Carregamento -->
    <div v-if="loading" class="flex-center h-screen">
      <div class="loading-spinner"></div>
    </div>
    
    <!-- Erro -->
    <div v-else-if="error" class="flex-center h-screen p-4 text-center">
      <div>
        <div class="text-6xl mb-4">⚠️</div>
        <h1 class="text-xl font-bold mb-2">QR Code não encontrado</h1>
        <p class="text-gray-500 mb-4">{{ error }}</p>
        <NuxtLink to="/" class="btn-outline">Voltar</NuxtLink>
      </div>
    </div>
    
    <!-- Conteúdo -->
    <div v-else-if="pet" class="pet-content">
      <!-- Cabeçalho com foto -->
      <div class="pet-header">
        <div class="pet-image" @click="openFullscreen" v-if="pet.pet?.photos && pet.pet?.photos.length > 0">
          <img 
            :src="pet.pet.photos[0].url" 
            :alt="pet.pet?.name"
          />
          <div class="zoom-icon">🔍</div>
        </div>
        <div v-else class="pet-image">
          <div class="no-photo">
            <span>🐾</span>
          </div>
        </div>
        
       
      </div>
       <div class="content-title">
          <h1>{{ pet.pet?.name }}</h1>
          <p class="text-center">{{ pet.pet?.breed || 'Não informado' }} • {{ pet.pet?.gender === 'Macho' ? 'Macho' : pet.pet?.gender === 'Fêmea' ? 'Fêmea' : 'Não informado' }}</p>
        </div>
      <!-- Informações -->
      <div class="info-cards">
        <!-- Características -->
        <div class="info-card">
          <div class="info-header">
            <span class="info-icon">📋</span>
            <h2>Características</h2>
          </div>
          
          <div class="info-grid">
            <div class="info-item">
              <span class="tag">Espécie</span>
              <span>{{ pet.pet?.species || "Cachorro" }}</span>
            </div>
            
            <div class="info-item">
              <span class="tag">Idade</span>
              <span>{{ pet.pet?.age }} anos</span>
            </div>
            
            <div class="info-item">
              <span class="tag">Cor</span>
              <span>{{ pet.pet?.color }}</span>
            </div>
          </div>
        </div>
        
        <!-- Dono -->
        <div class="info-card">
          <div class="info-header">
            <span class="info-icon">👤</span>
            <h2>Informações do dono</h2>
          </div>
          
          <div class="owner-info">
            <div class="owner-avatar">
              <img v-if="pet.owner?.avatar" :src="pet.owner.avatar" :alt="pet.owner?.name" />
              <div v-else>{{ pet.owner?.name ? pet.owner.name.charAt(0).toUpperCase() : '?' }}</div>
            </div>
            
            <div class="owner-details">
              <div class="owner-name">{{ pet.owner?.name }}</div>
              <div class="owner-contact">{{ pet.owner?.phone }}</div>
              <div class="owner-email">{{ pet.owner?.email }}</div>
            </div>
          </div>
        </div>
        
        <!-- Endereço -->
        <div v-if="pet.rescue?.address" class="info-card">
          <div class="info-header">
            <span class="info-icon">📍</span>
            <h2>Endereço de recuperação</h2>
          </div>
          
          <div class="address-info">
            <p>{{ pet.rescue.address.street }}, {{ pet.rescue.address.number }}
               {{ pet.rescue.address.complement ? `, ${pet.rescue.address.complement}` : '' }}</p>
            <p>{{ pet.rescue.address.neighborhood }}</p>
            <p>{{ pet.rescue.address.city }} - {{ pet.rescue.address.state }}</p>
            <p>CEP: {{ pet.rescue.address.zipCode }}</p>
          </div>
        </div>
      </div>
      
      <!-- Botão de contato -->
      <div class="action-button">
        <button 
          type="button" 
          @click="showLocationModal = true" 
          class="contact-btn" 
          :disabled="isAlertingOwner"
        >
          <span v-if="isAlertingOwner">
            <span class="small-spinner"></span> Enviando localização...
          </span>
          <span v-else>Alertar o dono</span>
        </button>
        
        <div v-if="locationError" class="location-error">
          {{ locationError }}
        </div>
        
        <button v-if="locationError" @click="tryCallDirectly" class="fallback-btn">
          Ligar diretamente
        </button>
      </div>
    </div>
    
    <!-- Modal de imagem em tela cheia -->
    <div v-if="showFullscreen" class="fullscreen-modal" @click="closeFullscreen">
      <div class="fullscreen-content">
        <img 
          v-if="pet?.pet?.photos && pet.pet.photos.length > 0" 
          :src="pet.pet.photos[0].url" 
          :alt="pet.pet?.name"
          class="fullscreen-image"
        />
        <button class="close-button" @click.stop="closeFullscreen">✕</button>
      </div>
    </div>
    
    <!-- Modal de confirmação para geolocalização -->
    <div v-if="showLocationModal" class="modal-overlay">
      <div class="modal-container" @click.stop>
        <div class="modal-header">
          <h3>Compartilhar localização?</h3>
          <button class="modal-close" @click="showLocationModal = false">✕</button>
        </div>
        
        <div class="modal-body">
          <div class="modal-icon">📍</div>
          <p>Para ajudar o dono a encontrar o pet, precisamos compartilhar sua localização atual.</p>
          <p class="modal-subtitle">Sua localização será compartilhada apenas com o dono do pet.</p>
        </div>
        
        <div class="modal-footer">
          <button class="modal-btn-cancel" @click="showLocationModal = false">Cancelar</button>
          <button class="modal-btn-confirm" @click="confirmLocation">Compartilhar localização</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const qrCodeId = route.params.qrCodeId as string
const config = useRuntimeConfig()
const showFullscreen = ref(false)
const showLocationModal = ref(false)
const isAlertingOwner = ref(false)
const locationError = ref('')

interface QRCodeResponse {
  data: {
    qrcode: {
      id: string
      code: string
      scanned: boolean
      lastScanned: string
      qrImageUrl: string
    }
    pet: {
      id: string
      name: string
      species: string
      breed: string
      color: string
      age: number
      gender: string
      photos: {
        url: string
        thumbnailUrl: string
      }[]
    }
    owner: {
      avatar: string
      name: string
      phone: string
      email: string
    }
    rescue: {
      address: {
        id: string
        street: string
        number: string
        complement: string
        neighborhood: string
        city: string
        state: string
        zipCode: string
        type: string
        userId: string
        createdAt: string
        updatedAt: string
      } | null
    }
  }
}

const pet = ref<QRCodeResponse['data'] | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)

// Buscar informações do pet pelo código QR
const fetchPetInfo = async () => {
  loading.value = true
  error.value = null
  
  try {
    const apiBaseUrl = config.public.apiBaseUrl
    const response = await $fetch<QRCodeResponse>(`${apiBaseUrl}/qrcodes/q/${qrCodeId}`, {
      method: 'GET'
    })
    pet.value = response.data
  } catch (err) {
    console.error('Erro ao carregar informações do pet:', err)
    error.value = 'Não foi possível encontrar informações para este código QR. Verifique se o código é válido.'
  } finally {
    loading.value = false
  }
}

// Confirmar compartilhamento de localização
const confirmLocation = () => {
  console.log('Localização confirmada pelo usuário')
  showLocationModal.value = false
  
  // Solicitar permissão de geolocalização imediatamente após o clique do usuário
  if (navigator.geolocation) {
    isAlertingOwner.value = true
    locationError.value = ''
    
    console.log('Solicitando permissão de geolocalização...')
    navigator.geolocation.getCurrentPosition(
      // Sucesso - posição obtida
      (position) => {
        console.log('Permissão concedida, posição obtida')
        const { latitude, longitude } = position.coords
        sendLocationToServer(latitude, longitude)
      },
      // Erro - permissão negada ou outro erro
      (err) => {
        console.error('Erro ao obter posição:', err)
        isAlertingOwner.value = false
        
        if (err.code === 1) {
          locationError.value = 'Permissão de localização negada. Por favor, habilite o acesso à sua localização.'
        } else if (err.code === 2) {
          locationError.value = 'Não foi possível determinar sua localização atual.'
        } else if (err.code === 3) {
          locationError.value = 'Tempo esgotado ao tentar obter sua localização.'
        } else {
          locationError.value = 'Ocorreu um erro ao tentar acessar sua localização.'
        }
      },
      // Opções
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    )
  } else {
    locationError.value = 'Geolocalização não suportada pelo seu navegador'
    isAlertingOwner.value = false
  }
}

// Função para enviar a localização para o servidor
const sendLocationToServer = async (latitude: number, longitude: number) => {
  if (!pet.value?.pet?.id) {
    console.log('Pet ID não encontrado:', pet.value?.pet)
    locationError.value = 'Não foi possível identificar o pet.'
    isAlertingOwner.value = false
    return
  }
  
  try {
    console.log('Posição obtida:', { latitude, longitude })
    
    // Enviar dados para a API
    const apiBaseUrl = config.public.apiBaseUrl
    console.log('Enviando dados para API:', `${apiBaseUrl}/locators`)
    
    const response = await $fetch(`${apiBaseUrl}/locators`, {
      method: 'POST',
      body: {
        animalId: pet.value.pet.id,
        latitude,
        longitude
      }
    })
    
    console.log('Localização enviada com sucesso:', response)
    
    // Fazer a ligação telefônica após enviar os dados
    if (pet.value.owner?.phone) {
      window.location.href = `tel:${pet.value.owner.phone}`
    } else {
      console.log('Telefone do dono não encontrado')
      locationError.value = 'Telefone do dono não disponível'
    }
    
  } catch (err) {
    console.error('Erro ao enviar localização:', err)
    locationError.value = 'Ocorreu um erro ao tentar enviar sua localização.'
  } finally {
    isAlertingOwner.value = false
  }
}

// Função para contatar o dono diretamente, sem enviar localização
const tryCallDirectly = () => {
  if (pet.value?.owner?.phone) {
    window.location.href = `tel:${pet.value.owner.phone}`
  } else {
    locationError.value = 'Telefone do dono não disponível'
  }
}

// Handler para o clique do botão
const handleButtonClick = () => {
  console.log('Botão clicado - timestamp:', new Date().toISOString())
  showLocationModal.value = true
}

// Abrir visualização em tela cheia
const openFullscreen = () => {
  showFullscreen.value = true
  document.body.style.overflow = 'hidden'
}

// Fechar visualização em tela cheia
const closeFullscreen = () => {
  showFullscreen.value = false
  document.body.style.overflow = ''
}

// Carregar dados quando a página for montada
onMounted(() => {
  fetchPetInfo()
})

// Limpar ao desmontar
onUnmounted(() => {
  document.body.style.overflow = ''
})
</script>

<style scoped>
.pet-profile {
  --main-color: #ff5c5c;
  --bg-color: #f9fafb;
  --card-bg: white;
  --text-primary: #333;
  --text-secondary: #666;
  font-family: 'Poppins', sans-serif;
  min-height: 100vh;
  background-color: var(--bg-color);
}

.flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255, 92, 92, 0.1);
  border-radius: 50%;
  border-top: 3px solid var(--main-color);
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.btn-outline {
  display: inline-block;
  padding: 0.5rem 1.5rem;
  border: 1px solid #ccc;
  border-radius: 2rem;
  color: var(--text-secondary);
  text-decoration: none;
  transition: all 0.2s;
}

.btn-outline:hover {
  border-color: var(--main-color);
  color: var(--main-color);
}

/* Layout principal */
.pet-content {
  max-width: 600px;
  flex-direction: column;
  align-items: center;
  margin: 0 auto;
  padding: 0 0 6rem 0;
}

/* Cabeçalho com foto */
.pet-header {
  position: relative;
  height: 500px;
  margin-bottom: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-radius: 0 0 24px 24px;
  overflow: hidden;
}

.pet-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.pet-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center center;
  transition: transform 0.5s ease;
}

.pet-image:hover img {
  transform: scale(1.05);
}

.content-title {
  margin: 0 auto;
  text-align: center;
  margin-bottom: 1rem;
}

.pet-image::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 60px;
  background: linear-gradient(to top, rgba(0,0,0,0.5), transparent);
  pointer-events: none;
}

.zoom-icon {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 36px;
  height: 36px;
  background-color: rgba(255,255,255,0.8);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  z-index: 5;
}

.no-photo {
  width: 100%;
  height: 100%;
  background: linear-gradient(45deg, #f3f4f6, #e5e7eb);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 4rem;
  color: #d1d5db;
}

.pet-title {
  max-width: 600px;
  margin-bottom: 1rem;
  padding: 1.25rem;
  background: var(--card-bg);
  border-radius: 1rem 1rem 0 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.pet-title h1 {
  font-size: 1.75rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
  color: var(--text-primary);
}

.pet-title p {
  font-size: 0.9rem;
  color: var(--text-secondary);
}

/* Cards de informação */
.info-cards {
  padding: 0 1rem;
}

.info-card {
  background: var(--card-bg);
  border-radius: 1rem;
  margin-bottom: 1rem;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.info-header {
  display: flex;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #f3f4f6;
}

.info-icon {
  margin-right: 0.75rem;
  font-size: 1.25rem;
}

.info-header h2 {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
}

/* Grid para características */
.info-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  padding: 1rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.tag {
  font-size: 0.75rem;
  color: var(--text-secondary);
  margin-bottom: 0.25rem;
}

/* Informações do dono */
.owner-info {
  display: flex;
  align-items: center;
  padding: 1rem;
}

.owner-avatar {
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 1rem;
  background-color: var(--main-color);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 1.5rem;
  flex-shrink: 0;
}

.owner-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.owner-details {
  font-size: 0.9rem;
}

.owner-name {
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.owner-contact, .owner-email {
  color: var(--text-secondary);
  margin-bottom: 0.25rem;
}

/* Endereço */
.address-info {
  padding: 1rem;
  font-size: 0.9rem;
  line-height: 1.5;
  color: var(--text-secondary);
}

/* Botão de contato */
.action-button {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 1rem;
  background: var(--card-bg);
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.contact-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
  padding: 0.75rem;
  background-color: var(--main-color);
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: 500;
  text-align: center;
  cursor: pointer;
  transition: background-color 0.2s;
}

.contact-btn:hover:not(:disabled) {
  background-color: #e74c4c;
}

.contact-btn:disabled {
  background-color: #ffadad;
  cursor: not-allowed;
}

.small-spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255,255,255,0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s linear infinite;
  margin-right: 8px;
}

.location-error {
  margin-top: 0.75rem;
  color: var(--main-color);
  font-size: 0.875rem;
  text-align: center;
  max-width: 400px;
}

.fallback-btn {
  margin-top: 0.75rem;
  padding: 0.5rem 1rem;
  background-color: transparent;
  color: var(--main-color);
  border: 1px solid var(--main-color);
  border-radius: 0.5rem;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}

.fallback-btn:hover {
  background-color: rgba(255, 92, 92, 0.1);
}

/* Modal de visualização em tela cheia */
.fullscreen-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.fullscreen-content {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.fullscreen-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.close-button {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 40px;
  height: 40px;
  background-color: rgba(255, 255, 255, 0.3);
  border: none;
  border-radius: 50%;
  color: white;
  font-size: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 101;
}

.close-button:hover {
  background-color: rgba(255, 255, 255, 0.5);
}

/* Modal de confirmação de localização */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
}

.modal-container {
  width: 90%;
  max-width: 400px;
  background-color: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #f3f4f6;
}

.modal-header h3 {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0;
  color: var(--text-primary);
}

.modal-close {
  background: none;
  border: none;
  font-size: 1.25rem;
  color: var(--text-secondary);
  cursor: pointer;
}

.modal-body {
  padding: 1.5rem;
  text-align: center;
}

.modal-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  color: var(--main-color);
}

.modal-body p {
  margin: 0 0 0.75rem;
  color: var(--text-primary);
  line-height: 1.5;
}

.modal-subtitle {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.modal-footer {
  display: flex;
  padding: 1rem;
  border-top: 1px solid #f3f4f6;
  gap: 0.5rem;
}

.modal-btn-cancel,
.modal-btn-confirm {
  flex: 1;
  padding: 0.75rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.modal-btn-cancel {
  background-color: transparent;
  color: var(--text-secondary);
  border: 1px solid #e5e7eb;
}

.modal-btn-confirm {
  background-color: var(--main-color);
  color: white;
  border: none;
}

.modal-btn-cancel:hover {
  background-color: #f3f4f6;
}

.modal-btn-confirm:hover {
  background-color: #e74c4c;
}
</style> 