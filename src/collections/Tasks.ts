import { CollectionConfig } from 'payload'
import type { CollectionBeforeChangeHook } from 'payload'

interface TaskData {
  id: string
  impact?: number
  confidence?: number
  ease?: number
  priority: string
}

const updatePriority: CollectionBeforeChangeHook<TaskData> = ({ data }) => {
  if (data.impact && data.confidence && data.ease) {
    const iceScore = (data.impact + data.confidence + data.ease) / 3

    if (iceScore >= 8) data.priority = '5'
    else if (iceScore >= 5) data.priority = '3'
    else if (iceScore >= 3) data.priority = '1'
    else data.priority = '0'
  }

  return data
}

const Tasks: CollectionConfig = {
  slug: 'tasks',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'impact', 'confidence', 'ease', 'priority', 'status'],
  },
  fields: [
    {
      name: 'ticktickId',
      type: 'text',
      required: true,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'content',
      type: 'textarea',
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Todo', value: '0' },
        { label: 'In Progress', value: '1' },
        { label: 'Completed', value: '2' },
      ],
      defaultValue: '0',
    },
    {
      name: 'priority',
      type: 'select',
      options: [
        { label: 'None', value: '0' },
        { label: 'Low', value: '1' },
        { label: 'Medium', value: '3' },
        { label: 'High', value: '5' },
      ],
      defaultValue: '0',
    },
    {
      name: 'impact',
      type: 'number',
      min: 1,
      max: 10,
      required: true,
      defaultValue: 5,
    },
    {
      name: 'confidence',
      type: 'number',
      min: 1,
      max: 10,
      required: true,
      defaultValue: 5,
    },
    {
      name: 'ease',
      type: 'number',
      min: 1,
      max: 10,
      required: true,
      defaultValue: 5,
    },
    {
      name: 'dueDate',
      type: 'date',
    },
    {
      name: 'startDate',
      type: 'date',
    },
    {
      name: 'tags',
      type: 'array',
      fields: [
        {
          name: 'name',
          type: 'text',
        },
      ],
    },
    {
      name: 'lastSync',
      type: 'date',
      admin: {
        readOnly: true,
      },
    },
  ],
  hooks: {
    beforeChange: [updatePriority],
  },
}

export default Tasks
