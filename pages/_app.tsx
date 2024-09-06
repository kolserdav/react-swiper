/******************************************************************************************
 * Repository: https://github.com/kolserdav/react-swiper.git
 * File name: _app.tsx
 * Author: Sergey Kolmiller
 * Email: <kolserdav@conhos.ru>
 * License: MIT
 * License text: The code is distributed as is. There are no guarantees regarding the functionality of the code or parts of it.
 * Copyright: kolserdav, All rights reserved (c)
 * Create Date: Fri Sep 06 2024 18:44:44 GMT+0700 (Krasnoyarsk Standard Time)
 ******************************************************************************************/
import "@/styles/globals.css";
import type { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
