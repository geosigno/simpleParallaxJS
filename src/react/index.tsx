import React, { useCallback, useEffect, useState } from "react";
import AnimationManager from "./AnimationManager";
import useGetImageHeight from "./hooks/useGetImageHeight";
import useGetTransitionValue from "./hooks/useGetTransitionValue";
import useIntersectionObserver from "./hooks/useIntersectionObserver";
import { SimpleParallaxProps } from "./types";

const SimpleParallax: React.FunctionComponent<SimpleParallaxProps> = ({
  delay = 0.4,
  orientation: orientationProp = "up",
  scale: scaleProp = 1.4,
  overflow = false,
  transition = "cubic-bezier(0,0,0,1)",
  maxTransition = null,
  children,
}) => {
  const orientation = orientationProp ?? "up";
  const scale = scaleProp ?? 1.2;
  const src = (children as React.ReactElement)?.props?.src;

  const [isInit, setIsInit] = useState(false);
  const [viewportTop, setViewportTop] = useState(0);
  const [boundingClientRect, setBoundingClientRect] = useState<DOMRect | null>(
    null
  );
  const [transformCSS, setTransformCSS] = useState("");
  const [transitionCSS, setTransitionCSS] = useState("");
  const [shouldApplyTransition, setShouldApplyTransition] = useState(false);

  const [imageRef, imageHeight, isLoaded] = useGetImageHeight(src);
  const [elementRef, isVisible] = useIntersectionObserver<HTMLDivElement>({
    root: null,
    rootMargin: "0px",
    threshold: Array.from(Array(101).keys(), (n) => n / 100),
  });
  const transitionValue = useGetTransitionValue({
    isLoaded,
    imageHeight,
    scale,
    boundingClientRect: boundingClientRect as DOMRect,
    orientation,
    maxTransition,
  });

  const updateParallax = useCallback(() => {
    if (!isVisible && isInit) return;

    if (window.scrollY !== viewportTop || !isInit) {
      const boundingClientRect = imageRef.current?.getBoundingClientRect();
      if (boundingClientRect) {
        setBoundingClientRect(boundingClientRect);
      }
      if (!isInit) {
        setIsInit(true);
        setTimeout(() => {
          setShouldApplyTransition(true);
        }, 50);
      }
      setViewportTop(window.scrollY);
    }
  }, [viewportTop, isVisible, imageRef, isInit]);

  useEffect(() => {
    let transform = `translate3d(${transitionValue})`;
    if (!overflow) {
      transform += ` scale(${scale})`;
    }
    setTransformCSS(transform);
  }, [transitionValue, scale, overflow]);

  useEffect(() => {
    if (!transition || !delay || !shouldApplyTransition) {
      setTransitionCSS("");
      return;
    }
    setTransitionCSS(`transform ${delay}s ${transition}`);
  }, [transition, delay, shouldApplyTransition]);

  useEffect(() => {
    AnimationManager.register(updateParallax);
    return () => {
      AnimationManager.unregister(updateParallax);
    };
  }, [updateParallax]);

  const clonedChild = React.isValidElement(children)
    ? React.cloneElement(children as React.ReactElement, {
        style: {
          ...((children as React.ReactElement).props.style ?? {}),
          transform: transformCSS,
          willChange: "transform",
          transition: transitionCSS,
        },
        ref: imageRef,
      })
    : null;

  return (
    <div
      ref={elementRef}
      style={{
        overflow: overflow ? "visible" : "hidden",
      }}
    >
      {clonedChild}
    </div>
  );
};

export default SimpleParallax;
