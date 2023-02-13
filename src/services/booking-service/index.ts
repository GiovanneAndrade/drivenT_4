import bookingRepository from '@/repositories/booking-repository';
import { notFoundError, unauthorizedError } from '@/errors';

async function findBooking(userId: number) {
  const result = await bookingRepository.findBooking(userId);
  if (!result) throw notFoundError();
  return result;
}

async function createBooking(userId: number, roomId: number) {
  const consult = await bookingRepository.consultRoom(roomId);

  if (consult.length === 0) throw notFoundError();
  if (consult[0].Booking.length === consult[0].capacity) throw unauthorizedError();

  const result = await bookingRepository.createBooking(userId, roomId);
  return result;
}

async function updateBooking(bookingId: number, userId: number, roomId: number) {
  const consult = await bookingRepository.consultRoom(roomId);
 
  const consultBookingUser = await bookingRepository.findBooking(userId);
  if (!consultBookingUser) throw notFoundError();

  if (consult.length === 0) throw notFoundError();
  if (consult[0].Booking.length === consult[0].capacity) throw unauthorizedError();

  const result = await bookingRepository.updateBooking(bookingId, userId, roomId);
   
  if (!result.count) throw notFoundError();
  const consultBooking = await bookingRepository.ConsultBooking(roomId);
    
  return consultBooking;
}

const bookingService = {
  findBooking,
  createBooking,
  updateBooking,
};

export default bookingService;
