import React, { FC } from "react";

import "./SBCarouselArrowButton.scss";

export enum ARROW_BUTTON_TYPE {
  LEFT_BUTTON = 0,
  RIGHT_BUTTON = 1,
}

export interface ISBCarouselArrowButtonProps {
  /**
   * Indicate the type of button to be rendered
   * @values BUTTON_TYPE.LEFT_BUTTON | BUTTON_TYPE.RIGHT_BUTTON
   * @required
   */
  buttonType: ARROW_BUTTON_TYPE;

  /**
   * Callback to advance on click
   * @required
   */
  advanceCallback: () => void;

  /**
   * Render custom button
   * @param advanceItem function to navigate to the next item
   * @param defaultClass default class for the button, it contain styles to position the button correctly. (not the arrow icon)
   * @example
   * <SBCarousel
   *   renderButton={(advanceItem, defaultClass) => (
   *     <button onClick={advanceItem} className={defaultClass}>
   *       advance
   *     </button>
   *   )}
   * >
   *   ...
   * </SBCarousel>
   */
  renderButton?: (advanceItem: () => void, defaultClass?: string) => JSX.Element;
}

const SBCarouselArrowButton: FC<ISBCarouselArrowButtonProps> = ({
  buttonType,
  advanceCallback,
  renderButton,
}: ISBCarouselArrowButtonProps): JSX.Element => {
  let buttonStyle: string, arrowStyle: string;

  switch (buttonType) {
    case ARROW_BUTTON_TYPE.LEFT_BUTTON:
      buttonStyle = "left-arrow-button";
      arrowStyle = "left-arrow";
      break;
    case ARROW_BUTTON_TYPE.RIGHT_BUTTON:
      buttonStyle = "right-arrow-button";
      arrowStyle = "right-arrow";
      break;
  }

  return renderButton ? (
    renderButton(advanceCallback, buttonStyle)
  ) : (
    <button onClick={advanceCallback} className={buttonStyle}>
      <span className={arrowStyle} />
    </button>
  );
};

export default SBCarouselArrowButton;
