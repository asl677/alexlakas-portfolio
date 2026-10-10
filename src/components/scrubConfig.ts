// Scrubbed scroll reveal tuning. Progress is 0 as an element's top touches the viewport bottom
// and 1 after `range` px of scrolling. Fractions are of the viewport height.
export const scrubConfig = {
  text: { frac: 0.26, min: 160, max: 240 },
  media: { frac: 0.26, min: 160, max: 240 },
  damping: 6,
  // px above the viewport bottom where reveals begin (clears the mobile browser toolbar).
  edgeInset: 70,
};
