// components/AnimatedUpdateIndicator.tsx
"use client";
import React, { useState, useEffect } from "react";

interface AnimatedUpdateIndicatorProps {
  id: string;
  isNew?: boolean;
  isUpdated?: boolean;
  isDeleted?: boolean;
  highlightDuration?: number;
}

/**
 * Componente que proporciona animaciones visuales para indicar cuando un elemento
 * ha sido creado, actualizado o eliminado en tiempo real.
 */
const AnimatedUpdateIndicator: React.FC<
  AnimatedUpdateIndicatorProps & { children: React.ReactNode }
> = ({
  id,
  isNew = false,
  isUpdated = false,
  isDeleted = false,
  highlightDuration = 5000,
  children,
}) => {
  const [isHighlighted, setIsHighlighted] = useState<boolean>(
    isNew || isUpdated,
  );
  const [isBeingRemoved, setIsBeingRemoved] = useState<boolean>(isDeleted);
  const [hasAnimationEnded, setHasAnimationEnded] = useState<boolean>(false);

  // Controlar el estado de la animación
  useEffect(() => {
    if (isNew || isUpdated) {
      setIsHighlighted(true);

      const timer = setTimeout(() => {
        setIsHighlighted(false);
      }, highlightDuration);

      return () => clearTimeout(timer);
    }
  }, [isNew, isUpdated, highlightDuration, id]);

  // Manejar la animación de eliminación
  useEffect(() => {
    if (isDeleted && !isBeingRemoved) {
      setIsBeingRemoved(true);

      // La animación durará 1 segundo antes de que el componente pueda ser eliminado
      const timer = setTimeout(() => {
        setHasAnimationEnded(true);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [isDeleted, isBeingRemoved]);

  // Si el elemento se ha eliminado y la animación ha terminado, no renderizar nada
  if (hasAnimationEnded) {
    return null;
  }

  // Determinar las clases CSS basadas en el estado
  let animationClass = "";

  if (isBeingRemoved) {
    animationClass = "animate-delete";
  } else if (isHighlighted) {
    animationClass = isNew ? "animate-newItem" : "animate-updateItem";
  }

  return <div className={`transition-all ${animationClass}`}>{children}</div>;
};

export default AnimatedUpdateIndicator;
