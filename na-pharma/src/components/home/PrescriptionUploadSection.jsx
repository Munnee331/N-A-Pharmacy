import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate, Link } from 'react-router-dom'
import {
  Upload,
  FileImage,
  FileText,
  CheckCircle2,
  AlertCircle,
  X,
  ClipboardList,
  Clock,
  ShieldCheck,
  LogIn,
} from 'lucide-react'
import Button from '../ui/Button'
import { uploadPrescription } from '../../api/prescriptionApi.js'
import { useAuth } from '../../context/AuthContext.jsx'

// ── Constants ─────────────────────────────────────────────────────────────
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
const MAX_SIZE_MB    = 10                          // matches backend limit
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024

const steps = [
  { icon: Upload,        label: 'Upload your prescription' },
  { icon: ClipboardList, label: 'Pharmacist reviews it'    },
  { icon: Clock,         label: 'Get medicines in 30 min'  },
]

// ── Helpers ───────────────────────────────────────────────────────────────
function getFileIcon(file) {
  return file?.type === 'application/pdf' ? FileText : FileImage
}

function formatBytes(bytes) {
  if (bytes < 1024)           return `${bytes} B`
  if (bytes < 1024 * 1024)    return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

/** Extract a human-readable message from an API error */
function extractErrorMessage(err) {
  // Axios error shape from our client interceptor: { status, message, raw }
  if (err?.message) return err.message
  if (typeof err === 'string') return err
  return 'Upload failed. Please try again.'
}

// ── Component ─────────────────────────────────────────────────────────────
export default function PrescriptionUploadSection() {
  const { isAuthenticated } = useAuth()
  const navigate            = useNavigate()

  const [file, setFile]           = useState(null)
  const [notes, setNotes]         = useState('')
  const [dragOver, setDragOver]   = useState(false)
  const [progress, setProgress]   = useState(0)
  const [status, setStatus]       = useState('idle') // idle | uploading | success | error
  const [result, setResult]       = useState(null)
  const [fileError, setFileError] = useState('')
  const [errorMsg, setErrorMsg]   = useState('')
  const inputRef                  = useRef(null)

  // ── File validation ──────────────────────────────────────────────────────
  function validateAndSet(incoming) {
    setFileError('')
    if (!incoming) return
    if (!ACCEPTED_TYPES.includes(incoming.type)) {
      setFileError('Only JPG, PNG, WEBP, or PDF files are accepted.')
      return
    }
    if (incoming.size > MAX_SIZE_BYTES) {
      setFileError(`File is too large. Maximum size is ${MAX_SIZE_MB} MB.`)
      return
    }
    setFile(incoming)
    setStatus('idle')
    setResult(null)
    setErrorMsg('')
  }

  // ── Drag & drop handlers ─────────────────────────────────────────────────
  function onDragOver(e)  { e.preventDefault(); setDragOver(true) }
  function onDragLeave()  { setDragOver(false) }
  function onDrop(e) {
    e.preventDefault()
    setDragOver(false)
    validateAndSet(e.dataTransfer.files?.[0])
  }

  // ── Upload ───────────────────────────────────────────────────────────────
  async function handleUpload() {
    if (!file) return
    setStatus('uploading')
    setProgress(0)
    setErrorMsg('')

    try {
      const data = await uploadPrescription(file, notes, setProgress)
      setResult(data)
      setStatus('success')

      // Redirect to dashboard after 2 s so user sees the success state
      setTimeout(() => {
        navigate('/dashboard', { replace: false })
      }, 2000)
    } catch (err) {
      setStatus('error')
      setErrorMsg(extractErrorMessage(err))
    }
  }

  // ── Reset ────────────────────────────────────────────────────────────────
  function reset() {
    setFile(null)
    setNotes('')
    setProgress(0)
    setStatus('idle')
    setResult(null)
    setFileError('')
    setErrorMsg('')
    if (inputRef.current) inputRef.current.value = ''
  }

  const FileIcon = getFileIcon(file)

  return (
    <section
      data-testid="prescription-upload-section"
      className="relative overflow-hidden bg-gradient-to-br from-secondary-50 via-white to-primary-50 py-20 lg:py-28"
    >
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 rounded-full
                      bg-primary-100/50 blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute -bottom-20 -left-20 w-64 h-64 rounded-full
                      bg-secondary-100/40 blur-3xl" aria-hidden="true" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* ── Left: copy + steps ── */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full
                             bg-secondary-100 text-secondary-700 text-sm font-medium mb-6 border border-secondary-200">
              <ShieldCheck size={13} />
              Pharmacist-Verified Service
            </span>

            <h2 className="text-4xl sm:text-5xl font-bold text-neutral-900 leading-tight mb-4">
              Upload Your{' '}
              <span className="text-secondary-600">Prescription</span>
            </h2>
            <p className="text-lg text-neutral-600 leading-relaxed mb-10 max-w-md">
              Simply upload a photo or PDF of your doctor's prescription. Our licensed
              pharmacists will review it and prepare your order within 30 minutes.
            </p>

            <div className="flex flex-col gap-5">
              {steps.map(({ icon: Icon, label }, i) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, x: -16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  className="flex items-center gap-4"
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-secondary-100
                                  flex items-center justify-center border border-secondary-200">
                    <Icon size={18} className="text-secondary-600" />
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-secondary-400 w-5">{i + 1}.</span>
                    <span className="text-neutral-700 font-medium">{label}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* ── Right: upload card ── */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: 'easeOut', delay: 0.1 }}
          >
            <div className="bg-white rounded-3xl shadow-soft-lg border border-neutral-100 p-8">

              {/* ── Guest gate — not logged in ── */}
              {!isAuthenticated ? (
                <GuestPrompt />
              ) : (
                <AnimatePresence mode="wait">

                  {/* ── Success state ── */}
                  {status === 'success' && result ? (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      data-testid="upload-success"
                      className="flex flex-col items-center text-center gap-5 py-4"
                    >
                      <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center">
                        <CheckCircle2 size={32} className="text-primary-600" />
                      </div>
                      <div>
                        <p className="text-xl font-bold text-neutral-900 mb-1">
                          Prescription Received!
                        </p>
                        <p className="text-neutral-500 text-sm">
                          A pharmacist will review it within 30 minutes.
                          Redirecting to your dashboard…
                        </p>
                      </div>
                      <div className="w-full bg-primary-50 rounded-2xl p-4 border border-primary-100">
                        <p className="text-xs text-neutral-500 mb-1">Reference ID</p>
                        <p className="text-lg font-bold text-primary-700 tracking-wide font-mono">
                          {result.prescription?._id?.slice(-8).toUpperCase() ?? '—'}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={reset}
                        className="w-full"
                      >
                        Upload Another Prescription
                      </Button>
                    </motion.div>

                  ) : (
                    /* ── Upload form ── */
                    <motion.div
                      key="form"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-col gap-5"
                    >
                      <div>
                        <h3 className="text-lg font-semibold text-neutral-900 mb-1">
                          Upload Prescription
                        </h3>
                        <p className="text-sm text-neutral-500">
                          JPG, PNG, WEBP or PDF · Max {MAX_SIZE_MB} MB
                        </p>
                      </div>

                      {/* Drop zone */}
                      <div
                        role="button"
                        tabIndex={0}
                        aria-label="Upload prescription file"
                        data-testid="drop-zone"
                        onClick={() => inputRef.current?.click()}
                        onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
                        onDragOver={onDragOver}
                        onDragLeave={onDragLeave}
                        onDrop={onDrop}
                        className={`relative flex flex-col items-center justify-center gap-3 rounded-2xl
                                    border-2 border-dashed p-8 cursor-pointer transition-all duration-200
                                    focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:ring-offset-2
                                    ${dragOver
                                      ? 'border-secondary-400 bg-secondary-50'
                                      : file
                                        ? 'border-primary-400 bg-primary-50'
                                        : 'border-neutral-300 bg-neutral-50 hover:border-secondary-400 hover:bg-secondary-50'
                                    }`}
                      >
                        <input
                          ref={inputRef}
                          type="file"
                          accept={ACCEPTED_TYPES.join(',')}
                          className="sr-only"
                          data-testid="file-input"
                          onChange={(e) => validateAndSet(e.target.files?.[0])}
                          aria-hidden="true"
                        />

                        {file ? (
                          <>
                            <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center">
                              <FileIcon size={22} className="text-primary-600" />
                            </div>
                            <div className="text-center">
                              <p className="text-sm font-medium text-neutral-900 truncate max-w-[200px]">
                                {file.name}
                              </p>
                              <p className="text-xs text-neutral-500">{formatBytes(file.size)}</p>
                            </div>
                            <button
                              type="button"
                              aria-label="Remove file"
                              onClick={(e) => { e.stopPropagation(); reset() }}
                              className="absolute top-3 right-3 p-1 rounded-lg text-neutral-400
                                         hover:text-red-500 hover:bg-red-50 transition-colors"
                            >
                              <X size={14} />
                            </button>
                          </>
                        ) : (
                          <>
                            <div className="w-12 h-12 rounded-xl bg-secondary-100 flex items-center justify-center">
                              <Upload size={22} className="text-secondary-600" />
                            </div>
                            <div className="text-center">
                              <p className="text-sm font-medium text-neutral-700">
                                Drag & drop or{' '}
                                <span className="text-secondary-600 underline">browse</span>
                              </p>
                              <p className="text-xs text-neutral-400 mt-0.5">
                                Your prescription file
                              </p>
                            </div>
                          </>
                        )}
                      </div>

                      {/* File validation error */}
                      <AnimatePresence>
                        {fileError && (
                          <motion.p
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            className="flex items-center gap-1.5 text-sm text-red-600"
                            role="alert"
                            data-testid="file-error"
                          >
                            <AlertCircle size={14} />
                            {fileError}
                          </motion.p>
                        )}
                      </AnimatePresence>

                      {/* Notes */}
                      <div>
                        <label
                          htmlFor="rx-notes"
                          className="block text-sm font-medium text-neutral-700 mb-1.5"
                        >
                          Notes for pharmacist{' '}
                          <span className="text-neutral-400 font-normal">(optional)</span>
                        </label>
                        <textarea
                          id="rx-notes"
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder="e.g. urgent, specific brand preferred, allergies…"
                          rows={3}
                          className="w-full rounded-xl border border-neutral-300 px-4 py-2.5 text-sm
                                     text-neutral-900 placeholder:text-neutral-400 resize-none
                                     focus:outline-none focus:border-secondary-500
                                     focus:ring-2 focus:ring-secondary-500 focus:ring-offset-2
                                     transition-colors duration-200"
                        />
                      </div>

                      {/* Upload progress bar */}
                      <AnimatePresence>
                        {status === 'uploading' && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            data-testid="progress-bar"
                          >
                            <div className="flex justify-between text-xs text-neutral-500 mb-1.5">
                              <span>Uploading…</span>
                              <span aria-live="polite">{progress}%</span>
                            </div>
                            <div
                              className="h-2 bg-neutral-100 rounded-full overflow-hidden"
                              role="progressbar"
                              aria-valuenow={progress}
                              aria-valuemin={0}
                              aria-valuemax={100}
                            >
                              <motion.div
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 0.2 }}
                                className="h-full bg-secondary-500 rounded-full"
                              />
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* API error message */}
                      <AnimatePresence>
                        {status === 'error' && errorMsg && (
                          <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex items-center gap-1.5 text-sm text-red-600"
                            role="alert"
                            data-testid="upload-error"
                          >
                            <AlertCircle size={14} />
                            {errorMsg}
                          </motion.p>
                        )}
                      </AnimatePresence>

                      {/* Submit button */}
                      <Button
                        variant="secondary"
                        size="lg"
                        className="w-full"
                        isLoading={status === 'uploading'}
                        disabled={!file || status === 'uploading'}
                        onClick={handleUpload}
                        data-testid="submit-button"
                      >
                        {status === 'uploading' ? 'Uploading…' : 'Submit Prescription'}
                      </Button>

                      <p className="text-center text-xs text-neutral-400">
                        By submitting, you confirm this is a valid doctor's prescription.
                      </p>
                    </motion.div>
                  )}

                </AnimatePresence>
              )}

            </div>
          </motion.div>

        </div>
      </div>
    </section>
  )
}

// ── Guest prompt — shown when user is not logged in ───────────────────────
function GuestPrompt() {
  return (
    <div
      data-testid="guest-prompt"
      className="flex flex-col items-center text-center gap-5 py-6"
    >
      <div className="w-14 h-14 rounded-2xl bg-secondary-100 flex items-center justify-center">
        <LogIn size={24} className="text-secondary-600" />
      </div>
      <div>
        <h3 className="text-lg font-semibold text-neutral-900 mb-1">
          Sign in to upload a prescription
        </h3>
        <p className="text-sm text-neutral-500 max-w-xs">
          Create a free account or sign in to submit your prescription and track its status.
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-3 w-full">
        <Button
          as={Link}
          to="/login"
          variant="secondary"
          size="md"
          className="flex-1 justify-center"
        >
          Sign In
        </Button>
        <Button
          as={Link}
          to="/register"
          variant="outline"
          size="md"
          className="flex-1 justify-center"
        >
          Create Account
        </Button>
      </div>
    </div>
  )
}
