import dayjs from 'dayjs';
import faker from '@faker-js/faker';
import { Event } from '@prisma/client';
import { prisma } from '@/config';

export async function createBooking(userId: number, roomId: number) {
  return prisma.booking.create({
    data: {
      userId: userId,
      roomId: roomId,
    },
  });
}
export async function updateBooking(bookingId: number, userId: number, roomId: number) {
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

export async function findBooking(userId: number, roomId: number) {
  return await prisma.booking.findFirst({
    where: {
      userId: userId,
    },
    select: {
      id: true,
      Room: true,
    },
  });
}
export async function findBookingRoomById(roomId: number) {
  return await prisma.room.findMany({
    where: {
      id: roomId,
    },
    select: {
      capacity: true,
      Booking: true,
    },
  });
}
