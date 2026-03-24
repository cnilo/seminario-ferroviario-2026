import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import styles from './InscripcionForm.module.css'

// ── CONFIGURACIÓN ────────────────────────────────────────────────────────────
const FLOW_URL     = import.meta.env.VITE_FLOW_URL
const SECRET_TOKEN = import.meta.env.VITE_SECRET_TOKEN
// ─────────────────────────────────────────────────────────────────────────────

const AREAS = [
  { value: 'Medio Ambiente, Energía y Sostenibilidad', icon: '🌿' },
  { value: 'Ingeniería y Obras Civiles',               icon: '🏗' },
  { value: 'Experiencias del Usuario',                 icon: '🛡' },
  { value: 'Sistemas Ferroviarios',                    icon: '🚄' },
  { value: 'Mantenimiento',                            icon: '🔧' },
  { value: 'Digitalización e Inteligencia Artificial', icon: '🤖' },
  { value: 'Otros',                                    icon: '✏️' },
]

const PAISES = [
  'Chile','Argentina','Brasil','Colombia','España','Francia',
  'Alemania','Italia','China','Japón','Corea del Sur',
  'Estados Unidos','México','Otro',
]

const INITIAL = {
  empresa: '', pais: '', contacto: '', correo: '', telefono: '',
  area: '', areaOtros: '', titulo: '', resumen: '', participo: '', calidad: '',
}

function Field({ label, required, error, children }) {
  return (
    <div className={styles.field}>
      <label className={styles.label}>
        {label} {required && <span className={styles.req}>*</span>}
      </label>
      {children}
      <AnimatePresence>
        {error && (
          <motion.p
            className={styles.fieldError}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}

function RadioCard({ name, value, label, icon, checked, onChange }) {
  return (
    <label className={`${styles.radioCard} ${checked ? styles.radioChecked : ''}`}>
      <input type="radio" name={name} value={value} checked={checked} onChange={onChange} />
      <div className={styles.radioInner}>
        <div className={`${styles.radioDot} ${checked ? styles.radioDotChecked : ''}`}>
          {checked && <div className={styles.radioDotFill} />}
        </div>
        {icon && <span className={styles.radioIcon}>{icon}</span>}
        <span className={styles.radioLabel}>{label}</span>
      </div>
    </label>
  )
}

function SectionHeader({ number, title }) {
  return (
    <div className={styles.sectionHeader}>
      <div className={styles.sectionLine} />
      <div className={styles.sectionLabel}>
        <span className={styles.sectionNum}>Sección {number.toString().padStart(2, '0')}</span>
        <span className={styles.sectionDash}>—</span>
        <span>{title}</span>
      </div>
      <div className={styles.sectionLine} />
    </div>
  )
}

export default function InscripcionForm() {
  const [values, setValues]     = useState(INITIAL)
  const [errors, setErrors]     = useState({})
  const [file, setFile]         = useState(null)
  const [dragging, setDragging] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted]   = useState(false)
  const [toast, setToast]           = useState(null)
  const fileRef = useRef()

  const set = (key, val) => {
    setValues(v => ({ ...v, [key]: val }))
    setErrors(e => ({ ...e, [key]: '' }))
  }

  const showToast = (msg, type = 'error') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 4500)
  }

  const ALLOWED_MIME = [
    'application/pdf',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  ]

  const setFileVal = (f) => {
    if (!f) return
    const ext = f.name.split('.').pop().toLowerCase()
    if (!['pdf','ppt','pptx'].includes(ext) || !ALLOWED_MIME.includes(f.type)) {
      showToast('Solo se aceptan archivos .PDF o .PPTX', 'error')
      return
    }
    setFile(f)
    setErrors(e => ({ ...e, archivo: '' }))
  }

  const validate = () => {
    const e = {}
    if (!values.empresa.trim())  e.empresa  = 'Este campo es obligatorio.'
    if (!values.pais)            e.pais     = 'Seleccione un país.'
    if (!values.contacto.trim()) e.contacto = 'Este campo es obligatorio.'
    if (!values.correo.trim())   e.correo   = 'Este campo es obligatorio.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.correo))
                                 e.correo   = 'Ingrese un correo válido.'
    if (!values.telefono.trim()) e.telefono = 'Este campo es obligatorio.'
    if (!values.area)            e.area     = 'Seleccione una categoría.'
    if (values.area === 'Otros' && !values.areaOtros.trim()) e.areaOtros = 'Especifique el área.'
    if (!values.titulo.trim())   e.titulo   = 'Este campo es obligatorio.'
    if (!values.resumen.trim())  e.resumen  = 'Este campo es obligatorio.'
    if (!file)                   e.archivo  = 'Debe adjuntar su propuesta.'
    if (!values.participo)       e.participo = 'Seleccione una opción.'
    if (values.participo === 'Sí' && !values.calidad)
                                 e.calidad  = 'Seleccione una opción.'
    return e
  }

  const toBase64 = (f) => new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result.split(',')[1])
    reader.onerror = reject
    reader.readAsDataURL(f)
  })

  const handleSubmit = async () => {
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      showToast('Complete todos los campos obligatorios antes de enviar.', 'error')
      const firstErr = document.querySelector('[data-error="true"]')
      firstErr?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }

    setSubmitting(true)

    let archivoBase64 = ''
    try {
      archivoBase64 = await toBase64(file)
    } catch {
      showToast('Error al leer el archivo. Intente nuevamente.', 'error')
      setSubmitting(false)
      return
    }

    const payload = {
      Title:         values.empresa,
      Pais:          values.pais,
      Contacto:      values.contacto,
      Correo:        values.correo,
      Telefono:      values.telefono,
      Area:          values.area === 'Otros' ? values.areaOtros : values.area,
      Titulo:        values.titulo,
      Resumen:       values.resumen,
      Participo:     values.participo,
      Calidad:       values.calidad || 'N/A',
      ArchivoNombre: `${values.empresa.trim().replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]/g, '').replace(/\s+/g, '_')}_Propuesta_Seminario2026.${file?.name.split('.').pop()}`,
      ArchivoBase64: archivoBase64,
      FechaEnvio:    new Date().toISOString(),
      _token:        SECRET_TOKEN,
    }

    try {
      const res = await fetch(FLOW_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (res.ok || res.status === 202) {
        setSubmitted(true)
        window.scrollTo({ top: 0, behavior: 'smooth' })
      } else {
        throw new Error('HTTP ' + res.status)
      }
    } catch (err) {
      showToast('Error al enviar. Intente nuevamente o escriba a seminario@metro.cl', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <motion.div
        className={styles.successScreen}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className={styles.successIcon}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        >✓</motion.div>
        <h2 className={styles.successTitle}>¡Inscripción Enviada!</h2>
        <p className={styles.successDesc}>
          Hemos recibido su propuesta para el Seminario de Innovaciones Ferroviarias 2026.<br /><br />
          Nos pondremos en contacto a través de <strong>{values.correo}</strong> antes del{' '}
          <strong>8 de mayo de 2026</strong>.
        </p>
        <p className={styles.successContact}>
          Para consultas escríbanos a{' '}
          <a href="mailto:seminario@metro.cl">seminario@metro.cl</a>
        </p>
        <div className={styles.successMeta}>
          <div className={styles.successMetaItem}>
            <span className={styles.successMetaLabel}>Empresa</span>
            <span>{values.empresa}</span>
          </div>
          <div className={styles.successMetaItem}>
            <span className={styles.successMetaLabel}>Área</span>
            <span>{values.area}</span>
          </div>
          <div className={styles.successMetaItem}>
            <span className={styles.successMetaLabel}>Propuesta</span>
            <span>{values.titulo}</span>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <div className={styles.wrapper}>
      {/* Header */}
      <motion.div
        className={styles.header}
        initial={{ opacity: 0, y: -24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className={styles.headerBadge}>3° Edición</div>
        <div className={styles.headerLogo}>
          <img src="/logo-metro.png" alt="Metro de Santiago" className={styles.headerLogoImg} />
          <span className={styles.headerBrand}>Metro de Santiago</span>
        </div>
        <h1 className={styles.headerTitle}>
          Seminario Innovaciones<br />
          para la <span>Industria Ferroviaria</span><br />
          <em>2026</em>
        </h1>
        <p className={styles.headerSub}>Proyectando el Transporte del Futuro</p>
        <div className={styles.headerMeta}>
          <div className={styles.metaItem}><div className={styles.metaDot} />24 y 25 de Junio 2026</div>
          <div className={styles.metaItem}><div className={`${styles.metaDot} ${styles.red}`} />Santiago de Chile</div>
          <div className={styles.metaItem}><div className={`${styles.metaDot} ${styles.gold}`} />Inscripciones hasta el 8 de mayo</div>
        </div>
      </motion.div>

      {/* Sección 1 */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <SectionHeader number={1} title="Datos de la empresa" />
        <div className={styles.grid}>
          <Field label="Nombre de la Empresa o Razón Social" required error={errors.empresa}>
            <input
              data-error={!!errors.empresa}
              className={`${styles.input} ${errors.empresa ? styles.inputError : ''}`}
              value={values.empresa}
              onChange={e => set('empresa', e.target.value)}
              placeholder="Ej: Siemens Mobility Chile S.A."
            />
          </Field>
          <Field label="País de Origen" required error={errors.pais}>
            <div className={styles.selectWrap}>
              <select
                className={`${styles.input} ${errors.pais ? styles.inputError : ''}`}
                value={values.pais}
                onChange={e => set('pais', e.target.value)}
              >
                <option value="">Seleccione un país</option>
                {PAISES.map(p => <option key={p}>{p}</option>)}
              </select>
              <span className={styles.selectArrow} />
            </div>
          </Field>
          <Field label="Nombre del Contacto Principal" required error={errors.contacto}>
            <input
              className={`${styles.input} ${errors.contacto ? styles.inputError : ''}`}
              value={values.contacto}
              onChange={e => set('contacto', e.target.value)}
              placeholder="Nombre y apellido"
            />
          </Field>
          <Field label="Correo Electrónico" required error={errors.correo}>
            <input
              type="email"
              className={`${styles.input} ${errors.correo ? styles.inputError : ''}`}
              value={values.correo}
              onChange={e => set('correo', e.target.value)}
              placeholder="correo@empresa.com"
            />
          </Field>
          <Field label="Teléfono de Contacto" required error={errors.telefono}>
            <input
              type="tel"
              className={`${styles.input} ${errors.telefono ? styles.inputError : ''}`}
              value={values.telefono}
              onChange={e => set('telefono', e.target.value)}
              placeholder="+56 9 1234 5678"
            />
          </Field>
        </div>
      </motion.div>

      {/* Sección 2 */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}>
        <SectionHeader number={2} title="Categoría de la propuesta" />
        <Field label="¿En qué área se enmarca su solución?" required error={errors.area}>
          <div className={styles.radioGrid}>
            {AREAS.map(a => (
              <RadioCard
                key={a.value}
                name="area"
                value={a.value}
                label={a.value}
                icon={a.icon}
                checked={values.area === a.value}
                onChange={() => { set('area', a.value); if (a.value !== 'Otros') set('areaOtros', '') }}
              />
            ))}
          </div>
        </Field>
        <AnimatePresence>
          {values.area === 'Otros' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              style={{ overflow: 'hidden', marginTop: 16 }}
            >
              <Field label="Especifique el área" required error={errors.areaOtros}>
                <input
                  className={`${styles.input} ${errors.areaOtros ? styles.inputError : ''}`}
                  value={values.areaOtros}
                  onChange={e => set('areaOtros', e.target.value)}
                  placeholder="Describa el área de su solución"
                />
              </Field>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Sección 3 */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.29 }}>
        <SectionHeader number={3} title="Detalle de la propuesta" />
        <div className={styles.grid1}>
          <Field label="Título de la Propuesta / Solución" required error={errors.titulo}>
            <input
              className={`${styles.input} ${errors.titulo ? styles.inputError : ''}`}
              value={values.titulo}
              onChange={e => set('titulo', e.target.value)}
              placeholder="Ej: Sistema de monitoreo predictivo para material rodante"
            />
          </Field>
          <Field label="Resumen Ejecutivo" required error={errors.resumen}>
            <textarea
              className={`${styles.input} ${styles.textarea} ${errors.resumen ? styles.inputError : ''}`}
              value={values.resumen}
              onChange={e => set('resumen', e.target.value)}
              placeholder="Explique cómo su solución ayuda a los proyectos de modernización y expansión de Metro de Santiago..."
            />
          </Field>
          <Field label="Carga de Propuesta" required error={errors.archivo}>
            <div
              className={`${styles.uploadArea} ${dragging ? styles.dragging : ''} ${file ? styles.hasFile : ''} ${errors.archivo ? styles.uploadError : ''}`}
              onDragOver={e => { e.preventDefault(); setDragging(true) }}
              onDragLeave={() => setDragging(false)}
              onDrop={e => { e.preventDefault(); setDragging(false); setFileVal(e.dataTransfer.files[0]) }}
              onClick={() => fileRef.current?.click()}
            >
              <input
                ref={fileRef}
                type="file"
                accept=".pdf,.ppt,.pptx"
                style={{ display: 'none' }}
                onChange={e => setFileVal(e.target.files[0])}
              />
              {!file ? (
                <>
                  <div className={styles.uploadIcon}>📎</div>
                  <p className={styles.uploadLabel}><strong>Haz clic o arrastra</strong> tu archivo aquí</p>
                  <p className={styles.uploadHint}>Solo .PDF o .PPTX — máximo 10 diapositivas — hasta 1 GB</p>
                </>
              ) : (
                <div className={styles.fileInfo}>
                  <span className={styles.fileIconBig}>📄</span>
                  <div className={styles.fileDetails}>
                    <span className={styles.fileName}>{file.name}</span>
                    <span className={styles.fileSize}>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                  </div>
                  <button
                    className={styles.fileRemove}
                    onClick={e => { e.stopPropagation(); setFile(null) }}
                    type="button"
                  >×</button>
                </div>
              )}
            </div>
          </Field>
        </div>
      </motion.div>

      {/* Sección 4 */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.36 }}>
        <SectionHeader number={4} title="Historial de participación" />
        <Field label="¿Ha participado en ediciones anteriores del Seminario?" required error={errors.participo}>
          <div className={styles.radioRow}>
            {['Sí', 'No'].map(v => (
              <RadioCard key={v} name="participo" value={v} label={v}
                checked={values.participo === v}
                onChange={() => { set('participo', v); if (v === 'No') set('calidad', '') }}
              />
            ))}
          </div>
        </Field>
        <AnimatePresence>
          {values.participo === 'Sí' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              style={{ overflow: 'hidden', marginTop: 20 }}
            >
              <Field label="¿En qué calidad participó anteriormente?" required error={errors.calidad}>
                <div className={styles.radioRow}>
                  {['Asistente', 'Expositor', 'Ambas'].map(v => (
                    <RadioCard key={v} name="calidad" value={v} label={v}
                      checked={values.calidad === v}
                      onChange={() => set('calidad', v)}
                    />
                  ))}
                </div>
              </Field>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Submit */}
      <motion.div
        className={styles.submitArea}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.45 }}
      >
        <p className={styles.submitNote}>
          Al enviar, acepta que Metro de Santiago procese sus datos para la gestión del seminario.{' '}
          Consultas: <a href="mailto:seminario@metro.cl">seminario@metro.cl</a>
        </p>
        <motion.button
          className={styles.btnSubmit}
          onClick={handleSubmit}
          disabled={submitting}
          whileHover={!submitting ? { scale: 1.02 } : {}}
          whileTap={!submitting ? { scale: 0.98 } : {}}
        >
          {submitting ? (
            <span className={styles.spinner} />
          ) : (
            <>Enviar Inscripción <span className={styles.arrow}>→</span></>
          )}
        </motion.button>
      </motion.div>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            className={`${styles.toast} ${styles[toast.type]}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <span>{toast.type === 'error' ? '⚠' : '✓'}</span>
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
