'use client'

import React, { useState, useEffect } from 'react'
import { usePayloadAPI } from '../hooks/usePayloadAPI'
import type { Task } from '../payload-types'

const TaskList: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([])
  const [expandedTask, setExpandedTask] = useState<string | null>(null)
  const [syncing, setSyncing] = useState(false)
  const { get, patch, post } = usePayloadAPI()

  useEffect(() => {
    fetchTasks()
  }, [])

  const fetchTasks = async () => {
    try {
      const response = await get<Task>('/api/tasks')
      setTasks(response.docs)
    } catch (error) {
      console.error('Error fetching tasks:', error)
    }
  }

  const handleSync = async () => {
    try {
      setSyncing(true)
      await post('/api/tasks/sync', {})
      await fetchTasks() // Aktualisiere die Liste nach der Synchronisation
    } catch (error) {
      console.error('Error syncing tasks:', error)
    } finally {
      setSyncing(false)
    }
  }

  const handleScoreChange = async (
    taskId: string,
    field: 'impact' | 'confidence' | 'ease',
    value: number,
  ) => {
    try {
      const task = tasks.find((t) => t.id === taskId)
      if (!task) return

      const updatedTask = {
        ...task,
        [field]: value,
      }

      await patch<Task>(`/api/tasks/${taskId}`, updatedTask)
      await post('/api/tasks/sync', {})
      await fetchTasks()
    } catch (error) {
      console.error('Error updating task:', error)
    }
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Tasks</h1>
        <button
          onClick={handleSync}
          disabled={syncing}
          className={`px-4 py-2 rounded-md text-white ${
            syncing ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'
          }`}
        >
          {syncing ? 'Synchronisiere...' : 'Mit TickTick synchronisieren'}
        </button>
      </div>

      <div className="space-y-4">
        {tasks.map((task) => (
          <div key={task.id} className="bg-white shadow rounded-lg p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">{task.title}</h2>
              <button
                onClick={() => setExpandedTask(expandedTask === task.id ? null : task.id)}
                className="text-blue-500 hover:text-blue-700"
              >
                {expandedTask === task.id ? 'Weniger' : 'Mehr'}
              </button>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Impact</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={task.impact}
                  onChange={(e) => handleScoreChange(task.id, 'impact', parseInt(e.target.value))}
                  onBlur={(e) => handleScoreChange(task.id, 'impact', parseInt(e.target.value))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Confidence</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={task.confidence}
                  onChange={(e) =>
                    handleScoreChange(task.id, 'confidence', parseInt(e.target.value))
                  }
                  onBlur={(e) => handleScoreChange(task.id, 'confidence', parseInt(e.target.value))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Ease</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={task.ease}
                  onChange={(e) => handleScoreChange(task.id, 'ease', parseInt(e.target.value))}
                  onBlur={(e) => handleScoreChange(task.id, 'ease', parseInt(e.target.value))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            {expandedTask === task.id && (
              <div className="mt-4">
                <div className="prose max-w-none">
                  <p>{task.content}</p>
                </div>
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-gray-700">Tags</h3>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {task.tags &&
                      task.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {tag.name}
                        </span>
                      ))}
                  </div>
                </div>
                {(task.dueDate || task.startDate) && (
                  <div className="mt-4 text-sm text-gray-500">
                    {task.startDate && (
                      <p>Start: {new Date(task.startDate).toLocaleDateString()}</p>
                    )}
                    {task.dueDate && <p>Fällig: {new Date(task.dueDate).toLocaleDateString()}</p>}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default TaskList
