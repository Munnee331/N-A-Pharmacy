/**
 * Integration tests for Payments API (initiate)
 *
 * Uses mongodb-memory-server + a real Express app instance.
 */

import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'
import request from 'supertest'
import jwt from 'jsonwebtoken'
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'

import app from '../../app.js'
import Medicine from '../../models/Medicine.js'
import Order from '../../models/Order.js'
import User from '../../models/User.js'
import Prescription from '../../models/Prescription.js'

const JWT_SECRET = process.env.JWT_SECRET || 'na_pharma_dev_jwt_secret_change_in_production'

let mongod

beforeAll(async () => {
  mongod = await MongoMemoryServer.create()
  await mongoose.connect(mongod.getUri())
})

afterAll(async () => {
  await mongoose.disconnect()
  await mongod.stop()
})

beforeEach(async () => {
  await Promise.all([
    Medicine.deleteMany({}),
    Order.deleteMany({}),
    User.deleteMany({}),
    Prescription.deleteMany({}),
  ])
})

async function createUserWithToken(role = 'customer') {
  const user = await User.create({ name: `T ${role}`, email: `${role}-${Date.now()}@x.test`, password: 'Password123!', role })
  const token = jwt.sign({ userId: user._id.toString(), role }, JWT_SECRET, { expiresIn: '1h' })
  return { user, token }
}

async function createMedicine(overrides = {}) {
  return Medicine.create({ name: `Med-${Date.now()}`, category: 'general', price: 100, ...overrides })
}

describe('POST /api/payments/initiate', () => {
  it('filters out prescription-required items when no prescription provided', async () => {
    const { user, token } = await createUserWithToken('customer')

    const rxMed = await createMedicine({ prescriptionRequired: true, price: 50 })
    const freeMed = await createMedicine({ prescriptionRequired: false, price: 80 })

    const payload = {
      items: [
        { medicine: rxMed._id.toString(), name: rxMed.name, quantity: 1, price: rxMed.price },
        { medicine: freeMed._id.toString(), name: freeMed.name, quantity: 2, price: freeMed.price },
      ],
      shippingAddress: { address: 'addr', city: 'Dhaka' },
      paymentMethod: 'cod',
    }

    const res = await request(app)
      .post('/api/payments/initiate')
      .set('Authorization', `Bearer ${token}`)
      .send(payload)

    expect(res.status).toBe(200)
    expect(res.body.data).toHaveProperty('filteredOutItems')
    expect(res.body.data.filteredOutItems).toHaveLength(1)
    expect(String(res.body.data.filteredOutItems[0].medicine)).toBe(rxMed._id.toString())

    // Order should be created only for non-restricted item
    const orders = await Order.find({ customer: user._id }).lean()
    expect(orders).toHaveLength(1)
    const order = orders[0]
    expect(order.items).toHaveLength(1)
    expect(String(order.items[0].medicine)).toBe(freeMed._id.toString())
    expect(order.totalAmount).toBe(Number(freeMed.price) * 2)
  })

  it('returns filteredOutItems and does not create an order when all items are restricted', async () => {
    const { token } = await createUserWithToken('customer')

    const rxMed = await createMedicine({ prescriptionRequired: true, price: 70 })

    const payload = {
      items: [ { medicine: rxMed._id.toString(), name: rxMed.name, quantity: 1, price: rxMed.price } ],
      shippingAddress: { address: 'addr', city: 'Dhaka' },
      paymentMethod: 'cod',
    }

    const res = await request(app)
      .post('/api/payments/initiate')
      .set('Authorization', `Bearer ${token}`)
      .send(payload)

    expect(res.status).toBe(200)
    expect(res.body.data.filteredOutItems).toHaveLength(1)

    const orders = await Order.find({}).lean()
    expect(orders).toHaveLength(0)
  })

  it('does not filter when prescriptionImage is provided', async () => {
    const { user, token } = await createUserWithToken('customer')
    const rxMed = await createMedicine({ prescriptionRequired: true, price: 30 })
    const freeMed = await createMedicine({ prescriptionRequired: false, price: 20 })

    const payload = {
      items: [
        { medicine: rxMed._id.toString(), name: rxMed.name, quantity: 1, price: rxMed.price },
        { medicine: freeMed._id.toString(), name: freeMed.name, quantity: 1, price: freeMed.price },
      ],
      shippingAddress: { address: 'addr', city: 'Dhaka' },
      paymentMethod: 'cod',
      prescriptionImage: '/uploads/fake.jpg',
    }

    const res = await request(app)
      .post('/api/payments/initiate')
      .set('Authorization', `Bearer ${token}`)
      .send(payload)

    expect(res.status).toBe(200)
    expect(res.body.data.filteredOutItems).toHaveLength(0)

    const orders = await Order.find({ customer: user._id }).lean()
    expect(orders).toHaveLength(1)
    expect(orders[0].items).toHaveLength(2)
  })
})
