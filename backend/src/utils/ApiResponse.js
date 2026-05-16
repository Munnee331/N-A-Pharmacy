/**
 * Standardised success response wrapper.
 * Every successful response follows the same shape.
 * @example  res.status(200).json(new ApiResponse(200, data, 'Fetched'))
 */
export class ApiResponse {
  constructor(statusCode, data, message = 'Success') {
    this.statusCode = statusCode
    this.data       = data
    this.message    = message
    this.success    = statusCode < 400
  }
}
