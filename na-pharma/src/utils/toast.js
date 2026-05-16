import toast from 'react-hot-toast'

/**
 * Reusable toast helpers.
 * Wraps react-hot-toast with consistent styling and options.
 */

const BASE_OPTIONS = {
  duration: 4000,
  style: {
    borderRadius: '12px',
    fontFamily: 'Inter, system-ui, sans-serif',
    fontSize: '14px',
    fontWeight: '500',
    maxWidth: '380px',
  },
}

export const showToast = {
  /**
   * Show a success toast.
   * @param {string} message
   * @param {object} [options]
   */
  success(message, options = {}) {
    return toast.success(message, {
      ...BASE_OPTIONS,
      style: {
        ...BASE_OPTIONS.style,
        background: '#f0fdf4',
        color: '#15803d',
        border: '1px solid #bbf7d0',
      },
      iconTheme: { primary: '#16a34a', secondary: '#f0fdf4' },
      ...options,
    })
  },

  /**
   * Show an error toast.
   * @param {string} message
   * @param {object} [options]
   */
  error(message, options = {}) {
    return toast.error(message, {
      ...BASE_OPTIONS,
      duration: 5000,
      style: {
        ...BASE_OPTIONS.style,
        background: '#fef2f2',
        color: '#dc2626',
        border: '1px solid #fecaca',
      },
      iconTheme: { primary: '#dc2626', secondary: '#fef2f2' },
      ...options,
    })
  },

  /**
   * Show a loading toast. Returns the toast ID for dismissal.
   * @param {string} message
   * @returns {string} toastId
   */
  loading(message) {
    return toast.loading(message, {
      ...BASE_OPTIONS,
      duration: Infinity,
      style: {
        ...BASE_OPTIONS.style,
        background: '#eff6ff',
        color: '#1d4ed8',
        border: '1px solid #bfdbfe',
      },
    })
  },

  /**
   * Show an info toast.
   * @param {string} message
   * @param {object} [options]
   */
  info(message, options = {}) {
    return toast(message, {
      ...BASE_OPTIONS,
      icon: 'ℹ️',
      style: {
        ...BASE_OPTIONS.style,
        background: '#eff6ff',
        color: '#1d4ed8',
        border: '1px solid #bfdbfe',
      },
      ...options,
    })
  },

  /**
   * Dismiss a specific toast by ID.
   * @param {string} toastId
   */
  dismiss(toastId) {
    toast.dismiss(toastId)
  },

  /**
   * Dismiss all toasts.
   */
  dismissAll() {
    toast.dismiss()
  },

  /**
   * Promise-based toast — shows loading, then success or error.
   * @param {Promise} promise
   * @param {{ loading: string, success: string, error: string }} messages
   */
  promise(promise, messages) {
    return toast.promise(promise, messages, {
      ...BASE_OPTIONS,
      success: {
        style: {
          ...BASE_OPTIONS.style,
          background: '#f0fdf4',
          color: '#15803d',
          border: '1px solid #bbf7d0',
        },
      },
      error: {
        style: {
          ...BASE_OPTIONS.style,
          background: '#fef2f2',
          color: '#dc2626',
          border: '1px solid #fecaca',
        },
      },
    })
  },
}

export default showToast
