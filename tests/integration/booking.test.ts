import app, { init } from '@/app';
import { prisma } from '@/config';
import faker from '@faker-js/faker';
import { TicketStatus } from '@prisma/client';
import e from 'express';
import httpStatus from 'http-status';
import * as jwt from 'jsonwebtoken';
import supertest from 'supertest';
import {
  createEnrollmentWithAddress,
  createUser,
  createTicketType,
  createTicket,
  createPayment,
  generateCreditCardData,
  createTicketTypeWithHotel,
  createTicketTypeRemote,
  createHotel,
  createRoomWithHotelId,
  createRoom,
  createBooking,
  findBooking,
  findBookingRoomById,
} from '../factories';
import { cleanDb, generateValidToken } from '../helpers';

beforeAll(async () => {
  await init();
});

beforeEach(async () => {
  await cleanDb();
});

const server = supertest(app);

describe('GET /booking', () => {
  it('should respond with status 401 if no token is given', async () => {
    const response = await server.get('/booking');
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if given token is not valid', async () => {
    const token = faker.lorem.word();

    const response = await server.get('/booking').set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if there is no session for given token', async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.get('/booking').set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });
});

describe('GET /booking', () => {
  it('TESTE 1 consultar booking', async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const hotelId = await createHotel();
    const room = await createRoom(Number(hotelId.id));
    const bookingId = await createBooking(Number(user.id), Number(room.id));
    const booking = await findBooking(Number(user.id), Number(room.id));

    const response = await server.get('/booking').set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(httpStatus.OK);
    expect(response.body).toMatchObject({
      id: booking.id,
      Room: {},
    });
  });

  it('TESTE 2 consultar booking error', async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const hotels = await createHotel();
    const booking = await prisma.booking.findFirst({
      where: {
        userId: user.id,
      },
      select: {
        id: true,
        Room: true,
      },
    });

    const response = await server.get('/booking').set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(httpStatus.NOT_FOUND);
  });
});

describe('GET /booking', () => {
  it('should respond with status 401 if no token is given', async () => {
    const response = await server.post('/booking');
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if given token is not valid', async () => {
    const token = faker.lorem.word();

    const response = await server.post('/booking').set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if there is no session for given token', async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.post('/booking').set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });
});

describe('POST /booking', () => {
  it('TESTE 1 postar booking aqui', async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const hotelId = await createHotel();
    const roomId = 10000000
    const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send({roomId:roomId});
    const consultRoom = await findBookingRoomById(roomId); 

    expect(response.status).toBe(httpStatus.NOT_FOUND);
  });

    it('TESTE 1 postar booking', async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const hotelId = await createHotel();
    const roomId = 10000000
    const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send();
    const consultRoom = await findBookingRoomById(roomId); 

    expect(response.status).toBe(403);
  });

  it('TESTE 3 postar booking', async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const hotelId = await createHotel();
    const roomId = await createRoom(hotelId.id);
    const booking_1 = await createBooking(user.id, roomId.id);
    const booking_2 = await createBooking(user.id, roomId.id);
    const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send({ roomId: roomId.id });

    //const consultRoom = await findBookingRoomById(roomId.id);
    expect(response.status).toBe(httpStatus.NOT_FOUND);
  });
  describe('POST /booking', () => {
    it('TESTE 4 postar booking', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const hotelId = await createHotel();
      const roomId = await createRoom(hotelId.id);
      const response = await server
        .post('/booking')
        .set('Authorization', `Bearer ${token}`)
        .send({ roomId: roomId.id });
      const consultRoom = await findBookingRoomById(roomId.id);
      const consult = await prisma.booking.findFirst({});

      expect(consult.userId).toBe(user.id);
      expect(consult.roomId).toBe(roomId.id);
      expect(response.status).toBe(httpStatus.OK);
      expect(response.body).toMatchObject({
        id: consult.id,
        userId: consult.userId,
        roomId: consult.roomId,
        createdAt: consult.createdAt.toISOString(),
        updatedAt: consult.updatedAt.toISOString(),
      });
    });
  });
});
