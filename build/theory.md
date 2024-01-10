## Scaling in 3D Space

Scaling in 3D space involves multiplying the distances from the coordinate axes by constant factors along each axis. The scaling matrix, denoted as T<sub>scaling</sub>, scales by factors v<sup>x</sup>, v<sup>y</sup>, and v<sup>z</sup> units and is represented as:

<img src="images/scaling-matrix.png">  

When this scaling matrix is multiplied with a vector [x, y, z], the resulting vector is obtained as:

<img src="images/point_scaling.png">  

### Interpretation:

A scaling transformation can be interpreted as resizing the coordinate axes while keeping the points constant. For example, a scaling by (2, 3, 4) would require redrawing each unit on the X-axis as 2 units, each unit on the Y-axis as 3 units, and each unit on the Z-axis as 4 units.

This fundamental concept is integral to understanding how objects can be enlarged or reduced in 3D space through scaling transformations.
