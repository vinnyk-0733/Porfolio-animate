'use client';

import { AnimatePresence, motion, useAnimationControls } from 'framer-motion';
import React, { useState } from 'react';
import { Menu, X, Linkedin, Instagram, Github, Link2, Globe, PersonStanding, LucidePersonStanding, PersonStandingIcon, LucideBackpack } from 'lucide-react';
import { cn } from '@/lib/utils';

const CONSTANTS = {
  itemSize: 70,
  openStagger: 0.04,
  closeStagger: 0.04,
  radius: 170 // increased distance so items map out a wide, breathable quadrant
};

const STYLES: Record<string, Record<string, string>> = {
  trigger: {
    container:
      'rounded-full flex items-center bg-white text-black justify-center cursor-pointer outline-none ring-0 hover:scale-105 transition-all duration-100 z-50 shadow-xl border border-white/20',
    active: 'bg-white'
  },
  item: {
    container:
      'rounded-full flex items-center justify-center absolute bg-black/80 border border-white/20 hover:bg-white/20 hover:border-white/50 backdrop-blur-md cursor-pointer text-white shadow-lg transition-colors group',
    label:
      'text-[10px] sm:text-xs font-bold text-white absolute top-full left-1/2 -translate-x-1/2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-black/60 backdrop-blur-md border border-white/10 px-2 py-1 rounded-md pointer-events-none'
  }
};

const pointOnQuadrantBottomLeft = (i: number, n: number, r: number, cx = 0, cy = 0) => {
  // We span from Top (-90 deg / -PI/2) to Right (0 deg / 0 rad)
  const theta = -Math.PI / 1.8 + (Math.PI / 2) * (i / Math.max(1, n - 1));
  const x = cx + r * Math.cos(theta);
  const y = cy + r * Math.sin(theta);
  return { x, y };
};

interface MenuItemProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  index: number;
  totalItems: number;
  isOpen: boolean;
}

const MenuItem = ({ icon, label, href, index, totalItems, isOpen }: MenuItemProps) => {
  const { x, y } = pointOnQuadrantBottomLeft(index, totalItems, CONSTANTS.radius);

  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="absolute z-40 outline-none">
      <motion.button
        animate={{
          x: isOpen ? x : 0,
          y: isOpen ? y : 0,
          opacity: isOpen ? 1 : 0,
          scale: isOpen ? 1 : 0.5
        }}
        whileHover={{
          scale: 1.15,
          transition: { duration: 0.1 }
        }}
        transition={{
          delay: isOpen ? index * CONSTANTS.openStagger : (totalItems - index) * CONSTANTS.closeStagger,
          type: 'spring',
          stiffness: 300,
          damping: 20
        }}
        style={{
          height: CONSTANTS.itemSize - 4,
          width: CONSTANTS.itemSize - 4
        }}
        className={STYLES.item.container}
      >
        {icon}
        <span className={STYLES.item.label}>{label}</span>
      </motion.button>
    </a>
  );
};

interface MenuTriggerProps {
  setIsOpen: (isOpen: boolean) => void;
  isOpen: boolean;
  itemsLength: number;
}

const MenuTrigger = ({ setIsOpen, isOpen, itemsLength }: MenuTriggerProps) => {
  const animate = useAnimationControls();

  return (
    <motion.div className="z-50 relative">
      <motion.button
        animate={animate}
        style={{
          height: CONSTANTS.itemSize,
          width: CONSTANTS.itemSize
        }}
        className={cn(STYLES.trigger.container, isOpen && STYLES.trigger.active)}
        onClick={() => {
          setIsOpen(!isOpen);
        }}
      >
        <AnimatePresence mode="popLayout">
          {isOpen ? (
            <motion.span
              key="menu-close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X size={20} className="text-black" />
            </motion.span>
          ) : (
            <motion.span
              key="menu-open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Menu size={20} className="text-black" />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </motion.div>
  );
};

export const SocialQuadrantMenu = () => {
  const [isOpen, setIsOpen] = useState(false);

  const socialItems = [
    { label: 'LinkedIn', icon: <Linkedin size={18} />, href: 'https://www.linkedin.com/in/vinaya-kumar-49472031b/'},
    { label: 'Instagram', icon: <Instagram size={18} />, href: 'https://www.instagram.com/vinnyk__073?igsh=YjY0bW8zb3k0Z3E1'},
    { label: 'GitHub', icon: <Github size={18} />, href: 'https://github.com/vinnyk-0733'},
    { label: 'Dinq', icon: <LucideBackpack size={18} />, href: 'https://dinq.me/admin/mydinq?domain=vinaya'},
    // { label: 'Personal Website', icon: <Globe size={18} />, href: '' }
  ];

  return (
    <div className="fixed bottom-6 left-6 z-50 flex items-center justify-center">
      <motion.div className="absolute inset-0 flex items-center justify-center z-40">
        {socialItems.map((item, index) => {
          return (
            <MenuItem
              key={`menu-item-${index}`}
              icon={item.icon}
              label={item.label}
              href={item.href}
              index={index}
              totalItems={socialItems.length}
              isOpen={isOpen}
            />
          );
        })}
      </motion.div>
      <MenuTrigger
        setIsOpen={setIsOpen}
        isOpen={isOpen}
        itemsLength={socialItems.length}
      />
    </div>
  );
};
