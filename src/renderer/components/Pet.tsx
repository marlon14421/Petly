import React, { useState, useEffect, useRef } from 'react'
import { PetAnimation } from '@shared/types'

// Placeholder for pet character
// Pixel Art Assets from internet (Placeholders for now)
const PET_ASSETS: Record<string, { idle: string; happy: string; sound: string; voiceLines: string[] }> = {
  cat: {
    idle: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcW94ZHR0YmZpNXNkMWwzaHBucTBzOWs5MXczaXE5Nnk0OXVybHVhYiZlcD12MV9zdGlja2Vyc19zZWFyY2gmY3Q9cw/WP392ibkvgOfYn07ez/giphy.gif',
    happy: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcW94ZHR0YmZpNXNkMWwzaHBucTBzOWs5MXczaXE5Nnk0OXVybHVhYiZlcD12MV9zdGlja2Vyc19zZWFyY2gmY3Q9cw/ztisqLhP99tVSHG136/giphy.gif',
    sound: 'https://www.myinstants.com/media/sounds/kot-allo.mp3',
    voiceLines: [
      'Meow! *purr*', 
      'Pet me more!', 
      'Get away with that dog!', 
      'Give me treats!',
      'Is it nap time yet?',
      'I saw a bird outside!',
      'Where is the laser pointer?',
      'Purrfection!'
    ]
  },
  miku: {
    idle: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3VzeGlncWtqM3V0YmtyNXZ0MDRvaGZ1dWsxN2ljN2dzcWpmOGRuOCZlcD12MV9zdGlja2Vyc19zZWFyY2gmY3Q9cw/13xxoHrXk4Rrdm/giphy.gif',
    happy: 'https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3cHhqNjVpNnk5YTVjaDc2dGNscTVwN2Yyc3cweXN6N3phcWFkZHhzYiZlcD12MV9zdGlja2Vyc19yZWxhdGVkJmN0PXM/ZcEYarbVuNdm/giphy.gif',
    sound: 'https://www.myinstants.com/media/sounds/jet2-miku.mp3',
    voiceLines: [
      'Miku Miku Beam!', 
      'Shall we sing together?', 
      'I am the best pet!', 
      'Vocaloid Power!',
      'Leek for everyone!',
      'Ready for the concert?',
      '01 in your heart!',
      'Sekai de ichiban o-hime-sama!'
    ]
  },
  ghost: {
    idle: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNXFtNXdqdTF0dGlmcG9kNWNrcHNzMjF0eHYwOXhja2QycTc5MGVweCZlcD12MV9zdGlja2Vyc19zZWFyY2gmY3Q9cw/YoypIsUmXXI52/giphy.gif',
    happy: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNXFtNXdqdTF0dGlmcG9kNWNrcHNzMjF0eHYwOXhja2QycTc5MGVweCZlcD12MV9zdGlja2Vyc19zZWFyY2gmY3Q9cw/MYpsWqc6TbTIA/giphy.gif',
    sound: 'https://www.myinstants.com/media/sounds/ghostbusters.mp3',
    voiceLines: [
      'Boo!', 
      'I am a friendly ghost.', 
      'Can you see me?', 
      'Spooky, right?',
      'Floating is fun!',
      'No one can catch me!',
      'I prefer the night.',
      'Boo-tiful day!'
    ]
  }
}

const PetCharacter: React.FC<{ animation: PetAnimation; type: string; hasBubble: boolean; onInteraction: () => void }> = ({ animation, type, hasBubble, onInteraction }) => {
  const assets = PET_ASSETS[type] || PET_ASSETS.cat
  const isHappy = animation === 'happy' || hasBubble
  
  return (
    <div 
      className="relative cursor-pointer select-none group"
      onClick={onInteraction}
      onContextMenu={(e) => e.preventDefault()}
    >
      <img 
        src={isHappy ? assets.happy : assets.idle} 
        alt="Pet" 
        draggable="false"
        className={`w-32 h-32 object-contain pointer-events-none ${animation === 'happy' ? 'animate-bounce' : ''}`}
      />
    </div>
  )
}

const Pet: React.FC = () => {
  const [animation, setAnimation] = useState<PetAnimation>('idle')
  const [petType, setPetType] = useState('cat')
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [bubble, setBubble] = useState<string | null>(null)
  const isDragging = useRef(false)
  const lastMousePos = useRef({ x: 0, y: 0 })
  const lastSoundTime = useRef(0)

  const playPetSound = () => {
    if (!soundEnabled) return
    
    // Cooldown check (e.g. 1 second)
    const now = Date.now()
    if (now - lastSoundTime.current < 1000) return
    
    const soundUrl = PET_ASSETS[petType]?.sound
    if (soundUrl) {
      lastSoundTime.current = now
      const audio = new Audio(soundUrl)
      audio.volume = 0.2
      audio.play().catch(e => console.warn("Sound play prevented or failed", e))
    }
  }

  useEffect(() => {
    window.electronAPI.onChangePet((type) => setPetType(type))
    window.electronAPI.onToggleSound((enabled) => setSoundEnabled(enabled))
  }, [])

  useEffect(() => {
    // Random movement logic
    const moveInterval = setInterval(async () => {
      if (Math.random() > 0.8 && !isDragging.current) {
        setAnimation('walk')
        
        // Random direction
        const directions = [
          { x: 10, y: 0 },
          { x: -10, y: 0 },
          { x: 0, y: 10 },
          { x: 0, y: -10 }
        ]
        const dir = directions[Math.floor(Math.random() * directions.length)]
        
        // Move multiple steps
        for (let i = 0; i < 10; i++) {
          if (isDragging.current) break
          await new Promise(r => setTimeout(r, 100))
          window.electronAPI.windowDrag(dir)
        }
        
        setAnimation('idle')
      }
    }, 10000)

    // Random speech bubbles
    const bubbleInterval = setInterval(() => {
      if (Math.random() > 0.7 && !bubble) {
        const messages = [
          "Doing great!", 
          "Let's work!", 
          "Take a break?", 
          "Drink water!",
          "Stretch your legs!",
          "You're doing amazing!",
          "Stay hydrated!",
          "Focus time!",
          "I'm watching you!",
          "Did you blink?",
          "Check your posture!",
          "You got this!"
        ]
        setBubble(messages[Math.floor(Math.random() * messages.length)])
        setTimeout(() => setBubble(null), 3000)
      }
    }, 15000)

    return () => {
      clearInterval(moveInterval)
      clearInterval(bubbleInterval)
    }
  }, [])

  const handleInteraction = () => {
    const assets = PET_ASSETS[petType] || PET_ASSETS.cat
    const lines = assets.voiceLines
    const randomLine = lines[Math.floor(Math.random() * lines.length)]
    
    setAnimation('happy')
    setBubble(randomLine)
    playPetSound()
    setTimeout(() => {
      setAnimation('idle')
      setBubble(null)
    }, 4000)
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    // 2 is for right click
    if (e.button === 2) {
      isDragging.current = true
      lastMousePos.current = { x: e.screenX, y: e.screenY }
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging.current) {
      const deltaX = e.screenX - lastMousePos.current.x
      const deltaY = e.screenY - lastMousePos.current.y
      window.electronAPI.windowDrag({ x: deltaX, y: deltaY })
      lastMousePos.current = { x: e.screenX, y: e.screenY }
    }
  }

  const handleMouseUp = () => {
    isDragging.current = false
  }

  return (
    <div 
      className="fixed inset-0 pointer-events-none flex flex-col items-center justify-center"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div className="pointer-events-auto flex flex-col items-center">
        {bubble && (
          <div className="bg-white px-4 py-2 rounded-2xl shadow-lg mb-4 text-sm font-bold border-2 border-gray-200 relative animate-in fade-in zoom-in duration-300">
            {bubble}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white rotate-45 border-r-2 border-b-2 border-gray-200" />
          </div>
        )}
        <PetCharacter 
          animation={animation} 
          type={petType} 
          hasBubble={!!bubble} 
          onInteraction={handleInteraction} 
        />
      </div>
    </div>
  )
}

export default Pet
