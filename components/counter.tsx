'use client';
import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

export default function AnimatedDigits({ value }: { value: number | null }) {
  const motionValue = useMotionValue(value ?? 0);
  const spring = useSpring(motionValue, { stiffness: 42, damping: 24, mass: 1.2 });
  const rounded = useTransform(spring, (v) => Math.round(v).toLocaleString('en-US'));
  const [display, setDisplay] = useState('—');

  useEffect(() => {
    if (value !== null) motionValue.set(value);
  }, [value, motionValue]);

  useEffect(() => rounded.on('change', setDisplay), [rounded]);

  return (
    <motion.span aria-label={value === null ? 'No data available' : value.toLocaleString('en-US')}>
      {value === null ? 'Awaiting data' : display}
    </motion.span>
  );
}
