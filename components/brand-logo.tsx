import Image from "next/image";

export function BrandLogo({
  priority = false,
  src = "/images/ball-house-logo-attached.png",
}: {
  priority?: boolean;
  src?: string;
}) {
  return (
    <span className="brand-logo">
      <Image
        src={src}
        alt="Ball House"
        fill
        sizes="(max-width: 700px) 200px, 244px"
        loading={priority ? "eager" : "lazy"}
      />
    </span>
  );
}
