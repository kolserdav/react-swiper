/******************************************************************************************
 * Repository: https://github.com/kolserdav/swiper.git
 * Author: Sergey Kolmiller
 * Email: <serega12101983@gmail.com>
 * License: MIT
 * License Text: The code is distributed as is. There are no guarantees regarding the functionality of the code or parts of it.
 * Copyright: kolserdav, All rights reserved (c)
 * Create date: Mon Nov 29 2021 16:18:08 GMT+0700 (Krasnoyarsk Standard Time)
 ******************************************************************************************/
import React from 'react';
import { Swiper, GetSwipeHandler, Swipe } from 'swiper';
import 'swiper/dist/index.css';

const getNext: GetSwipeHandler = (old) => {
  const id = old + 1;
  return {
    id: id < 5 ? id : null,
    children: id < 5 ? <h1>Test {id}</h1> : <div></div>,
  };
};

const getPrevios: GetSwipeHandler = (old) => {
  const id = old - 1;
  return {
    id: id > 0 ? id : null,
    children: id > 0 ? <h1>Test {id}</h1> : <div></div>,
  };
};

const _getNext = (id: number): Swipe => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const res: any = getNext(id);
  return res;
};

const App = (): React.ReactElement => {
  return (
    <div>
      <Swiper
        defaultCurrent={_getNext(0)}
        getNext={getNext}
        getPrev={getPrevios}
        invitationAnimation={true}
      />
    </div>
  );
};

export default App;
