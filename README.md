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
import { Swiper, GetSwipeHandler, Swipe } from '@kolserdav/swiper';
import '@kolserdav/swiper/dist/styles.css';

const COUNT = 4;

const getNext: GetSwipeHandler = async (old) => {
  let id = old + 1;
  id = id <= COUNT ? id : 0;
  return {
    id,
    children: <h1>Test {id}</h1>,
  };
};

const getPrevios: GetSwipeHandler = async (old) => {
  let id = old - 1;
  id = id >= 0 ? id : COUNT;
  return {
    id,
    children: <h1>Test {id}</h1>,
  };
};

const App = (): React.ReactElement => {
  const [current, setCurrent] = useState<Swipe>();
  useEffect(() => {
    if (!current) {
      (async () => {
        setCurrent(await getNext(0));
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
          durationAnimation={1000}
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
   * invitation animation
   */
  invitationAnimation?: boolean;

  /**
   * On swipe callback
   */
  onSwipe?: (currentId: number) => void;

  /**
   * Auto slide if provieded
   */
  durationAnimation?: number;

  /**
   * Blocked swipe event
   */
  blockSwipe?: boolean;

  /**
   * Show dots
   */
  dots?: {
    inactive: boolean;
    list: number[];
    active: number;
  };

  /**
   * Makes dark colors as light
   */
  darkTheme?: boolean;

  /**
   * Component height
   */
  height?: number;
}
```

## License

MIT © [kolserdav](https://github.com/kolserdav)
