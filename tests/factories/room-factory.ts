import dayjs from 'dayjs';
import faker from '@faker-js/faker';
import { Event } from '@prisma/client';
import { prisma } from '@/config';

export async function createRoom(hotelId: number) {
  return prisma.room.create({
    data: {
      name: faker.name.findName(),
      capacity: 2,
      hotelId: hotelId,
    },
  });
}
