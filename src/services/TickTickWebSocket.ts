import WebSocket from 'ws'
import TickTickService from './TickTickService'

class TickTickWebSocket {
  private ws: WebSocket | null = null
  private tickTickService: TickTickService
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 5000 // 5 Sekunden

  constructor(private accessToken: string) {
    this.tickTickService = new TickTickService(accessToken)
  }

  connect() {
    try {
      this.ws = new WebSocket('wss://api.ticktick.com/websocket', {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      })

      this.ws.on('open', () => {
        console.log('WebSocket Verbindung hergestellt')
        this.reconnectAttempts = 0
        this.subscribe()
      })

      this.ws.on('message', async (data) => {
        try {
          const message = JSON.parse(data.toString())
          if (message.type === 'task_update') {
            await this.handleTaskUpdate(message.data)
          }
        } catch (error) {
          console.error('Fehler beim Verarbeiten der WebSocket-Nachricht:', error)
        }
      })

      this.ws.on('close', () => {
        console.log('WebSocket Verbindung geschlossen')
        this.handleReconnect()
      })

      this.ws.on('error', (error) => {
        console.error('WebSocket Fehler:', error)
        this.handleReconnect()
      })
    } catch (error) {
      console.error('Fehler beim Erstellen der WebSocket-Verbindung:', error)
      this.handleReconnect()
    }
  }

  private subscribe() {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          type: 'subscribe',
          channels: ['task_updates'],
        }),
      )
    }
  }

  private async handleTaskUpdate(taskData: any) {
    try {
      await this.tickTickService.syncTaskFromTickTick(taskData)
    } catch (error) {
      console.error('Fehler bei der Task-Synchronisation:', error)
    }
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      console.log(`Versuche Reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`)
      setTimeout(() => this.connect(), this.reconnectDelay)
    } else {
      console.error('Maximale Anzahl an Reconnect-Versuchen erreicht')
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }
}

export default TickTickWebSocket
