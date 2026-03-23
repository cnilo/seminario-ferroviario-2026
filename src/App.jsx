import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import ParticleCanvas from './components/ParticleCanvas'
import DownloadGate from './components/DownloadGate'
import InscripcionForm from './components/InscripcionForm'

// Decoraciones de esquina
function CornerDeco({ position }) {
  const style = {
    position: 'fixed',
    pointerEvents: 'none',
    zIndex: 0,
    opacity: 0.28,
    ...(position === 'tl' ? { top: 0, left: 0 } : { bottom: 0, right: 0, transform: 'rotate(180deg)' }),
  }
  return (
    <svg style={style} width="130" height="130" viewBox="0 0 130 130">
      <path d="M0 44 L0 0 L44 0" fill="none" stroke="#1e90ff" strokeWidth="1.5"/>
      <path d="M0 76 L0 0 L76 0" fill="none" stroke="#1e90ff" strokeWidth="0.5" opacity="0.4"/>
      <circle cx="0" cy="0" r="3" fill="#1e90ff" opacity="0.6"/>
    </svg>
  )
}

export default function App() {
  const [screen, setScreen] = useState('gate') // 'gate' | 'form'

  return (
    <>
      <ParticleCanvas />
      <CornerDeco position="tl" />
      <CornerDeco position="br" />

      <AnimatePresence mode="wait">
        {screen === 'gate' ? (
          <motion.div
            key="gate"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.4 }}
          >
            <DownloadGate onContinue={() => setScreen('form')} />
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <InscripcionForm />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
