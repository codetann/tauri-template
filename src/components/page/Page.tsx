import styles from "./Page.module.css";
import { motion } from "framer-motion";

const css = {
  page: "w-full h-full relative p-4 pt-0 pl-0 rounded-lg overflow-hidden",
  children:
    "w-full h-full relative bg-neutral-50 dark:bg-neutral-900 rounded-lg overflow-hidden",
};

interface PageProps {
  children: React.ReactNode;
  column?: boolean;
}

// animate the page in and out
const pageVariants = {
  initial: {
    opacity: 0,
    y: 10,
  },
  animate: {
    opacity: 1,
    y: 0,
  },
  exit: {
    opacity: 0,
    y: 10,
  },
};
export default function Page({ children, column }: PageProps) {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{
        duration: 0.15,
        // ease: "easeInOut",
      }}
      className={css.page}
    >
      <div
        className={`${css.children} ${
          column ? "flex flex-col" : "flex flex-row"
        }`}
      >
        {children}
      </div>
    </motion.div>
  );
}
