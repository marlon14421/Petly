import React, { useState, useEffect } from 'react'
import Pet from './components/Pet'
import { PetState, Task, PetConfig } from '@shared/types'
import { Trophy, CheckSquare, Settings, X, Plus, Trash2 } from 'lucide-react'

const App: React.FC = () => {
  const [view, setView] = useState<'pet' | 'tasks' | 'settings'>('pet')
  const [petState, setPetState] = useState<PetState>(() => {
    const saved = localStorage.getItem('petState')
    return saved ? JSON.parse(saved) : {
      hunger: 50,
      happiness: 50,
      energy: 100,
      xp: 0,
      level: 1,
      tasksCompleted: 0
    }
  })

  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('tasks')
    return saved ? JSON.parse(saved) : []
  })

  const [config, setConfig] = useState<PetConfig>(() => {
    const saved = localStorage.getItem('config')
    return saved ? JSON.parse(saved) : {
      reminderInterval: 30,
      volume: 50,
      showReminders: true
    }
  })

  useEffect(() => {
    localStorage.setItem('petState', JSON.stringify(petState))
    localStorage.setItem('tasks', JSON.stringify(tasks))
    localStorage.setItem('config', JSON.stringify(config))
  }, [petState, tasks, config])

  // Hunger/Energy decay logic
  useEffect(() => {
    const interval = setInterval(() => {
      setPetState(prev => ({
        ...prev,
        hunger: Math.max(0, prev.hunger - 1),
        energy: Math.max(0, prev.energy - 0.5),
        happiness: Math.max(0, prev.happiness - 0.2)
      }))
    }, 60000) // Every minute

    return () => clearInterval(interval)
  }, [])

  const handleAddTask = (title: string) => {
    const newTask: Task = {
      id: Math.random().toString(36).substr(2, 9),
      title,
      completed: false,
      createdAt: Date.now()
    }
    setTasks([...tasks, newTask])
  }

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(task => {
      if (task.id === id) {
        const completed = !task.completed
        if (completed) {
          // Reward pet
          setPetState(ps => {
            const newXP = ps.xp + 10
            const newLevel = Math.floor(newXP / 100) + 1
            return {
              ...ps,
              xp: newXP,
              level: newLevel,
              tasksCompleted: ps.tasksCompleted + 1,
              happiness: Math.min(100, ps.happiness + 20),
              energy: Math.min(100, ps.energy + 10)
            }
          })
        }
        return { ...task, completed }
      }
      return task
    }))
  }

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id))
  }

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Main Content */}
      <div className="w-full h-full flex flex-col items-center justify-center">
        <Pet />
      </div>
    </div>
  )
}

export default App
