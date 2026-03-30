import { useMemo, useState } from "react";
import "./BorderGlow.css";

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

function BorderGlow({
  children,
  edgeSensitivity = 30,
  glowColor = "40 80 80",
  backgroundColor = "#060010",
  borderRadius = 28,
  glowRadius = 40,
  glowIntensity = 1,
  coneSpread = 25,
  animated = false,
  colors = ["#c084fc", "#f472b6", "#38bdf8"],
  className = "",
}) {
  const [pointer, setPointer] = useState({
    x: 50,
    y: 50,
    opacity: 0,
    active: false,
  });

  const mergedClassName = useMemo(
    () => ["border-glow", animated ? "border-glow--animated" : "", className]
      .filter(Boolean)
      .join(" "),
    [animated, className]
  );

  const handleMove = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    const edgeDistance = Math.min(
      event.clientX - rect.left,
      rect.right - event.clientX,
      event.clientY - rect.top,
      rect.bottom - event.clientY
    );
    const proximity = clamp(1 - edgeDistance / edgeSensitivity, 0, 1);

    setPointer({
      x,
      y,
      opacity: proximity > 0 ? (0.32 + proximity * 0.68) * glowIntensity : 0,
      active: proximity > 0,
    });
  };

  const handleLeave = () => {
    setPointer((previous) => ({
      ...previous,
      opacity: 0,
      active: false,
    }));
  };

  return (
    <div
      className={mergedClassName}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{
        "--border-glow-background": backgroundColor,
        "--border-glow-radius": `${borderRadius}px`,
        "--border-glow-inner-radius": `${Math.max(borderRadius - 1, 0)}px`,
        "--border-glow-radius-blur": `${glowRadius}px`,
        "--border-glow-cone-spread": `${coneSpread}deg`,
        "--border-glow-opacity": pointer.opacity,
        "--border-glow-x": `${pointer.x}%`,
        "--border-glow-y": `${pointer.y}%`,
        "--border-glow-color": glowColor,
        "--border-glow-alpha-strong": Math.min(pointer.opacity, 1),
        "--border-glow-alpha-soft": Math.min(pointer.opacity * 0.65, 0.9),
        "--border-glow-colors": `conic-gradient(from 180deg at ${pointer.x}% ${pointer.y}%, ${colors.join(
          ", "
        )})`,
      }}
      data-active={pointer.active}
    >
      <div className="border-glow__halo" />
      <div className="border-glow__border" />
      <div className="border-glow__content">{children}</div>
    </div>
  );
}

export default BorderGlow;
