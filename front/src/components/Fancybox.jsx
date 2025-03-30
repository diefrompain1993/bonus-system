import React, { useRef, useEffect } from "react";

import { Fancybox as NativeFancybox } from "@fancyapps/ui";
import "@fancyapps/ui/dist/fancybox/fancybox.css";

function Fancybox(props) {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;

    const delegate = props.delegate || "[data-fancybox]";
    const options = props.options || {
      Carousel: { infinite: false },
      Images: { Panzoom: { maxScale: 2 } },
    };

    NativeFancybox.bind(container, delegate, options);

    // return () => {
    //   NativeFancybox.unbind(container);
    //   NativeFancybox.close();
    // };
  });

  return (
    <div ref={containerRef} className={props.className}>
      {props.children}
    </div>
  );
}

export default Fancybox;
