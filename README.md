# TSCAD 
Constructive Solid Geometry (CSG) using Signed Distance Functions (SDF) and Typescript 

# Features
* Language support / coder friendly - I want a 3D modeling tool similar to openscad, but with a full language tools, IDE, etc for easy coding.  This is why typescript is my first choice.

* Implicit Functions - The other aspect that peaked my interest is ImplicitCAD.  I was impressed with the elegance in the maths. Haskell is an awesome language and i would recommend anyone learn it, however IDE support was still missing at the time of this writing.

* Rounded Union - I always felt this was missing in Openscad, and was a major driver for me to find my own solution.  With SDF this is very easy to implement.

* Version Control - using code has other major advantages like version control and diff's.

* exports to OBJ file format.  I was able to export STL (ascii) initially, but it turns out that OBJ was even easy and gave smaller file sizes.

# Cons
* Rendering a solid needs the resolution and bounding box to be specified.

* while the maths are exact, the final rendering using maching cubes is approximate.  Often there are artifacts along hard edges.  I wrote this tool with 3D printing in mind, even though the artifacts show up in the rendering, it should not have any impact on the final print.

* no live view for now, will come in the future. I had a browser based viewer initially, but decided to drop it and focus on other aspects. Having the obj export is handy enough for now.

# Setup
* clone this repo
* npm install
* npm run test
  - this will generate and obj file in target folder

# Marching Cubes
* Getting the rendering right is a big part of this library.  Marching cubes is considered a fast for a GPU, but we are working on CPU here and single threaded with node no less.  Original code is pulled from https://github.com/mikolalysenko/isosurface.  However I did make significant optimizations on this.
  - Biggest optimization is implementing a skip mechanism.  When the SDF returns a large value, we can skip the next cubes proprtional to the distance returned.  This reduces our time complexity from R^3 (volumne) to R^2 (surface).
  - A sparse circular 'layer' buffer is also used.  This had a big improvement before implementing 'skip cubes', but still gives a small benefit now.  Memory usage was improved by limiting size to 2 layers and leveraging a 'sparse' array implemenation.
  - I am trying to figure out how to figure out the bounds implicitly, specifiying the bounds is not too troublesome, may not be worth my time.
  - Other thoughts on volume traversal, right now it is a standard one layer at a time traversal, but I am thinking about traversing using Hilbert/Peano curves.  The thinking is that a linear skip translates into a volume skip. Another way may to do variable block size traversal, don't have a good way to do this either. 

# References
* https://github.com/mikolalysenko/isosurface
* https://www.iquilezles.org/www/articles/distfunctions/distfunctions.htm
  - Inigo has detailed many algorithms for SDF manipulation, I will be implementing alot of these.
  - he also has a nice youtube channel focused on combining graphics and math
* https://shadertoy.com
* http://paulbourke.net/geometry/polygonise/
* https://github.com/colah/ImplicitCAD
* https://github.com/curv3d/curv
* https://www.openscad.org/
* https://openjscad.org/
