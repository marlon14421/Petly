export interface PetState {
  hunger: number
  happiness: number
  energy: number
  xp: number
  level: number
  tasksCompleted: number
}

export interface Task {
  id: string
  title: string
  completed: boolean
  createdAt: number
}

export interface PetConfig {
  reminderInterval: number // in minutes
  volume: number
  showReminders: boolean
}

export type PetAnimation = 'idle' | 'walk' | 'sit' | 'sleep' | 'happy' | 'sad'
