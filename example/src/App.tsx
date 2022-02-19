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
        />
      )}
    </div>
  );
};

export default App;
