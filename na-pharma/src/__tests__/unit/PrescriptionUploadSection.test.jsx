/**
 * Unit tests for PrescriptionUploadSection component.
 *
 * Coverage:
 *  - Guest state: shows sign-in prompt, hides upload form
 *  - Authenticated state: shows upload form
 *  - File validation: rejects invalid types and oversized files
 *  - Upload flow: calls uploadPrescription, shows progress, shows success
 *  - Error handling: shows API error message
 *  - Redirect: navigates to /dashboard after successful upload
 *  - Reset: clears state after clicking "Upload Another"
 */

import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'

// ── Mocks ─────────────────────────────────────────────────────────────────

// Mock framer-motion — strip animation props, render plain elements
vi.mock('framer-motion', () => ({
  motion: new Proxy({}, {
    get: (_, tag) => {
      const Tag = typeof tag === 'string' ? tag : 'div'
      return ({ children, ...props }) => {
        const {
          initial, animate, exit, variants, transition,
          whileHover, whileInView, viewport, whileTap,
          ...rest
        } = props
        return <Tag {...rest}>{children}</Tag>
      }
    },
  }),
  AnimatePresence: ({ children }) => <>{children}</>,
}))

// Mock prescriptionApi
vi.mock('../../api/prescriptionApi.js', () => ({
  uploadPrescription: vi.fn(),
}))

// Mock AuthContext
const mockUseAuth = vi.fn()
vi.mock('../../context/AuthContext.jsx', () => ({
  useAuth: () => mockUseAuth(),
}))

// Mock useNavigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

import PrescriptionUploadSection from '../../components/home/PrescriptionUploadSection'
import { uploadPrescription }    from '../../api/prescriptionApi.js'

// ── Helpers ───────────────────────────────────────────────────────────────

function renderComponent() {
  return render(
    <MemoryRouter>
      <PrescriptionUploadSection />
    </MemoryRouter>
  )
}

function makeFile(name = 'rx.jpg', type = 'image/jpeg', sizeBytes = 1024) {
  return new File([new ArrayBuffer(sizeBytes)], name, { type })
}

// ── Setup ─────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks()
  vi.useFakeTimers({ shouldAdvanceTime: true })
  mockUseAuth.mockReturnValue({ isAuthenticated: true })
})

afterEach(() => {
  vi.useRealTimers()
})

/** Simulate file selection on the hidden input */
function selectFile(file) {
  const input = screen.getByTestId('file-input')
  Object.defineProperty(input, 'files', { value: [file], configurable: true })
  fireEvent.change(input)
}

// ─────────────────────────────────────────────────────────────────────────
// 1. Guest state
// ─────────────────────────────────────────────────────────────────────────

describe('Guest state (not authenticated)', () => {
  beforeEach(() => {
    mockUseAuth.mockReturnValue({ isAuthenticated: false })
  })

  it('shows the guest sign-in prompt', () => {
    renderComponent()
    expect(screen.getByTestId('guest-prompt')).toBeInTheDocument()
    expect(screen.getByText(/sign in to upload a prescription/i)).toBeInTheDocument()
  })

  it('shows Sign In and Create Account buttons', () => {
    renderComponent()
    // Button as={Link} renders as <a> (role="link"), not role="button"
    expect(screen.getByRole('link', { name: /sign in/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /create account/i })).toBeInTheDocument()
  })

  it('does not show the file drop zone', () => {
    renderComponent()
    expect(screen.queryByTestId('drop-zone')).not.toBeInTheDocument()
  })

  it('does not show the submit button', () => {
    renderComponent()
    expect(screen.queryByTestId('submit-button')).not.toBeInTheDocument()
  })
})

// ─────────────────────────────────────────────────────────────────────────
// 2. Authenticated state — initial render
// ─────────────────────────────────────────────────────────────────────────

describe('Authenticated state — initial render', () => {
  it('shows the upload form', () => {
    renderComponent()
    expect(screen.getByTestId('drop-zone')).toBeInTheDocument()
    expect(screen.getByTestId('submit-button')).toBeInTheDocument()
  })

  it('does not show the guest prompt', () => {
    renderComponent()
    expect(screen.queryByTestId('guest-prompt')).not.toBeInTheDocument()
  })

  it('submit button is disabled when no file is selected', () => {
    renderComponent()
    expect(screen.getByTestId('submit-button')).toBeDisabled()
  })

  it('shows the notes textarea', () => {
    renderComponent()
    expect(screen.getByLabelText(/notes for pharmacist/i)).toBeInTheDocument()
  })
})

// ─────────────────────────────────────────────────────────────────────────
// 3. File validation
// ─────────────────────────────────────────────────────────────────────────

describe('File validation', () => {
  it('accepts a JPEG file without showing an error', async () => {
    renderComponent()
    selectFile(makeFile('rx.jpg', 'image/jpeg'))

    expect(screen.queryByTestId('file-error')).not.toBeInTheDocument()
    expect(screen.getByTestId('submit-button')).not.toBeDisabled()
  })

  it('accepts a PDF file', async () => {
    renderComponent()
    selectFile(makeFile('rx.pdf', 'application/pdf'))

    expect(screen.queryByTestId('file-error')).not.toBeInTheDocument()
  })

  it('rejects a GIF file and shows an error', async () => {
    renderComponent()
    selectFile(makeFile('rx.gif', 'image/gif'))

    expect(screen.getByTestId('file-error')).toBeInTheDocument()
    expect(screen.getByTestId('file-error')).toHaveTextContent(/jpg.*png.*webp.*pdf/i)
    expect(screen.getByTestId('submit-button')).toBeDisabled()
  })

  it('rejects a file exceeding 10 MB', async () => {
    renderComponent()
    selectFile(makeFile('big.jpg', 'image/jpeg', 10 * 1024 * 1024 + 1))

    expect(screen.getByTestId('file-error')).toBeInTheDocument()
    expect(screen.getByTestId('file-error')).toHaveTextContent(/too large/i)
  })

  it('clears the file error when a valid file is selected after an invalid one', async () => {
    renderComponent()

    selectFile(makeFile('rx.gif', 'image/gif'))
    expect(screen.getByTestId('file-error')).toBeInTheDocument()

    selectFile(makeFile('rx.jpg', 'image/jpeg'))
    expect(screen.queryByTestId('file-error')).not.toBeInTheDocument()
  })
})

// ─────────────────────────────────────────────────────────────────────────
// 4. Successful upload flow
// ─────────────────────────────────────────────────────────────────────────

describe('Successful upload flow', () => {
  const mockResult = {
    prescription: { _id: 'abc123def456' },
    imageUrl:     '/uploads/prescriptions/test.jpg',
  }

  beforeEach(() => {
    uploadPrescription.mockResolvedValue(mockResult)
  })

  it('calls uploadPrescription with the file and notes', async () => {
    renderComponent()
    const file = makeFile('rx.jpg', 'image/jpeg')
    selectFile(file)

    fireEvent.change(screen.getByLabelText(/notes for pharmacist/i), {
      target: { value: 'Urgent' },
    })
    fireEvent.click(screen.getByTestId('submit-button'))

    await waitFor(() => {
      expect(uploadPrescription).toHaveBeenCalledWith(
        file,
        'Urgent',
        expect.any(Function)
      )
    })
  })

  it('shows the success state after upload', async () => {
    renderComponent()
    selectFile(makeFile('rx.jpg', 'image/jpeg'))
    fireEvent.click(screen.getByTestId('submit-button'))

    await waitFor(() => {
      expect(screen.getByTestId('upload-success')).toBeInTheDocument()
    })
    expect(screen.getByText(/prescription received/i)).toBeInTheDocument()
  })

  it('shows the reference ID from the prescription _id', async () => {
    renderComponent()
    selectFile(makeFile('rx.jpg', 'image/jpeg'))
    fireEvent.click(screen.getByTestId('submit-button'))

    await waitFor(() => {
      expect(screen.getByTestId('upload-success')).toBeInTheDocument()
    })
    // Last 8 chars of 'abc123def456' uppercased = '23DEF456'
    expect(screen.getByText('23DEF456')).toBeInTheDocument()
  })

  it('redirects to /dashboard after 2 seconds', async () => {
    renderComponent()
    selectFile(makeFile('rx.jpg', 'image/jpeg'))
    fireEvent.click(screen.getByTestId('submit-button'))

    await waitFor(() => {
      expect(screen.getByTestId('upload-success')).toBeInTheDocument()
    })

    expect(mockNavigate).not.toHaveBeenCalled()

    act(() => { vi.advanceTimersByTime(2000) })

    expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: false })
  })

  it('resets to idle form when "Upload Another" is clicked', async () => {
    renderComponent()
    selectFile(makeFile('rx.jpg', 'image/jpeg'))
    fireEvent.click(screen.getByTestId('submit-button'))

    await waitFor(() => {
      expect(screen.getByTestId('upload-success')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: /upload another/i }))

    expect(screen.queryByTestId('upload-success')).not.toBeInTheDocument()
    expect(screen.getByTestId('drop-zone')).toBeInTheDocument()
    expect(screen.getByTestId('submit-button')).toBeDisabled()
  })
})

// ─────────────────────────────────────────────────────────────────────────
// 5. Error handling
// ─────────────────────────────────────────────────────────────────────────

describe('Error handling', () => {
  it('shows the API error message when upload fails', async () => {
    uploadPrescription.mockRejectedValue({ message: 'File is too large. Maximum allowed size is 10 MB.' })

    renderComponent()
    selectFile(makeFile('rx.jpg', 'image/jpeg'))
    fireEvent.click(screen.getByTestId('submit-button'))

    await waitFor(() => {
      expect(screen.getByTestId('upload-error')).toBeInTheDocument()
    })
    expect(screen.getByTestId('upload-error')).toHaveTextContent(/too large/i)
  })

  it('shows a generic error message when the error has no message', async () => {
    uploadPrescription.mockRejectedValue({})

    renderComponent()
    selectFile(makeFile('rx.jpg', 'image/jpeg'))
    fireEvent.click(screen.getByTestId('submit-button'))

    await waitFor(() => {
      expect(screen.getByTestId('upload-error')).toBeInTheDocument()
    })
    expect(screen.getByTestId('upload-error')).toHaveTextContent(/upload failed/i)
  })

  it('does not navigate on error', async () => {
    uploadPrescription.mockRejectedValue({ message: 'Server error' })

    renderComponent()
    selectFile(makeFile('rx.jpg', 'image/jpeg'))
    fireEvent.click(screen.getByTestId('submit-button'))

    await waitFor(() => {
      expect(screen.getByTestId('upload-error')).toBeInTheDocument()
    })

    act(() => { vi.advanceTimersByTime(5000) })
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it('clears the error message when a new file is selected', async () => {
    uploadPrescription.mockRejectedValue({ message: 'Server error' })

    renderComponent()
    selectFile(makeFile('rx.jpg', 'image/jpeg'))
    fireEvent.click(screen.getByTestId('submit-button'))

    await waitFor(() => {
      expect(screen.getByTestId('upload-error')).toBeInTheDocument()
    })

    selectFile(makeFile('rx2.jpg', 'image/jpeg'))
    expect(screen.queryByTestId('upload-error')).not.toBeInTheDocument()
  })
})

// ─────────────────────────────────────────────────────────────────────────
// 6. Progress bar
// ─────────────────────────────────────────────────────────────────────────

describe('Progress bar', () => {
  it('shows the progress bar while uploading', async () => {
    uploadPrescription.mockReturnValue(new Promise(() => {}))

    renderComponent()
    selectFile(makeFile('rx.jpg', 'image/jpeg'))
    fireEvent.click(screen.getByTestId('submit-button'))

    await waitFor(() => {
      expect(screen.getByTestId('progress-bar')).toBeInTheDocument()
    })
  })

  it('submit button is disabled while uploading', async () => {
    uploadPrescription.mockReturnValue(new Promise(() => {}))

    renderComponent()
    selectFile(makeFile('rx.jpg', 'image/jpeg'))
    fireEvent.click(screen.getByTestId('submit-button'))

    await waitFor(() => {
      expect(screen.getByTestId('submit-button')).toBeDisabled()
    })
  })
})
