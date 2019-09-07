# Types

A *type* refers to a class of data and the operations permitted on that class of data. 
The following built-in types are supported for the @boardname@:

## Basic (primitive) types #primitives

* **[Number](/types/number)**: an integer number (32-bit signed)
* **[String](/types/string)**: a sequence of characters
* **[Boolean](/types/boolean)**: true or false

## Complex types #complex

* **[Array](/types/array)**: a list of items of a primitive type

## Functions

* **[Function](types/function)**: code you can reuse anywhere in a program 

## Images and Sprites #custom

* **[Image](/types/image)**: rows and columns of color pixels that make a picture
* **[Sprite](/types/sprite)**: an operation object to locate and move an image

## User data

TypeScript allows you to create user-defined classes of data. 

```typescript
class Foo {
    public bar: number;
    baz() {

    }
}
```
