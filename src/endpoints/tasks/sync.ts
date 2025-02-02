import { Endpoint, PayloadHandler } from 'payload'
import TickTickService from '../../services/TickTickService'

const syncEndpoint: Endpoint = {
  path: '/api/tasks/sync',
  method: 'post',
  handler: (async (req) => {
    try {
      const accessToken = process.env.TICKTICK_ACCESS_TOKEN

      if (!accessToken) {
        return new Response(
          JSON.stringify({
            message: 'TickTick access token not configured',
          }),
          {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          },
        )
      }

      const tickTickService = new TickTickService(accessToken)
      await tickTickService.syncAllTasks()

      return new Response(
        JSON.stringify({
          message: 'Tasks synchronized successfully',
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        },
      )
    } catch (error) {
      console.error('Error syncing tasks:', error)
      return new Response(
        JSON.stringify({
          message: 'Error syncing tasks',
          error: error instanceof Error ? error.message : String(error),
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        },
      )
    }
  }) as PayloadHandler,
}

export default syncEndpoint
