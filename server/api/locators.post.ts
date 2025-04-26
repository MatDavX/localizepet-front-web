export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  
  // Validar os dados recebidos
  if (!body.petId || !body.qrCodeId || body.latitude === undefined || body.longitude === undefined) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Dados incompletos. É necessário fornecer petId, qrCodeId, latitude e longitude.'
    })
  }

  console.log('Localização recebida:', {
    petId: body.petId,
    qrCodeId: body.qrCodeId,
    latitude: body.latitude,
    longitude: body.longitude,
    timestamp: new Date().toISOString()
  })
  
  // Em uma implementação real:
  // 1. Salvar a localização no banco de dados
  // 2. Notificar o dono do pet por SMS/email/push notification
  // 3. Atualizar o status do QR code para "escaneado"
  
  // Simulando um pequeno atraso para demonstração
  await new Promise(resolve => setTimeout(resolve, 500))
  
  return {
    success: true,
    message: 'Localização registrada com sucesso! O dono será notificado.'
  }
}) 