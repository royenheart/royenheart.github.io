import { useEffect, useRef } from 'react';
import {
  animate,
  motion,
  useMotionValue,
  useTransform,
  type MotionValue,
} from 'motion/react';
import type { OrbitCard } from './CardDeck';
import { CardSurface } from './CardSurface';
import { cardIndex } from './sequence';
import { rotaryDesigns, type RotaryDesign } from './rotary-designs';
import { useContourLayout } from './useContourLayout';

function RotaryCard({
  card,
  position,
  index,
  progress,
  design,
  reduced,
}: {
  card: OrbitCard;
  position: number;
  index: number;
  progress: MotionValue<number>;
  design: RotaryDesign;
  reduced: boolean;
}) {
  const cardRef = useRef<HTMLElement>(null);
  useContourLayout(cardRef, `${design}:${card.id}`);
  const transform = useTransform(progress, (value) => {
    if (reduced) return 'none';
    const distance = position - value;
    const degrees = distance * rotaryDesigns[design].step;
    const angle = (degrees * Math.PI) / 180;
    if (design === 'tangent')
      return `rotateZ(${-degrees}deg) rotateY(${-degrees * 0.7}deg) translateZ(${-Math.abs(distance) * 24}px)`;
    const y = Math.sin(angle);
    const z = Math.cos(angle) - 1;
    if (design === 'drum')
      return `translate3d(0, calc(var(--rotary-radius) * ${y}), calc(var(--rotary-radius) * ${z})) rotateX(${-degrees}deg)`;
    return `translate3d(${(1 - Math.cos(angle)) * 30}px, calc(var(--rotary-radius) * ${y}), calc(var(--rotary-radius) * ${z})) rotateY(${-distance * 38}deg) rotateZ(${-distance * 5}deg)`;
  });
  const opacity = useTransform(progress, (value) => {
    const distance = Math.abs(position - value);
    if (reduced) return position === index ? 1 : 0;
    if (distance >= 1.65) return 0;
    return distance < 1
      ? 1 - distance * 0.76
      : 0.24 * (1 - (distance - 1) / 0.65);
  });
  const active = position === index;
  return (
    <motion.article
      ref={cardRef}
      className={`rotary-card${active ? ' rotary-card-active' : ''}`}
      aria-label={card.label}
      aria-hidden={!active}
      inert={!active}
      data-position={position}
      style={{ transform, opacity }}
    >
      <CardSurface design={design} />
      {card.content}
    </motion.article>
  );
}

export function RotaryDeck({
  cards,
  index,
  onIndex,
  reduced,
  onClose,
  design,
  duration,
}: {
  cards: OrbitCard[];
  index: number;
  onIndex(index: number): void;
  reduced: boolean;
  onClose(): void;
  design: RotaryDesign;
  duration: number;
}) {
  const progress = useMotionValue(index);
  const host = useRef<HTMLElement>(null);
  const lastWheel = useRef(0);
  const pointer = useRef<number | null>(null);
  useEffect(() => {
    const node = host.current;
    if (reduced || progress.get() === index) {
      progress.set(index);
      if (node) node.dataset.moving = 'false';
      return;
    }
    if (node) node.dataset.moving = 'true';
    const control = animate(progress, index, {
      duration,
      ease: [0.22, 0.72, 0.18, 1],
      onComplete: () => {
        if (node) node.dataset.moving = 'false';
      },
    });
    return () => control.stop();
  }, [index, reduced, progress, duration]);
  const step = (delta: number) =>
    onIndex(cardIndex(index, delta, cards.length));
  return (
    <section
      ref={host}
      id="orbit-deck"
      className="rotary-deck"
      role="region"
      aria-roledescription="carousel"
      aria-label="Information cards"
      aria-describedby="rotary-help"
      tabIndex={0}
      data-card-count={cards.length}
      data-card-index={index}
      data-moving="false"
      onKeyDown={(event) => {
        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
          event.preventDefault();
          step(event.key === 'ArrowDown' ? 1 : -1);
        }
        if (event.key === 'Home' || event.key === 'End') {
          event.preventDefault();
          onIndex(event.key === 'Home' ? 0 : cards.length - 1);
        }
        if (event.key === 'Escape') {
          event.preventDefault();
          onClose();
        }
      }}
    >
      <p id="rotary-help" className="sr-only">
        Scroll over a card or swipe vertically to browse. Use the up and down
        arrow keys while focused. Home and End jump to the first and last cards.
        Escape closes the cards.
      </p>
      <div
        className="rotary-stage"
        onWheel={(event) => {
          if (
            Math.abs(event.deltaY) < 12 ||
            performance.now() - lastWheel.current < 300
          )
            return;
          lastWheel.current = performance.now();
          step(event.deltaY);
        }}
        onPointerDown={(event) => {
          if (event.pointerType !== 'mouse') pointer.current = event.clientY;
        }}
        onPointerUp={(event) => {
          if (
            pointer.current !== null &&
            Math.abs(event.clientY - pointer.current) > 35
          )
            step(pointer.current - event.clientY);
          pointer.current = null;
        }}
        onPointerCancel={() => {
          pointer.current = null;
        }}
      >
        {cards.map((card, position) => (
          <RotaryCard
            key={card.id}
            card={card}
            position={position}
            index={index}
            progress={progress}
            design={design}
            reduced={reduced}
          />
        ))}
      </div>
      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {cards[index]?.label}. Card {index + 1} of {cards.length}.
      </p>
    </section>
  );
}
