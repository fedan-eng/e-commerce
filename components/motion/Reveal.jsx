"use client";
// components/motion/Reveal.jsx — scroll-in motion shared by the storefront sections.
//   <Reveal>…</Reveal>                    fades and rises in when scrolled into view
//   <Stagger><StaggerItem/>…</Stagger>    the items come in one after another
//   <CountUp to={30} suffix="+" />        a number that counts up when it comes into view
// Each plays once. With "reduce motion" on, everything simply shows.
import { useEffect, useRef } from "react";
import { animate, motion, useInView, useMotionValue, useReducedMotion, useTransform } from "framer-motion";

export const EASE = [0.22, 1, 0.36, 1];
const VIEWPORT = { once: true, amount: 0.15 };

// as: the element to render ("div", "section", "li", "ul"…); y: how far it rises; x: slides in sideways
export function Reveal({ as = "div", y = 32, x = 0, delay = 0, duration = 0.7, className, children, ...rest }) {
  const still = useReducedMotion();
  const Tag = motion[as] || motion.div;
  if (still) return <Tag className={className} {...rest}>{children}</Tag>;
  return (
    <Tag
      className={className}
      initial={{ opacity: 0, y, x }}
      whileInView={{ opacity: 1, y: 0, x: 0 }}
      viewport={VIEWPORT}
      transition={{ duration, delay, ease: EASE }}
      {...rest}
    >
      {children}
    </Tag>
  );
}

const group = (gap, delay) => ({ hide: {}, show: { transition: { staggerChildren: gap, delayChildren: delay } } });
const item = (y, scale) => ({
  hide: { opacity: 0, y, scale },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.65, ease: EASE } },
});

// gap: seconds between items
export function Stagger({ as = "div", gap = 0.1, delay = 0, className, children, ...rest }) {
  const still = useReducedMotion();
  const Tag = motion[as] || motion.div;
  if (still) return <Tag className={className} {...rest}>{children}</Tag>;
  return (
    <Tag className={className} variants={group(gap, delay)} initial="hide" whileInView="show" viewport={VIEWPORT} {...rest}>
      {children}
    </Tag>
  );
}

// pop: also grows in slightly (cards)
export function StaggerItem({ as = "div", y = 28, pop = false, className, children, ...rest }) {
  const still = useReducedMotion();
  const Tag = motion[as] || motion.div;
  return (
    <Tag className={className} variants={still ? undefined : item(y, pop ? 0.94 : 1)} {...rest}>
      {children}
    </Tag>
  );
}

export function CountUp({ to, from = 0, duration = 1.6, prefix = "", suffix = "", className }) {
  const still = useReducedMotion();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const value = useMotionValue(still ? to : from);
  const text = useTransform(value, (v) => `${prefix}${Math.round(v).toLocaleString("en-NG")}${suffix}`);
  useEffect(() => {
    if (still) return value.set(to);
    if (!inView) return;
    const controls = animate(value, to, { duration, ease: EASE });
    return () => controls.stop();
  }, [inView, still, to, duration, value]);
  return <motion.span ref={ref} className={className}>{text}</motion.span>;
}
