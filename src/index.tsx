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
  Fragment,
} from 'react';
import clsx from 'clsx';
import s from './styles.module.css';

/**
 * Time to miliseconds of change animation by card left value
 */
export const SWIPE_TRANSITION_TIMEOUT = 400;

/**
 * One of swipe card
 */
export interface Swipe {
  id: number | null;
  nextRef?: RefObject<HTMLButtonElement | HTMLDivElement | undefined>;
  closeRef?: RefObject<HTMLButtonElement | HTMLDivElement | undefined>;
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
   * invitation animation
   */
  // eslint-disable-next-line react/require-default-props
  invitationAnimation?: boolean;

  /**
   * On swipe callback
   */
  // eslint-disable-next-line react/require-default-props
  onSwipe?: (currentId: number | null | undefined) => void;

  /**
   * Auto slide if provieded
   */
  durationAnimation?: number;
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
  children: <div />,
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
    invitationAnimation,
    durationAnimation,
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
  const [load, setLoad] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);

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
  const setGoClassHandler = (): void => {
    getRef(next?.id || 0).current?.classList.add(s.go);
    getRef(prev?.id || 0).current?.classList.add(s.go);
    getRef(current?.id || 0).current?.classList.add(s.go);
    setTimeout(() => {
      getRef(next?.id || 0).current?.classList.remove(s.go);
      getRef(prev?.id || 0).current?.classList.remove(s.go);
      getRef(current?.id || 0).current?.classList.remove(s.go);
    }, SWIPE_TRANSITION_TIMEOUT);
  };

  /**
   * Set to cards classes for out animation
   */
  const setBackClassHandler = (): void => {
    getRef(next?.id || 0).current?.classList.add(s.back);
    getRef(prev?.id || 0).current?.classList.add(s.back);
    getRef(current?.id || 0).current?.classList.add(s.back);
    setTimeout(() => {
      getRef(next?.id || 0).current?.classList.remove(s.back);
      getRef(prev?.id || 0).current?.classList.remove(s.back);
      getRef(current?.id || 0).current?.classList.remove(s.back);
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
    setLoad(true);
    let startTime: number;
    let currentId: number | null | undefined = 0;
    if (Math.abs(_lastLeft) > width / 3) {
      if (_lastLeft < 0) {
        if (next?.id === null) {
          setBackClassHandler();
          setLeft(0);
          setLoad(false);
          return 1;
        }
        currentId = next?.id;
        if (onSwipe !== undefined) {
          onSwipe(currentId);
        }
        setGoClassHandler();
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
        setNext(postNext);
      } else {
        if (prev?.id === null) {
          setBackClassHandler();
          setLeft(0);
          setLoad(false);
          return 1;
        }
        currentId = prev?.id;
        if (onSwipe !== undefined) {
          onSwipe(currentId);
        }
        setGoClassHandler();
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
        setNext(current);
      }
    } else {
      setBackClassHandler();
      setLeft(0);
      setLoad(false);
      return 1;
    }
    setLoad(false);
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
        lastLeft = _left;
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
  const clickHandler = (origin: 'next' | 'prev'): (() => Promise<1 | 0>) => {
    const isNext = origin === 'next';
    return async (): Promise<1 | 0> => {
      const coeff = isNext ? -1 : 1;
      const leftVal = width * coeff;
      if (isNext) {
        setGoClassHandler();
      } else {
        setBackClassHandler();
      }
      await wait(SWIPE_TRANSITION_TIMEOUT);
      await swipe(leftVal);
      return 0;
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

  /**
   * optional animation handler
   */
  const infitationAnimationHandler = async (shift: number) => {
    if (shift < 0) {
      setGoClassHandler();
    } else {
      setBackClassHandler();
    }
    setLeft(shift);
    await wait(SWIPE_TRANSITION_TIMEOUT);
    if (shift < 0) {
      setBackClassHandler();
    } else {
      setGoClassHandler();
    }
    setLeft(0);
    await wait(SWIPE_TRANSITION_TIMEOUT);
  };

  useEffect(() => {
    let clearAnimate: NodeJS.Timeout;
    if (durationAnimation) {
      clearAnimate = setInterval(() => {
        clickNextHandler();
      }, durationAnimation);
    }

    const _width = containerRef?.current?.parentElement?.getBoundingClientRect()?.width;
    const _height = containerRef?.current?.parentElement?.getBoundingClientRect()?.height;
    const __left = containerRef?.current?.parentElement?.getBoundingClientRect()?.left;

    const _windowWidth = document.body.clientWidth;
    const buttonNext = current?.nextRef?.current;
    const buttonClose = current?.closeRef?.current;
    buttonNext?.addEventListener('click', clickNextHandler);
    buttonClose?.addEventListener('click', clickNextHandler);
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
        prePrev = await getPrev(_p.id || 0);
        postNext = await getNext(_n.id || 0);
        // setPreValues(_p, _n);
        _defaultCurrent = defaultCurrent;
        setLoad(false);
      })();
    }
    // run invitation animation
    if (invitationAnimation && width && !animated) {
      if (prev && next) {
        animated = true;
        (async (): Promise<void> => {
          if (prev.id) {
            await infitationAnimationHandler(windowWidth / 5.5);
          }
          if (next.id) {
            await infitationAnimationHandler((windowWidth / 5.5) * -1);
          }
        })();
      }
    }
    // set is mobile
    if (typeof isMobile === 'undefined') {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
      // @ts-ignore
      setIsMobile('ontouchstart' in window || typeof navigator?.msMaxTouchPoints !== 'undefined');
    }
    setPreValues(prev, next);
    window.addEventListener('resize', resizeHandler);
    return (): void => {
      if (clearAnimate) {
        clearInterval(clearAnimate);
      }
      window.removeEventListener('resize', resizeHandler);
      buttonNext?.removeEventListener('click', clickNextHandler);
      buttonClose?.removeEventListener('click', clickNextHandler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [next, defaultCurrent]);
  return (
    <div className={s.container} ref={containerRef}>
      {/** absolute position cards */}
      {swipes.map((item) => (
        <Fragment key={item.id}>
          {item.id !== null && item.children !== null && width && (
            <div
              onTouchMove={onTouchWrapper('onTouchMove')}
              onTouchStart={onTouchWrapper('onTouchStart')}
              onTouchEnd={onTouchWrapper('onTouchEnd')}
              id={item.id?.toString()}
              style={
                item.type === 'current'
                  ? { width, height, left }
                  : item.type === 'prev'
                  ? { width, height, left: left - window.innerWidth }
                  : { width, height, left: left + window.innerWidth }
              }
              className={clsx(
                s.card,
                item.type === 'prev' ? s.prev : item.type === 'next' ? s.next : ''
              )}
              ref={getRef(item.id)}
            >
              {/** Block of content */}
              <div className={clsx(s.content, className)}>{item.children}</div>
            </div>
          )}
          {item.id === null && (
            <div
              style={
                item.type === 'current'
                  ? { width, height, left }
                  : item.type === 'prev'
                  ? { width, height, left: left - windowWidth }
                  : { width, height, left: left + windowWidth }
              }
              className={clsx(
                s.card,
                item.type === 'prev' ? s.prev : item.type === 'next' ? s.next : ''
              )}
            >
              <button disabled={true}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="currentColor"
                  viewBox="0 0 16 16"
                >
                  <path d="M5 3.5h6A1.5 1.5 0 0 1 12.5 5v6a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 11V5A1.5 1.5 0 0 1 5 3.5z" />
                </svg>
              </button>
            </div>
          )}
        </Fragment>
      ))}
      {typeof isMobile !== 'undefined' && !isMobile && prev?.id !== null && (
        <div className={clsx(s.button, s.button__prev)}>
          <button
            className={s.icon__button}
            type="button"
            disabled={load || isMobile}
            onClick={clickPrevHandler}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="24px"
              viewBox="0 0 24 24"
              width="24px"
              fill="#000000"
            >
              <path d="M0 0h24v24H0V0z" fill="none" />
              <path d="M10.02 6L8.61 7.41 13.19 12l-4.58 4.59L10.02 18l6-6-6-6z" />
            </svg>
          </button>
        </div>
      )}
      {typeof isMobile !== 'undefined' && !isMobile && next?.id !== null && (
        <div className={clsx(s.button, s.button__next)}>
          <button
            className={s.icon__button}
            type="button"
            disabled={load || isMobile}
            onClick={clickNextHandler}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="24px"
              viewBox="0 0 24 24"
              width="24px"
              fill="#000000"
            >
              <path d="M0 0h24v24H0V0z" fill="none" />
              <path d="M10.02 6L8.61 7.41 13.19 12l-4.58 4.59L10.02 18l6-6-6-6z" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

Swiper.defaultProps = {
  className: '',
};
