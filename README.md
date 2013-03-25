Development
-----------

**Building a new TopoJSON file:**

The file at `app/data/local-authorities.json` is a TopoJSON file containing all the geographical shapes **and** all the austerity data.

To rebuild this file (e.g. after data is updated in the DB):

1. Make a copy of the `data-config.coffee_sample` file, named `data-config.coffee`.
2. Edit the MySQL details in this new file (with details of the actual database and table containing the austerity data).
3. Run `grunt topojson`.

This will generate new TopoJSON based on the shape data from `data/la-shapes.json` and the austerity data from the database, and save it to `app/data/local-authorities.json` (overwriting that file).

You might then want to upload this new file to replace the one on the server, or you might want to run `grunt build` to build a complete new `dist` (which will include the new TopoJSON file).
