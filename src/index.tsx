import React, {
  useMemo,
  useState,
  useRef,
  createRef,
  RefObject,
  useEffect,
  TouchEvent,
} from 'react';
import clsx from 'clsx';
import styles from './index.module.css';
import { ReactComponent as NextIcon } from './icons/navigate_next_black_24dp.svg';
import { ReactComponent as NextBigIcon } from './icons/navigate_next_black_48dp.svg';

const ANIMATION_TIMEOUT = 400;

/**
 * One of swipe card
 */
export interface Swipe {
  id: number;
  children: React.ReactElement | React.ReactElement[] | null;
}

/**
 * Callback for get next or previous card content
 */
export type GetSwipeHandler = (oldId: number) => Swipe | null | Promise<Swipe | null>;

/**
 * One of swipe card internal
 */
interface SwipeFull extends Swipe {
  type: 'next' | 'current' | 'prev';
}

/**
 * Event touch name
 */
type TouchName = 'onTouchMove' | 'onTouchStart' | 'onTouchEnd';

/**
 * Props of Swiper component
 */
interface SwiperProps {
  /**
   * Current card content
   */
  current: Swipe;

  /**
   * Next card content
   */
  next: Swipe;

  /**
   * Previous card content
   */
  prev: Swipe;

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
}

/**
 * Create swipe list from values
 */
const getSwipes = (__prev: Swipe, __current: Swipe, __next: Swipe): SwipeFull[] => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result: any[] = [1, 2, 3].map((id) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const item: any = id === 1 ? { ...__prev } : id === 2 ? { ...__current } : { ...__next };
    item.type = id === 1 ? 'prev' : id === 2 ? 'current' : 'next';
    return item;
  });
  return result;
};

const refs: {
  [key: number]: RefObject<HTMLDivElement>;
} = {};

let startClientX: number;
let lastLeft: number;

/**
 * Swiper component
 */
const Swiper = (props: SwiperProps): React.ReactElement => {
  const { current, next, prev, getNext, getPrev, className, prevButtonRef, nextButtonRef } = props;

  const [_current, setCurrent] = useState<Swipe | null>();
  const [_prev, setPrev] = useState<Swipe | null>();
  const [_next, setNext] = useState<Swipe | null>();
  const [windowWidth, setWindowWidth] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);
  const [width, setWidth] = useState<number>(0);
  const [_left, _setLeft] = useState<number>(0);
  const [left, setLeft] = useState<number>(0);
  const [isMobile, setIsMobile] = useState<boolean>();

  const containerRef = useRef<HTMLDivElement>(null);
  const _buttonPrevRef = useRef<HTMLDivElement>(null);
  const _buttonNextRef = useRef<HTMLDivElement>(null);

  /**
   * Create memoized swipes
   */
  const swipes = useMemo(
    () => getSwipes(_prev || prev, _current || current, _next || next),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [_next]
  );

  /**
   * Get new or exists ref by id
   */
  const getRef = (id: number): typeof refs[0] => {
    refs[id] = refs[id] ? refs[id] : createRef<HTMLDivElement>();
    return refs[id];
  };

  /**
   * Set to cards classes for in animation
   */
  const setGoClass = (): void => {
    getRef(_next?.id || 0).current?.classList.add(styles.go);
    getRef(_prev?.id || 0).current?.classList.add(styles.go);
    getRef(_current?.id || 0).current?.classList.add(styles.go);
    setTimeout(() => {
      getRef(_next?.id || 0).current?.classList.remove(styles.go);
      getRef(_prev?.id || 0).current?.classList.remove(styles.go);
      getRef(_current?.id || 0).current?.classList.remove(styles.go);
    }, ANIMATION_TIMEOUT);
  };

  /**
   * Set to cards classes for out animation
   */
  const setBackClass = (): void => {
    getRef(_next?.id || 0).current?.classList.add(styles.back);
    getRef(_prev?.id || 0).current?.classList.add(styles.back);
    getRef(_current?.id || 0).current?.classList.add(styles.back);
    setLeft(0);
    setTimeout(() => {
      getRef(_next?.id || 0).current?.classList.remove(styles.back);
      getRef(_prev?.id || 0).current?.classList.remove(styles.back);
      getRef(_current?.id || 0).current?.classList.remove(styles.back);
    }, ANIMATION_TIMEOUT);
  };

  /**
   * Run swipe animation
   */
  const swipe = async (_lastLeft: number): Promise<void> => {
    if (Math.abs(_lastLeft) > width / 3) {
      setLeft(0);
      if (_lastLeft < 0) {
        setPrev(_current);
        setCurrent(_next);
        setNext(await getNext(_next?.id || 0));
      } else {
        setPrev(await getPrev(_prev?.id || 0));
        setCurrent(_prev);
        setNext(_current);
      }
      setGoClass();
    } else {
      setBackClass();
    }
  };

  /**
   * Touch event handler
   */
  const onTouchHandler = async (name: TouchName, e: TouchEvent): Promise<void> => {
    const { touches } = e;
    const clientX = touches[0]?.clientX;
    startClientX = startClientX || 0;
    switch (name) {
      case 'onTouchStart':
        startClientX = clientX;
        break;
      case 'onTouchMove':
        lastLeft = _left - (startClientX - clientX);
        setLeft(lastLeft);
        break;
      case 'onTouchEnd':
        await swipe(lastLeft);
        break;
      default:
    }
  };

  /**
   * Wait helper
   */
  const wait = async (miliseconds: number): Promise<void> => {
    await new Promise((resolve) => {
      setTimeout(() => {
        resolve(0);
      }, miliseconds);
    });
  };

  /**
   * Touch event wrapper
   */
  const onTouchWrapper =
    (name: TouchName): ((event: TouchEvent<HTMLDivElement>) => void) =>
    (e): void => {
      onTouchHandler(name, e);
    };

  /**
   * On next or previous button click handler
   */
  const clickHandler = (origin: 'next' | 'prev'): (() => Promise<void>) => {
    const isNext = origin === 'next';
    return async (): Promise<void> => {
      const coeff = isNext ? -1 : 1;
      const leftVal = width * coeff;
      if (isNext) {
        setGoClass();
      } else {
        setBackClass();
      }
      setLeft(leftVal);
      await wait(ANIMATION_TIMEOUT / 2);
      await swipe(leftVal);
    };
  };

  /**
   * Wrapper for next button click handler
   */
  const clickNextHandler = clickHandler('next');

  /**
   * Wrapper for previous button click handler
   */
  const clickPrevHandler = clickHandler('prev');

  const resizeHandler = (): void => {
    const _width = containerRef?.current?.parentElement?.getBoundingClientRect()?.width;
    const _height = containerRef?.current?.parentElement?.getBoundingClientRect()?.height;
    const __left = containerRef?.current?.parentElement?.getBoundingClientRect()?.left;
    const _windowWidth = document.body.clientWidth;
    if (_width && _height) {
      console.log(_width);
      setWidth(_width);
      setHeight(_height);
    }
    if (__left) {
      setLeft(__left);
    }
    if (_windowWidth) {
      setWindowWidth(_windowWidth);
    }
  };

  useEffect(() => {
    const _width = containerRef?.current?.parentElement?.getBoundingClientRect()?.width;
    const _height = containerRef?.current?.parentElement?.getBoundingClientRect()?.height;
    const __left = containerRef?.current?.parentElement?.getBoundingClientRect()?.left;
    const prevButton = prevButtonRef ? prevButtonRef?.current : _buttonPrevRef.current;
    const nextButton = nextButtonRef ? nextButtonRef?.current : _buttonNextRef.current;
    const _windowWidth = document.body.clientWidth;
    if (_width && !width && _height && !height) {
      setWidth(_width);
      setHeight(_height);
    }
    // save container left
    if (__left && !left) {
      _setLeft(__left);
    }
    // save window width
    if (!windowWidth && _windowWidth) {
      setWindowWidth(_windowWidth);
    }
    // set start cards
    if (!_current || !_prev || !_next) {
      setCurrent(current);
      setNext(next);
      setPrev(prev);
    }
    // set is mobile
    if (typeof isMobile === 'undefined') {
      setIsMobile('ontouchstart' in window || typeof navigator.msMaxTouchPoints !== 'undefined');
    }
    prevButton?.addEventListener('click', clickPrevHandler);
    nextButton?.addEventListener('click', clickNextHandler);
    window.addEventListener('resize', resizeHandler);
    return (): void => {
      prevButton?.removeEventListener('click', clickPrevHandler);
      nextButton?.removeEventListener('click', clickNextHandler);
      window.removeEventListener('resize', resizeHandler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [_next]);

  return (
    <div className={styles.container} ref={containerRef}>
      {/** absolute position cards */}
      {swipes.map((item) => (
        <div
          onTouchMove={onTouchWrapper('onTouchMove')}
          onTouchStart={onTouchWrapper('onTouchStart')}
          onTouchEnd={onTouchWrapper('onTouchEnd')}
          key={item.id}
          id={item.id.toString()}
          style={
            item.type === 'current'
              ? { width, height, left }
              : item.type === 'prev'
              ? { width, height, left: left - windowWidth }
              : { width, height, left: left + windowWidth }
          }
          className={clsx(
            styles.card,
            item.type === 'prev' ? styles.prev : item.type === 'next' ? styles.next : ''
          )}
          ref={getRef(item.id)}
        >
          {/** Block of content */}
          <div className={clsx(styles.content, className)}>{item.children}</div>
        </div>
      ))}
      {!isMobile && !prevButtonRef && (
        <div className={clsx(styles.button, styles.button_prev)} ref={_buttonPrevRef}>
          {windowWidth < 3000 ? <NextIcon /> : <NextBigIcon />}
        </div>
      )}
      {!isMobile && !nextButtonRef && (
        <div className={clsx(styles.button, styles.button_next)} ref={_buttonNextRef}>
          {windowWidth < 3000 ? <NextIcon /> : <NextBigIcon />}
        </div>
      )}
    </div>
  );
};

Swiper.defaultProps = {
  className: '',
};

export default Swiper;
