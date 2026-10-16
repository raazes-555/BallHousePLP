import { z } from "zod";

export const orderRequestSchema = z.object({
  fullName: z.string().trim().min(2, "Please enter your full name.").max(100),
  phone: z
    .string()
    .trim()
    .min(7, "Please enter a valid phone number.")
    .max(20)
    .regex(/^[+\d][\d\s-]{6,19}$/, "Please enter a valid phone number."),
  email: z.string().trim().email("Please enter a valid email address."),
  location: z.string().trim().min(5, "Please share your exact location.").max(300),
  productSlug: z.string().trim().min(1, "Product is required."),
  quantity: z.coerce.number().int().min(1).max(20),
  deliveryZone: z.enum(["inside_valley", "outside_valley"]),
  submissionId: z.uuid(),
  website: z.string().max(0).optional(),
});

export type OrderRequest = z.infer<typeof orderRequestSchema>;

export type OrderRecord = {
  orderId: string;
  dateTime: string;
  customerName: string;
  phone: string;
  email: string;
  location: string;
  productName: string;
  quantity: number;
  pricePerPiece: number;
  deliveryZone: string;
  deliveryFee: number;
  totalPrice: number;
  paymentMethod: "Cash On Delivery";
  orderStatus: "New Order";
  notes: string;
};
