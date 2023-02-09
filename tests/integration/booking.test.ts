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
    
 /*    const room = await prisma.room.create({
      data: {
        name: 'test-1',
        hotelId: hotels.id,
        capacity: 2,
      },
    });
   const teste1 = await prisma.booking.create({
      data: {
        userId: user.id,
        roomId: room.id,
      },
    });

    const teste = await prisma.room.findMany({
      where: {
        id: room.id,
      },
      select: {
        capacity: true,
        Booking: true,
      },
    }); */
    
    const response = await server.get('/booking').set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(httpStatus.NOT_FOUND);
  });
});
