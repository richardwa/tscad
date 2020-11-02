# openjscad
Starter project for openjscad library with typescript
* src files need to export the solid(s) to be rendered, no need to follow the main convention of jscad files.
* the types folder is setup to help in generating csg when coding from your IDE. @types/openjscad did not work for me so i am doing the types manually.  work in progress.

# Setup
* clone this repo
* npm install

# run viewer - via parcel 
* npm run server

# cli for generating stl
* npm run render ./src/torus.js

# stack
* parceljs for bundling
* typescript
* openjscad
* preact - for customizing the viewer, in the future.