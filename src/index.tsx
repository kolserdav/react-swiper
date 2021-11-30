/******************************************************************************************
 * Repository: https://github.com/kolserdav/swiper.git
 * Author: Sergey Kolmiller
 * Email: <serega12101983@gmail.com>
 * License: MIT
 * License Text: The code is distributed as is. There are no guarantees regarding the functionality of the code or parts of it.
 * Copyright: kolserdav, All rights reserved (c)
 * Create date: Mon Nov 29 2021 16:18:08 GMT+0700 (Krasnoyarsk Standard Time)
 ******************************************************************************************/
import React, {
  useMemo,
  useState,
  useRef,
  createRef,
  RefObject,
  useEffect,
  TouchEvent,
} from 'react';
import { IconButton } from '@mui/material';
import clsx from 'clsx';
import StopIcon from '@mui/icons-material/StopScreenShare';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import styles from './index.module.css';

/**
 * Time to miliseconds of change animation by card left value
 */
export const SWIPE_TRANSITION_TIMEOUT = 400;

/**
 * One of swipe card
 */
export interface Swipe {
  id: number | null;
  children: React.ReactElement | React.ReactElement[];
}

/**
 * Callback for get next or previous card content
 */
export type GetSwipeHandler = (oldId: number) => Promise<Swipe>;

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

/**
 * Create swipe list from values
 */
const getSwipes = (prev: Swipe, current: Swipe, next: Swipe, swipes: SwipeFull[]): SwipeFull[] => {
  if (
    (prev?.id === current?.id || current?.id === next?.id || next?.id === prev?.id) &&
    swipes.length
  ) {
    return swipes;
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result: any[] = [1, 2, 3].map((id) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const item: any = id === 1 ? { ...prev } : id === 2 ? current : { ...next };
    item.type = id === 1 ? 'prev' : id === 2 ? 'current' : 'next';
    return item;
  });
  return result;
};

/**
 * Get default swipe with random id
 */
const getDefaultSwipe = (): Swipe => ({
  id: Math.ceil(Math.random() * 1000),
  children: <div></div>,
});

const refs: {
  [key: number]: RefObject<HTMLDivElement>;
} = {};

let startClientX: number;
let lastLeft: number;
let animated = false;
let prePrev: Swipe | null = null;
let postNext: Swipe | null = null;
let _defaultCurrent: Swipe;
let oldSwipes: SwipeFull[] = [];

/**
 * Swiper component
 */
export const Swiper = (props: SwiperProps): React.ReactElement => {
  const {
    defaultCurrent,
    getNext,
    getPrev,
    onSwipe,
    className,
    prevButtonRef,
    nextButtonRef,
    invitationAnimation,
  } = props;

  const [current, setCurrent] = useState<Swipe | null>();
  const [prev, setPrev] = useState<Swipe | null>();
  const [next, setNext] = useState<Swipe | null>();
  const [windowWidth, setWindowWidth] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);
  const [width, setWidth] = useState<number>(0);
  const [_left, _setLeft] = useState<number>(0);
  const [left, setLeft] = useState<number>(0);
  const [isMobile, setIsMobile] = useState<boolean>();

  const containerRef = useRef<HTMLDivElement>(null);
  const _buttonPrevRef = useRef<HTMLDivElement>(null);
  const _buttonNextRef = useRef<HTMLDivElement>(null);

  if (typeof _defaultCurrent === 'undefined') {
    _defaultCurrent = defaultCurrent;
  }
  /**
   * Create memoized swipes
   */
  const swipes = useMemo(
    () =>
      getSwipes(
        prev || getDefaultSwipe(),
        current || defaultCurrent,
        next || getDefaultSwipe(),
        oldSwipes
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [next, prev, current]
  );

  oldSwipes = swipes;

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
    getRef(next?.id || 0).current?.classList.add(styles.go);
    getRef(prev?.id || 0).current?.classList.add(styles.go);
    getRef(current?.id || 0).current?.classList.add(styles.go);
    setTimeout(() => {
      getRef(next?.id || 0).current?.classList.remove(styles.go);
      getRef(prev?.id || 0).current?.classList.remove(styles.go);
      getRef(current?.id || 0).current?.classList.remove(styles.go);
    }, SWIPE_TRANSITION_TIMEOUT);
  };

  /**
   * Set to cards classes for out animation
   */
  const setBackClass = (): void => {
    getRef(next?.id || 0).current?.classList.add(styles.back);
    getRef(prev?.id || 0).current?.classList.add(styles.back);
    getRef(current?.id || 0).current?.classList.add(styles.back);
    setTimeout(() => {
      getRef(next?.id || 0).current?.classList.remove(styles.back);
      getRef(prev?.id || 0).current?.classList.remove(styles.back);
      getRef(current?.id || 0).current?.classList.remove(styles.back);
    }, SWIPE_TRANSITION_TIMEOUT);
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
   * Set pre previos or post next values
   */
  const setPreValues = (_p: Swipe | null | undefined, _n: Swipe | null | undefined) => {
    if (_p) {
      getPrev(_p?.id || 0).then((d) => {
        prePrev = d;
      });
    }
    if (_n) {
      getNext(_n?.id || 0).then((d) => {
        postNext = d;
      });
    }
  };

  /**
   * Run swipe animation
   */
  const swipe = async (_lastLeft: number): Promise<1 | 0> => {
    let startTime: number;
    let currentId = 0;
    if (Math.abs(_lastLeft) > width / 3) {
      if (_lastLeft < 0) {
        if (!next?.id) {
          setBackClass();
          setLeft(0);
          return 1;
        }
        setGoClass();
        setLeft(windowWidth * -1);
        startTime = new Date().getTime();
        if (next?.id === postNext?.id) {
          await new Promise((resolve) => {
            const clear = setInterval(() => {
              if (next?.id !== postNext?.id) {
                clearInterval(clear);
                resolve(0);
              }
            }, 0);
          });
        }
        await wait(SWIPE_TRANSITION_TIMEOUT - (new Date().getTime() - startTime));
        setLeft(0);
        setPrev(current);
        setCurrent(next);
        currentId = next?.id;
        setNext(postNext);
      } else {
        if (!prev?.id) {
          setBackClass();
          setLeft(0);
          return 1;
        }
        setGoClass();
        setLeft(windowWidth);
        startTime = new Date().getTime();
        if (prev?.id === prePrev?.id) {
          await new Promise((resolve) => {
            const clear = setInterval(() => {
              if (prev?.id !== prePrev?.id) {
                clearInterval(clear);
                resolve(0);
              }
            }, 0);
          });
        }
        await wait(SWIPE_TRANSITION_TIMEOUT - (new Date().getTime() - startTime));
        setLeft(0);
        setPrev(prePrev);
        setCurrent(prev);
        currentId = prev?.id;
        setNext(current);
      }
    } else {
      setBackClass();
      setLeft(0);
      return 1;
    }
    if (onSwipe !== undefined) {
      onSwipe(currentId);
    }
    return 0;
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
      await wait(SWIPE_TRANSITION_TIMEOUT / 2);
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

  const infitationAnimationHandler = async (shift: number) => {
    if (shift < 0) {
      setGoClass();
    } else {
      setBackClass();
    }
    setLeft(shift);
    await wait(SWIPE_TRANSITION_TIMEOUT);
    if (shift < 0) {
      setBackClass();
    } else {
      setGoClass();
    }
    setLeft(0);
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
    if (!current || !prev || !next || _defaultCurrent !== defaultCurrent) {
      (async (): Promise<void> => {
        const _n = await getNext(defaultCurrent.id || 0);
        const _p = await getPrev(defaultCurrent.id || 0);
        setCurrent(defaultCurrent);
        setPrev(_p);
        setNext(_n);
        setLeft(_left);
        prePrev = await getPrev(_p.id || 0);
        postNext = await getNext(_n.id || 0);
        // setPreValues(_p, _n);
        _defaultCurrent = defaultCurrent;
      })();
    }
    // run invitation animation
    if (invitationAnimation && width && !animated) {
      animated = true;
      (async (): Promise<void> => {
        if (prev?.id) {
          await infitationAnimationHandler(100);
        }
        if (next?.id) {
          await infitationAnimationHandler(-100);
        }
      })();
    }
    // set is mobile
    if (typeof isMobile === 'undefined') {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      setIsMobile('ontouchstart' in window || typeof navigator.msMaxTouchPoints !== 'undefined');
    }
    setPreValues(prev, next);
    prevButton?.addEventListener('click', clickPrevHandler);
    nextButton?.addEventListener('click', clickNextHandler);
    window.addEventListener('resize', resizeHandler);
    return (): void => {
      prevButton?.removeEventListener('click', clickPrevHandler);
      nextButton?.removeEventListener('click', clickNextHandler);
      window.removeEventListener('resize', resizeHandler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [next, defaultCurrent]);

  return (
    <div className={styles.container} ref={containerRef}>
      {/** absolute position cards */}
      {swipes.map((item) => (
        <div key={item.id}>
          <React.Fragment>
            {item.id && width && (
              <div
                onTouchMove={onTouchWrapper('onTouchMove')}
                onTouchStart={onTouchWrapper('onTouchStart')}
                onTouchEnd={onTouchWrapper('onTouchEnd')}
                id={item.id?.toString()}
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
            )}
            {!item.id && (
              <div
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
              >
                <IconButton disabled={true}>
                  <StopIcon />
                </IconButton>
              </div>
            )}
          </React.Fragment>
        </div>
      ))}
      {typeof isMobile !== 'undefined' && !isMobile && !prevButtonRef && prev?.id && (
        <div className={clsx(styles.button, styles.button_prev)} ref={_buttonPrevRef}>
          <IconButton>
            <NavigateNextIcon />
          </IconButton>
        </div>
      )}
      {typeof isMobile !== 'undefined' && !isMobile && !nextButtonRef && next?.id && (
        <div className={clsx(styles.button, styles.button_next)} ref={_buttonNextRef}>
          <IconButton>
            <NavigateNextIcon />
          </IconButton>
        </div>
      )}
    </div>
  );
};

Swiper.defaultProps = {
  className: '',
};
