# Activity: Sprite Motion and Events 

Motion is the change in position. To get sprites moving, we will change their position using a game pad event. The game pad has ``||controller:controller events||`` for the ``||controller:up||``, ``||controller:down||``, ``||controller:left||`` and ``||controller:right||`` buttons. 

We can use those events to change sprite location, and to make the sprite move. We will also see how to give a sprite a velocity. Velocity is the rate of change of our position - in real life, this is often measured as kilometers per hour or miles per hour. 

When the velocities of a sprite are not zero, then the sprite will be in motion.

In these activities, the student will use:
* Controller events
* Incrementing ``||sprites:x||`` and ``||sprites:y||`` coordinates
* Setting ``||sprites:vx||`` and ``||sprites:vy||`` velocity
* Short methods and functions with motion
* ``||sprites:stay on screen||``
* Flipping (and switching) images

## Change position with controller event

https://youtu.be/O27uzdkbgK4

[Alternative Video Location](https://aka.ms/40544a-spritemoevent1)

## Example #1: Increment position left and right

1. Review the code below
2. Create the sample code and run the code
3. Save the code for the task (name it "motionLR")

```blocks
enum SpriteKind {
    Player,
    Enemy
}
let agent: Sprite = null
controller.right.onEvent(ControllerButtonEvent.Pressed, function () {
    agent.x += 3
})
controller.left.onEvent(ControllerButtonEvent.Pressed, function () {
    agent.x += -3
})
agent = sprites.create(img`
. . . . . . . . . . . . . . . . 
. . . . . . . . . . . . . . . . 
. . . . . . . . . . . . . . . . 
. . . . . . . . . . . . . . . . 
. . . . . . 6 6 6 6 . . . . . . 
. . . . . 6 6 6 6 6 6 . . . . . 
. . . . 6 6 6 6 6 6 6 . . . . . 
. . . . 6 6 6 6 6 6 6 6 . . . . 
. . . 6 6 6 6 6 6 6 6 6 . . . . 
. . . 6 6 6 6 6 6 6 6 6 . . . . 
. . . . . 6 6 6 6 6 6 . . . . . 
. . . . . . 6 6 6 . . . . . . . 
. . . . . . . . . . . . . . . . 
. . . . . . . . . . . . . . . . 
. . . . . . . . . . . . . . . . 
. . . . . . . . . . . . . . . . 
`, SpriteKind.Player)
```

## Student Task #1: Increment position Y-axis (up and down)

1. Start with example 1 (motionLR, or your own similar code)
2. Add additional code to control the up and down (`Y` direction) motions using the controller 
3. **Challenges:**
    * Add an ``||controller:A||`` button event to move the sprite to the center of the game screen
    * Add a ``||controller:B||`` button event to make the sprite "jump" (move) 15 pixels

## Concept: Sprite Motion Velocity

https://youtu.be/Gl0Y2sHY_MA 

[Alternative Video Location](https://aka.ms/40544a-spritemoevent2velocity)

Velocity is speed in a particular direction. In our games we typically track movement in `X` and `Y` directions. 

If we have a positive `X` velocity, for example, then our sprite will continue to increase in `X`, making it move to the right across the screen.

## Example #2: Increment Velocity Left and Right

1. Review the code below
2. Create the sample code and run the code
3. Save the code for the task (name it "velocityLR")

```blocks
enum SpriteKind {
    Player,
    Enemy
}
let agent: Sprite = null
controller.right.onEvent(ControllerButtonEvent.Pressed, function () {
    agent.vx += 1
})
controller.left.onEvent(ControllerButtonEvent.Pressed, function () {
    agent.vx += -1
})
agent = sprites.create(img`
. . . . . . . . . . . . . . . . 
. . . . . . . . . . . . . . . . 
. . . . . . . . . . . . . . . . 
. . . . . . . . . . . . . . . . 
. . . . . . 6 6 6 6 . . . . . . 
. . . . . 6 6 6 6 6 6 . . . . . 
. . . . 6 6 6 6 6 6 6 . . . . . 
. . . . 6 6 6 6 6 6 6 6 . . . . 
. . . 6 6 6 6 6 6 6 6 6 . . . . 
. . . 6 6 6 6 6 6 6 6 6 . . . . 
. . . . . 6 6 6 6 6 6 . . . . . 
. . . . . . 6 6 6 . . . . . . . 
. . . . . . . . . . . . . . . . 
. . . . . . . . . . . . . . . . 
. . . . . . . . . . . . . . . . 
. . . . . . . . . . . . . . . . 
`, SpriteKind.Enemy)
```

## Student Task #2: Increment Velocity Up and Down 

1. Start with example #2 ("velocityLR") or your own similar code
2. Add additional code to control the up and down (`Y` direction) velocities using the controller 
3. **Challenges:**
    * Add an ``||controller:A||`` button event move the sprite to the center of the game screen
    * Add a ``||controller:B||`` button event to stop the sprite (all velocities = 0)

## Concept: Shorter ``||sprites:dx||``/``||sprites:dy||`` approach

https://youtu.be/TPpg3jp2lx4

[Alternative Video Location](https://aka.ms/40544a-spritemoevent3shortmethod)

We have created motion by capturing the key pad events and incrementing (or decrementing) a location coordinate or a velocity. Now that we have seen how this works for the four directional buttons, we can use a shorter method to handle this.

## Example #3: Motion short ``||sprites:dx||`` / ``||sprites:dy||`` code method 

1. Review the code below
2. Create the sample code and run the code
3. Save the code for the task (name it "motionShortMethod")
4. Note the blocks in ``||game:on game update||``

```blocks
enum SpriteKind {
    Player,
    Enemy
}
let ball: Sprite = null
scene.setBackgroundColor(1)
ball = sprites.create(img`
. . . . . . . . . . . . . . . . 
. . . . . . . . . . . . . . . . 
. . . . . . . . . . . . . . . . 
. . . . . . . . . . . . . . . . 
. . . . . . 6 6 6 6 . . . . . . 
. . . . . 6 6 6 6 6 6 . . . . . 
. . . . 6 6 6 6 6 6 6 . . . . . 
. . . . 6 6 6 6 6 6 6 6 . . . . 
. . . 6 6 6 6 6 6 6 6 6 . . . . 
. . . 6 6 6 6 6 6 6 6 6 . . . . 
. . . . . 6 6 6 6 6 6 . . . . . 
. . . . . . 6 6 6 . . . . . . . 
. . . . . . . . . . . . . . . . 
. . . . . . . . . . . . . . . . 
. . . . . . . . . . . . . . . . 
. . . . . . . . . . . . . . . . 
`, SpriteKind.Enemy)
game.onUpdate(function () {
    ball.x += controller.dx()
    ball.y += controller.dy()
})
```

## Student Task #3: Create Velocity Motion

1. Start with motion (short method) example above or similar code
2. Explore the controller menu for ``||controller:control mySprite with vx 100 vy 100||``
3. Change the key pad motion to use the discovered block by placing it in ``||game:on start||``
3. Make the sprite stay in the screen boundary
4. **Challenge:** add button events that stop the sprite's motion, and reset the sprite to the center of the screen

### ~hint

The ``||sprites:stay in screen||`` block is in the sprite menu.

### ~

## Concept: Flip Image

https://youtu.be/1tae8OZpt4w

[Alternative Video Location](https://aka.ms/40544a-spritemoevent4flip)

By making a mirror flip of a sprite we can simulate walking by making each leg appear differently 

## Example #4: Image Flip with button press event

Flipping an image creates a mirror image when we use ``||images:flip horizontal||`` block. This can be useful in creating a simple 2 frame walking animation.

1. Review the code below
2. Create the sample code and run the code
3. Save the code for the task (name it "flipImage")
4. Note use of the function called "flipHorizontal"
5. Find the ``||sprites:sprite image||`` block in the sprites menu that is the image that is flipped

```blocks
enum SpriteKind {
    Player,
    Enemy
}
function flipHorizontal() {
    mySprite.image.flipX()
    pause(200)
}
controller.anyButton.onEvent(ControllerButtonEvent.Pressed, function () {
    flipHorizontal()
})
scene.setBackgroundColor(6)
let mySprite: Sprite = sprites.create(img`
. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 
. . . . . . . . . . . . . . 2 . . . . . . . . . . . . . . . . . 
. . . . . . . . . . . . 2 2 2 2 2 . . . . . . . . . . . . . . . 
. . . . . . . . . . . 2 2 2 2 2 2 2 . . . . . . . . . . . . . . 
. . . . . . . . . . 2 2 2 2 2 2 2 2 2 . . . . . . . . . . . . . 
. . . . . . . . . . 2 2 7 2 2 2 7 2 2 . . . . . . . . . . . . . 
. . . . . . . . . 2 2 2 2 2 8 2 2 2 2 2 . . . . . . . . . . . . 
. . . . . . . . . . 2 2 2 2 8 8 2 2 2 . . . . . . . . . . . . . 
. . . . . . . . . . 2 2 2 2 2 2 2 2 2 . . . . . . . . . . . . . 
. . . . . . . . . . . 2 2 9 9 2 2 2 . . . . . . . . . . . . . . 
. . . . . . . 4 4 4 4 4 2 2 2 2 2 4 4 4 4 4 . . . . . . . . . . 
. . . . . . . 4 4 4 4 4 4 4 2 4 4 4 4 4 4 4 . . . . . . . . . . 
. . . . . . . 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 . . . . . . . . . . 
. . . . . . . 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 . . . . . . . . . . 
. . . . . . . 4 4 4 . 4 4 4 4 4 4 4 . 4 4 4 . . . . . . . . . . 
. . . . . . . 4 4 4 . 4 4 4 4 4 4 4 . 4 4 4 . . . . . . . . . . 
. . . . . . . 4 4 4 . 4 4 4 4 4 4 4 . 4 4 4 . . . . . . . . . . 
. . . . . . . 4 4 4 . 4 4 4 4 4 4 4 . 4 4 4 . . . . . . . . . . 
. . . . . . . 4 4 4 . 4 4 4 4 4 4 4 . a a a . . . . . . . . . . 
. . . . . . . 4 4 4 . 4 4 4 4 4 4 4 . a . a . . . . . . . . . . 
. . . . . . . a a a . 4 4 4 4 4 4 4 . a a a . . . . . . . . . . 
. . . . . . . a . a . 4 4 4 4 4 4 4 . . . . . . . . . . . . . . 
. . . . . . . a a a . 7 7 . . . . 7 7 . . . . . . . . . . . . . 
. . . . . . . . . . . 7 7 . . . . 7 7 . . . . . . . . . . . . . 
. . . . . . . . . . . 7 7 . . . . 7 7 . . . . . . . . . . . . . 
. . . . . . . . . . . 7 7 . . . . 7 7 . . . . . . . . . . . . . 
. . . . . . . . . . . 7 7 . . . . 7 7 . . . . . . . . . . . . . 
. . . . . . . . . . . 7 7 . . . . 7 7 . . . . . . . . . . . . . 
. . . . . . . . . . . 7 7 . . . . 7 7 . . . . . . . . . . . . . 
. . . . . . . . . . d d d . . . . 7 7 . . . . . . . . . . . . . 
. . . . . . . . . . . . . . . . . 7 7 . . . . . . . . . . . . . 
. . . . . . . . . . . . . . . . d d d . . . . . . . . . . . . . 
`, SpriteKind.Player)
```

## Student Task #4: Image Flip with motion

1. Start with example #4 above or your own similar code
2. Make your own image move using the ``||controller:up||``, ``||controller:down||``, ``||controller:left||``, ``||controller:right||`` buttons on the controller
3. Use ``||controller:A||`` button to ``||images:flip vertically||`` to flip the image upside down.

## What did we learn? 

1. Describe how events can be used to run code using an example.
2. Describe the difference between changing position and changing velocity.
3. **Challenge:** when using ``||images:flip||`` in task #4, ``||variables:mySprite||`` is **not** what is flipped. What is actually flipped? Explain how you know.

### [Teacher Material](/courses/csintro1/about/teachers)
