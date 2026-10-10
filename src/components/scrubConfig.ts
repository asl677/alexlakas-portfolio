// Scrubbed scroll reveal tuning. Progress is 0 as an element's top touches the viewport bottom
// and 1 after `range` px of scrolling. Fractions are of the viewport height.
export const scrubConfig = {
  text: { frac: 0.2, min: 120, max: 200 },
  media: { frac: 0.2, min: 120, max: 200 },
  damping: 6,
  // px above the viewport bottom where reveals begin (clears the mobile browser toolbar).
  edgeInset: 70,
};
