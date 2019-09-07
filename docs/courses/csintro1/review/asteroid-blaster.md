# Review: Asteroid Blaster

Create your own asteroid destroying masterpiece.

![Asteroid Blaster](/static/courses/csintro1/review/asteroid-blaster.gif)

## Student Task #1: Create the Spaceship

Create a spaceship for the player to control

1. Create a sprite, with the image set to a spaceship. Store it in the variable ``||variables:spaceship||``
2. Add a ``||controller:control sprite spaceship with||`` block, and set both ``||controller:vx||`` and ``||controller:vy||`` to 50
3. ``||sprites:Change||`` ``||variables:spaceship||``s ``||sprites:y||`` position by 40, to move them closer to the bottom of the screen
4. Use ``||info:set life to 3||`` to start the player off with some life
5. Use ``||info:set score to 0||`` to start the player off with no score

## Student Task #2: Firing Lasers

Add the ability for the player to fire lasers

1. Create an ``||controller:on A button pressed||`` event
2. In the event, create a ``||sprites:projectile||`` with a ``||sprites:vx||`` of 0 and a ``||sprites:vy||`` of -100. Change the kind to ``||sprites:Laser||``
3. Change the ``||sprites:projectile||``s image to be a laser - a one or two pixel line is enough
4. Press the ``+`` on the ``||sprites:projectile||``, and change to be ``||sprites:from spaceship||``
5. Set the ``||sprites:z||`` value for the ``||sprites:projectile||`` to be -1, so that it appears below the ship

## Student Task #3: Evil Asteroids

Add asteroids for the player to avoid, that are created more quickly as time goes on

1. Create a ``||loops:forever||`` loop
2. Inside the ``||loops:forever||`` loop, create a projectile with an image of an asteroid. Change it to be of ``||sprites:kind||`` ``||sprites:Asteroid||``
3. Change both the ``x`` and ``y`` velocities of the ``||sprites:Asteroid||`` to be ``||math:random||`` values between -50 and 50
4. After creating the ``||sprites:Asteroid||``, use ``||loops:pause||`` to pause for `2000 - (30 x` ``||info:score||`` `)` ms. As the player scores **more points**, the time between asteroids being created **decreases**

## Student Task #4: Damage

Add an an event so that the player loses life 

1. Add an event for when a sprite of kind ``||sprites:Player||`` overlaps with a sprite of kind ``||sprites:Asteroid||``
2. Decrease ``||info:life||`` by 1
3. ``||sprites:destroy||`` the ``||sprites:Asteroid||`` sprite

## Student Task #5: Laser Effect

Give the laser some power to destroy the asteroids

1. Add an event for when a sprite of kind ``||sprites:Laser||`` overlaps with a sprite of kind ``||sprites:Asteroid||``
2. Increase the player's score by one
3. ``||sprites:destroy||`` both the ``||sprites:Asteroid||`` and ``||sprites:Laser||`` sprites involved in the overlap

## Challenges

Currently, the game gets nearly impossible to progress past 67 or so points; at that point, the ``||loops:pause||`` will do nothing, as ``2000 - 30 * 67`` is less than 0. To fix this, use ``||math:max||`` in the ``||loops:pause||``, to choose the maximum (largest) value between the current equation, and 500.
