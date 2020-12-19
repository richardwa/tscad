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

# References
* https://github.com/mikolalysenko/isosurface
  - marching cubes function is pulled directly from here
  - minor changes for typescript
  - significant speed improvement (8x) by buffering the SDF (uses more memory)
  - WIP - use gpu to improve speed even more

* https://www.iquilezles.org/www/articles/distfunctions/distfunctions.htm
  - Inigo has detailed many algorithms for SDF manipulation, I will be implementing alot of these.
  - he also has a nice youtube channel focused on combining graphics and math

* http://paulbourke.net/geometry/polygonise/
* https://github.com/colah/ImplicitCAD

# Other refrences and/or inspirations
* https://github.com/curv3d/curv
* https://www.openscad.org/
* https://openjscad.org/
