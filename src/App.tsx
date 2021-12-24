import React from "react";
import SBCarousel, { ISBCarouselProps } from "./components/SBCarousel/SBCarousel";

const NUMBER_OF_ITEMS = 40;

function App() {
  const elements: JSX.Element[] = [...Array(NUMBER_OF_ITEMS)].map(
    (_item, index) => (
      <button
        key={index}
        data-testid={`carousel-item-${index}`}
        onClick={() => document.location.reload()}
      >
        Element number {index}
      </button>
    )
  );

  const sbCarouselSettings: ISBCarouselProps = {
    children: elements,
    itemsPerView: 4,
    showArrowButtons: false,
    withIndicator: true,
  };

  return (
    <div className="App">
      <SBCarousel {...sbCarouselSettings} />
    </div>
  );
}

export default App;
