# swiper

> Simple and powerfull dynamic react swiper component

[![NPM](https://img.shields.io/npm/v/swiper.svg)](https://www.npmjs.com/package/swiper) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Install

```bash
npm install --save @kolserdav/swiper
```

## Usage

```tsx
import React, { useState, useEffect } from 'react';
import { Swiper, GetSwipeHandler, Swipe } from 'swiper';
import 'swiper/dist/index.css';

const getNext: GetSwipeHandler = async (old) => {
  const id = old + 1;
  return {
    id: id < 7 ? id : null,
    children: id < 7 ? <h1>Test {id}</h1> : <div></div>,
  };
};

const getPrevios: GetSwipeHandler = async (old) => {
  const id = old - 1;
  return {
    id: id > 0 ? id : null,
    children: id > 0 ? <h1>Test {id}</h1> : <div></div>,
  };
};

const App = (): React.ReactElement => {
  const [current, setCurrent] = useState<Swipe>();

  useEffect(() => {
    if (!current) {
      (async () => {
        setCurrent(await getNext(1));
      })();
    }
  }, []);
  return (
    <div>
      {current && (
        <Swiper
          defaultCurrent={current}
          getNext={getNext}
          getPrev={getPrevios}
          invitationAnimation={true}
        />
      )}
    </div>
  );
};

export default App;
```

## Properties

```tsx
interface SwiperProps {
  /**
   * Current card content
   */
  defaultCurrent: Swipe;

  /**
   * Get next card handler
   */
  getNext: GetSwipeHandler;

  /**
   * Get previous card handler
   */
  getPrev: GetSwipeHandler;

  /**
   * Class name for content block
   */
  className?: string;

  /**
   * Button for swipe to next
   */
  nextButtonRef?: RefObject<HTMLButtonElement | HTMLDivElement | undefined>;

  /**
   * Button for swipe to previous
   */
  prevButtonRef?: RefObject<HTMLButtonElement | HTMLDivElement | undefined>;

  /**
   * invitation animation
   */
  invitationAnimation?: boolean;

  /**
   * On swipe callback
   */
  onSwipe?: (currentId: number) => void;
}
```

## License

MIT © [kolserdav](https://github.com/kolserdav)
