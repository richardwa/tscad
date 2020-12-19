# TSCAD 
Constructive Solid Geometry (CSG) using Signed Distance Functions (SDF) and Typescript 

# Features
* Language support / coder friendly - I want a 3D modeling tool similar to openscad, but with a full language, tools, IDE, etc for easy coding.  This is why typescript is my first choice.

* Implicit Functions - The other aspect that peaked my interest is ImplicitCAD and the beauty and in its mathematics.  Haskell is an awesome language and i would recommend anyone learn it, however IDE support was still missing at the time of this writing.

* Rounded Union - I always felt this was missing in Openscad, and was a major driver for me to find my own solution.  With SDF this is very easy to implement, and much harder in discreet geometries (like openscad).

* Version Control - Obviously using code, has other major advantages like version control and diff's.


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
