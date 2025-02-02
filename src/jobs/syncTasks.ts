import TickTickService from '../services/TickTickService'
import TickTickWebSocket from '../services/TickTickWebSocket'

let wsClient: TickTickWebSocket | null = null

export const syncTasks = async () => {
  try {
    const accessToken = process.env.TICKTICK_ACCESS_TOKEN

    if (!accessToken) {
      throw new Error('TickTick access token not configured')
    }

    // Initialisiere WebSocket-Client, wenn noch nicht vorhanden
    if (!wsClient) {
      wsClient = new TickTickWebSocket(accessToken)
      wsClient.connect()
    }

    // Führe initiale Synchronisation durch
    const tickTickService = new TickTickService(accessToken)
    await tickTickService.syncAllTasks()

    console.log('Background sync completed successfully')
  } catch (error) {
    console.error('Error in background sync:', error)
  }
}
