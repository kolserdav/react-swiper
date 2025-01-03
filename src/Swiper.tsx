/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/control-has-associated-label */
/******************************************************************************************
 * Repository: https://github.com/kolserdav/react-swiper.git
 * File name: Swiper.tsx
 * Author: Sergey Kolmiller
 * Email: <kolserdav@conhos.ru>
 * License: MIT
 * License text: The code is distributed as is. There are no guarantees regarding the functionality of the code or parts of it.
 * Copyright: kolserdav, All rights reserved (c)
 * Create Date: Fri Sep 06 2024 18:44:44 GMT+0700 (Krasnoyarsk Standard Time)
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
  useCallback,
} from 'react';
import clsx from 'clsx';
import * as _s from './Swiper.module.css';
import SwiperButton from './SwiperButton';

const s: Record<string, string> = _s as any;

/**
 * Time to miliseconds of change animation by card left value
 */
export const SWIPE_TRANSITION_TIMEOUT = 400;

/**
 * Minimum swipe speed regardless of distance
 */
export const SWIPE_ON_EVENT_SPEED = 0.5;

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
// eslint-disable-next-line no-unused-vars
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
export interface SwiperProps {
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
  // eslint-disable-next-line no-unused-vars
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
    inactive: boolean;
    list: number[];
    active: number;
  };

  /**
   * Makes dark colors as light
   */
  darkTheme?: boolean;
}

/**
 * Create swipe list from values
 */
const getSwipes = (prev: Swipe, current: Swipe, next: Swipe, swipes: SwipeFull[]): SwipeFull[] => {
  if (
    (prev?.id === current?.id || current?.id === next?.id || next?.id === prev?.id) &&
    swipes.length !== 0
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
  [key: number]: RefObject<HTMLDivElement | null>;
} = {};

let startClientX: number;
let startClientY: number;
let lastLeft: number;
let animated = false;
let _defaultCurrent: Swipe;
let oldSwipes: SwipeFull[] = [];
let startTime = new Date().getTime();

/**
 * Swiper component
 */
export default function ReactSwiper(props: SwiperProps): React.ReactElement {
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
    darkTheme,
  } = props;

  const [current, setCurrent] = useState<Swipe>();
  const [prev, setPrev] = useState<Swipe>();
  const [next, setNext] = useState<Swipe>();
  const [prePrev, setPrePrev] = useState<Swipe>();
  const [postNext, setPostNext] = useState<Swipe>();
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

    [next, prev, current, defaultCurrent]
  );

  oldSwipes = swipes;

  /**
   * Get new or exists ref by id
   */
  const getRef = (id: number): (typeof refs)[0] => {
    refs[id] = refs[id] ? refs[id] : createRef<HTMLDivElement>();
    return refs[id];
  };

  /**
   * Set to cards classes for in animation
   */
  const setGoClassHandler = useMemo(
    () =>
      (_next?: Swipe, _prev?: Swipe): void => {
        getRef(_next?.id || next?.id || 0).current?.classList.add(s.go);
        getRef(_prev?.id || prev?.id || 0).current?.classList.add(s.go);
        getRef(current?.id || 0).current?.classList.add(s.go);
        setTimeout(() => {
          getRef(_next?.id || next?.id || 0).current?.classList.remove(s.go);
          getRef(_prev?.id || prev?.id || 0).current?.classList.remove(s.go);
          getRef(current?.id || 0).current?.classList.remove(s.go);
        }, SWIPE_TRANSITION_TIMEOUT);
      },
    [current?.id, next?.id, prev?.id]
  );

  /**
   * Set to cards classes for out animation
   */
  const setBackClassHandler = useMemo(
    () => (): void => {
      getRef(next?.id || 0).current?.classList.add(s.back);
      getRef(prev?.id || 0).current?.classList.add(s.back);
      getRef(current?.id || 0).current?.classList.add(s.back);
      setTimeout(() => {
        getRef(next?.id || 0).current?.classList.remove(s.back);
        getRef(prev?.id || 0).current?.classList.remove(s.back);
        getRef(current?.id || 0).current?.classList.remove(s.back);
      }, SWIPE_TRANSITION_TIMEOUT);
    },
    [current?.id, next?.id, prev?.id]
  );

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
  const setPreValues = useMemo(
    () =>
      (_p: Swipe | undefined, _n: Swipe | undefined): void => {
        if (_p) {
          getPrev(_p?.id || 0).then((d) => {
            setPrePrev(d);
          });
        }
        if (_n) {
          getNext(_n?.id || 0).then((d) => {
            setPostNext(d);
          });
        }
      },
    [getNext, getPrev]
  );

  const goSwipeBack = useMemo(
    () => () => {
      setBackClassHandler();
      setLeft(0);
      setLoad(false);
    },
    [setBackClassHandler, setLeft, setLoad]
  );

  const startSwipe = useMemo(
    () => (_next: Swipe | undefined, _prev: Swipe | undefined, __left: number) => {
      setGoClassHandler(_next, _prev);
      setLeft(__left);
    },
    [setGoClassHandler]
  );

  const endSwipe = useMemo(
    () =>
      ({
        _prev,
        _current,
        _next,
      }: {
        _prev: Swipe | undefined;
        _current: Swipe | undefined;
        _next: Swipe | undefined;
      }) => {
        setLeft(0);
        setPrev(_prev);
        setCurrent(_current);
        setNext(_next);
      },
    []
  );

  const goSwipe = useCallback(
    async (
      {
        newNext,
        newPrev,
        coeff,
      }: {
        newPrev: Swipe | undefined;
        newNext: Swipe | undefined;
        coeff: 1 | -1;
      },
      _next: Swipe | undefined,
      _prev: Swipe | undefined
    ) => {
      if (_next?.id === null || _prev?.id === null) {
        goSwipeBack();
        return 1;
      }
      if (onSwipe !== undefined) {
        onSwipe(_next?.id || _prev?.id);
      }
      startSwipe(_next, _prev, windowWidth * coeff);
      await wait(SWIPE_TRANSITION_TIMEOUT);
      endSwipe({ _prev: newPrev, _current: _next || _prev, _next: newNext });
      return 0;
    },
    [endSwipe, goSwipeBack, onSwipe, startSwipe, windowWidth]
  );

  /**
   * Run swipe animation
   */
  const swipe = useMemo(
    () =>
      async ({
        _lastLeft,
        _next,
        _prev,
        speed,
      }: {
        _lastLeft: number;
        _next: Swipe | undefined;
        _prev: Swipe | undefined;
        speed?: number;
      }): Promise<1 | 0> => {
        setLoad(true);
        if (
          Math.abs(_lastLeft) > width / 3 ||
          (speed !== undefined && speed > SWIPE_ON_EVENT_SPEED)
        ) {
          if (_lastLeft < 0) {
            await goSwipe({ newPrev: current, newNext: postNext, coeff: -1 }, _next, undefined);
          } else {
            await goSwipe({ newPrev: prePrev, newNext: current, coeff: 1 }, undefined, _prev);
          }
        } else {
          goSwipeBack();
        }
        setLoad(false);
        return 0;
      },
    [current, goSwipeBack, width, prePrev, postNext, goSwipe]
  );

  /**
   * Touch event handler
   */
  const onTouchHandler = useMemo(
    () =>
      async (name: TouchName, e: TouchEvent): Promise<void> => {
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
                _next: next,
                _prev: prev,
              });
            }
            break;
          default:
        }
      },
    [_left, blockSwipe, swipe, next, prev]
  );

  /**
   * Touch event wrapper
   */
  const onTouchWrapper =
    // eslint-disable-next-line no-unused-vars, prettier/prettier

    (name: TouchName): ((event: TouchEvent<HTMLDivElement>) => void) =>
      (e): void => {
        onTouchHandler(name, e);
      };

  /**
   * On next or previous button click handler
   */
  const clickHandler = useMemo(
    () =>
      (origin: 'next' | 'prev'): (() => Promise<1 | 0>) => {
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
            _next: next,
            _prev: prev,
          });
          return 0;
        };
      },
    [setBackClassHandler, setGoClassHandler, swipe, width, next, prev]
  );

  /**
   * Wrapper for next button click handler
   */
  const clickNextHandler = clickHandler('next');

  /**
   * Wrapper for previous button click handler
   */
  const clickPrevHandler = clickHandler('prev');

  /**
   * optional animation handler
   */
  const infitationAnimationHandler = useMemo(
    () =>
      async (shift: number): Promise<void> => {
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
      },
    [setBackClassHandler, setGoClassHandler]
  );

  /**
   * Initial start cards
   */
  const setStartCards = useMemo(
    () => async (): Promise<void> => {
      const _n = await getNext(defaultCurrent.id || 0);
      const _p = await getPrev(defaultCurrent.id || 0);
      setCurrent(defaultCurrent);
      setPrev(_p);
      setNext(_n);
      _defaultCurrent = defaultCurrent;
      setLoad(false);
    },
    [defaultCurrent, getNext, getPrev]
  );

  /**
   * Invitation animation
   */
  const startInvitationAnimation = useMemo(
    () =>
      async (_prev: Swipe, _next: Swipe): Promise<void> => {
        if (_prev.id) {
          await infitationAnimationHandler(windowWidth / 5.5);
        }
        if (_next.id) {
          await infitationAnimationHandler((windowWidth / 5.5) * -1);
        }
      },
    [infitationAnimationHandler, windowWidth]
  );

  /**
   * Handler on click by dot
   */
  const clickDotHandler: MouseEventHandler<HTMLDivElement> = useMemo(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    () => async (e: any) => {
      const { target } = e;
      const tabindex = target?.getAttribute('tabindex');
      const active = parseInt(tabindex, 10);
      const currentId = current?.id || 0;
      let newCurrent: Swipe | undefined;
      let newPrev: Swipe | undefined;
      let newNext: Swipe | undefined;
      if (currentId === next?.id) {
        newCurrent = next;
        newNext = postNext;
        newPrev = current;
      } else if (currentId === prev?.id) {
        newCurrent = prev;
        newNext = current;
        newPrev = prePrev;
      } else if (currentId === prePrev?.id) {
        newCurrent = prePrev;
        newNext = prev;
        newPrev = await getPrev(prePrev?.id);
      } else if (currentId === postNext?.id) {
        newCurrent = postNext;
        newPrev = next;
        newNext = await getPrev(postNext?.id);
      } else {
        newCurrent = await getNext(active - 1);
        newNext = await getNext(newCurrent?.id || 0);
        newPrev = await getPrev(newCurrent?.id || 0);
      }

      if (currentId < active) {
        await goSwipe({ newPrev, newNext, coeff: -1 }, newCurrent, undefined);
      } else {
        await goSwipe({ newPrev, newNext, coeff: 1 }, undefined, newCurrent);
      }
    },
    [getNext, getPrev, goSwipe, current, next, postNext, prePrev, prev]
  );

  /**
   * Set button listeners
   */
  useEffect(() => {
    const buttonNext = current?.nextRef?.current;
    const buttonClose = current?.closeRef?.current;
    buttonNext?.addEventListener('click', clickNextHandler);
    buttonClose?.addEventListener('click', clickNextHandler);
    return (): void => {
      buttonNext?.removeEventListener('click', clickNextHandler);
      buttonClose?.removeEventListener('click', clickNextHandler);
    };
  }, [clickNextHandler, current]);

  /**
   * Set width and height
   */
  useEffect(() => {
    const _width = containerRef?.current?.parentElement?.getBoundingClientRect()?.width;
    const _height = containerRef?.current?.parentElement?.getBoundingClientRect()?.height;
    if (_width && _height) {
      setWidth(_width);
      setHeight(_height);
    }
  }, [containerRef, width, height]);

  /**
   * Save container left
   */
  useEffect(() => {
    const __left = containerRef?.current?.parentElement?.getBoundingClientRect()?.left;
    if (__left && !left) {
      _setLeft(__left);
    }
  }, [containerRef, left]);

  /**
   * Auto slide
   */
  useEffect(() => {
    // eslint-disable-next-line no-undef
    let clearAnimate: NodeJS.Timeout;
    if (durationAnimation) {
      clearAnimate = setInterval(() => {
        clickNextHandler();
      }, durationAnimation);
    }
    return () => {
      if (clearAnimate) {
        clearInterval(clearAnimate);
      }
    };
  }, [durationAnimation, clickNextHandler]);

  /**
   * Set start cards
   */
  useEffect(() => {
    if (!current || !prev || !next || _defaultCurrent !== defaultCurrent) {
      setStartCards();
    }
  }, [current, next, prev, defaultCurrent, setStartCards]);

  /**
   * Save window width
   */
  useEffect(() => {
    const _windowWidth =
      containerRef.current?.parentElement?.clientWidth || document.body.clientWidth;
    if (!windowWidth && _windowWidth) {
      setWindowWidth(_windowWidth);
    }
  }, [windowWidth]);

  /**
   * Run invitation animation
   */
  useEffect(() => {
    if (invitationAnimation && width && !animated) {
      if (prev && next) {
        animated = true;
        startInvitationAnimation(prev, next);
      }
    }
  }, [invitationAnimation, next, prev, startInvitationAnimation, width]);

  /**
   * Listen resize
   */
  useEffect(() => {
    const resizeHandler = (): void => {
      const _width = containerRef?.current?.parentElement?.getBoundingClientRect()?.width;
      const _height = containerRef?.current?.parentElement?.getBoundingClientRect()?.height;
      const __left = containerRef?.current?.parentElement?.getBoundingClientRect()?.left;
      const _windowWidth =
        containerRef.current?.parentElement?.clientWidth || document.body.clientWidth;
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
    window.addEventListener('resize', resizeHandler);
    return (): void => {
      window.removeEventListener('resize', resizeHandler);
    };
  }, []);

  /**
   * Set is mobile
   */
  useEffect(() => {
    if (typeof isMobile === 'undefined') {
      // @ts-ignore
      setIsMobile('ontouchstart' in window || typeof navigator?.msMaxTouchPoints !== 'undefined');
    }
  }, [isMobile]);

  /**
   * Set pre values
   */
  useEffect(() => {
    setPreValues(prev, next);
  }, [prev, next, setPreValues]);

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
                    ? {
                        width,
                        height,
                        left: left - windowWidth,
                      }
                    : {
                        width,
                        height,
                        left: left + windowWidth,
                      }
              }
              className={clsx(
                s.card,
                item.type === 'prev' ? s.prev : item.type === 'next' ? s.next : ''
              )}
              ref={getRef(item.id)}
            >
              {/** Block of content */}
              <div className={clsx(s.content, darkTheme ? s.content_dark : '', className)}>
                {item.children}
              </div>
            </div>
          )}
          {item.id === null && (
            <div
              style={
                item.type === 'current'
                  ? { width, height, left }
                  : item.type === 'prev'
                    ? {
                        width,
                        height,
                        left: left - windowWidth,
                      }
                    : {
                        width,
                        height,
                        left: left + windowWidth,
                      }
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
                fill={darkTheme ? 'grey' : 'black'}
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
            className={clsx(s.icon__button, darkTheme ? s.icon__button_dark : s.icon__button_light)}
            type="button"
            disabled={load || isMobile}
            onClick={clickPrevHandler}
          >
            <SwiperButton darkTheme={darkTheme} />
          </button>
        </div>
      )}
      {typeof isMobile !== 'undefined' && !isMobile && next?.id !== null && (
        <div className={clsx(s.button, s.button__next)}>
          <button
            className={clsx(s.icon__button, darkTheme ? s.icon__button_dark : s.icon__button_light)}
            type="button"
            disabled={load || isMobile}
            onClick={clickNextHandler}
          >
            <SwiperButton darkTheme={darkTheme} />
          </button>
        </div>
      )}
      {dots !== undefined && (
        <div className={clsx(s.dots)}>
          {dots.list.map((item) => (
            <div
              role="button"
              onClick={dots.inactive ? undefined : clickDotHandler}
              tabIndex={item}
              key={item}
              className={clsx(
                s.dot,
                current?.id === item ? s.active : '',
                dots.inactive ? s.dot__inactive : ''
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
