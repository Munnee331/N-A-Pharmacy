/**
 * Wraps an async Express route handler and forwards any rejected promise
 * to next() — eliminating try/catch boilerplate in every controller.
 *
 * @param {Function} fn  async (req, res, next) => Promise
 * @returns {Function}   Express middleware
 *
 * @example
 *   router.get('/medicines', asyncHandler(async (req, res) => {
 *     const data = await Medicine.find()
 *     res.json(new ApiResponse(200, data))
 *   }))
 */
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next)

export default asyncHandler
