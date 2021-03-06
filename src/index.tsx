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
  MouseEventHandler,
} from 'react';
import clsx from 'clsx';
import s from './styles.module.css';

/**
 * Time to miliseconds of change animation by card left value
 */
export const SWIPE_TRANSITION_TIMEOUT = 400;

/**
 * Minimum swipe speed regardless of distance
 */
export const SWIPE_ON_EVENT_SPEED = 0.7;

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

  /**
   * Blocked swipe event
   */
  blockSwipe?: boolean;

  /**
   * Show dots
   */
  dots?: {
    list: number[];
    active: number;
  };
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
let startClientY: number;
let lastLeft: number;
let animated = false;
let prePrev: Swipe | null = null;
let postNext: Swipe | null = null;
let _defaultCurrent: Swipe;
let oldSwipes: SwipeFull[] = [];
let startTime = new Date().getTime();

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
    blockSwipe,
    dots,
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
  const setGoClassHandler = (_next?: Swipe, _prev?: Swipe): void => {
    getRef(_next?.id || next?.id || 0).current?.classList.add(s.go);
    getRef(_prev?.id || prev?.id || 0).current?.classList.add(s.go);
    getRef(current?.id || 0).current?.classList.add(s.go);
    setTimeout(() => {
      getRef(_next?.id || next?.id || 0).current?.classList.remove(s.go);
      getRef(_prev?.id || prev?.id || 0).current?.classList.remove(s.go);
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
  const setPreValues = (_p: Swipe | null | undefined, _n: Swipe | null | undefined): void => {
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
  const swipe = async ({
    _lastLeft,
    _next,
    _prev,
    speed,
  }: {
    _lastLeft: number;
    _next?: Swipe;
    _prev?: Swipe;
    speed?: number;
  }): Promise<1 | 0> => {
    setLoad(true);
    let startTime: number;
    let currentId: number | null | undefined = 0;
    if (Math.abs(_lastLeft) > width / 3 || (speed !== undefined && speed > SWIPE_ON_EVENT_SPEED)) {
      if (_lastLeft < 0) {
        if (next?.id === null) {
          setBackClassHandler();
          setLeft(0);
          setLoad(false);
          return 1;
        }
        currentId = _next?.id || next?.id;
        if (onSwipe !== undefined) {
          onSwipe(currentId);
        }
        setGoClassHandler(_next);
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
        setCurrent(_next || next);
        setNext(postNext);
      } else {
        if (prev?.id === null) {
          setBackClassHandler();
          setLeft(0);
          setLoad(false);
          return 1;
        }
        currentId = _prev?.id || prev?.id;
        if (onSwipe !== undefined) {
          onSwipe(currentId);
        }
        setGoClassHandler(undefined, _prev);
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
        setCurrent(_prev || prev);
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
    const clientY = touches[0]?.clientY;
    startClientX = startClientX || 0;
    startClientY = startClientY || 0;
    let absX = 0;
    let absY = 0;
    switch (name) {
      case 'onTouchStart':
        startClientX = clientX;
        startClientY = clientY;
        lastLeft = _left;
        startTime = new Date().getTime();
        break;
      case 'onTouchMove':
        if (!blockSwipe) {
          absY = Math.abs(startClientY - clientY);
          absX = Math.abs(startClientX - clientX);
          if (absX > absY) {
            lastLeft = _left - (startClientX - clientX);
            setLeft(lastLeft);
          }
        }
        break;
      case 'onTouchEnd':
        if (!blockSwipe) {
          await swipe({
            _lastLeft: lastLeft,
            speed: Math.abs(lastLeft / (new Date().getTime() - startTime)),
          });
        }
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
      await swipe({
        _lastLeft: leftVal,
      });
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
  const infitationAnimationHandler = async (shift: number): Promise<void> => {
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

  /**
   * Initial start cards
   */
  const setStartCards = async (): Promise<void> => {
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
  };

  /**
   * Invitation animation
   */
  const startInvitationAnimation = async (prev: Swipe, next: Swipe): Promise<void> => {
    if (prev.id) {
      await infitationAnimationHandler(windowWidth / 5.5);
    }
    if (next.id) {
      await infitationAnimationHandler((windowWidth / 5.5) * -1);
    }
  };

  /**
   * Handler on click by dot
   */
  const clickDotHandler: MouseEventHandler<HTMLDivElement> = async (e: any) => {
    const { target } = e;
    const tabindex = target?.getAttribute('tabindex');
    const active = parseInt(tabindex, 10);
    const currId = current?.id || 0;
    if (currId < active) {
      const next = await getNext(active - 1);
      setNext(next);
      const prev = await getPrev(next?.id || 0);
      await swipe({ _lastLeft: -1000, _prev: prev, _next: next });
      postNext = await getNext(next?.id || 0);
      prePrev = await getPrev(prev?.id || 0);
      setPrev(prev);
    } else {
      const prev = await getPrev(active + 1);
      setPrev(prev);
      const next = await getNext(prev?.id || 0);
      await swipe({ _lastLeft: 1000, _prev: prev, _next: next });
      postNext = await getNext(next?.id || 0);
      prePrev = await getPrev(prev?.id || 0);
      setNext(next);
    }
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
      setStartCards();
    }
    // run invitation animation
    if (invitationAnimation && width && !animated) {
      if (prev && next) {
        animated = true;
        startInvitationAnimation(prev, next);
      }
    }
    // set is mobile
    if (typeof isMobile === 'undefined') {
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
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="24px"
                viewBox="0 0 24 24"
                width="24px"
                fill="#000000"
              >
                <path d="M0 0h24v24H0V0z" fill="none" />
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM4 12c0-4.42 3.58-8 8-8 1.85 0 3.55.63 4.9 1.69L5.69 16.9C4.63 15.55 4 13.85 4 12zm8 8c-1.85 0-3.55-.63-4.9-1.69L18.31 7.1C19.37 8.45 20 10.15 20 12c0 4.42-3.58 8-8 8z" />
              </svg>
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
      {dots && (
        <div className={s.dots}>
          {dots.list.map((item) => (
            <div
              role="button"
              onClick={clickDotHandler}
              tabIndex={item}
              key={item}
              className={clsx(s.dot, current?.id === item ? s.active : '')}
            />
          ))}
        </div>
      )}
    </div>
  );
};

Swiper.defaultProps = {
  className: '',
};
