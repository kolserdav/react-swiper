/******************************************************************************************
 * Repository: https://github.com/kolserdav/swiper.git
 * Author: Sergey Kolmiller
 * Email: <serega12101983@gmail.com>
 * License: MIT
 * License Text: The code is distributed as is. There are no guarantees regarding the functionality of the code or parts of it.
 * Copyright: kolserdav, All rights reserved (c)
 * Create date: Mon Nov 29 2021 16:18:08 GMT+0700 (Krasnoyarsk Standard Time)
 ******************************************************************************************/
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
