import { Router } from "express";
import { authenticateToken } from "@/middlewares";
import { createBooking, findBooking } from "@/controllers";

const bookingRouter = Router();

bookingRouter
  .all("/*", authenticateToken)
  .get("/", findBooking)
  .post("/", createBooking)

export { bookingRouter };
