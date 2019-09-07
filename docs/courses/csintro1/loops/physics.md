# Activity: Sprite Physics

Up to this point, we have generally glossed over the exact details of how sprite motion works. In this activity, students will gain a greater understanding of how exactly a sprite's velocity and acceleration actually affects their behavior in a game.

In this activity, student will use:
* ``||sprites:projectile||`` sprites
* ``||game:on game update every||``
* ``||math:pick random||``
* Velocity: ``||sprites:vx||`` and ``||sprites:vy||``
* Acceleration: ``||sprites:ax||`` and ``||sprites:ay||``

## Concept: Velocity

https://youtu.be/aNYPqyIFRT0 

[Alternative Video Location](https://aka.ms/40544a-physics-velocity) 

Velocity is defined as speed in a given direction. Velocity is the rate at which an object's position changes, and the direction the position is changing. 

In real life, you can think of velocity like being in a train or a car; the speed on a highway may be 60 miles per hour, but the velocity would be 60 miles per hour going North. This means over the course of an hour at this rate, you will be 60 miles further North than you are currently.

In @boardname@, a sprite's velocity is measured in **pixels per second**, and stored as a sprite's ``||sprites:vx||`` and ``||sprites:vy||``.

A sprite's ``||sprites:vx||`` represents the sprite's velocity on the horizontal axis and is how quickly the sprite's ``||sprites:x||`` value is changing in value moving left to right. 

A sprite's ``||sprites:vy||``, represents the sprite's velocity in the vertical axis, and is how quickly the sprite's ``||sprites:y||`` changes in value moving up and down.

In @boardname@, a sprite's velocity is defined in terms of pixels per second.

### Example #1a: Change in Position vs Velocity

1. Review the code below
2. Create the sample code and run the code
3. Notice how the behavior for the two sprites is similar, and how it is different

```blocks
enum SpriteKind {
    Player,
    Enemy
}
let second: Sprite = null
let first: Sprite = null
first = sprites.createProjectile(img`
. . . . . . . . . . . . . . . . 
. . . . . . . . . . . . . . . . 
. . . . . . . . . . . . . . . . 
. . . . . . . . . . . . 2 . . . 
. . . . . . . . . . . . 2 2 . . 
. . . . . . . . . . . . 2 2 2 . 
. . . . . . . . . . . . 2 2 2 2 
2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 
. . . . . . . . . . . . 2 2 2 2 
. . . . . . . . . . . . 2 2 2 . 
. . . . . . . . . . . . 2 2 . . 
. . . . . . . . . . . . 2 . . . 
. . . . . . . . . . . . . . . . 
. . . . . . . . . . . . . . . . 
. . . . . . . . . . . . . . . . 
. . . . . . . . . . . . . . . . 
`, 0, 0, SpriteKind.Player)
second = sprites.createProjectile(img`
. . . . . . . . . . . . . . . . 
. . . . . . . . . . . . . . . . 
. . . . . . . . . . . . . . . . 
. . . . . . . . . . . . 9 . . . 
. . . . . . . . . . . . 9 9 . . 
. . . . . . . . . . . . 9 9 9 . 
. . . . . . . . . . . . 9 9 9 9 
9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 
. . . . . . . . . . . . 9 9 9 9 
. . . . . . . . . . . . 9 9 9 . 
. . . . . . . . . . . . 9 9 . . 
. . . . . . . . . . . . 9 . . . 
. . . . . . . . . . . . . . . . 
. . . . . . . . . . . . . . . . 
. . . . . . . . . . . . . . . . 
. . . . . . . . . . . . . . . . 
`, 0, 0, SpriteKind.Player)
first.x += -80
second.x += -80
first.y += -10
second.y += 10
first.vx = 30
game.onUpdateInterval(1000, function () {
    second.x += 30
})
game.onUpdate(function () {
    first.say("x: " + Math.ceil(first.x))
    second.say("x: " + second.x)
})
```

In particular, pay attention to these portions of the code:

```block
let first: Sprite = null
let second: Sprite = null
first.vx = 30
game.onUpdateInterval(1000, function () {
    second.x += 30
})
```

## Concept: Acceleration

https://youtu.be/pRUlsEekmUg 

[Alternative Video Location](https://aka.ms/40544a-physics-acceleration) 

Acceleration represents the rate of change in velocity. We think of this is how much an object is speeding up or slowing down in a particular direction. Gravity is a good example of acceleration where falling objects increase in velocity, falling faster and faster, in the down direction.

The relationship between acceleration and velocity is similar to the relationship between velocity and position. Velocity is the rate at which position is changing, and acceleration is the rate at which velocity is changing.

In other words, acceleration tells us how quickly the velocity is changing. Braking in a car or speeding up in a rocket taking off are examples of acceleration. We feel a force pull on our bodies when there is acceleration.

In @boardname@, a sprite's acceleration is defined in terms of **pixels per second, per second** (pixels/s/s).

### Example #1b - Sprite with Acceleration

Below is a sprite with an acceleration applied. We set the sprite position to the bottom of the screen every 2 seconds in order to see how the velocity changes over time. We see the sprite has a larger velocity with each pass.

```blocks
enum SpriteKind {
    Player,
    Enemy
}
let mySprite: Sprite = null
mySprite = sprites.create(img`
. . . . . . . . . . . . . . . . 
. . . . . . . . . . . . . . . . 
. . . . . . . . . . . . . . . . 
. . . 1 1 1 1 1 1 1 1 1 1 1 . . 
. . . 1 e e e e e e e e e 1 . . 
. . . 1 e e e e e e e e e 1 . . 
. . . 1 e e e e e e e e e 1 . . 
. . . 1 e e e e e e e e e 1 . . 
. . . 1 e e e e e e e e e 1 . . 
. . . 1 e e e e e e e e e 1 . . 
. . . 1 e e e e e e e e e 1 . . 
. . . 1 1 1 1 1 1 1 1 1 1 1 . . 
. . . . . . . . . . . . . . . . 
. . . . . . . . . . . . . . . . 
. . . . . . . . . . . . . . . . 
. . . . . . . . . . . . . . . . 
`, SpriteKind.Player)
mySprite.ay = -20
for (let i = 0; i < 5; i++) {
    mySprite.y = 140
    pause(2000)
}
mySprite.destroy()

```

### Example #1c: Change in Velocity vs Acceleration

1. Review the code below
2. Create the sample code and run the code
3. Notice how the behavior for the two sprites is similar, and how it is different

```blocks
enum SpriteKind {
    Player,
    Enemy
}
let second: Sprite = null
let first: Sprite = null
first = sprites.createProjectile(img`
. . . . . . . . . . . . . . . . 
. . . . . . . . . . . . . . . . 
. . . . . . . . . . . . . . . . 
. . . . . . . . . . . . 2 . . . 
. . . . . . . . . . . . 2 2 . . 
. . . . . . . . . . . . 2 2 2 . 
. . . . . . . . . . . . 2 2 2 2 
2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 
. . . . . . . . . . . . 2 2 2 2 
. . . . . . . . . . . . 2 2 2 . 
. . . . . . . . . . . . 2 2 . . 
. . . . . . . . . . . . 2 . . . 
. . . . . . . . . . . . . . . . 
. . . . . . . . . . . . . . . . 
. . . . . . . . . . . . . . . . 
. . . . . . . . . . . . . . . . 
`, 20, 0, SpriteKind.Player)
second = sprites.createProjectile(img`
. . . . . . . . . . . . . . . . 
. . . . . . . . . . . . . . . . 
. . . . . . . . . . . . . . . . 
. . . . . . . . . . . . 9 . . . 
. . . . . . . . . . . . 9 9 . . 
. . . . . . . . . . . . 9 9 9 . 
. . . . . . . . . . . . 9 9 9 9 
9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 
. . . . . . . . . . . . 9 9 9 9 
. . . . . . . . . . . . 9 9 9 . 
. . . . . . . . . . . . 9 9 . . 
. . . . . . . . . . . . 9 . . . 
. . . . . . . . . . . . . . . . 
. . . . . . . . . . . . . . . . 
. . . . . . . . . . . . . . . . 
. . . . . . . . . . . . . . . . 
`, 20, 0, SpriteKind.Player)
first.y += -10
second.y += 10
first.ax = 2
game.onUpdate(function () {
    first.say("vx: " + Math.ceil(first.vx))
    second.say("vx: " + second.vx)
})
game.onUpdateInterval(1000, function () {
    second.vx += 2
})

```

## Student Task #1a: Water balloons

https://youtu.be/lMLLUf4NQF0 

[Alternative Video Location](https://aka.ms/40544a-physics-task-a) 

1. Review the code below
2. Create the sample code and run the code
3. Save the code for the task (name it "water balloon")
4. Currently, when the balloon collides with the block, it creates only a single drop of a splash. Use a loop in the overlap event between sprites of kind Balloon and sprites of kind Enemy to create 50 drops of kind ``||sprites:Splash||`` instead
5. **Challenge:** set the acceleration for every splash of water emitted from the balloon to be 40, so that the splashes will accelerate downwards at the same rate the balloon did

### ~hint

In total, this loop should include 4 blocks - the generation of a random ``||variables:xDirection||`` and ``||variables:yDirection||``, the creation of the projectile, and the block that sets the projectiles ghost flag to be on.

### ~

```blocks
enum SpriteKind {
    Player,
    Enemy,
    Balloon,
    Splash
}
let projectile: Sprite = null
let yDirection = 0
let balloon: Sprite = null
let xDirection = 0
let block: Sprite = null
sprites.onOverlap(SpriteKind.Balloon, SpriteKind.Enemy, function (sprite, otherSprite) {
    sprite.setFlag(SpriteFlag.Ghost, true)
    xDirection = Math.randomRange(0, 50)
    yDirection = Math.randomRange(0, 50)
    // create the splash
    projectile = sprites.createProjectile(img`
9 
`, xDirection, yDirection, SpriteKind.Splash, sprite)
    // create the splash
    projectile = sprites.createProjectile(img`
9 
`, -1 * xDirection, -1 * yDirection, SpriteKind.Splash, sprite)
    // make the splash a ghost, so that it doesn't
    // interact with other sprites
    projectile.setFlag(SpriteFlag.Ghost, true)
    // destroy the balloon
    sprite.destroy()
})
controller.A.onEvent(ControllerButtonEvent.Pressed, function () {
    balloon.vx = 40
    balloon.vy = -50
    balloon.ay = 40
})
controller.B.onEvent(ControllerButtonEvent.Pressed, function () {
    balloon.destroy()
    balloon = sprites.create(img`
. . . . . . . 8 . . . . . . . . 
. . . . . 8 8 9 8 8 . . . . . . 
. . . . 8 9 9 9 9 9 8 . . . . . 
. . . 8 9 9 8 8 8 9 9 8 . . . . 
. . . 8 9 8 8 9 9 8 9 8 . . . . 
. . 8 9 9 8 8 8 9 8 9 9 8 . . . 
. . . 8 9 8 8 8 8 8 9 8 . . . . 
. . . 8 9 9 8 8 8 9 9 8 . . . . 
. . . . 8 9 9 9 9 9 8 . . . . . 
. . . . . 8 8 9 8 8 . . . . . . 
. . . . . . . 8 . . . . . . . . 
`, SpriteKind.Balloon)
    balloon.x += -50
})
scene.setBackgroundColor(6)
block = sprites.create(img`
f f f f f f f f f f f f f f f f 
f 1 2 2 1 1 2 2 2 1 2 1 1 2 1 f 
f 1 2 1 2 1 2 1 2 1 2 2 1 2 1 f 
f 1 2 1 2 1 2 2 2 1 2 1 2 2 1 f 
f 1 2 2 1 1 2 1 2 1 2 1 1 2 1 f 
f 1 1 1 1 1 1 1 1 1 1 1 1 1 1 f 
f 1 2 2 2 1 2 2 2 1 2 2 2 1 1 f 
f 1 2 1 1 1 2 1 1 1 2 1 2 1 1 f 
f 1 2 1 2 1 2 2 1 1 2 2 2 1 1 f 
f 1 2 2 2 1 2 2 2 1 2 1 1 2 1 f 
f f f f f f f f f f f f f f f f 
. . . . . . . . . . . . . . . . 
. . . . . . . . . . . . . . . . 
. . . . . . . . . . . . . . . . 
. . . . . . . . . . . . . . . . 
. . . . . . . . . . . . . . . . 
`, SpriteKind.Enemy)
block.x += 50
balloon = sprites.create(img`
. . . . . . . . . . . . . . . . 
. . . . . . . . . . . . . . . . 
. . . . . . . 8 . . . . . . . . 
. . . . . 8 8 9 8 8 . . . . . . 
. . . . 8 9 9 9 9 9 8 . . . . . 
. . . 8 9 9 8 8 8 9 9 8 . . . . 
. . . 8 9 8 8 9 9 8 9 8 . . . . 
. . 8 9 9 8 8 8 9 8 9 9 8 . . . 
. . . 8 9 8 8 8 8 8 9 8 . . . . 
. . . 8 9 9 8 8 8 9 9 8 . . . . 
. . . . 8 9 9 9 9 9 8 . . . . . 
. . . . . 8 8 9 8 8 . . . . . . 
. . . . . . . 8 . . . . . . . . 
. . . . . . . . . . . . . . . . 
. . . . . . . . . . . . . . . . 
. . . . . . . . . . . . . . . . 
`, SpriteKind.Balloon)
balloon.x += -50

```

## Student Task #1b: Flying Duck

https://youtu.be/mmRhSMyFtaY 

[Alternative Video Location](https://aka.ms/40544a-physics-task-b) 

In this task, you will make a basic version of a flying bird game. In it, the bird will fall due to gravity, and whenever the player presses ``||controller:A||`` button, the bird flies into the sky.

1. Open a new project, and name it "Flying Duck"
2. Create a sprite on the screen
3. Give the sprite an acceleration in the ``||sprites:Y||`` direction, so that it falls due to 'gravity'
4. Create an ``||controller:on A button pressed||`` event
5. Inside of the ``||controller:on A button pressed||`` event, use ``||sprites:change by||`` to change the sprite's velocity in the ``||sprites:Y||`` direction, so that pressing the ``||controller:A||`` button makes the sprite 'fly' and counteract 'gravity'
6. **Challenge:** create an ``||game:on game update every 2000 ms||`` event which spawns a projectile that moves horizontally across the screen. Set the projectile's ``||sprites:Y||`` position to a random place on the screen, using the ``||Math:pick random||`` and ``||Scene:screen height||`` blocks. Make something happen when the projectiles overlap with the player sprite!

![Flying Duck](/static/courses/csintro1/loops/flying-duck.gif)

### ~hint

Try different values for the vertical acceleration representing gravity ``||sprites:ay||`` such as 25, 50, 100, 200.

What is a reasonably challenging value for the acceleration of gravity for the duck?

### ~

## What did we learn?

1. Why does making a sprite have a random velocity in both the x and y directions cause the sprite to move in a random direction? How would limiting the projectile to only positive directions change this?
2. In examples #1a and #1c, you likely noticed that the values were fluctuating more for ``||variables:first||`` than for ``||variables:second||``, even though they were both increasing at the same rate on a second-by-second basis. Make a hypothesis on why that is.
3. **Challenge:** did either racer (example #1 or example #2) have a clear winner? Make a hypothesis on why this might be, even if the rate of change is the same on a second-by-second basis.

### [Teacher Material](/courses/csintro1/about/teachers)
