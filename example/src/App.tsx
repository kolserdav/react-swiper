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

const COUNT = 4;
const LAG = 250;

const getNext: GetSwipeHandler = async (old) => {
  let id: any = old + 1;
  id = id <= COUNT ? id : null;
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id,
        children: <h1>Test {id}</h1>,
      })
    }, LAG)
  });
};

const getPrevios: GetSwipeHandler = async (old) => {
  let id = old - 1;
  id = id >= 0 ? id : COUNT;
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id,
        children: <h1>Test {id}</h1>,
      })
    }, LAG)
  });
};

const App = (): React.ReactElement => {
  const [current, setCurrent] = useState<Swipe>();
  useEffect(() => {
    if (!current) {
      (async () => {
        setCurrent(await getNext(-1));
      })();
    }
  }, [current]);

  return (
    <div className='container'>
      {current && (
        <Swiper
          blockSwipe={false}
          defaultCurrent={current}
          getNext={getNext}
          getPrev={getPrevios}
          invitationAnimation={true}
          className="card__content"
          dots={{
            list: [0,1,2,3,4],
            active: current.id || 1
          }}
        />
      )}
    </div>
  );
};

export default App;
