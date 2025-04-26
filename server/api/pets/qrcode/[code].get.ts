export default defineEventHandler(async (event) => {
  const code = getRouterParam(event, 'code')
  if (!code) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Código QR não fornecido'
    })
  }
  
 
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  const petData = {
    id: code,
    name: 'Rex',
    age: '3 anos',
    breed: 'Labrador',
    photo: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?q=80&w=2069&auto=format&fit=crop',
    ownerName: 'João Silva',
    ownerContact: '(11) 99999-9999',
    additionalInfo: 'Vacinado e castrado. Gosta de brincar no parque.'
  }
  
  return petData
}) 