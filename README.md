# TSCAD 
Constructive Solid Geometry (CSG) using Signed Distance Functions (SDF) and Typescript 

# Features
* Language support / coder friendly - I want a 3D modeling tool similar to openscad, but with a full language tools, IDE, etc for easy coding.  This is why typescript is my first choice.
* Implicit Functions - The other aspect that peaked my interest is ImplicitCAD.  I was impressed with the elegance in the maths. Haskell is an awesome language and i would recommend anyone learn it, however IDE support was still missing at the time of this writing.
* Rounded Union - I always felt this was missing in Openscad, and was a major driver for me to find my own solution.  With SDF this is very easy to implement.
* Version Control - using code has other major advantages like version control and diff's.
* exports to OBJ file format.  I was able to export STL (ascii) initially, but it turns out that OBJ was even easier and gave smaller file sizes.

# Cons
* no live view for now, will come in the future. I had a browser based viewer initially, but decided to drop it and focus on other aspects. Having the obj export is handy enough for now.
  - TODO - i have an idea to embed an IDE into the browser along with auto WebGL/GLSL generated code for live view. Just like shadertoy except with typescript IDE

# Setup
* clone this repo
* npm install
* npm run test
  - this will generate and obj file in target folder

# Implicit Surface Extraction
* I spent alot of time working on this to get all the features I was looking for in an extraction algorithm.
 - bounds can be arbitarily large without incurring much cost.
 - variable sized cubes when extracting surface to get a good shape and not spend too much cycles/file size on the flat parts
 - somewhat easy to understand implemetation.  At first my implemenations had alot of conditionals (up, down , left, right etc) when working on cubes.  There were symetries to be exploited for shorter code, but took a while to find the best way.
 - no cracks on the rendered object


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
