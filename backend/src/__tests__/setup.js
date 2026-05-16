/**
 * Global test setup — runs before every test file.
 * Loads .env so JWT_SECRET, COOKIE_SECRET, etc. are available
 * in the Express app and middleware during integration tests.
 */
import 'dotenv/config'
