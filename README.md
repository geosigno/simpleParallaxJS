<div align="center">
<picture>
  <source srcset="https://simpleparallax.com/logo-vertical-dark.png" media="(prefers-color-scheme: dark)">
  <source srcset="https://simpleparallax.com/logo-vertical-light.png" media="(prefers-color-scheme: light)">
  <img src="https://simpleparallax.com/logo-vertical-dark.png" alt="Logo" width="400" height="180" style="display:block;margin:0 auto;">
</picture>
</div>

# simpleParallax.js

simpleParallax.js is a lightweight and easy-to-use React and JS library that adds parallax animations to any image.

While other plugins can be complex, simpleParallax.js is notable for its simplicity and impressive visual effects. The parallax effect is applied directly to image tags, eliminating the need for background images. Any image can be used. More info on the case study [here](https://medium.com/@geoffrey.signorato/case-study-create-a-parallax-effect-directly-on-img-tags-with-javascript-35b8daf81471).

Give it a try!

## Installation

Install the package via npm or yarn:

```sh
#npm
npm install simple-parallax-js

#yarn
yarn add simple-parallax-js
```

Import it:

```javascript
//React version
import SimpleParallax from 'simple-parallax-js';

//Vanilla Version
import SimpleParallax from "simple-parallax-js/vanilla";
```

## Initialization

### React

Simply add the following JavaScript code:

```javascript

import SimpleParallax from "simple-parallax-js";

const Component = () => (
  <SimpleParallax>
    <img src={"thumbnail.jpg"} alt={"image"} />
  </SimpleParallax>
)

```
### Vanilla

Giving the following HTML :

```html
 <img class="thumbnail" src="image.jpg" alt="image">
```

simply add the following JavaScript code :

```javascript
const image = document.getElementsByClassName('thumbnail');
new SimpleParallax(image);
```

You can also choose to apply the parallax on multiple images :

```javascript
const images = document.querySelectorAll('img');
new SimpleParallax(images);
```

Once simpleparallax has been correctly initialized, it adds the ```simple-parallax-initialized``` class on the container.

simpleParallax now works with video :

```html
<video>
  <source src="video.mp4" type="video/mp4">
</video>
```

```javascript
var video = document.getElementsByTagName('video');
new SimpleParallax(video);
```

## Settings

Setting | Type | Default | Hint
--- | --- | --- | ---
orientation | String | up | up - right - down - left - up left - up right - down left - down right
scale | Number | 1.3 | need to be above 1
overflow | Boolean | false | 
delay | Number | 0 | the delay is in second **Watch out, sometimes this delay is causing issue on iOS devices [#47](https://github.com/geosigno/simpleParallax.js/issues/47)**
transition | String | '' | any CSS transition
maxTransition | Number | 0 | it should be a percentage between 1 and 99
customContainer | String or Node | '' | (Vanilla version only)
customWrapper | String | '' | the selector of the custom wrapper (Vanilla version only)

You can apply these settings with the following JS code :

### React

```javascript
import SimpleParallax from "simple-parallax-js";

const Component = () => (
  <SimpleParallax 
    delay={0}
    orientation={"down"}
    scale={1.3}
    overflow
    maxTransition={60}
  >
    <img src={"thumbnail.jpg"} alt={"image"} />
  </SimpleParallax>
)
```

### Next

```javascript
import SimpleParallax from "simple-parallax-js";
import Image from "next/image";

const Component = () => (
  <SimpleParallax 
    delay={0}
    orientation={"down"}
    scale={1.3}
    overflow
    maxTransition={60}
  >
    <Image src={"thumbnail.jpg"} alt={"image"} width={1920} height={1024} />
  </SimpleParallax>
)
```

### Vanilla

```javascript
var images = document.querySelectorAll('.thumbnail');
new SimpleParallax(images, {
    delay: 0,
    orientation: 'down',
    scale: 1.3,
    overflow: true,
    customContainer: '.container',
    customWrapper: '.wrapper'
});
```

### orientation - *String* - see [example](https://simpleparallax.com#example-orientation)
The parallax effect's orientation, or direction, can be customized. If you choose *up*, the image will move from bottom to top as you scroll down, and from top to bottom as you scroll up. This same logic applies for all other orientations, including *right*, *down*, *left*, *up left*, *up right*, *down left*, and *down right*. If two directions are combined, such as *down right*, the image will move diagonally.

### scale - *Number* - see [example](https://simpleparallax.com#example-scale)
The higher the *scale* setting, the more pronounced the parallax effect becomes. However, this can cause the image quality to diminish. To mitigate this, if the *scale* is set at 1.5 and your image width is 500px, simply multiply 500 by 1.5 to get 750. You can then use a 750px image in place of your 500px one to maintain image quality. More information can be found in the case study linked [here](https://medium.com/@geoffrey.signorato/case-study-create-a-parallax-effect-directly-on-img-tags-with-javascript-35b8daf81471).

### overflow - *Boolean* - see [example](https://simpleparallax.com#example-overflow)
By default, the image scales to create a parallax effect without any overflow on the layout - for a better understanding, review the [case study](https://medium.com/@geoffrey.signorato/case-study-create-a-parallax-effect-directly-on-img-tags-with-javascript-35b8daf81471). When overflow is set to true, the image will translate beyond its natural flow, potentially overlapping your content.

### delay - *Number* - see [example](https://simpleparallax.com#example-delay-transition)
Setting a delay prolongs the image's translation even after the user has stopped scrolling, creating a pleasing effect. This delay is measured in seconds. **Watch out, sometimes this delay is causing issue on iOS devices [#47](https://github.com/geosigno/simpleParallax.js/issues/47)**

### transition - *String* - see [example](https://simpleparallax.com#example-delay-transition)
The transition setting is linked with the delay setting. It applies any CSS transition to the delay setting, such as ease or ease-in-out.

### maxTransition - *Number* - see [example](https://simpleparallax.com#example-max-transition)
The maxTransition setting controls the extent of the parallax animation. By default, it translates from 0% to 100% of the user's viewport. You can adjust this to any percentage.

### src - *String* - Vanilla version only
This is the source of the image. It can be a local path or a URL.

### customContainer - *String or Node* - Vanilla version only
Parallax calculations default to the body scroll percentage. However, images may be in a container with its own scroll area. For accurate calculations, set a custom container.

### customWrapper - *String* - Vanilla version only
In some instances, you might want to use your own wrapper instead of the plugin's. Specifying a custom wrapper will add the simpleParallax class and an overflow: hidden style.

## Methods

### refresh
Refresh a simpleParallax instance (to recalculate all the positions) : 

```javascript
var images = document.querySelectorAll('img');
var instance = new SimpleParallax(images);
instance.refresh();
```

By default, the refresh method is fired at every window resize.

### destroy
Destroy a simpleParallax instance:

```javascript
var images = document.querySelectorAll('img');
var instance = new SimpleParallax(images);
instance.destroy();
```

## Examples
You can find all the examples [here](https://simpleparallax.com/#examples).

## Compatibility
| IE | Edge | Firefox | Chrome | Safari | Opera | iOS Safari |
|---|---|---|---|---|---|---|
| no support | 16+ | 55+ | 58+ | 12.1+ | 45+ | 12.2+ |

Even though old browsers are not supported, the page won't crash. Simply, there will be no parallax.

If you want to support older browsers such as IE, you will need a polyfill for [closest()](https://developer.mozilla.org/en-US/docs/Web/API/Element/closest#Polyfill) and [Intersection Observer](https://github.com/w3c/IntersectionObserver/tree/master/polyfill). Please note that even with polyfills, the parallax effect will not seem fluid.

## Author

[Geoffrey Signorato](https://github.com/geosigno/)

## Contributing

Open an issue or a pull request to suggest changes or additions.

