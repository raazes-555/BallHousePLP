"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  Clock3,
  Headphones,
  Minus,
  PackageCheck,
  Plus,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  Truck,
  Zap,
} from "lucide-react";
import { formatNpr, product } from "@/lib/product";
import { BrandLogo } from "@/components/brand-logo";

const testimonials = [
  {
    quote:
      "The textured channels make the ball feel secure on quick drives. This is sample copy for the review layout.",
    name: "Aayush K.",
    location: "Kathmandu",
    photo: "/images/testimonial-aayush-k-hq.png",
  },
  {
    quote:
      "The compact 3X3 size feels quick in the hand while the weight still feels substantial. Sample review content.",
    name: "Sanjay R.",
    location: "Lalitpur",
    photo: "/images/testimonial-sanjay-r-hq.png",
  },
  {
    quote:
      "A strong option for outdoor practice—the grip pattern is the detail I noticed first. Sample review content.",
    name: "Pratiksha M.",
    location: "Bhaktapur",
    photo: "/images/testimonial-pratiksha-m-hq.png",
  },
];

const faqs = [
  {
    question: "Is this an official FIBA 3X3 basketball?",
    answer:
      "Yes. This ball follows the distinctive FIBA 3X3 format: a size 6 circumference with the weight of a size 7 basketball.",
  },
  {
    question: "Can I use it on both indoor and outdoor courts?",
    answer:
      "Yes. It is designed for indoor hardwood and outdoor hard courts. Wiping it clean after outdoor use will help preserve the surface.",
  },
  {
    question: "What is included in the price?",
    answer:
      "The discounted product price is NPR 2,000 per ball. Delivery is NPR 100 inside Kathmandu Valley and NPR 150 outside the Valley.",
  },
  {
    question: "How does Cash on Delivery work?",
    answer:
      "Place your order with your exact delivery details. Our representative will call to confirm, and you pay when the product arrives.",
  },
  {
    question: "How soon will my order be confirmed?",
    answer:
      "A sales representative will call you after your order is received to verify the address and expected delivery timing.",
  },
  {
    question: "Does the ball arrive inflated?",
    answer:
      "Packaging and inflation can vary during delivery. If it needs air, use a standard basketball pump and avoid overinflating it.",
  },
];

function checkoutHref(quantity: number) {
  return `/checkout?product=${product.slug}&quantity=${quantity}`;
}

export function ProductLanding() {
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);

  const selectPrevious = () =>
    setActiveImage((current) => (current - 1 + product.images.length) % product.images.length);
  const selectNext = () => setActiveImage((current) => (current + 1) % product.images.length);

  return (
    <main>
      <div className="announcement">
        <span>20% launch offer</span>
        <span className="announcement-dot" />
        <span>Cash on Delivery across Nepal</span>
      </div>

      <header className="site-header shell">
        <Link href="/" className="brand-logo-link" aria-label="Ball House home">
          <BrandLogo priority />
        </Link>
        <nav aria-label="Main navigation">
          <a href="#details">The ball</a>
          <a href="#benefits">Benefits</a>
          <a href="#faq">FAQ</a>
        </nav>
        <Link className="button button-small" href={checkoutHref(quantity)}>
          Order now <ArrowRight size={16} />
        </Link>
      </header>

      <section className="hero shell">
        <div className="hero-copy">
          <div className="eyebrow"><Sparkles size={15} /> Built for the half court</div>
          <h1>Own every move.<br /><span>Rule the 3X3.</span></h1>
          <p className="hero-lede">
            The Wilson FIBA 3X3 Basketball gives you the grip, control, and game-speed confidence to play without hesitation.
          </p>
          <div className="hero-price-row">
            <div>
              <span className="price-kicker">Limited-time price</span>
              <strong>{formatNpr(product.salePrice)}</strong>
            </div>
            <div className="save-pill">Save {formatNpr(product.regularPrice - product.salePrice)}</div>
          </div>
          <div className="hero-actions">
            <Link className="button button-primary" href={checkoutHref(quantity)}>
              Purchase now <ArrowRight size={19} />
            </Link>
            <a className="text-link" href="#details">Explore the ball <ChevronRight size={17} /></a>
          </div>
          <div className="hero-trust">
            <span><BadgeCheck size={18} /> Official 3X3 spec</span>
            <span><ShieldCheck size={18} /> Pay on delivery</span>
          </div>
        </div>

        <div className="hero-visual">
          <div className="hero-number" aria-hidden="true">3×3</div>
          <div className="hero-image-wrap">
            <Image
              src="/images/wilson-fiba-3x3-hero-supplied-trimmed.png"
              alt="Wilson FIBA 3X3 basketball"
              width={983}
              height={1017}
              preload
              sizes="(max-width: 800px) 90vw, 48vw"
            />
          </div>
          <div className="floating-card floating-card-top"><Target size={19} /><span>4× more<br /><b>grip points</b></span></div>
          <div className="floating-card floating-card-bottom"><Zap size={19} /><span>Fast control<br /><b>game ready</b></span></div>
        </div>
      </section>

      <section className="trust-strip" aria-label="Shopping benefits">
        <div className="shell trust-grid">
          <div><PackageCheck /><span><b>Cash on Delivery</b><small>Pay when it arrives</small></span></div>
          <div><Truck /><span><b>Delivery across Nepal</b><small>Valley and nationwide</small></span></div>
          <div><Clock3 /><span><b>Fast confirmation</b><small>We call after your order</small></span></div>
          <div><Headphones /><span><b>Helpful support</b><small>Before and after delivery</small></span></div>
        </div>
      </section>

      <section className="product-section section shell" id="details">
        <div className="gallery-column">
          <div className="gallery-main">
            <Image
              src={product.images[activeImage]}
              alt={`${product.name} view ${activeImage + 1}`}
              fill
              sizes="(max-width: 900px) 92vw, 46vw"
            />
            <button className="gallery-arrow gallery-arrow-left" onClick={selectPrevious} aria-label="Previous product image"><ChevronLeft /></button>
            <button className="gallery-arrow gallery-arrow-right" onClick={selectNext} aria-label="Next product image"><ChevronRight /></button>
            <span className="gallery-count">{String(activeImage + 1).padStart(2, "0")} / {String(product.images.length).padStart(2, "0")}</span>
          </div>
          <div className="gallery-thumbnails">
            {product.images.map((image, index) => (
              <button
                key={image}
                className={index === activeImage ? "active" : ""}
                onClick={() => setActiveImage(index)}
                aria-label={`Show product image ${index + 1}`}
              >
                <Image src={image} alt="" fill sizes="90px" />
              </button>
            ))}
          </div>
        </div>

        <div className="product-info">
          <div className="eyebrow">Official FIBA 3X3 format</div>
          <h2>{product.name}</h2>
          <div className="rating-row"><span><Star fill="currentColor" /><Star fill="currentColor" /><Star fill="currentColor" /><Star fill="currentColor" /><Star fill="currentColor" /></span> Performance-built design</div>
          <p>{product.description}</p>
          <ul className="quick-benefits">
            <li><CircleCheck /> Wave Triple Threat grip technology</li>
            <li><CircleCheck /> Size 6 circumference, size 7 weight</li>
            <li><CircleCheck /> Indoor and outdoor court performance</li>
          </ul>
          <div className="price-panel">
            <div><span className="old-price">{formatNpr(product.regularPrice)}</span><strong>{formatNpr(product.salePrice)}</strong></div>
            <span className="discount-badge">20% OFF</span>
          </div>
          <div className="quantity-row">
            <div>
              <label>Quantity</label>
              <div className="stepper">
                <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} aria-label="Decrease quantity"><Minus /></button>
                <span>{quantity}</span>
                <button onClick={() => setQuantity((q) => Math.min(20, q + 1))} aria-label="Increase quantity"><Plus /></button>
              </div>
            </div>
            <div className="live-total"><span>Product total</span><strong>{formatNpr(product.salePrice * quantity)}</strong><small>Delivery added at checkout</small></div>
          </div>
          <Link className="button button-primary button-wide" href={checkoutHref(quantity)}>
            Buy now — {formatNpr(product.salePrice * quantity)} <ArrowRight size={19} />
          </Link>
          <div className="microcopy"><ShieldCheck size={16} /> No advance payment. Confirm your order by phone.</div>
        </div>
      </section>

      <section className="benefits-section section" id="benefits">
        <div className="shell">
          <div className="section-heading light-heading">
            <div className="eyebrow">Control changes everything</div>
            <h2>Made for basketball<br />at full speed.</h2>
            <p>Every detail is tuned for quick decisions, confident hands, and the relentless rhythm of the half court.</p>
          </div>
          <div className="benefits-grid">
            {product.benefits.map((benefit, index) => (
              <article key={benefit.title}>
                <span className="benefit-index">{index + 1}</span>
                <h3>{benefit.title}</h3>
                <p>{benefit.description}</p>
              </article>
            ))}
          </div>
          <div className="center-action"><Link className="button button-yellow" href={checkoutHref(quantity)}>Order yours today <ArrowRight size={19} /></Link></div>
        </div>
      </section>

      <section className="story-section section shell">
        <div className="story-image">
          <Image src="/images/wilson-fiba-3x3-lifestyle.png" alt="Wilson FIBA 3X3 basketball on court" fill sizes="(max-width: 900px) 92vw, 50vw" />
        </div>
        <div className="story-copy">
          <span className="story-mark">W</span>
          <div className="eyebrow">The 3X3 difference</div>
          <h2>Smaller in the hand.<br />Serious in the game.</h2>
          <p>The compact circumference makes crossovers and fast exchanges feel natural. The full game-ball weight keeps your release honest, so practice translates when the pressure rises.</p>
          <dl>
            <div><dt>28.5”</dt><dd>Size 6 circumference</dd></div>
            <div><dt>7</dt><dd>Full-size ball weight</dd></div>
            <div><dt>2</dt><dd>Indoor + outdoor courts</dd></div>
          </dl>
        </div>
      </section>

      <section className="testimonials-section section">
        <div className="shell">
          <div className="section-heading">
            <div>
              <div className="eyebrow">Review preview</div>
              <h2>Built for players<br />who want control.</h2>
            </div>
            <p className="sample-notice">Sample testimonial names, portraits, and copy for layout preview. Replace with verified customer reviews before publishing.</p>
          </div>
          <div className="testimonials-grid">
            {testimonials.map((testimonial) => (
              <article key={testimonial.name}>
                <div className="quote-mark">“</div>
                <p>{testimonial.quote}</p>
                <footer>
                  <span className="avatar" aria-hidden="true">
                    <Image
                      src={testimonial.photo}
                      alt=""
                      width={96}
                      height={96}
                      sizes="96px"
                      unoptimized
                    />
                  </span>
                  <span><b>{testimonial.name}</b><small>{testimonial.location}</small></span>
                </footer>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="faq-section section shell" id="faq">
        <div className="faq-intro">
          <div className="eyebrow">Quick answers</div>
          <h2>Everything you<br />need to know.</h2>
          <p>Still deciding? Order with confidence—there is no advance payment.</p>
          <Link className="text-link" href={checkoutHref(quantity)}>Go to checkout <ArrowRight size={17} /></Link>
        </div>
        <div className="faq-list">
          {faqs.map((faq, index) => (
            <details key={faq.question} open={index === 0}>
              <summary><span>{faq.question}</span><Plus /></summary>
              <p>{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="final-cta shell">
        <div>
          <div className="eyebrow">Your next game starts here</div>
          <h2>Grip it. Move faster.<br />Own the court.</h2>
          <p>Order today for {formatNpr(product.salePrice)} with Cash on Delivery.</p>
        </div>
        <Link className="button button-yellow" href={checkoutHref(quantity)}>Purchase now <ArrowRight size={20} /></Link>
        <div className="court-lines" aria-hidden="true" />
      </section>

      <footer className="site-footer shell">
        <BrandLogo />
        <p>Performance for the half court. Cash on Delivery across Nepal.</p>
        <a href="mailto:raazes@gmail.com">raazes@gmail.com</a>
      </footer>

      <div className="mobile-buy-bar">
        <div><small>Offer price</small><strong>{formatNpr(product.salePrice)}</strong></div>
        <Link className="button button-primary" href={checkoutHref(quantity)}>Order now <ArrowRight size={18} /></Link>
      </div>
    </main>
  );
}
