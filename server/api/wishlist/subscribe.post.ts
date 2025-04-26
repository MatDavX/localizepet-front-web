export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  
  // Validação básica
  if (!body.email || !validateEmail(body.email)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Email inválido'
    })
  }

  // Aqui você poderia salvar em um banco de dados
  // Por ora, retornamos uma resposta simulada
  
  // Simulando um pequeno atraso
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  // Simulando o salvamento no banco e incrementando contador
  // Em uma implementação real, você salvaria no banco de dados
  const subscribersStore = useStorage('wishlist')
  let subscribers: string[] = await subscribersStore.getItem('subscribers') as string[] || []
  
  // Verificar se o email já existe
  if (!Array.isArray(subscribers)) {
    subscribers = []
  }
  
  // Verificar se o email já existe
  if (subscribers.includes(body.email)) {
    return {
      success: false,
      message: 'Este email já está cadastrado na lista de espera!',
      data: {
        email: body.email,
        alreadyRegistered: true
      }
    }
  }
  
  // Adicionar o email à lista
  subscribers.push(body.email)
  await subscribersStore.setItem('subscribers', subscribers)
  
  return {
    success: true,
    message: 'Email registrado com sucesso na wishlist!',
    data: {
      email: body.email,
      registeredAt: new Date().toISOString()
    }
  }
})

// Função de validação de email
function validateEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
} 