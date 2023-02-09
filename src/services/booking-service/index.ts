import bookingRepository from '@/repositories/booking-repository';
import { notFoundError } from '@/errors';

async function findBooking(userId:number) {
  const result = await bookingRepository.findBooking(userId);
  if (!result) throw notFoundError();
  return result;
}
 
async function createBooking(userId:number, roomId:number) {

  const consult = await bookingRepository.consultRoom(roomId);

  if (!consult || consult[0].Booking.length === consult[0].capacity) throw notFoundError(); 

  const result = await bookingRepository.createBooking(userId, roomId);
  return result;   
}

const bookingService = {
  findBooking,
  createBooking
};

export default bookingService;
