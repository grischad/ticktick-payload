import axios from 'axios'
import payload from 'payload'

interface TickTickTask {
  id: string
  title: string
  content: string
  status: number
  priority: number
  dueDate: string
  startDate: string
  tags: { name: string }[]
}

interface ICEData {
  impact: number
  confidence: number
  ease: number
}

class TickTickService {
  private baseUrl = 'https://api.ticktick.com/api/v2'
  private accessToken: string

  constructor(accessToken: string) {
    this.accessToken = accessToken
  }

  private getHeaders() {
    return {
      Authorization: `Bearer ${this.accessToken}`,
      'Content-Type': 'application/json',
    }
  }

  private extractICEFromContent(content: string): ICEData | null {
    const iceRegex = /ICE:\s*Impact:\s*(\d+)\s*Confidence:\s*(\d+)\s*Ease:\s*(\d+)/
    const match = content.match(iceRegex)

    if (match && match[1] && match[2] && match[3]) {
      return {
        impact: parseInt(match[1], 10),
        confidence: parseInt(match[2], 10),
        ease: parseInt(match[3], 10),
      }
    }
    return null
  }

  private addICEToContent(content: string, ice: ICEData): string {
    const iceString = `ICE:\nImpact: ${ice.impact}\nConfidence: ${ice.confidence}\nEase: ${ice.ease}`

    if (content.includes('ICE:')) {
      return content.replace(/ICE:[\s\S]*?(?=\n\n|$)/, iceString)
    }

    return `${content}\n\n${iceString}`
  }

  async syncTaskFromTickTick(ticktickTask: TickTickTask) {
    const iceData = this.extractICEFromContent(ticktickTask.content || '')

    const existingTask = await payload.find({
      collection: 'tasks',
      where: {
        ticktickId: { equals: ticktickTask.id },
      },
    })

    const taskData = {
      ticktickId: ticktickTask.id,
      title: ticktickTask.title,
      content: ticktickTask.content,
      status: (ticktickTask.status === 0 ? '0' : ticktickTask.status === 1 ? '1' : '2') as
        | '0'
        | '1'
        | '2',
      priority: (ticktickTask.priority === 0
        ? '0'
        : ticktickTask.priority === 1
          ? '1'
          : ticktickTask.priority === 3
            ? '3'
            : '5') as '0' | '1' | '3' | '5',
      dueDate: ticktickTask.dueDate,
      startDate: ticktickTask.startDate,
      tags: ticktickTask.tags,
      impact: iceData?.impact || 5,
      confidence: iceData?.confidence || 5,
      ease: iceData?.ease || 5,
      lastSync: new Date().toISOString(),
    }

    if (existingTask.totalDocs > 0 && existingTask.docs[0]) {
      await payload.update({
        collection: 'tasks',
        id: existingTask.docs[0].id,
        data: taskData,
      })
    } else {
      await payload.create({
        collection: 'tasks',
        data: taskData,
      })
    }
  }

  async syncTaskToTickTick(payloadTask: any) {
    const iceData = {
      impact: payloadTask.impact,
      confidence: payloadTask.confidence,
      ease: payloadTask.ease,
    }

    const content = this.addICEToContent(payloadTask.content || '', iceData)

    const ticktickTask = {
      id: payloadTask.ticktickId,
      title: payloadTask.title,
      content,
      status: parseInt(payloadTask.status),
      priority: parseInt(payloadTask.priority),
      dueDate: payloadTask.dueDate,
      startDate: payloadTask.startDate,
      tags: payloadTask.tags,
    }

    await axios.put(`${this.baseUrl}/task/${payloadTask.ticktickId}`, ticktickTask, {
      headers: this.getHeaders(),
    })

    await payload.update({
      collection: 'tasks',
      id: payloadTask.id,
      data: { lastSync: new Date().toISOString() },
    })
  }

  async syncAllTasks() {
    const response = await axios.get(`${this.baseUrl}/task/all`, {
      headers: this.getHeaders(),
    })

    for (const task of response.data) {
      await this.syncTaskFromTickTick(task)
    }
  }
}

export default TickTickService
