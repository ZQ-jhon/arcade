# Activity: Generate Sprites using Create and On Create

Many games need to spawn sprites for the player to collect like coins, or to avoid like oil spills. 

We will use ``||sprites:create empty sprite||`` to spawn a new empty sprite, which is a place holder for a sprite without an image. Then we can use an ``||sprites:on created||`` event to set the image and a random position for newly generated sprites. 

The ``||sprites:on created||`` block uses the sprite's ``||sprites:kind||`` so we can give our new sprites the exact attributes we want, like an image, velocity, or position.

## Concept: Random Clouds - create with on created event 

https://youtu.be/eXCpLH74tF4

[Alternative Video Location](https://aka.ms/40544a-createoncreate)

## Example #1: Random clouds

This example uses the ``||sprites:on created||`` event to set the sprite image and location after a sprite of a particular kind is spawned.

1. Review the code below 
2. Create the sample code and run the code 
3. Save the code for the task (name it "spawnCloud")
4. Carefully examine the ``||sprites:create empty sprite||`` block and ``||sprites:on created||`` event

```blocks
enum SpriteKind {
    Helicopter,
    Cloud,
    Player,
    Enemy
}
let agent: Sprite = null
controller.up.onEvent(ControllerButtonEvent.Pressed, function () {
    agent.vy += -1
})
controller.down.onEvent(ControllerButtonEvent.Pressed, function () {
    agent.vy += 1
})
controller.left.onEvent(ControllerButtonEvent.Pressed, function () {
    agent.vx += -1
})
// Control the copter with the + pad
controller.right.onEvent(ControllerButtonEvent.Pressed, function () {
    agent.vx += 1
})
sprites.onCreated(SpriteKind.Cloud, function (newCloud) {
    newCloud.setImage(img`
. . . . . . . . . . . . . . . . 
. . . . . . . . . . . . . . . . 
. . . . 1 1 1 1 1 8 . . . . . . 
. . . 1 1 8 8 8 1 1 1 1 1 1 . . 
. 8 1 1 8 8 8 8 8 8 8 8 8 1 1 . 
. 1 8 8 8 1 8 8 8 1 1 8 8 8 1 . 
1 1 8 8 1 1 1 1 1 8 8 8 1 1 1 . 
1 1 8 8 8 8 8 1 1 8 1 8 1 1 . . 
. 1 1 1 1 8 8 8 8 8 8 8 1 8 . . 
. . . . 1 1 8 8 1 1 8 8 1 . . . 
. . . . . . 8 8 8 1 1 1 1 . . . 
. . . . . . 1 1 1 1 . . . . . . 
. . . . . . . . . . . . . . . . 
. . . . . . . . . . . . . . . . 
. . . . . . . . . . . . . . . . 
. . . . . . . . . . . . . . . . 
`)
    newCloud.x = Math.randomRange(16, scene.screenWidth() - 16)
    newCloud.y = Math.randomRange(20, scene.screenHeight() - 75)
})
sprites.onOverlap(SpriteKind.Helicopter, SpriteKind.Cloud, function (sprite, otherSprite) {
    sprite.x += -1 * sprite.vx
    sprite.y += -1 * sprite.vy
    sprite.vx = 0
    sprite.vy = 0
    otherSprite.y += -1
    pause(100)
    otherSprite.y += 1
})
game.splash("Generated Clouds", "on Sprite created")
scene.setBackgroundColor(9)
agent = sprites.create(img`
. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 
. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 
. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 
. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 
. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 
. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 
. . . . . . . . . . . . . . . . . . . . . . f f f f . . . . . . 
. . . . . f f f f . . . . . . . . . f f f f f f f . . . . . . . 
. . . . . . . f f f f f f f f f f f f f . . . . . . . . . . . . 
. . . . . . . . . . . . . . . f . . . . . . . . . . . . . . . . 
. . . . . . . . . . . . . . . f . . . . . . . . . . . . . . . . 
. . . . . . . . . . . . . . e f . . e e e . . . . . . . . . . . 
. . . . f . . . . . . . . . e . . e e f f 1 1 . . . . . . . . . 
. . f f f f f f f f . . . . e e e 2 f . 1 1 1 1 . . . . . . . . 
. . . . . f . . . . . . e e e 2 2 2 f 1 1 1 1 1 . . . . . . . . 
. . . . . f . . . e e e 2 2 2 2 2 2 f 1 1 1 1 1 e . . . . . . . 
. . . . . f e e e e 2 2 2 2 2 2 2 2 f f 1 1 f 2 e . . . . . . . 
. . . . . e e 2 2 2 2 2 2 2 2 2 2 2 f f f f f 2 e . . . . . . . 
. . . . . e 2 2 2 2 2 2 2 2 2 2 2 2 f f f f f 2 e . . . . . . . 
. . . . . e e 2 2 2 2 2 2 2 2 2 2 2 f f f f f 2 e . . . . . . . 
. . . . . . e e 2 2 2 2 2 2 e 2 2 2 2 2 2 f f 2 e . . . . . . . 
. . . . . . . e e 2 2 2 2 2 e e 2 2 2 2 2 2 2 e e . . . . . . . 
. . . . . . . . e e e e 2 e e e 2 2 2 2 2 2 e e . . . . . . . . 
. . . . . . . . . . . f e . . . e e e e e e . . . . . . . . . . 
. . . . . . . . . . . f . . . . . . . . f . . . . . . . . . . . 
. . . . . . f . . . . f . . . . . . . . f . . . . . f . . . . . 
. . . . . . f f f f f f f f f f f f f f f f f f f f . . . . . . 
. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 
. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 
. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 
. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 
. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 
`, SpriteKind.Helicopter)
// Create and place "clouds"  Sprites
sprites.createEmptySprite(SpriteKind.Cloud)
sprites.createEmptySprite(SpriteKind.Cloud)
```

## Student Task #1: More Random Clouds

The ``||sprites:on created||`` event allows us to set code to run whenever a new sprite is created. This is used to create new clouds multiple times with the same code. Now we will create new clouds with ``||sprites:create empty sprite of kind||`` blocks.

1. Start with example #1 or your own similar code
2. Review the code and find the ``||sprites:create empty sprite of kind||`` of kind blocks
3. Add 2 more ``||sprites:create empty sprite of kind||`` blocks for clouds
4. Add a new ``||sprites:create empty sprite of kind||`` for a different ``||sprites:kind||``. Use the ``||sprites:on created||`` event to
    * set an image for the sprite that is created (for example, a bird or a butterfly)
    * set the sprite to be in a random position
5. Use ``||sprites:create empty sprite of kind||`` to create at least five of the times.
6. **Challenge:** create an event for the ``||sprites:Helicopter||`` overlap with the new ``||sprites:kind||`` that has an action that gives the new ``||sprites:kind||`` a fast velocity so that it will fly off the screen after they overlap

## What did we learn?
 
1. Describe how a ``||sprites:kind||`` label is used in generating a sprite using ``||sprites:create empty sprite||`` block.
2. Explain what the ``||sprites:on created||`` block does for you.

### [Teacher Material](/courses/csintro1/about/teachers)
