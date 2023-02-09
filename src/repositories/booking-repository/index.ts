import { prisma } from '@/config';

async function findBooking(userId: number) {
  return prisma.booking.findFirst({
    where: {
      userId: userId,
    },
    select: {
      id: true,
      Room: true,
    },
  });
}

async function createBooking(userId: number, roomId: number) {

  return prisma.booking.create({
    data: {
      userId: userId,
      roomId: roomId,
    },
  });
}
async function consultRoom(roomId: number) {
  return prisma.room.findMany({
    where: {
      id: roomId,
    },
    select:{
      capacity:true,
      Booking:true
    }
  });
}


const bookingRepository = {
  findBooking,
  createBooking,
  consultRoom,

};

export default bookingRepository;
