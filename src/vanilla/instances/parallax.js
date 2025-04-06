import cssTransform from '../helpers/cssTransform';
import isImageLoaded from '../helpers/isImageLoaded';
import { viewport } from '../helpers/viewport';

class ParallaxInstance {
    constructor(element, options, prefersReducedMotion = false) {
        // set the element & settings
        this.element = element;
        this.elementContainer = element;
        this.settings = options;
        this.isVisible = true;
        this.isInit = false;
        this.oldTranslateValue = -1;
        this.prefersReducedMotion = prefersReducedMotion;

        this.init = this.init.bind(this);

        this.customWrapper =
            this.settings.customWrapper &&
            this.element.closest(this.settings.customWrapper)
                ? this.element.closest(this.settings.customWrapper)
                : null;

        // Don't initialize if reduced motion is preferred
        if (this.prefersReducedMotion) return;

        // check if images has not been loaded yet
        if (isImageLoaded(element)) {
            this.init();
        } else {
            this.element.addEventListener('load', () => {
                // timeout to ensure the image is fully loaded into the DOM
                setTimeout(() => {
                    this.init(true);
                }, 50);
            });
        }
    }

    init(asyncInit) {
        // Don't initialize if reduced motion is preferred
        if (this.prefersReducedMotion) return;
        
        // for some reason, <picture> are init an infinite time on windows OS
        if (this.isInit) return;

        if (asyncInit) {
            // in case the image is lazy loaded, the rangemax should be cleared
            // so it will be updated in the next getTranslateValue()
            this.rangeMax = null;
        }

        // check if element has not been already initialized with simpleParallax
        if (this.element.closest('.simpleParallax')) return;

        if (this.settings.overflow === false) {
            // if overflow option is set to false
            // wrap the element into a div to apply overflow
            this.wrapElement(this.element);
        }

        // apply the transform style on the image
        this.setTransformCSS();

        // get the current element offset
        this.getElementOffset();

        // init the Intesection Observer
        this.intersectionObserver();

        // get its translated value
        this.getTranslateValue();

        // apply its translation even if not visible for the first init
        this.animate();

        // if a delay has been set
        if (this.settings.delay > 0) {
            // apply a timeout to avoid buggy effect
            setTimeout(() => {
                // apply the transition style on the image
                this.setTransitionCSS();

                //add isInit class
                this.elementContainer.classList.add(
                    'simple-parallax-initialized'
                );
            }, 10);
        } else {
            //add isInit class
            this.elementContainer.classList.add('simple-parallax-initialized');
        }

        // for some reason, <picture> are init an infinite time on windows OS
        this.isInit = true;
    }

    // if overflow option is set to false
    // wrap the element into a .simpleParallax div and apply overflow hidden to hide the image excedant (result of the scale)
    wrapElement() {
        // check is current image is in a <picture> tag
        const elementToWrap = this.element.closest('picture') || this.element;

        // create a .simpleParallax wrapper container
        // if there is a custom wrapper
        // override the wrapper with it
        let wrapper = this.customWrapper || document.createElement('div');

        wrapper.classList.add('simpleParallax');
        wrapper.style.overflow = 'hidden';

        // append the image inside the new wrapper
        if (!this.customWrapper) {
            elementToWrap.parentNode.insertBefore(wrapper, elementToWrap);
            wrapper.appendChild(elementToWrap);
        }

        this.elementContainer = wrapper;
    }

    // unwrap the element from .simpleParallax wrapper container
    unWrapElement() {
        const wrapper = this.elementContainer;

        // if there is a custom wrapper, we jusy need to remove the class and style
        if (this.customWrapper) {
            wrapper.classList.remove('simpleParallax');
            wrapper.style.overflow = '';
        } else {
            wrapper.replaceWith(...wrapper.childNodes);
        }
    }

    // apply default style on element
    setTransformCSS() {
        if (this.settings.overflow === false) {
            // if overflow option is set to false
            // add scale style so the image can be translated without getting out of its container
            this.element.style[cssTransform] = `scale(${this.settings.scale})`;
        }

        // add will-change CSS property to improve perfomance
        this.element.style.willChange = 'transform';
    }

    // apply the transition effect
    setTransitionCSS() {
        // add transition option
        this.element.style.transition = `transform ${this.settings.delay}s ${this.settings.transition}`;
    }

    // remove style of the element
    unSetStyle() {
        // remove will change inline style
        this.element.style.willChange = '';
        this.element.style[cssTransform] = '';
        this.element.style.transition = '';
    }

    // get the current element offset
    getElementOffset() {
        // get position of the element
        const positions = this.elementContainer.getBoundingClientRect();
        // get height
        this.elementHeight = positions.height;
        // get offset top
        this.elementTop = positions.top + viewport.positions.top;
        // if there is a custom container
        if (this.settings.customContainer) {
            // we need to do some calculation to get the position from the parent rather than the viewport
            const parentPositions =
                this.settings.customContainer.getBoundingClientRect();
            this.elementTop =
                positions.top - parentPositions.top + viewport.positions.top;
        }
        // get offset bottom
        this.elementBottom = this.elementHeight + this.elementTop;
    }

    // build the Threshold array to cater change for every pixel scrolled
    buildThresholdList() {
        const thresholds = [];
        for (let i = 1.0; i <= this.elementHeight; i++) {
            const ratio = i / this.elementHeight;
            thresholds.push(ratio);
        }
        return thresholds;
    }

    // create the Intersection Observer
    intersectionObserver() {
        const options = {
            root: null,
            threshold: this.buildThresholdList()
        };
        this.observer = new IntersectionObserver(
            this.intersectionObserverCallback.bind(this),
            options
        );
        this.observer.observe(this.element);
    }

    // Intersection Observer Callback to set the element at visible state or not
    intersectionObserverCallback(entries) {
       entries.forEach((entry) => {
            if (entry.isIntersecting) {
                this.isVisible = true;
            } else {
                this.isVisible = false;
            }
        });
    }

    // check if the current element is visible in the Viewport
    // for browser that not support Intersection Observer API
    checkIfVisible() {
       return (
            this.elementBottom > viewport.positions.top &&
            this.elementTop < viewport.positions.bottom
        );
    }

    // calculate the range between image will be translated
    getRangeMax() {
        // get the real height of the image without scale
        const elementImageHeight = this.element.clientHeight;

        // range is calculate with the image height by the scale
        this.rangeMax =
            elementImageHeight * this.settings.scale - elementImageHeight;
    }

    // get the percentage and the translate value to apply on the element
    getTranslateValue() {
        // calculate the % position of the element comparing to the viewport
        // rounding percentage to a 1 number float to avoid unn unnecessary calculation
        let percentage = (
            (viewport.positions.bottom - this.elementTop) /
            ((viewport.positions.height + this.elementHeight) / 100)
        ).toFixed(1);

        // sometime the percentage exceeds 100 or goes below 0
        percentage = Math.min(100, Math.max(0, percentage));

        // if a maxTransition has been set, we round the percentage to that number
        if (
            this.settings.maxTransition !== 0 &&
            percentage > this.settings.maxTransition
        ) {
            percentage = this.settings.maxTransition;
        }

        // sometime the same percentage is returned
        // if so we don't do anything
        if (this.oldPercentage === percentage) {
            return false;
        }

        // if not range max is set, recalculate it
        if (!this.rangeMax) {
            this.getRangeMax();
        }

        // transform this % into the max range of the element
        // rounding translateValue to a non float int - as minimum pixel for browser to render is 1 (no 0.5)
        this.translateValue = (
            (percentage / 100) * this.rangeMax -
            this.rangeMax / 2
        ).toFixed(0);

        // sometime the same translate value is returned
        // if so we don't do anything
        if (this.oldTranslateValue === this.translateValue) {
            return false;
        }

        // store the current percentage
        this.oldPercentage = percentage;
        this.oldTranslateValue = this.translateValue;

        return true;
    }

    // animate the image
    animate() {
        let translateValueY = 0;
        let translateValueX = 0;
        let inlineCss;

        if (
            this.settings.orientation.includes('left') ||
            this.settings.orientation.includes('right')
        ) {
            // if orientation option is left or right
            // use horizontal axe - X axe
            translateValueX = `${this.settings.orientation.includes('left') ? this.translateValue * -1 : this.translateValue}px`;
        }

        if (
            this.settings.orientation.includes('up') ||
            this.settings.orientation.includes('down')
        ) {
            // if orientation option is up or down
            // use vertical axe - Y axe
            translateValueY = `${this.settings.orientation.includes('up') ? this.translateValue * -1 : this.translateValue}px`;
        }

        // set style to apply to the element
        if (this.settings.overflow === false) {
            // if overflow option is set to false
            // add the scale style
            inlineCss = `translate3d(${translateValueX}, ${translateValueY}, 0) scale(${this.settings.scale})`;
        } else {
            inlineCss = `translate3d(${translateValueX}, ${translateValueY}, 0)`;
        }

        // add style on the element using the adequate CSS transform
        this.element.style[cssTransform] = inlineCss;
    }
}

export default ParallaxInstance;
