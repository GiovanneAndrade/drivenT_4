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
async function ConsultBooking(roomId: number) {
  return prisma.booking.findFirst({
    where: {
    roomId:roomId
    },
    select: {
      roomId:true,
      userId:true,
      createdAt:true,
      updatedAt:true
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

async function updateBooking(bookingId: number, userId: number, roomId: number) {
  return prisma.booking.updateMany({
    where: {
      id: bookingId,
    },
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
    select: {
      capacity: true,
      Booking: true,
    },
  });
}

const bookingRepository = {
  findBooking,
  createBooking,
  consultRoom,
  updateBooking,
  ConsultBooking
};

export default bookingRepository;
