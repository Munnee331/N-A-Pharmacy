import jwt    from 'jsonwebtoken'
import { env } from '../config/env.js'

/**
 * Generate a signed JWT for the given user.
 *
 * Payload includes userId and role so middleware can authorise
 * without an extra DB round-trip on every request.
 *
 * @param   {{ _id: string, role: string }} user
 * @returns {string}  signed JWT
 */
const generateToken = (user) =>
  jwt.sign(
    { userId: user._id, role: user.role },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES }
  )

export default generateToken
