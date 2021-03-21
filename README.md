# TSCAD 
Constructive Solid Geometry (CSG) using Signed Distance Functions (SDF) and Typescript 

## Features
* Language support / coder friendly - I want a 3D modeling tool similar to openscad, but with a full language tools, IDE, etc for easy coding.  This is why typescript is my first choice.
* Implicit Functions - The other aspect that peaked my interest is ImplicitCAD.  I was impressed with the elegance in the maths. Haskell is an awesome language and i would recommend anyone learn it, however IDE support was still missing at the time of this writing.
* Rounded Union - I always felt this was missing in Openscad, and was a major driver for me to find my own solution.  With SDF this is very easy to implement.
* Version Control - using code has other major advantages like version control and diff's.
* exports to OBJ file format.  I was able to export STL (ascii) initially, but it turns out that OBJ was even easier and gave smaller file sizes.

# POC - https://richardwa.github.io/tscad/dist/viewer/viewer.html
this is the 'viewer', on a desktop the server script will compile and send webgl code to browser to render your project.


## Setup
* clone this repo
* npm install

- npm run test-viewer
  - starts a parcel server that will serve webgl code for the example shape
* npm run test
  - this will generate and obj file in target folder

## CSG Functions
 - These were mostly implemented using Inigo's site and examples. It is a joy at how wonderful and simple these functions are.
 - boolean operations: union, diff, intersect
 - extrusions: extrude, revolve, mirror, tile
 - manipulations: translate, rotate, scale
 - 3D primitives: cube, sphere, cylinder
 - 2D primitives: square, circle, regular polygons, arbitary polygons
 

## Implicit Surface Extraction - Dual Marching Cubes
 - I spent alot of time working on this to get all the features I was looking for in an extraction algorithm.
 - bounds can be arbitarily large without incurring much cost.
 - variable sized cubes when extracting surface to get a good shape and not spend too much cycles/file size on the flat parts
 - somewhat easy to understand implemetation.  At first my implemenations had alot of conditionals (up, down , left, right etc) when working on cubes.  There were symetries to be exploited for shorter code, but took a while to find the best way.
 - while i may still look into mesh simplification, I don't want to solely rely on post processing.  Didn't want to waste cycles on creating then removing small triangles.
 - no cracks on the rendered object
 - example: rounded union of cube and sphere with variable sized mesh

![sphere cube](./pics/sphere-cube.jpg?raw=true "sphere cube")

## 3D Printing / Slicing
 - while Dual Marching Cubes can produce reasonable high quality models, there are can still be rendering artifacts. To overcome these, we can use the 'slicing' render which gives

## References
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
