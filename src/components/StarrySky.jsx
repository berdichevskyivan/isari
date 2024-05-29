import React, { useEffect, useRef, useState } from 'react';
import { useSpring, animated } from '@react-spring/web';
import '../App.css';

const generateStars = (numStars) => {
  const stars = [];
  for (let i = 0; i < numStars; i++) {
    const style = {
      top: `${Math.random() * 100}vh`,
      left: `${Math.random() * 100}vw`,
    };
    stars.push(<BlinkingStar key={i} style={style} />);
  }
  return stars;
};

const BlinkingStar = ({ style }) => {
  const props = useSpring({
    from: { opacity: 1 },
    to: async (next) => {
      while (true) {
        await next({ opacity: 0.2 });
        await next({ opacity: 1 });
      }
    },
    config: { duration: Math.random() * 2000 + 1000 },
    reset: true,
  });

  return <animated.div className="star" style={{ ...style, ...props }} />;
};

const StarrySky = () => {
  const [stars, setStars] = useState([]);

  useEffect(() => {
    setStars(generateStars(100));
  }, []);

  return (
    <div className="starry-sky">
      {stars}
    </div>
  );
};

export default StarrySky;
