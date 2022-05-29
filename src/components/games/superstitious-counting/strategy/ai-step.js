'use strict';

import { random } from 'lodash-es';

export const getAiStep = ({ current, target, restricted }) => {
  if ((target - current) % 14 === 0) { //any step wins
    return randomStep(restricted);
  }
  if ((target - current) % 14 === 1) { //any step looses
    return randomStep(restricted);
  }
  //only one winning step
  if ((target - current) % 14 - 1 === restricted) return randomStep(restricted);
  else return (target - current) % 14 - 1;
};

const randomStep = (restricted) => {
  let step = restricted;
  while(step === restricted){
    step = random(1, 12);
  }
  return step;
};
