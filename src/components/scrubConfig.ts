// Scrubbed scroll reveal tuning. Progress is 0 as an element's top touches the viewport bottom
// and 1 after `range` px of scrolling. Fractions are of the viewport height.
export const scrubConfig = {
  text: { frac: 0.22, min: 140, max: 220 },
  media: { frac: 0.3, min: 200, max: 320 },
  damping: 7,
  // px above the viewport bottom where reveals begin (clears the mobile browser toolbar).
  edgeInset: 70,
};
