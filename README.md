# swiper

> Simple and powerfull react swiper component

[![NPM](https://img.shields.io/npm/v/swiper.svg)](https://www.npmjs.com/package/swiper) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Install

```bash
npm install --save @kolserdav/swiper
```

## Usage

```tsx
import React from 'react';
import { Swiper, GetSwipeHandler } from 'swiper';
import 'swiper/dist/index.css';

const getNext: GetSwipeHandler = (old) => {
  const id = old + 1;
  return {
    id,
    children: id < 5 ? <h1>Test {id}</h1> : null,
  };
};

const getPrevious: GetSwipeHandler = (old) => {
  const id = old - 1;
  return {
    id,
    children: id > 0 ? <h1>Test {id}</h1> : null,
  };
};

/**
 * Typescript syntetic method
 * */
const _getNext = (id: number): Swipe => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const res: any = getNext(id);
  return res;
};

const App = (): React.ReactElement => {
  return (
    <div>
      <Swiper defaultCurrent={_getNext(0)} getNext={getNext} getPrev={getPrevious} />
    </div>
  );
};

export default App;
```

## Additional properties

```tsx
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
```

## License

MIT © [kolserdav](https://github.com/kolserdav)
