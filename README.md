Development
-----------

### Getting set up

#### Building a new GeoJSON file

The file at `app/data/local-authorities.json` is a GeoJSON file containing all the geographical shapes and all the austerity data.

To rebuild this file (e.g. after data has changed):

1. Make a copy of the `data-config.coffee_sample` file called just `data-config.coffee`.
2. Edit the MySQL details in this new file (with details of the actual database and table containing the austerity data).
3. Run `grunt assemble-geojson`.

This should overwrite `app/data/local-authorities.json` with the new GeoJSON. (This is comprised of the shape data from `data/la-shapes.json` and the properties from the database.)

You might then want to upload this new file to replace the one on the server, or you might want to run `grunt build` to build a new `dist` (which will include this file).

If you want to do it in one step, you can run `grunt build:with-data` – this basically runs the `assemble-geojson` task to regenerate `app/data/local-authorities.json`, before running the rest of the `build` task as usual.
