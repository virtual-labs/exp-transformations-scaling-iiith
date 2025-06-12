### Step 1: Understanding Controls and Features
- Familiarize yourself with the mouse and touch controls listed under **Mouse Controls** and **Mobile Touch Controls**. Understand how left-click, right-click, scrolling, and touch gestures translate, rotate, and zoom the simulation.
- Learn about locking options such as **Lock Graph**, **Lock Zoom**, and **Lock Rotate** to understand how they restrict specific functionalities in the simulation.

### Step 2: Shape Manipulation
- Explore the **Shape Controls** section. Practice adding, selecting, editing, and deleting shapes using the corresponding buttons (**Add**, **Edit**, **Delete**). Note the instructions regarding shape placement and the warnings about avoiding overlapping coordinates.

### Step 3: Understanding Default Scaling
- Note that shapes in the simulation start with default scaling values:
  - X-axis: 3 (width is 3 times the base size)
  - Y-axis: 2 (height is 2 times the base size)
  - Z-axis: 2 (depth is 2 times the base size)
- Use the **Reset** button to return to these default values at any time.

### Step 4: Scaling and Transformation
- In the **Scaling Controls** section, you can adjust the scaling factors for X, Y, and Z axes:
  - Values > 1: Increase the size from the base size
  - Values = 1: Return to base size for that dimension
  - Values < 1: Decrease the size from the base size
- Examples of what to expect:
  - X=3, Y=2, Z=2: Default size (3× wider, 2× taller, 2× deeper than base)
  - X=1, Y=1, Z=1: Base size (smaller than default)
  - X=6, Y=4, Z=4: Double the default size
  - X=1.5, Y=1, Z=1: 1.5× wider than base size

### Step 5: Using the Slider for Smooth Scaling
- **Important**: The slider is used to smoothly transition between the current size and the target size
- **Critical Steps**:
  1. First, set your desired X, Y, Z values in the input fields
  2. Click **Apply Scaling** to set these as your target values
  3. **Only then** use the slider to see the smooth transition
- The slider will:
  - Start at 0 (current size)
  - End at 1000 (target size you set)
  - Show smooth scaling animation as you move it
- **Warning**: Moving the slider before clicking Apply Scaling will not show the correct scaling effect

### Step 6: Grid Options and Visualization
- Use the **Grid Options** section to toggle:
  - XY-grid: Shows the horizontal plane
  - YZ-grid: Shows the vertical plane on the right
  - XZ-grid: Shows the vertical plane on the left
- These grids help visualize the scaling effects in 3D space

### Step 7: Best Practices
- **Always** follow this sequence:
  1. Set your desired X, Y, Z values
  2. Click **Apply Scaling**
  3. Then use the slider to see the transition
- Use the **Reset** button to return to default values
- Ensure the slider is at zero before making new adjustments
- Observe how the shape's proportions change relative to the grid lines
- Compare the visual changes with the values in the transformation matrix

### Step 8: Experimentation
- Try these exercises to understand scaling:
  1. Reset to defaults (X=3, Y=2, Z=2)
  2. Set X=1, Y=1, Z=1 and click **Apply Scaling**
  3. Move the slider to see the transition to base size
  4. Set X=2, Y=2, Z=2 and click **Apply Scaling**
  5. Move the slider to see uniform scaling
  6. Experiment with different values for each axis:
     - Set new values
     - Click **Apply Scaling**
     - Use the slider to observe the transition
  7. Try the slider at different speeds to understand the animation
