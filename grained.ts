/*! Grained.js
 * Author : Sarath Saleem  - https://github.com/sarathsaleem
 * MIT license: http://opensource.org/licenses/MIT
 * GitHub : https://github.com/sarathsaleem/grained
 * v0.0.1
 */

"use strict";

type GrainedOptions = {
    animate?: boolean;
    patternWidth?: number;
    patternHeight?: number;
    grainOpacity?: number;
    grainDensity?: number;
    grainWidth?: number;
    grainHeight?: number;
    grainChaos?: number;
    grainSpeed?: number;
};

const grained = (ele: string | HTMLElement, opt: GrainedOptions = {}): void => {
    let element: HTMLElement | null = null;

    if (typeof ele === 'string') {
        element = document.getElementById(ele.replace('#', ''));
    } else if (ele instanceof HTMLElement) {
        element = ele;
    }

    if (!element) {
        console.error(`Grained: cannot find the element with id ${ele}`);
        return;
    }

    const elementId = element.id;

    // Set style for parent
    if (element.style.position !== 'absolute') {
        element.style.position = 'relative';
    }
    element.style.overflow = 'hidden';

    const prefixes = ["", "-moz-", "-o-animation-", "-webkit-", "-ms-"];

    // Default option values
    const options: Required<GrainedOptions> = {
        animate: true,
        patternWidth: 100,
        patternHeight: 100,
        grainOpacity: 0.1,
        grainDensity: 1,
        grainWidth: 1,
        grainHeight: 1,
        grainChaos: 0.5,
        grainSpeed: 20,
        ...opt
    };

    const generateNoise = (): string => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            throw new Error('Grained: Unable to get canvas context');
        }

        canvas.width = options.patternWidth;
        canvas.height = options.patternHeight;

        for (let w = 0; w < options.patternWidth; w += options.grainDensity) {
            for (let h = 0; h < options.patternHeight; h += options.grainDensity) {
                const rgb = Math.floor(Math.random() * 256);
                ctx.fillStyle = `rgba(${rgb}, ${rgb}, ${rgb}, ${options.grainOpacity})`;
                ctx.fillRect(w, h, options.grainWidth, options.grainHeight);
            }
        }

        return canvas.toDataURL('image/png');
    };

    const addCSSRule = (sheet: CSSStyleSheet, selector: string, rules: string): void => {
        const rule = selector ? `${selector} { ${rules} }` : rules;
        if (sheet.insertRule) {
            sheet.insertRule(rule, sheet.cssRules.length);
        } else if (sheet.addRule) {
            sheet.addRule(selector, rules);
        }
    };

    const noise = generateNoise();

    let animation = '';
    const keyFrames = [
        '0%:-10%,10%', '10%:-25%,0%', '20%:-30%,10%', '30%:-30%,30%',
        '40%::-20%,20%', '50%:-15%,10%', '60%:-20%,20%', '70%:-5%,20%',
        '80%:-25%,5%', '90%:-30%,25%', '100%:-10%,10%'
    ];

    prefixes.forEach(prefix => {
        animation += `@${prefix}keyframes grained {`;
        keyFrames.forEach(keyFrame => {
            const [key, value] = keyFrame.split(':');
            animation += `${key} { ${prefix}transform: translate(${value}); }`;
        });
        animation += '}';
    });

    // Add animation keyframe
    const existingAnimation = document.getElementById('grained-animation');
    existingAnimation?.parentElement?.removeChild(existingAnimation);

    const style = document.createElement('style');
    style.id = 'grained-animation';
    style.innerHTML = animation;
    document.body.appendChild(style);

    // Add customized style
    const existingStyle = document.getElementById(`grained-animation-${elementId}`);
    existingStyle?.parentElement?.removeChild(existingStyle);

    const customStyle = document.createElement('style');
    customStyle.id = `grained-animation-${elementId}`;
    document.body.appendChild(customStyle);

    let rule = `background-image: url(${noise});`;
    rule += 'position: absolute; content: ""; height: 300%; width: 300%; left: -100%; top: -100%; pointer-events: none;';

    if (options.animate) {
        prefixes.forEach(prefix => {
            rule += `${prefix}animation-name: grained;`;
            rule += `${prefix}animation-iteration-count: infinite;`;
            rule += `${prefix}animation-duration: ${options.grainChaos}s;`;
            rule += `${prefix}animation-timing-function: steps(${options.grainSpeed}, end);`;
        });
    }

    const selectorElement = `#${elementId}::before`;
    addCSSRule(customStyle.sheet as CSSStyleSheet, selectorElement, rule);
};

export default grained;
