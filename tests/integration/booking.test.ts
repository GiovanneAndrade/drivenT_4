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
  createTicketTypeRemoteNewFalse,
  createTicketTypeRemoteNew,
  createTicketError,
  createEnrollment,
  createTicketNew,
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
  updateBooking,
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

  describe('GET /booking', () => {
    it('consult successful appointment', async () => {
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

    it('user has no reservation', async () => {
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
});

describe('POST /booking', () => {
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

  describe('POST /booking', () => {
    it('roomId does not exist', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const hotelId = await createHotel();
      const roomId = 10000000;
      const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send({ roomId: roomId });
      const consultRoom = await findBookingRoomById(roomId);

      expect(response.status).toBe(httpStatus.NOT_FOUND);
    });

    it('roomId not sent', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const hotelId = await createHotel();
      //const roomId = 10000000
      const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send();
      //const consultRoom = await findBookingRoomById(roomId);

      expect(response.status).toBe(403);
    });

    it('no room available', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollment(user.id);
      const ticketType = await createTicketTypeRemote();
      const ticket = await createTicketNew(enrollment.id, ticketType.id);
      const ticketIsRemote = await createTicketTypeRemoteNew();
      const hotelId = await createHotel();
      const roomId = await createRoom(hotelId.id);
      const booking_1 = await createBooking(user.id, roomId.id);
      const booking_2 = await createBooking(user.id, roomId.id);
      const response = await server
        .post('/booking')
        .set('Authorization', `Bearer ${token}`)
        .send({ roomId: roomId.id });

      expect(response.status).toBe(403);
    });
    describe('POST /booking', () => {
      it('reservation made successfully', async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollment(user.id);
        const ticketType = await createTicketTypeRemote();
        const ticket = await createTicketNew(enrollment.id, ticketType.id);
   
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

       it('reservation not made unpaid ticket', async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollment(user.id);
        const ticketType = await createTicketTypeRemote();
        const ticket = await createTicketError(enrollment.id, ticketType.id);
        const ticketIsRemote = await createTicketTypeRemoteNew();
        const hotelId = await createHotel();
        const roomId = await createRoom(hotelId.id);
        const response = await server
          .post('/booking')
          .set('Authorization', `Bearer ${token}`)
          .send({ roomId: roomId.id });

        expect(response.status).toBe(httpStatus.NOT_FOUND);
     
      }); 
      it('ticket is not in person', async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollment(user.id);
        const ticketType = await createTicketTypeRemoteNew();
        const ticket = await createTicketError(enrollment.id, ticketType.id);
        const ticketIsRemote = await createTicketTypeRemoteNew();
        const hotelId = await createHotel();
        const roomId = await createRoom(hotelId.id);
        const response = await server
          .post('/booking')
          .set('Authorization', `Bearer ${token}`)
          .send({ roomId: roomId.id });

        expect(response.status).toBe(httpStatus.NOT_FOUND);
     
      });
     
    });
  });
});

describe('PUT /booking', () => {
  it('should respond with status 401 if no token is given', async () => {
    const response = await server.put('/booking/:bookingId');
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if given token is not valid', async () => {
    const token = faker.lorem.word();

    const response = await server.put('/booking/:bookingId').set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if there is no session for given token', async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.put('/booking/:bookingId').set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe('put /booking/:bookingId', () => {
    it('roomId does not exist', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const hotelId = await createHotel();
      const roomId = 10000000;
      const response = await server
        .put('/booking/:bookingId')
        .set('Authorization', `Bearer ${token}`)
        .send({ roomId: roomId });
      const consultRoom = await findBookingRoomById(roomId);

      expect(response.status).toBe(httpStatus.NOT_FOUND);
    });

    it('roomId not sent', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const hotelId = await createHotel();
      //const roomId = 10000000
      const response = await server.put('/booking/:bookingId').set('Authorization', `Bearer ${token}`).send();
      //const consultRoom = await findBookingRoomById(roomId);

      expect(response.status).toBe(403);
    });

    it('no room available', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const hotelId = await createHotel();
      const roomId = await createRoom(hotelId.id);
      const booking_1 = await createBooking(user.id, roomId.id);
      const booking_2 = await createBooking(user.id, roomId.id);
      const response = await server
        .put('/booking/:bookingId')
        .set('Authorization', `Bearer ${token}`)
        .send({ roomId: roomId.id });

      expect(response.status).toBe(403);
    });
    describe('put /booking', () => {
      it('update reservation made successfully', async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const hotelId = await createHotel();        
        const roomId = await createRoom(hotelId.id);
        const updateRoomId = await createRoom(hotelId.id);
        const createBookingUser = await createBooking(user.id, roomId.id)
        const response = await server
          .put(`/booking/${createBookingUser.id}`)
          .set('Authorization', `Bearer ${token}`)
          .send({ roomId: roomId.id });
        const updateBookingUser = await updateBooking(createBookingUser.id, user.id, updateRoomId.id);
        const consult = await prisma.booking.findFirst({ });

        expect(consult.roomId).toBe(updateRoomId.id);
        expect(consult.userId).toBe(user.id);
        expect(response.status).toBe(httpStatus.OK);
        expect(response.body).toMatchObject({
          userId: createBookingUser.userId,
          roomId: createBookingUser.roomId
        });
      });
    });
  });
});
