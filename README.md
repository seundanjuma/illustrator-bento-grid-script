# bento grid generator for adobe illustrator

created by [@mrkazuda](https://x.com/mrkazuda)

a script that creates bento-style grids in illustrator. draws rounded rectangles in varied layouts with proper spacing ratios.

## what it does

select any rectangle on your artboard and the script breaks it into a bento grid. cells can span multiple columns or rows, creating that modern dashboard/card layout look.

the spacing and corner radius follow actual design principles:
- gutter size is calculated as a percentage of your smallest cell (2.5% for tight, 5% for comfortable, 7.5% for spacious)
- corner radius uses the ios formula: `√(width × height) / 10`, rounded up
- all cells get the same corner radius regardless of size

## installation

**option 1: install permanently**
1. download `BentoGrid.jsx`
2. put it in your illustrator scripts folder:
   - **mac**: `/Applications/Adobe Illustrator [version]/Presets/en_US/Scripts/`
   - **windows**: `C:\Program Files\Adobe\Adobe Illustrator [version]\Presets\en_US\Scripts\`
3. restart illustrator
4. access from `File > Scripts > BentoGrid`

**option 2: run on demand**
1. download `BentoGrid.jsx` anywhere on your computer
2. in illustrator, go to `File > Scripts > Other Script...`
3. browse to the folder where you saved it and select `BentoGrid.jsx`
4. no restart needed, runs immediately

## how to use

1. draw a rectangle anywhere (this becomes your grid container)
2. keep it selected
3. run the script (see installation options above)
4. configure your grid:
   - pick spacing style (tight/comfortable/spacious)
   - set rows and columns
   - set margin
   - optionally paste a seed number to recreate a specific layout
5. click through previews until you find one you like
6. use "export seed" to save layouts you want to recreate later

## features

- **live preview** - see each layout on your artboard before committing
- **navigation** - browse through different layouts with previous/next buttons
- **seed system** - export and import seed numbers to recreate exact layouts
- **design ratios** - automatic gutter and corner radius calculations
- **no gaps** - always fills the entire grid with no empty spaces

## what are seeds?

think of a seed as a unique recipe number for your grid layout. the script generates different arrangements of cells randomly, but each arrangement has a unique number (the seed).

**why this matters:**
- you find a layout you love
- click "export seed" and you get a number like `847`
- later, you can paste `847` into "import seed" and get the exact same layout again
- save seeds for your favorite layouts or share them with your team to generate consistent bentos across projects

**example:**
- create a 4x3 grid with seed `123` → you get a specific arrangement
- create another 4x3 grid with seed `123` → you get the same arrangement
- create a 4x3 grid with seed `456` → you get a different arrangement

seeds only work with the same grid settings (same rows, columns, spacing). changing those settings with the same seed will give you a different result.