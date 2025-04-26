export const useWishlist = () => {
  const config = useRuntimeConfig()
  const loading = ref(false)
  const error = ref('')
  const success = ref(false)
  const alreadyRegistered = ref(false)
  const subscribersCount = ref(0)
  
  // Resetar flags ao inicializar o composable
  onMounted(() => {
    success.value = false
    alreadyRegistered.value = false
    error.value = ''
  })
  
  interface SubscribeResponse {
    success: boolean
    message: string
    data?: {
      email: string
      registeredAt?: string
      alreadyRegistered?: boolean
    }
  }
  
  const registerEmail = async (email: string) => {
    if (!email) return null
    
    loading.value = true
    error.value = ''
    success.value = false
    alreadyRegistered.value = false
    
    const apiBaseUrl = config.public.apiBaseUrl
    try {
      const response = await $fetch<SubscribeResponse>(`${apiBaseUrl}/wishlist/subscribe`, {
        method: 'POST',
        body: { email }
      })
      
      console.log(response)
      
      // Verificar se o email já está cadastrado
      if (response.data?.alreadyRegistered) {
        alreadyRegistered.value = true
        error.value = response.message || 'Este email já está cadastrado.'
      } else {
        success.value = true
      }
      
      await getSubscribersCount()
      return response
    } catch (err: unknown) {
      if (err instanceof Error) {
        error.value = err.message
      } else {
        error.value = 'Erro ao registrar email. Tente novamente.'
      }
      return null
    } finally {
      loading.value = false
    }
  }
  
  const getSubscribersCount = async () => {
    const apiBaseUrl = config.public.apiBaseUrl
    try {
      const response = await $fetch<{count: number}>(`${apiBaseUrl}/wishlist/subscribers-count`, {
        method: 'GET'
      })
      subscribersCount.value = response.count || 0
      return response.count
    } catch (err) {
      console.error('Erro ao obter contagem de inscritos:', err)
      return 0
    }
  }
  
  // Carregar a contagem inicial
  onMounted(() => {
    getSubscribersCount()
  })
  
  return {
    loading,
    error,
    success,
    alreadyRegistered,
    subscribersCount,
    registerEmail,
    getSubscribersCount
  }
} 