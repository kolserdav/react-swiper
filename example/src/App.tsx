import React from 'react'

import Swiper, { GetSwipeHandler } from 'swiper'
import 'swiper/dist/index.css'

const getNext: GetSwipeHandler = (old: number) => {
  const id = old + 1;
  return {
    id,
    children: <h1>Test {id}</h1>,
  };
};

const getPrevios: GetSwipeHandler = (old: number) => {
  const id = old - 1;
  return {
    id,
    children: <h1>Test {id}</h1>,
  };
};

const _getNext = (id: number)=> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const res: any = getNext(id);
  return res;
};

const App = () => {



  return <div>
  <Swiper
    current={_getNext(0)}
    prev={_getNext(-1)}
    next={_getNext(1)}
    getNext={getNext}
    getPrev={getPrevios}
  />
</div>
}

export default App
