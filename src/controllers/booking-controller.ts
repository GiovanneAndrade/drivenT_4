import { notFoundError } from '@/errors';
import { AuthenticatedRequest } from '@/middlewares';
import bookingService from '@/services/booking-service';
import { Response } from 'express';
import httpStatus from 'http-status';

export async function findBooking(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;

  try {
    const result = await bookingService.findBooking(userId);

    return res.status(httpStatus.OK).send(result);
  } catch (error) {
    return res.sendStatus(httpStatus.NOT_FOUND);
  }
}

export async function createBooking(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  const { roomId } = req.body;
  if (!roomId) return res.sendStatus(403);

  try {
    const result = await bookingService.createBooking(userId, roomId);

    return res.status(httpStatus.OK).send(result);
  } catch (error) {
    if (error.name === 'NotFoundError') {
      return res.sendStatus(httpStatus.NOT_FOUND);
    }
    if (error.name === 'UnauthorizedError') {
      return res.sendStatus(403);
    }
    return res.sendStatus(httpStatus.BAD_REQUEST);
  }
}
export async function updateBooking(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  const { roomId } = req.body;
  const { bookingId } = req.params;
  if (!roomId) return res.sendStatus(403);

  try {
    const result = await bookingService.updateBooking(Number(bookingId), userId, roomId);
    
    return res.status(httpStatus.OK).send(result);
  } catch (error) {
    if (error.name === 'NotFoundError') {
      return res.sendStatus(httpStatus.NOT_FOUND);
    }
    if (error.name === 'UnauthorizedError') {
      return res.sendStatus(403);
    }
    return res.sendStatus(httpStatus.BAD_REQUEST);
  }
}
