// Scrubbed scroll reveal tuning. Progress is 0 as an element's top touches the viewport bottom
// and 1 after `range` px of scrolling. Fractions are of the viewport height.
export const scrubConfig = {
  text: { frac: 0.32, min: 200, max: 300 },
  media: { frac: 0.4, min: 260, max: 400 },
  damping: 6,
  // px above the viewport bottom where reveals begin (clears the mobile browser toolbar).
  edgeInset: 70,
};
