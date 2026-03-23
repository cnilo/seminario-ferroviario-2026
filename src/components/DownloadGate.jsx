import { useState } from 'react'
import { motion } from 'framer-motion'
import styles from './DownloadGate.module.css'

// URL de la plantilla — reemplazar con la URL real del .pptx / .pdf
const TEMPLATE_URL = '/plantilla-propuesta-seminario-2026.pptx'
const TEMPLATE_NAME = 'Plantilla-Propuesta-Seminario-Ferroviario-2026.pptx'

export default function DownloadGate({ onContinue }) {
  const [downloaded, setDownloaded] = useState(false)

  const handleDownload = () => {
    const a = document.createElement('a')
    a.href = TEMPLATE_URL
    a.download = TEMPLATE_NAME
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    setTimeout(() => setDownloaded(true), 800)
  }

  const handleContinue = () => {
    onContinue()
  }

  return (
    <motion.div
      className={styles.gate}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Decoración superior */}
      <div className={styles.topDeco}>
        <div className={styles.decoLine} />
        <div className={styles.decoDot} />
        <div className={styles.decoLine} />
      </div>

      {/* Logo Metro */}
      <div className={styles.logo}>
        <img src="/logo-metro.png" alt="Metro de Santiago" className={styles.logoImg} />
        <div className={styles.logoText}>
          <span className={styles.brand}>Metro de Santiago</span>
          <span className={styles.edition}>3° Edición · 2026</span>
        </div>
      </div>

      <div className={styles.badge}>Paso previo obligatorio</div>

      <h1 className={styles.title}>
        Descarga la plantilla<br />
        <span>de propuesta</span>
      </h1>

      <p className={styles.desc}>
        Antes de completar el formulario de inscripción, debe descargar y completar
        la plantilla oficial de propuesta. El archivo resultante (.PDF o .PPTX)
        será requerido en el paso de carga de documentos.
      </p>

      {/* Info card */}
      <div className={styles.infoCard}>
        <div className={styles.infoRow}>
          <div className={styles.infoIcon}>📋</div>
          <div>
            <div className={styles.infoLabel}>Formato</div>
            <div className={styles.infoValue}>PowerPoint (.PPTX) — editable</div>
          </div>
        </div>
        <div className={styles.infoDivider} />
        <div className={styles.infoRow}>
          <div className={styles.infoIcon}>📐</div>
          <div>
            <div className={styles.infoLabel}>Extensión máxima</div>
            <div className={styles.infoValue}>10 diapositivas</div>
          </div>
        </div>
        <div className={styles.infoDivider} />
        <div className={styles.infoRow}>
          <div className={styles.infoIcon}>💾</div>
          <div>
            <div className={styles.infoLabel}>Guardar como</div>
            <div className={styles.infoValue}>.PDF o .PPTX — máx 1 GB</div>
          </div>
        </div>
        <div className={styles.infoDivider} />
        <div className={styles.infoRow}>
          <div className={styles.infoIcon}>📅</div>
          <div>
            <div className={styles.infoLabel}>Plazo de envío</div>
            <div className={styles.infoValue}>8 de mayo de 2026</div>
          </div>
        </div>
      </div>

      {/* Consultas */}
      <p className={styles.contactLine}>
        Consultas: <a href="mailto:seminario@metro.cl">seminario@metro.cl</a>
      </p>

      {/* Botón de descarga */}
      <motion.button
        className={styles.btnDownload}
        onClick={handleDownload}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {downloaded ? (
          <>
            <span className={styles.checkIcon}>✓</span>
            Plantilla descargada
          </>
        ) : (
          <>
            <span className={styles.dlIcon}>⬇</span>
            Descargar plantilla oficial
          </>
        )}
      </motion.button>

      {downloaded && (
        <motion.p
          className={styles.downloadedNote}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          ¡Listo! Complete la plantilla y guárdela. Podrá adjuntarla en el formulario.
        </motion.p>
      )}

      {/* Botón continuar */}
      <motion.button
        className={styles.btnContinue}
        onClick={handleContinue}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        Ir al formulario de inscripción <span className={styles.arrow}>→</span>
      </motion.button>

    </motion.div>
  )
}
