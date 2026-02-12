"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export const AccordionItem = ({
  title,
  isOpen,
  onClick,
  children,
  headerClassName = "",
  contentClassName = "",
  icon: Icon,
  iconClassName = "",
}) => {
  return (
    <div>
      <button
        onClick={onClick}
        className={`w-full flex justify-between items-center ${
          typeof headerClassName === "function"
            ? headerClassName(isOpen)
            : headerClassName
        }`}
      >
        <span>{title}</span>
        {Icon && (
          <span className={iconClassName}>
            {typeof Icon === "function" ? <Icon isOpen={isOpen} /> : Icon}
          </span>
        )}
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="content"
            initial="collapsed"
            animate="open"
            exit="collapsed"
            variants={{
              open: { height: "auto", opacity: 1 },
              collapsed: { height: 0, opacity: 0 },
            }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className={`overflow-hidden ${contentClassName}`}
          >
            <div>{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Accordion = ({
  items = [],
  className = "",
  headerClassName = "",
  contentClassName = "",
  icon = null,
  iconClassName = "",
  defaultOpenIndex = null, // 👈 new prop
}) => {
  const [openIndex, setOpenIndex] = useState(defaultOpenIndex);

  const handleClick = (index) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <div className={`w-full ${className}`}>
      {items.map((item, index) => (
        <AccordionItem
          key={index}
          title={item.title}
          isOpen={openIndex === index}
          onClick={() => handleClick(index)}
          headerClassName={headerClassName}
          contentClassName={contentClassName}
          icon={item.icon || icon}
          iconClassName={iconClassName}
        >
          {item.content}
        </AccordionItem>
      ))}
    </div>
  );
};

export default Accordion;
