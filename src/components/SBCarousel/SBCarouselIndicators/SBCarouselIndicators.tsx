import classNames from "classnames";
import React, { FC, RefObject, useEffect, useMemo } from "react";
import { useEffectOnce } from "react-use";
import smoothscroll from "smoothscroll-polyfill";

import "./SBCarouselIndicators.scss";

export interface ISBCarouselIndicatorsProps {
  /**
   * Indicate how many dots to show
   * @values number
   * @required
   */
  length: number;

  /**
   * Sets the sensitivity when scrolling to get no the next index
   * @values [0, n]
   * @default 0
   * @required
   */
  currentIndex: number;

  /**
   * Classname for indicator container
   */
  indicatorContainerClassName?: string;

  /**
   * props for indicator container element, be aware that if you supply className and ref props here, it will overwrite the default one
   */
  indicatorContainerProps?: React.HTMLProps<HTMLDivElement>;

  /**
   * className for each classes in the indicator,
   * active: current item,
   * close: item that close with current item,
   * far: item that far from current item
   */
  indicatorClassNames?: {
    active?: string;
    close?: string;
    far?: string;
  };

  /**
   * Render custom dot element
   * @param index dot's index
   * @param defaultClassName default class for the dot element, it contain styles to display the dot correctly
   * @example
   * <SBCarousel
   *   renderDot={(index, defaultClassName) => (
   *     // data-index is required for scrolling purposes
   *     <div key={index} data-index={index} className={defaultClassName} />
   *   )}
   * >
   *   ...
   * </SBCarousel>
   */
  renderDot?: (index: number, defaultClassName: string) => JSX.Element;
}

const SBCarouselIndicators: FC<ISBCarouselIndicatorsProps> = ({
  length,
  currentIndex,
  indicatorContainerClassName,
  indicatorContainerProps,
  indicatorClassNames,
}: ISBCarouselIndicatorsProps): JSX.Element => {
  /**
   * Reference to the indicator container
   */
  const indicatorContainerRef: RefObject<HTMLDivElement> =
    React.useRef<HTMLDivElement>(null);

  /**
   * Used in order for mobile devices to be able to display behaviour smooth
   * Kick off the polyfill
   */
  useEffectOnce((): void => smoothscroll.polyfill());

  /**
   * Update indicator index position
   */
  useEffect((): void => {
    const active: Element | null | undefined =
      indicatorContainerRef.current?.querySelector(".dots-active");

    if (active) {
      const index: string | null = active.getAttribute("data-index");

      if (index !== null && indicatorContainerRef.current) {
        indicatorContainerRef.current.scrollTo({
          left: ((Number(index) - 2) / 5) * 50,
          behavior: "smooth",
        });
      }
    }
  }, [currentIndex]);

  /**
   * Render the dots for items / pages
   */
  const renderDots: JSX.Element[] = useMemo((): JSX.Element[] => {
    let output: JSX.Element[] = [];

    const calculatedActiveIndex: number = currentIndex;

    for (let index = 0; index < length; index++) {
      let className: string = "";
      if (calculatedActiveIndex === index) {
        className = indicatorClassNames?.active || "dots-active";
      } else {
        if (calculatedActiveIndex === 0) {
          if (calculatedActiveIndex + index <= 2) {
            className = indicatorClassNames?.close || "dots-close";
          } else {
            className = indicatorClassNames?.far || "dots-far";
          }
        } else if (calculatedActiveIndex === length - 1) {
          if (Math.abs(calculatedActiveIndex - index) <= 2) {
            className = indicatorClassNames?.close || "dots-close";
          } else {
            className = indicatorClassNames?.far || "dots-far";
          }
        } else {
          if (Math.abs(calculatedActiveIndex - index) === 1) {
            className = indicatorClassNames?.close || "dots-close";
          } else {
            className = indicatorClassNames?.far || "dots-far";
          }
        }
      }

      output.push(<div key={index} data-index={index} className={className} />);
    }

    return output;
  }, [currentIndex, indicatorClassNames, length]);

  return (
    <div
      ref={indicatorContainerRef}
      className={classNames("indicator-container", {
        [`${indicatorContainerClassName}`]: !!indicatorContainerClassName,
      })}
      {...indicatorContainerProps}
    >
      {renderDots}
    </div>
  );
};

export default SBCarouselIndicators;
