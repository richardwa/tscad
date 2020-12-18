# TS CAD 
I pivoting this project a bit, i found that openjscad is changing alot and made it difficult for me to follow its code.  Instead, I will roll my own, sort of.

# Goals
* Language support / coder friendly - I want a 3D modeling tool similar to openscad, but with a full language, programming tools, IDE, etc for easy coding.  This is why typescript is my first choice.
* Implicit Functions - The other aspect that peaked my interest is ImplicitCAD and the beauty and simplicity in its mathematics.  In my naive mind i feel write a lib with a few simple CSG functions would go along way, lets see if this pans out.
* Viewer and STL support - this tool should refresh and update quickly on save, and reasonably export to STL.


# Setup
* clone this repo
* npm install

# run viewer - via parcel 
* npm run server
* open browser to the indicated port

# cli for generating stl
* npm run render ./src/torus.ts

# stack
* parceljs for bundling
* typescript
* openjscad
* preact - for customizing the viewer