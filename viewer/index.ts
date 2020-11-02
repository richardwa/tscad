import Processor from '@jscad/web/src/jscad/processor';
import shape from '../src/torus';

console.log(Processor);
const viewer = document.getElementById('viewerContext');
const p = new Processor(viewer);

p.setCurrentObjects([shape]);