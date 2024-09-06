import s from "@/styles/Home.module.css";
import { GetSwipeHandler, Swipe, Swiper } from "@/src/components/Swiper";
import { useEffect, useState } from "react";

const COUNT = 6;
const LAG = 25;

const getNext: GetSwipeHandler = async (old) => {
  let id: any = old + 1;
  id = id <= COUNT ? id : 0;
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id,
        children: <h1>Test {id}</h1>,
      });
    }, LAG);
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
      });
    }, LAG);
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
    <div className={s.container}>
      {current && (
        <Swiper
          blockSwipe={false}
          defaultCurrent={current}
          getNext={getNext}
          getPrev={getPrevios}
          invitationAnimation={true}
          className="card__content"
          dots={{
            list: [0, 1, 2, 3, 4, 5, 6],
            active: current.id || 1,
          }}
        />
      )}
    </div>
  );
};

export default App;
