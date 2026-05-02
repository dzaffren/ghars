import type { Variants } from "framer-motion";
import { useReducedMotion } from "framer-motion";

export const cardSpring = {
  type: "spring",
  stiffness: 300,
  damping: 28,
  mass: 0.9,
} as const;

export function useFadeUp(): Variants {
  const reduce = useReducedMotion();
  return reduce
    ? { hidden: { opacity: 1, y: 0 }, show: { opacity: 1, y: 0 } }
    : {
        hidden: { opacity: 0, y: 8 },
        show: { opacity: 1, y: 0, transition: cardSpring },
      };
}

export function useStagger(step = 0.06): Variants {
  const reduce = useReducedMotion();
  return { show: { transition: { staggerChildren: reduce ? 0 : step } } };
}

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: cardSpring },
};

export const stagger: Variants = {
  show: { transition: { staggerChildren: 0.06 } },
};
