export const product = {
  slug: "wilson-fiba-3x3-basketball",
  name: "Wilson FIBA 3X3 Basketball",
  brand: "Wilson",
  regularPrice: 2500,
  discountPercent: 20,
  salePrice: 2000,
  currency: "NPR",
  heroImage: "/images/wilson-fiba-3x3-hero.png",
  checkoutImage: "/images/wilson-fiba-3x3-checkout-supplied.jpg",
  images: [
    "/images/wilson-fiba-3x3-hero.png",
    "/images/wilson-fiba-3x3-lifestyle.png",
    "/images/wilson-fiba-3x3-front.png",
    "/images/wilson-fiba-3x3-detail.png",
    "/images/wilson-fiba-3x3-closeup.png",
  ],
  shortDescription:
    "The official FIBA 3X3 game ball—engineered for confident grip, fast control, and hard-court durability.",
  description:
    "Built for the speed and intensity of 3-on-3 basketball, the Wilson FIBA 3X3 combines a size 6 circumference with size 7 weight. Wave Triple Threat Technology adds more grip points across the surface for controlled dribbling, crisp passing, and confident shooting on indoor and outdoor courts.",
  benefits: [
    {
      title: "Superior grip & control",
      description:
        "Wave Triple Threat Technology creates four times more grip points for stronger control while dribbling, passing, shooting, and catching.",
    },
    {
      title: "Fast 3X3 handling",
      description:
        "A size 6 circumference makes quick moves easier, while the size 7 weight keeps the shooting feel familiar.",
    },
    {
      title: "Confident passes & shots",
      description:
        "Textured channels and deep grooves help the ball sit securely in your hands through fast transitions.",
    },
    {
      title: "Indoor + outdoor ready",
      description:
        "Reliable performance across concrete and hardwood courts for training, street games, and competition.",
    },
    {
      title: "Cushioned feel",
      description:
        "Cushion Core construction gives the ball a softer touch and comfortable control during intense play.",
    },
    {
      title: "Official FIBA 3X3 spec",
      description:
        "Made to the distinctive size-and-weight format used in official FIBA 3X3 basketball.",
    },
  ],
} as const;

export const deliveryOptions = {
  inside_valley: { label: "Inside Kathmandu Valley", fee: 100 },
  outside_valley: { label: "Outside Kathmandu Valley", fee: 150 },
} as const;

export type DeliveryZone = keyof typeof deliveryOptions;

export function formatNpr(amount: number) {
  return `NPR ${new Intl.NumberFormat("en-NP", {
    maximumFractionDigits: 0,
  }).format(amount)}`;
}

export function calculateOrderTotal(quantity: number, zone: DeliveryZone) {
  return product.salePrice * quantity + deliveryOptions[zone].fee;
}
