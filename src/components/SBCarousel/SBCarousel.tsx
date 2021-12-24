import classNames from "classnames";
import React, {
  Children,
  FC,
  HTMLProps,
  MouseEvent,
  ReactChild,
  ReactFragment,
  ReactNode,
  ReactPortal,
  RefObject,
  TouchEvent,
  useMemo,
  useRef,
  useState,
} from "react";
import { useEffectOnce, useInterval } from "react-use";
import smoothscroll from "smoothscroll-polyfill";

import SBCarouselArrowButton, { ARROW_BUTTON_TYPE } from "./SBCarouselArrowButton/SBCarouselArrowButton";
import SBCarouselIndicators from "./SBCarouselIndicators/SBCarouselIndicators";

import "./SBCarousel.scss";

export type ISBCarouselProps = {
  /**
   * Items that going to be showed
   */
  children: ReactNode;

  /**
   * Indicate how many items to show at once in view
   * @values number
   * @required
   */
  itemsPerView: number;

  /**
   * Is the carousel will be repeating
   * @values true | false
   * @default false
   */
  infiniteLoop?: boolean;

  /**
   * Add an extra view before the first view and an extra view after the last view
   * @values true | false
   * @default false
   */
  addExtraFirstAndLastView?: boolean;

  /**
   * Render with indicator
   * @values true | false
   * @default false
   */
  withIndicator?: boolean;

  /**
   * Render carousel with adaptable dimensions
   * @values true | false
   * @default true
   */
  withAdaptableDimensions?: boolean;

  /**
   * Render arrow buttons
   * @values true | false
   * @default true
   */
  showArrowButtons?: boolean;

  /**
   * Render custom previous button
   * @param previousItem function to navigate to previous item
   * @param defaultClass default class for the button, it contain styles to position the button correctly. (not the arrow icon)
   * @example
   * <SBCarousel
   *   renderPreviousButton={(previousItem, defaultClass) => (
   *     <button onClick={previousItem} className={defaultClass}>
   *       previous
   *     </button>
   *   )}
   * >
   *   ...
   * </SBCarousel>
   */
  renderPreviousButton?: (previousItem: () => void, defaultClass?: string) => JSX.Element;

  /**
   * Render custom next button
   * @param nextItem function to navigate to next item
   * @param defaultClass default class for the button, it contain styles to position the button correctly. (not the arrow icon)
   * @example
   * <SBCarousel
   *   renderNextButton={(nextItem, defaultClass) => (
   *     <button onClick={nextItem} className={defaultClass}>
   *       next
   *     </button>
   *   )}
   * >
   *   ...
   * </SBCarousel>
   */
  renderNextButton?: (nextItem: () => void, defaultClassName?: string) => JSX.Element;

  /**
   * Scroll free on page, without moving between indices
   * @values true | false
   * @default false
   */
  freeScroll?: boolean;

  /**
   * Render next/previous page or next/previous item on advance
   * @values true | false
   * @default true
   */
  advancePagesOnAutoScroll?: boolean;

  /**
   * Sets the scroll sensitivity
   * @values [0, n]
   * @default 1
   */
  scrollSensitivity?: number;

  /**
   * Sets the minimum drag distance the user has to drag before starting the drag animation
   * @values [0, n]
   * @default 1
   */
  minDragDistance?: number;

  /**
   * Sets the sensitivity when scrolling to get no the next index
   * @values [0, n]
   * @default 10
   */
  advanceIndexSensitivity?: number;

  /**
   * Sets the scroll sensitivity
   * @values "ltr" | "rtl"
   * @default "ltr"
   */
  direction?: string;

  /**
   * Enables the autoplay
   * @values true | false
   * @default false
   */
  autoplay?: boolean;

  /**
   * Sets the autoplay interval
   * @values "ltr" | "rtl"
   * @default "ltr"
   */
  autoplayInterval?: number;

  /**
   * additional className for container element
   */
  containerClassName?: string;

  /**
   * props for container element, be aware that if you supply className props here, it will overwrite the default one
   */
  containerProps?: HTMLProps<HTMLDivElement>;

  /**
   * additional className for wrapper element
   */
  wrapperClassName?: string;

  /**
   * props for wrapper element, be aware that if you supply className props here, it will overwrite the default one
   */
  wrapperProps?: HTMLProps<HTMLDivElement>;

  /**
   * additional className for content wrapper element
   */
  contentWrapperClassName?: string;

  /**
   * props for content wrapper element, be aware that if you supply className props here, it will overwrite the default one
   */
  contentWrapperProps?: HTMLProps<HTMLDivElement>;

  /**
   * additional className for content element
   */
  contentClassName?: string;

  /**
   * props for content element, be aware that if you supply className props here, it will overwrite the default one
   */
  contentProps?: HTMLProps<HTMLDivElement>;

  /**
   * Classname for indicator container
   */
  indicatorContainerClassName?: string;

  /**
   * props for indicator container element, be aware that if you supply className and ref props here, it will overwrite the default one
   */
  indicatorContainerProps?: HTMLProps<HTMLDivElement>;

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

const SBCarousel: FC<ISBCarouselProps> = ({
  children,
  itemsPerView,
  infiniteLoop = false,
  addExtraFirstAndLastView = false,
  withIndicator = false,
  withAdaptableDimensions = true,
  showArrowButtons = true,
  renderPreviousButton,
  renderNextButton,
  freeScroll = false,
  advancePagesOnAutoScroll = true,
  scrollSensitivity = 1,
  minDragDistance = 2,
  direction = "ltr",
  autoplay = false,
  autoplayInterval = 3000,
  containerClassName,
  wrapperClassName,
  contentWrapperClassName,
  contentClassName,
  containerProps,
  wrapperProps,
  contentWrapperProps,
  contentProps,
  indicatorContainerClassName,
  indicatorContainerProps,
  indicatorClassNames,
}: ISBCarouselProps): JSX.Element => {
  /**
   * Reference to the carousel content wrapper
   */
  const carouselContentWrapperRef: RefObject<HTMLDivElement> = useRef<HTMLDivElement>(null);

  /**
   * Total items
   */
  const length: number = useMemo<number>((): number => Children.count(children), [children]);

  /**
   * Current index item of the carousel
   */
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  /**
   * Confirms if currently draging or not
   */
  const [isDragging, setIsDragging] = useState<boolean>(false);

  /**
   * Confirms if the mouse pointer is inside the carousel
   */
  const [isMouseInside, setIsMouseInside] = useState<boolean>(false);

  /**
   * First touch / click position to be used in calculation for the swipe speed
   */
  const [touchClickPosition, setTouchClickPosition] = useState<null | number>(null);

  /**
   * Main scrollLeft value, indicating the current index scroll position
   */
  const [scrollLeft, setScrollLeft] = useState<number>(0);

  /**
   * Checks if the carousel is repeating its item
   */
  const isRepeating: boolean = useMemo<boolean>(
    (): boolean => infiniteLoop && Children.count(children) > itemsPerView,
    [children, infiniteLoop, itemsPerView]
  );

  /**
   * The width of an item inside the page
   */
  const itemWidth: number = useMemo<number>(
    (): number =>
      carouselContentWrapperRef.current
        ? carouselContentWrapperRef.current.offsetWidth / itemsPerView
        : 0,
    [carouselContentWrapperRef.current?.offsetWidth, itemsPerView]
  );

  /**
   * Scroll the ref to the new "left" position (on OX axis)
   */
  const scrollRefTo = (left: number, smooth: boolean = false, ref: RefObject<HTMLDivElement>): null | void =>
    ref.current &&
    ref.current.scrollTo({
      left,
      behavior: smooth ? "smooth" : undefined,
    });

  /**
   * Used in order for mobile devices to be able to display behaviour smooth
   * Kick off the polyfill
   */
  useEffectOnce((): void => smoothscroll.polyfill());

  /**
   * Move the slider automatically
   */
  useInterval(
    (): void => (advancePagesOnAutoScroll ? nextPage() : nextItem()),
    autoplay && !touchClickPosition && !isMouseInside ? autoplayInterval : null
  );

  /**
   * Move forward to the next item
   */
  const nextItem = (): void => {
    if (!carouselContentWrapperRef.current) return;
    if (isRepeating || currentIndex + itemsPerView <= length) {
      const newIndex: number = currentIndex + itemsPerView < length ? currentIndex + 1 : 0;
      const newScrollLeft: number = newIndex * itemWidth;

      setCurrentIndex(newIndex);
      setScrollLeft(newScrollLeft);
      setTouchClickPosition(null);

      scrollRefTo(newScrollLeft, true, carouselContentWrapperRef);
    }
  };

  /**
   * Move backward to the previous item
   */
  const previousItem = (): void => {
    if (!carouselContentWrapperRef.current) return;
    if (isRepeating || currentIndex > 0) {
      const newIndex: number = currentIndex > 0 ? currentIndex - 1 : length - 1;
      const newScrollLeft: number = newIndex * itemWidth;

      setCurrentIndex(newIndex);
      setScrollLeft(newScrollLeft);
      setTouchClickPosition(null);

      scrollRefTo(newScrollLeft, true, carouselContentWrapperRef);
    }
  };

  /**
   * Move forward to the next set of items
   */
  const nextPage = (): void => {
    if (!carouselContentWrapperRef.current) return;
    if (isRepeating || currentIndex + (length % itemsPerView) < length) {
      const newIndex: number =
        currentIndex + (length % itemsPerView) < length
          ? currentIndex + itemsPerView
          : 0;
      const newScrollLeft: number = newIndex * itemWidth;

      setCurrentIndex(newIndex);
      setScrollLeft(newScrollLeft);
      setTouchClickPosition(null);

      scrollRefTo(newScrollLeft, true, carouselContentWrapperRef);
    }
  };

  /**
   * Move backward to the previous set of items
   */
  const previousPage = (): void => {
    if (!carouselContentWrapperRef.current) return;
    if (isRepeating || currentIndex >= itemsPerView) {
      const newIndex: number =
        currentIndex - itemsPerView >= 0
          ? currentIndex - itemsPerView
          : length - 1;
      const newScrollLeft: number = newIndex * itemWidth;

      setCurrentIndex(newIndex);
      setScrollLeft(newScrollLeft);
      setTouchClickPosition(null);

      scrollRefTo(newScrollLeft, true, carouselContentWrapperRef);
    }
  };

  /**
   * Move to the scrolled set of items
   */
  const scrollToClosestItemIndex = (): void => {
    if (!carouselContentWrapperRef.current) return;

    const childrenArray: (
      | ReactChild
      | ReactFragment
      | ReactPortal
    )[] = Children.toArray(children);

    for (let index: number = 0; index < length; index++) {
      const child: ReactChild | ReactFragment | ReactPortal = childrenArray[index];
      const childLeft: number = itemWidth * index;
      const newScrollLeft: number = carouselContentWrapperRef.current.scrollLeft;

      if (!child) return;

      if (childLeft <= newScrollLeft && childLeft + itemWidth >= newScrollLeft) {
        const newIndex: number = childLeft + itemWidth / 2 > newScrollLeft ? index : index + 1;
        setScrollLeft(newIndex * itemWidth);
        setCurrentIndex(newIndex);

        scrollRefTo(newIndex * itemWidth, true, carouselContentWrapperRef);

        break;
      }
    }
  };

  /**
   * Handle when the user start the swipe gesture
   * @param e TouchEvent
   */
  const handleOnTouchStart = (e: TouchEvent<HTMLDivElement>): void => {
    if (!carouselContentWrapperRef.current) return;

    // Save the first position of the touch
    setTouchClickPosition(e.touches[0].pageX - carouselContentWrapperRef.current.offsetLeft);
    setScrollLeft(carouselContentWrapperRef.current.scrollLeft);
  };

  /**
   * Handle when one or more touch points are removed from the touch surface
   * @param e TouchEvent
   */
  const handleOnTouchEnd = (_e: TouchEvent<HTMLDivElement>): void => {
    setTouchClickPosition(null);
    isDragging && setIsDragging(false);
    !freeScroll && scrollToClosestItemIndex();
  };

  /**
   * Handle when one or more touch points have been disrupted (for example, too many touch points are created)
   * @param e TouchEvent
   */
  const handleOnTouchCancel = (e: TouchEvent<HTMLDivElement>): void => {
    touchClickPosition && handleOnTouchEnd(e);
    isDragging && setIsDragging(false);
  };

  /**
   * Handle when the user move the finger in swipe gesture
   * @param e TouchEvent
   */
  const handleOnTouchMove = (e: TouchEvent<HTMLDivElement>): void => {
    // Proceed only if the initial position is not null
    if (touchClickPosition === null || !carouselContentWrapperRef.current) {
      return;
    }

    const x: number = e.touches[0].pageX - carouselContentWrapperRef.current.offsetLeft;
    const walk: number = (x - touchClickPosition) * scrollSensitivity;

    if (!isDragging && Math.abs(walk) > minDragDistance) {
      setIsDragging(true);
    }
    
    if (isDragging) {
      scrollRefTo(scrollLeft - walk, false, carouselContentWrapperRef);
    }
  };

  /**
   * Handle when the user moves the mouse pointer onto an element
   * @param e MouseEvent
   */
  const handleOnMouseEnter = (): void => setIsMouseInside(true);

  /**
   * Handle when the user presses a mouse button
   * @param e MouseEvent
   */
  const handleOnMouseDown = (e: MouseEvent<HTMLDivElement>): void => {
    e.stopPropagation();

    if (!carouselContentWrapperRef.current) return;

    // Save the first mouse position
    setTouchClickPosition(e.pageX - carouselContentWrapperRef.current.offsetLeft);
    setScrollLeft(carouselContentWrapperRef.current.scrollLeft);

    // Stop weird link dragging effect
    e.preventDefault();
  };

  /**
   * Handle when the user releases the mouse button
   * @param e MouseEvent
   */
  const handleOnMouseUp = (e: MouseEvent<HTMLDivElement>): void => {
    e.stopPropagation();

    setTouchClickPosition(null);

    !freeScroll && scrollToClosestItemIndex();

    // Stop weird link dragging effect
    e.preventDefault();

    isDragging && setIsDragging(false);
  };

  /**
   * Handle when the user moves the mouse outside of the element
   * @param e MouseEvent
   */
  const handleOnMouseLeave = (e: MouseEvent<HTMLDivElement>): void => {
    touchClickPosition && handleOnMouseUp(e);
    setIsMouseInside(false);
  };

  /**
   * Handle when the user move the mouse after the click
   * @param e MouseEvent
   */
  const handleOnMouseMove = (e: MouseEvent<HTMLDivElement>): void => {
    e.stopPropagation();

    // Proceed only if the initial position is not null
    if (touchClickPosition === null || !carouselContentWrapperRef.current) {
      return;
    }

    const x: number = e.pageX - carouselContentWrapperRef.current.offsetLeft;
    const walk: number = (x - touchClickPosition) * scrollSensitivity;

    if (Math.abs(walk) > minDragDistance) {
      !isDragging && setIsDragging(true);
    }
    if (isDragging) {
      scrollRefTo(scrollLeft - walk, false, carouselContentWrapperRef);
    }

    // Prevent link click if the element was dragged
    e.preventDefault();
  };

  /**
   * Render previous items before the first item
   */
  const extraPreviousItems: ReactFragment[] = useMemo<ReactFragment[]>(() => {
    let output: ReactFragment[] = [];
    for (let index: number = 0; index < itemsPerView; index++) {
      output.push(Children.toArray(children)[length - 1 - index]);
    }
    output.reverse();
    return output;
  }, [children, length, itemsPerView]);

  /**
   * Render next items after the last item
   */
  const extraNextItems: ReactFragment[] = useMemo<ReactFragment[]>(() => {
    let output: ReactFragment[] = [];
    for (let index: number = 0; index < itemsPerView; index++) {
      output.push(Children.toArray(children)[index]);
    }
    return output;
  }, [children, itemsPerView]);

  return (
    <div
      className={classNames("carousel-container", { [`${containerClassName}`]: !!containerClassName })}
      dir={direction}
      {...containerProps}
    >
      <div
        className={classNames("carousel-wrapper", { [`${wrapperClassName}`]: !!wrapperClassName })}
        {...wrapperProps}
      >
        {showArrowButtons && (isRepeating || currentIndex > 0) ? (
          <SBCarouselArrowButton
            buttonType={ARROW_BUTTON_TYPE.LEFT_BUTTON}
            advanceCallback={advancePagesOnAutoScroll ? previousPage : previousItem}
            renderButton={renderPreviousButton}
          />
        ) : null}
        <div
          ref={carouselContentWrapperRef}
          className={classNames("carousel-content-wrapper", {
            [`${contentWrapperClassName}`]: !!contentWrapperClassName,
          })}
          {...contentWrapperProps}
          onTouchStart={handleOnTouchStart}
          onTouchMove={handleOnTouchMove}
          onTouchEnd={handleOnTouchEnd}
          onTouchCancel={handleOnTouchCancel}
          onMouseEnter={handleOnMouseEnter}
          onMouseDown={handleOnMouseDown}
          onMouseUp={handleOnMouseUp}
          onMouseLeave={handleOnMouseLeave}
          onMouseMove={handleOnMouseMove}
        >
          <div
            className={classNames("carousel-content", `show-${itemsPerView}`, {
              [`${contentClassName}`]: !!contentClassName,
              adaptable: withAdaptableDimensions,
            })}
            style={{ ...(isDragging ? { pointerEvents: "none" } : {}) }}
            {...contentProps}
          >
            {length > itemsPerView && addExtraFirstAndLastView && isRepeating && extraPreviousItems}
            {children}
            {length > itemsPerView && addExtraFirstAndLastView && isRepeating && extraNextItems}
          </div>
        </div>
        {showArrowButtons && (isRepeating || currentIndex < length - itemsPerView) ? (
          <SBCarouselArrowButton
            buttonType={ARROW_BUTTON_TYPE.RIGHT_BUTTON}
            advanceCallback={advancePagesOnAutoScroll ? nextPage : nextItem}
            renderButton={renderNextButton}
          />
        ) : null}
      </div>
      {withIndicator && (
        <SBCarouselIndicators
          length={length + 1 - itemsPerView}
          currentIndex={currentIndex}
          indicatorContainerClassName={indicatorContainerClassName}
          indicatorContainerProps={indicatorContainerProps}
          indicatorClassNames={indicatorClassNames}
        />
      )}
    </div>
  );
};

export default SBCarousel;
