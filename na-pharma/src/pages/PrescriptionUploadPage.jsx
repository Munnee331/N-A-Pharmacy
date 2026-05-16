import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  Upload, FileText, X, CheckCircle, ChevronRight,
  Stethoscope, ShieldCheck, Clock, Pill,
} from 'lucide-react'
import { cn } from '../utils/cn'
import Button from '../components/ui/Button'
import SectionContainer from '../components/ui/SectionContainer'
import usePageMeta from '../hooks/usePageMeta'

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
const ACCEPTED_LABEL = 'JPG, PNG, WEBP, PDF — max 10 MB each'

const SAMPLE_MEDICINES = [
  { name: 'Amoxil 500mg',  qty: '14 tablets', note: 'Twice daily after meals' },
  { name: 'Seclo 20mg',    qty: '7 capsules', note: 'Once daily before breakfast' },
  { name: 'Napa Extra',    qty: '10 tablets', note: 'As needed for pain' },
]

function useUploadSimulation() {
  const [progress, setProgress] = useState(0)
  const [status, setStatus]     = useState('idle')
  function start() {
    setStatus('uploading'); setProgress(0)
    let p = 0
    const interval = setInterval(() => {
      p += Math.random() * 18 + 5
      if (p >= 100) { p = 100; clearInterval(interval); setTimeout(() => setStatus('done'), 300) }
      setProgress(Math.min(p, 100))
    }, 180)
  }
  function reset() { setStatus('idle'); setProgress(0) }
  return { progress, status, start, reset }
}

function FileCard({ file, progress, status, onRemove }) {
  const isImage = file.type.startsWith('image/')
  const sizeMB  = (file.size / 1024 / 1024).toFixed(2)
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.25 }}
      className={cn('relative rounded-2xl border p-4 flex items-start gap-4',
        status === 'done' ? 'border-green-200 bg-green-50/50' : 'border-neutral-200 bg-white')}>
      <div className="w-14 h-14 rounded-xl bg-neutral-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
        {isImage
          ? <img src={URL.createObjectURL(file)} alt={file.name} className="w-full h-full object-cover" />
          : <FileText size={22} className="text-primary-500" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-neutral-900 truncate">{file.name}</p>
        <p className="text-xs text-neutral-400 mt-0.5">{sizeMB} MB</p>
        {status === 'uploading' && (
          <div className="mt-2">
            <div className="h-1.5 bg-neutral-200 rounded-full overflow-hidden">
              <motion.div animate={{ width: `${progress}%` }} transition={{ duration: 0.2 }}
                className="h-full bg-primary-500 rounded-full" />
            </div>
            <p className="text-[10px] text-neutral-400 mt-1">{Math.round(progress)}% uploaded…</p>
          </div>
        )}
        {status === 'done' && (
          <div className="flex items-center gap-1.5 mt-1.5 text-green-600 text-xs font-medium">
            <CheckCircle size={12} />Upload complete
          </div>
        )}
      </div>
      <button onClick={onRemove} aria-label="Remove file"
        className="w-7 h-7 rounded-lg flex items-center justify-center text-neutral-400
                   hover:text-red-500 hover:bg-red-50 transition-all flex-shrink-0
                   focus:outline-none focus:ring-2 focus:ring-red-400">
        <X size={14} />
      </button>
    </motion.div>
  )
}

export default function PrescriptionUploadPage() {
  usePageMeta('Upload Prescription', 'Upload your doctor\'s prescription for verified medicine delivery.')
  const [files, setFiles]           = useState([])
  const [isDragging, setDragging]   = useState(false)
  const [doctorNote, setDoctorNote] = useState('')
  const [submitted, setSubmitted]   = useState(false)
  const fileInputRef = useRef(null)
  const { progress, status, start, reset } = useUploadSimulation()

  const addFiles = useCallback((newFiles) => {
    const valid = Array.from(newFiles).filter(
      (f) => ACCEPTED_TYPES.includes(f.type) && f.size <= 10 * 1024 * 1024
    )
    if (valid.length === 0) return
    setFiles((prev) => [...prev, ...valid])
    start()
  }, [start])

  function handleDrop(e) { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files) }
  function handleFileInput(e) { addFiles(e.target.files); e.target.value = '' }
  function removeFile(idx) { setFiles((prev) => prev.filter((_, i) => i !== idx)); reset() }
  function handleSubmit(e) { e.preventDefault(); if (files.length === 0) return; setSubmitted(true) }

  if (submitted) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-primary-50 via-white to-secondary-50
                      flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}
          className="bg-white rounded-3xl shadow-soft-lg border border-neutral-100 p-10 max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5">
            <CheckCircle size={30} className="text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-neutral-900 mb-2">Prescription Submitted!</h2>
          <p className="text-neutral-500 text-sm mb-6 leading-relaxed">
            Our pharmacists will review your prescription within 30 minutes and confirm your order.
          </p>
          <div className="flex flex-col gap-3">
            <Button as={Link} to="/cart" size="md" className="w-full">View Cart</Button>
            <Button as={Link} to="/shop" variant="outline" size="md" className="w-full">Continue Shopping</Button>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div data-testid="prescription-page" className="min-h-screen bg-neutral-50">
      <section className="bg-gradient-to-br from-primary-50 via-white to-secondary-50 border-b border-neutral-100">
        <SectionContainer py="md" as="div">
          <nav className="flex items-center gap-1.5 text-sm text-neutral-500 mb-4" aria-label="Breadcrumb">
            <Link to="/" className="hover:text-primary-600 transition-colors">Home</Link>
            <ChevronRight size={14} className="text-neutral-300" />
            <Link to="/shop" className="hover:text-primary-600 transition-colors">Shop</Link>
            <ChevronRight size={14} className="text-neutral-300" />
            <span className="text-neutral-900 font-medium">Upload Prescription</span>
          </nav>
          <h1 className="text-4xl font-bold text-neutral-900 mb-2">Upload Prescription</h1>
          <p className="text-neutral-500">Upload your doctor's prescription and we'll prepare your medicines.</p>
        </SectionContainer>
      </section>

      <SectionContainer py="md">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 flex flex-col gap-6">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
              className="bg-white rounded-2xl border border-neutral-100 shadow-soft p-6">
              <h2 className="text-base font-semibold text-neutral-900 mb-4">Upload Prescription Files</h2>
              <div onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
                onDragLeave={() => setDragging(false)} onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                role="button" tabIndex={0} aria-label="Drop prescription files here or click to browse"
                onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
                className={cn('relative border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-200',
                  isDragging ? 'border-primary-400 bg-primary-50 scale-[1.01]'
                    : 'border-neutral-300 hover:border-primary-300 hover:bg-primary-50/30')}>
                <input ref={fileInputRef} type="file" multiple accept={ACCEPTED_TYPES.join(',')}
                  onChange={handleFileInput} className="sr-only" aria-hidden="true" />
                <motion.div animate={isDragging ? { scale: 1.1 } : { scale: 1 }} transition={{ duration: 0.2 }}
                  className="flex flex-col items-center gap-3">
                  <div className={cn('w-14 h-14 rounded-2xl flex items-center justify-center transition-colors',
                    isDragging ? 'bg-primary-100' : 'bg-neutral-100')}>
                    <Upload size={24} className={isDragging ? 'text-primary-600' : 'text-neutral-400'} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-neutral-700">
                      {isDragging ? 'Drop files here' : 'Drag & drop or click to upload'}
                    </p>
                    <p className="text-xs text-neutral-400 mt-1">{ACCEPTED_LABEL}</p>
                  </div>
                </motion.div>
              </div>
              <AnimatePresence>
                {files.length > 0 && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                    className="mt-4 flex flex-col gap-3">
                    {files.map((file, i) => (
                      <FileCard key={`${file.name}-${i}`} file={file} progress={progress}
                        status={status} onRemove={() => removeFile(i)} />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.08 }}
              className="bg-white rounded-2xl border border-neutral-100 shadow-soft p-6">
              <h2 className="text-base font-semibold text-neutral-900 mb-1">
                Additional Notes <span className="text-neutral-400 font-normal text-sm">(optional)</span>
              </h2>
              <p className="text-xs text-neutral-400 mb-3">Any special instructions from your doctor.</p>
              <textarea value={doctorNote} onChange={(e) => setDoctorNote(e.target.value)} rows={4}
                placeholder="e.g. Doctor advised to take with food." aria-label="Additional notes"
                className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm text-neutral-900
                           placeholder:text-neutral-400 resize-none focus:outline-none focus:ring-2
                           focus:ring-primary-500 focus:border-primary-500 transition-all" />
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.12 }}
              className="bg-white rounded-2xl border border-neutral-100 shadow-soft p-6">
              <h2 className="text-base font-semibold text-neutral-900 mb-4">Medicines on Prescription</h2>
              <div className="flex flex-col gap-3">
                {SAMPLE_MEDICINES.map((med) => (
                  <div key={med.name} className="flex items-start gap-3 p-3 rounded-xl bg-neutral-50 border border-neutral-100">
                    <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center flex-shrink-0">
                      <Pill size={14} className="text-primary-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-neutral-900">{med.name}</p>
                      <p className="text-xs text-neutral-500">{med.qty} · {med.note}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            <Button onClick={handleSubmit} size="lg" disabled={files.length === 0 || status === 'uploading'}
              className="w-full" leftIcon={<Upload size={18} />}>
              {status === 'uploading' ? 'Uploading…' : 'Submit Prescription'}
            </Button>
          </div>

          {/* Sidebar */}
          <div className="flex flex-col gap-5">
            <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.1 }}
              className="bg-white rounded-2xl border border-neutral-100 shadow-soft p-6">
              <h3 className="text-sm font-semibold text-neutral-900 mb-4">How It Works</h3>
              <ol className="flex flex-col gap-4">
                {[
                  { icon: Upload,      step: '1', text: 'Upload your prescription photo or PDF' },
                  { icon: Stethoscope, step: '2', text: 'Our pharmacist reviews within 30 min' },
                  { icon: ShieldCheck, step: '3', text: 'Medicines are verified and packed' },
                  { icon: Clock,       step: '4', text: 'Delivered to your door same day' },
                ].map(({ icon: Icon, step, text }) => (
                  <li key={step} className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-primary-100 text-primary-700
                                    flex items-center justify-center text-xs font-bold flex-shrink-0">{step}</div>
                    <p className="text-sm text-neutral-600 leading-relaxed">{text}</p>
                  </li>
                ))}
              </ol>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.15 }}
              className="bg-primary-50 rounded-2xl border border-primary-100 p-5">
              <h3 className="text-sm font-semibold text-primary-800 mb-3">Accepted Formats</h3>
              <div className="flex flex-wrap gap-2">
                {['JPG', 'PNG', 'WEBP', 'PDF'].map((fmt) => (
                  <span key={fmt} className="px-2.5 py-1 rounded-lg bg-white border border-primary-200 text-primary-700 text-xs font-semibold">{fmt}</span>
                ))}
              </div>
              <p className="text-xs text-primary-600 mt-3">Maximum file size: <strong>10 MB</strong> per file.</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.2 }}
              className="flex items-start gap-3 p-4 rounded-2xl bg-neutral-50 border border-neutral-200">
              <ShieldCheck size={16} className="text-primary-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-neutral-500 leading-relaxed">
                Your prescription is encrypted and stored securely. Only accessed by licensed pharmacists.
              </p>
            </motion.div>
          </div>
        </div>
      </SectionContainer>
    </div>
  )
}
