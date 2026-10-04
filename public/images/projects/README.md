# Project media

Add real PNG screenshots at these paths. Missing files keep the existing concept artwork. Run a new production build after adding files; availability is checked server-side at build time. Failed images also fall back gracefully.

- `janaza/main.png` — main website interface
- `janaza/workflow.png` — request/workflow interface
- `water-logger/home.png` — Android Home screen
- `water-logger/add-water.png` — Add Water screen
- `water-logger/statistics.png` — Statistics/Profile screen
- `tata-vision/reference.png`
- `tata-vision/basic-shapes.png`
- `tata-vision/curves.png`
- `tata-vision/shading.png`
- `tata-vision/coloring.png`
- `digit-recognizer/input.png` — handwritten input
- `digit-recognizer/result.png` — prediction/result
- `digit-recognizer/model.png` — optional model visualization

Desktop screenshots use a selectable browser frame; mobile screenshots use generic phone frames. Pipeline and comparison layouts show labeled images side by side and recompose on smaller screens. The media data supports any number of images, including a single screenshot. Change paths and descriptive alt text in `data/portfolio.ts` if needed. No sample or fabricated screenshots are included.
