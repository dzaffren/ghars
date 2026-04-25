"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type MenuItem = {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  href?: string;
  onClick?: () => void;
  label?: string;
};

type FlowerMenuProps = {
  menuItems: MenuItem[];
  iconColor?: string;
  backgroundColor?: string;
  animationDuration?: number;
  togglerSize?: number;
  /** Angle (degrees) of the first item. 0 = left, 90 = down, 180 = right, 270 = up */
  startAngle?: number;
  /** Degrees between each item. Defaults to evenly distributing across 360°. */
  spreadAngle?: number;
};

const MenuToggler = ({
  isOpen,
  onChange,
  backgroundColor,
  iconColor,
  animationDuration,
  togglerSize,
  iconSize,
}: {
  isOpen: boolean;
  onChange: () => void;
  backgroundColor: string;
  iconColor: string;
  animationDuration: number;
  togglerSize: number;
  iconSize: number;
}) => {
  const lineHeight = iconSize * 0.1;
  const lineWidth = iconSize * 0.8;
  const lineSpacing = iconSize * 0.25;

  return (
    <>
      <input
        id="flower-menu-toggler"
        type="checkbox"
        checked={isOpen}
        onChange={onChange}
        className="absolute inset-0 z-10 m-auto cursor-pointer opacity-0"
        style={{ width: togglerSize, height: togglerSize }}
      />
      <label
        htmlFor="flower-menu-toggler"
        className="absolute inset-0 z-20 m-auto flex cursor-pointer items-center justify-center rounded-full shadow-lg transition-all"
        style={{
          backgroundColor,
          color: iconColor,
          transitionDuration: `${animationDuration}ms`,
          width: togglerSize,
          height: togglerSize,
        }}
      >
        <span
          className="relative flex flex-col items-center justify-center"
          style={{ width: iconSize, height: iconSize }}
        >
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className={cn("absolute bg-current transition-all", {
                "opacity-0": isOpen && i === 0,
                "rotate-45": isOpen && i === 1,
                "-rotate-45": isOpen && i === 2,
              })}
              style={{
                transitionDuration: `${animationDuration}ms`,
                width: lineWidth,
                height: lineHeight,
                top: isOpen
                  ? `calc(50% - ${lineHeight / 2}px)`
                  : `calc(50% + ${(i - 1) * lineSpacing}px - ${lineHeight / 2}px)`,
              }}
            />
          ))}
        </span>
      </label>
    </>
  );
};

const MenuItemNode = ({
  item,
  angle,
  isOpen,
  iconColor,
  backgroundColor,
  animationDuration,
  itemSize,
  iconSize,
}: {
  item: MenuItem;
  angle: number;
  isOpen: boolean;
  iconColor: string;
  backgroundColor: string;
  animationDuration: number;
  itemSize: number;
  iconSize: number;
}) => {
  const Icon = item.icon;
  const offset = itemSize + 16;

  const inner = (
    <span
      className={cn(
        "flex h-full w-full items-center justify-center rounded-full opacity-70 transition-all hover:scale-110 hover:opacity-100",
        { "pointer-events-auto": isOpen, "pointer-events-none": !isOpen }
      )}
      style={{
        backgroundColor,
        color: iconColor,
        // counter-rotate so the icon stays upright
        transform: `rotate(-${angle}deg)`,
        transitionDuration: `${animationDuration}ms`,
      }}
    >
      <Icon style={{ width: iconSize, height: iconSize }} />
    </span>
  );

  return (
    <li
      className={cn("absolute inset-0 m-auto transition-all", {
        "opacity-100": isOpen,
        "opacity-0 pointer-events-none": !isOpen,
      })}
      style={{
        width: itemSize,
        height: itemSize,
        transform: isOpen
          ? `rotate(${angle}deg) translateX(-${offset}px)`
          : "none",
        transitionDuration: `${animationDuration}ms`,
      }}
    >
      {item.onClick ? (
        <button
          onClick={item.onClick}
          aria-label={item.label}
          className="h-full w-full"
          tabIndex={isOpen ? 0 : -1}
        >
          {inner}
        </button>
      ) : (
        <Link
          href={item.href ?? "#"}
          aria-label={item.label}
          className="h-full w-full"
          tabIndex={isOpen ? 0 : -1}
        >
          {inner}
        </Link>
      )}
    </li>
  );
};

export const FlowerMenu = ({
  menuItems,
  iconColor = "white",
  backgroundColor = "#2d6a4f",
  animationDuration = 400,
  togglerSize = 44,
  startAngle = 0,
  spreadAngle,
}: FlowerMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const itemCount = menuItems.length;
  const gap = spreadAngle ?? 360 / itemCount;
  const itemSize = togglerSize;
  const iconSize = Math.max(16, Math.floor(togglerSize * 0.45));
  const containerSize = togglerSize * 3;

  return (
    <nav
      className="relative"
      style={{ width: containerSize, height: containerSize }}
    >
      <MenuToggler
        isOpen={isOpen}
        onChange={() => setIsOpen((v) => !v)}
        backgroundColor={backgroundColor}
        iconColor={iconColor}
        animationDuration={animationDuration}
        togglerSize={togglerSize}
        iconSize={iconSize}
      />
      <ul className="absolute inset-0 m-0 h-full w-full list-none p-0">
        {menuItems.map((item, index) => (
          <MenuItemNode
            key={index}
            item={item}
            angle={startAngle + gap * index}
            isOpen={isOpen}
            iconColor={iconColor}
            backgroundColor={backgroundColor}
            animationDuration={animationDuration}
            itemSize={itemSize}
            iconSize={iconSize}
          />
        ))}
      </ul>
    </nav>
  );
};
