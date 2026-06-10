const WORD_LIST = [

  
  "cat", "dog", "sun", "tree", "house", "book", "fish", "bird",
  "boat", "star", "moon", "clock", "chair", "apple", "hat",
  "guitar", "castle", "cactus", "ladder", "bridge", "candle",
  "rocket", "umbrella", "compass", "lantern", "penguin", "volcano",
  "tornado", "dolphin", "pyramid", "democracy", "telescope", "escalator", "javascript", "procrastination",
  "constellation", "refrigerator", "photosynthesis", "rollercoaster",

];


const getRandomWord = () => {
  const randomIndex = Math.floor(Math.random() * WORD_LIST.length);
  return WORD_LIST[randomIndex];
};

module.exports = { WORD_LIST, getRandomWord };
