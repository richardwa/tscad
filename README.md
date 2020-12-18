# TSCAD 
Constructive Solid Geometry (CSG) using Signed Distance Functions (SDF) and Typescript 

# Features
* Language support / coder friendly - I want a 3D modeling tool similar to openscad, but with a full language, tools, IDE, etc for easy coding.  This is why typescript is my first choice.

* Implicit Functions - The other aspect that peaked my interest is ImplicitCAD and the beauty and simplicity in its mathematics.  Haskell is an awesome language and i would recommend anyone learn it, however IDE support was still missing at the time of this writing.

* Version Control - Obviously using code, has other major advantages like version control and diff's.

# Nice to haves
* GPU accerleration - would be cool if marching cubes can be done on gpu.

# Setup
* clone this repo
* npm install
* npm run test
  - this will generate and obj file in target folder

# render arbitrary file which exports a Shape3
* npm run render ./filepath.ts

# References
* https://github.com/mikolalysenko/isosurface
  - marching cubes function is pulled directly from here, minor changes for the typescript
* http://paulbourke.net/geometry/polygonise/
* https://github.com/colah/ImplicitCAD
* https://www.iquilezles.org/www/articles/distfunctions/distfunctions.htm

# Other refrences and/or inspirations
* https://github.com/curv3d/curv
* https://www.openscad.org/
* https://openjscad.org/
