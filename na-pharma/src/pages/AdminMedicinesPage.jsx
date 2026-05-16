import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus, Search, Pencil, Trash2, X, Loader2,
  ChevronLeft, ChevronRight, AlertCircle, Pill,
} from 'lucide-react'
import { useMedicines } from '../hooks/useMedicines.js'
import usePageMeta from '../hooks/usePageMeta.js'
import Button from '../components/ui/Button.jsx'
import showToast from '../utils/toast.js'

// ── Empty form state ──────────────────────────────────────────────────────
const EMPTY_FORM = {
  name: '', genericName: '', brand: '', category: '',
  description: '', price: '', discountPrice: '', stock: '',
  manufacturer: '', dosage: '', image: '',
  prescriptionRequired: false, isFeatured: false,
}

// ── Simple field validation ───────────────────────────────────────────────
function validateForm(f) {
  const errs = {}
  if (!f.name.trim())     errs.name     = 'Name is required.'
  if (!f.category.trim()) errs.category = 'Category is required.'
  if (f.price === '' || isNaN(Number(f.price)) || Number(f.price) < 0)
    errs.price = 'Valid price is required.'
  return errs
}

export default function AdminMedicinesPage() {
  usePageMeta('Medicines — Admin', 'Manage medicine catalogue.')

  const {
    medicines, pagination, isLoading, error,
    params, updateParams, create, update, remove,
  } = useMedicines({ limit: 10 })

  // ── Modal state ───────────────────────────────────────────────────────
  const [modal,       setModal]       = useState(null)   // null | 'create' | 'edit' | 'delete'
  const [selected,    setSelected]    = useState(null)   // medicine being edited/deleted
  const [form,        setForm]        = useState(EMPTY_FORM)
  const [formErrors,  setFormErrors]  = useState({})
  const [submitting,  setSubmitting]  = useState(false)

  // ── Search debounce ───────────────────────────────────────────────────
  const [searchInput, setSearchInput] = useState(params.search ?? '')

  function handleSearchKey(e) {
    if (e.key === 'Enter') updateParams({ search: searchInput, page: 1 })
  }

  // ── Open modals ───────────────────────────────────────────────────────
  function openCreate() {
    setForm(EMPTY_FORM)
    setFormErrors({})
    setSelected(null)
    setModal('create')
  }

  function openEdit(med) {
    setForm({
      name:                 med.name         ?? '',
      genericName:          med.genericName  ?? '',
      brand:                med.brand        ?? '',
      category:             med.category     ?? '',
      description:          med.description  ?? '',
      price:                String(med.price ?? ''),
      discountPrice:        med.discountPrice != null ? String(med.discountPrice) : '',
      stock:                String(med.stock ?? ''),
      manufacturer:         med.manufacturer ?? '',
      dosage:               med.dosage       ?? '',
      image:                med.image        ?? '',
      prescriptionRequired: med.prescriptionRequired ?? false,
      isFeatured:           med.isFeatured   ?? false,
    })
    setFormErrors({})
    setSelected(med)
    setModal('edit')
  }

  function openDelete(med) {
    setSelected(med)
    setModal('delete')
  }

  function closeModal() {
    setModal(null)
    setSelected(null)
    setFormErrors({})
  }

  // ── Form field change ─────────────────────────────────────────────────
  function handleField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }))
    if (formErrors[key]) setFormErrors((prev) => ({ ...prev, [key]: '' }))
  }

  // ── Submit create / edit ──────────────────────────────────────────────
  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validateForm(form)
    if (Object.keys(errs).length) { setFormErrors(errs); return }

    const payload = {
      ...form,
      price:         Number(form.price),
      discountPrice: form.discountPrice !== '' ? Number(form.discountPrice) : null,
      stock:         form.stock !== '' ? Number(form.stock) : 0,
    }

    setSubmitting(true)
    try {
      if (modal === 'create') {
        await create(payload)
      } else {
        await update(selected._id, payload)
      }
      closeModal()
    } catch (err) {
      showToast.error(err?.message ?? 'Operation failed.')
    } finally {
      setSubmitting(false)
    }
  }

  // ── Confirm delete ────────────────────────────────────────────────────
  async function handleDelete() {
    setSubmitting(true)
    try {
      await remove(selected._id)
      closeModal()
    } catch (err) {
      showToast.error(err?.message ?? 'Delete failed.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="p-5 sm:p-6 lg:p-8 space-y-6 max-w-screen-2xl mx-auto">

      {/* ── Page header ── */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Medicines</h1>
          <p className="text-sm text-neutral-500 mt-0.5">
            {pagination ? `${pagination.total} medicines in catalogue` : 'Manage your medicine catalogue'}
          </p>
        </div>
        <Button onClick={openCreate} leftIcon={<Plus size={16} />}>
          Add Medicine
        </Button>
      </div>

      {/* ── Search + filter bar ── */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
          <input
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={handleSearchKey}
            placeholder="Search medicines… (press Enter)"
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-neutral-200 bg-white
                       text-sm text-neutral-900 placeholder:text-neutral-400
                       focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-400"
          />
        </div>
        <select
          value={params.sort ?? 'latest'}
          onChange={(e) => updateParams({ sort: e.target.value, page: 1 })}
          className="px-3 py-2 rounded-xl border border-neutral-200 bg-white text-sm text-neutral-700
                     focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="latest">Latest first</option>
          <option value="oldest">Oldest first</option>
          <option value="price_asc">Price: Low → High</option>
          <option value="price_desc">Price: High → Low</option>
        </select>
      </div>

      {/* ── Table ── */}
      <div className="bg-white rounded-2xl border border-neutral-100 shadow-soft overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20 gap-3 text-neutral-400">
            <Loader2 size={22} className="animate-spin" />
            <span className="text-sm">Loading medicines…</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-red-500">
            <AlertCircle size={28} />
            <p className="text-sm font-medium">{error}</p>
          </div>
        ) : medicines.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-neutral-400">
            <Pill size={32} />
            <p className="text-sm font-medium">No medicines found.</p>
            <Button size="sm" onClick={openCreate} leftIcon={<Plus size={14} />}>Add first medicine</Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="bg-neutral-50 border-b border-neutral-100">
                  {['Name', 'Category', 'Price', 'Stock', 'Rx', 'Featured', ''].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold text-neutral-500
                                           uppercase tracking-wider first:pl-6 last:pr-6">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50">
                {medicines.map((med, i) => (
                  <motion.tr
                    key={med._id}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.25, delay: i * 0.03 }}
                    className="hover:bg-neutral-50/60 transition-colors group"
                  >
                    <td className="px-4 py-3.5 pl-6">
                      <p className="text-sm font-semibold text-neutral-900 truncate max-w-[180px]">{med.name}</p>
                      {med.brand && <p className="text-xs text-neutral-400">{med.brand}</p>}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px]
                                       font-medium bg-primary-50 text-primary-700 capitalize">
                        {med.category}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="text-sm font-semibold text-neutral-900">৳{med.price}</p>
                      {med.discountPrice && (
                        <p className="text-xs text-green-600">৳{med.discountPrice} sale</p>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`text-sm font-medium ${med.stock === 0 ? 'text-red-600' : med.stock < 20 ? 'text-amber-600' : 'text-neutral-700'}`}>
                        {med.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${med.prescriptionRequired ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                        {med.prescriptionRequired ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${med.isFeatured ? 'bg-amber-50 text-amber-700' : 'bg-neutral-100 text-neutral-500'}`}>
                        {med.isFeatured ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 pr-6">
                      <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openEdit(med)}
                          aria-label={`Edit ${med.name}`}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-neutral-400
                                     hover:text-primary-600 hover:bg-primary-50 transition-all
                                     focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          onClick={() => openDelete(med)}
                          aria-label={`Delete ${med.name}`}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-neutral-400
                                     hover:text-red-600 hover:bg-red-50 transition-all
                                     focus:outline-none focus:ring-2 focus:ring-red-500"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Pagination ── */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-neutral-100">
            <p className="text-xs text-neutral-400">
              Page {pagination.page} of {pagination.totalPages} · {pagination.total} total
            </p>
            <div className="flex items-center gap-2">
              <button
                disabled={!pagination.hasPrev}
                onClick={() => updateParams({ page: pagination.page - 1 })}
                className="w-8 h-8 rounded-lg flex items-center justify-center border border-neutral-200
                           text-neutral-500 hover:border-primary-300 hover:text-primary-600
                           disabled:opacity-40 disabled:cursor-not-allowed transition-all
                           focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                disabled={!pagination.hasNext}
                onClick={() => updateParams({ page: pagination.page + 1 })}
                className="w-8 h-8 rounded-lg flex items-center justify-center border border-neutral-200
                           text-neutral-500 hover:border-primary-300 hover:text-primary-600
                           disabled:opacity-40 disabled:cursor-not-allowed transition-all
                           focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Create / Edit Modal ── */}
      <AnimatePresence>
        {(modal === 'create' || modal === 'edit') && (
          <Modal title={modal === 'create' ? 'Add Medicine' : 'Edit Medicine'} onClose={closeModal}>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Name *" error={formErrors.name}>
                  <input value={form.name} onChange={(e) => handleField('name', e.target.value)}
                    placeholder="e.g. Napa Extra 500mg" className={inputCls(formErrors.name)} />
                </FormField>
                <FormField label="Generic Name">
                  <input value={form.genericName} onChange={(e) => handleField('genericName', e.target.value)}
                    placeholder="e.g. Paracetamol" className={inputCls()} />
                </FormField>
                <FormField label="Brand">
                  <input value={form.brand} onChange={(e) => handleField('brand', e.target.value)}
                    placeholder="e.g. Beximco" className={inputCls()} />
                </FormField>
                <FormField label="Category *" error={formErrors.category}>
                  <input value={form.category} onChange={(e) => handleField('category', e.target.value)}
                    placeholder="e.g. tablet" className={inputCls(formErrors.category)} />
                </FormField>
                <FormField label="Price (৳) *" error={formErrors.price}>
                  <input type="number" min="0" step="0.01" value={form.price}
                    onChange={(e) => handleField('price', e.target.value)}
                    placeholder="0.00" className={inputCls(formErrors.price)} />
                </FormField>
                <FormField label="Discount Price (৳)">
                  <input type="number" min="0" step="0.01" value={form.discountPrice}
                    onChange={(e) => handleField('discountPrice', e.target.value)}
                    placeholder="Leave blank if none" className={inputCls()} />
                </FormField>
                <FormField label="Stock">
                  <input type="number" min="0" value={form.stock}
                    onChange={(e) => handleField('stock', e.target.value)}
                    placeholder="0" className={inputCls()} />
                </FormField>
                <FormField label="Manufacturer">
                  <input value={form.manufacturer} onChange={(e) => handleField('manufacturer', e.target.value)}
                    placeholder="e.g. Square Pharma" className={inputCls()} />
                </FormField>
                <FormField label="Dosage">
                  <input value={form.dosage} onChange={(e) => handleField('dosage', e.target.value)}
                    placeholder="e.g. 500mg twice daily" className={inputCls()} />
                </FormField>
                <FormField label="Image URL">
                  <input value={form.image} onChange={(e) => handleField('image', e.target.value)}
                    placeholder="https://…" className={inputCls()} />
                </FormField>
              </div>

              <FormField label="Description">
                <textarea value={form.description} onChange={(e) => handleField('description', e.target.value)}
                  rows={3} placeholder="Brief description…"
                  className={`${inputCls()} resize-none`} />
              </FormField>

              <div className="flex items-center gap-6">
                <Toggle
                  label="Prescription Required"
                  checked={form.prescriptionRequired}
                  onChange={(v) => handleField('prescriptionRequired', v)}
                />
                <Toggle
                  label="Featured"
                  checked={form.isFeatured}
                  onChange={(v) => handleField('isFeatured', v)}
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={closeModal} disabled={submitting}>
                  Cancel
                </Button>
                <Button type="submit" isLoading={submitting}>
                  {modal === 'create' ? 'Create Medicine' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </Modal>
        )}
      </AnimatePresence>

      {/* ── Delete Confirm Modal ── */}
      <AnimatePresence>
        {modal === 'delete' && selected && (
          <Modal title="Delete Medicine" onClose={closeModal} maxWidth="max-w-md">
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 bg-red-50 rounded-xl border border-red-100">
                <AlertCircle size={18} className="text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-red-800">This action cannot be undone.</p>
                  <p className="text-sm text-red-600 mt-1">
                    You are about to permanently delete <strong>{selected.name}</strong>.
                  </p>
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={closeModal} disabled={submitting}>Cancel</Button>
                <Button variant="danger" isLoading={submitting} onClick={handleDelete}>
                  Delete Medicine
                </Button>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Reusable sub-components ───────────────────────────────────────────────

function Modal({ title, onClose, children, maxWidth = 'max-w-2xl' }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/50"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ duration: 0.2 }}
        className={`bg-white rounded-2xl shadow-soft-lg w-full ${maxWidth} max-h-[90vh] overflow-y-auto`}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
          <h2 className="text-base font-semibold text-neutral-900">{title}</h2>
          <button onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-neutral-400
                       hover:bg-neutral-100 hover:text-neutral-600 transition-colors
                       focus:outline-none focus:ring-2 focus:ring-primary-500">
            <X size={16} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </motion.div>
    </motion.div>
  )
}

function FormField({ label, error, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-neutral-600 uppercase tracking-wide">{label}</label>
      {children}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}

function Toggle({ label, checked, onChange }) {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer">
      <div className="relative flex-shrink-0">
        <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="sr-only" />
        <div className={`w-9 h-5 rounded-full transition-colors duration-200 ${checked ? 'bg-primary-600' : 'bg-neutral-200'}`} />
        <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${checked ? 'translate-x-4' : 'translate-x-0'}`} />
      </div>
      <span className="text-sm text-neutral-700">{label}</span>
    </label>
  )
}

function inputCls(error) {
  return `w-full px-3 py-2 rounded-xl border text-sm text-neutral-900 placeholder:text-neutral-400
          focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all
          ${error ? 'border-red-400 bg-red-50' : 'border-neutral-200 bg-white hover:border-neutral-300'}`
}
