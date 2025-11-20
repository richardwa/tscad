import { h, RNode, Signal } from "../lib";

export const Panel = (...children: Array<RNode | string>) =>
  h("div")
    .css("border-radius", "5px")
    .css("padding", "0.5rem")
    .css("background-color", "#424242")
    .inner(...children);

export const Button = (...children: Array<RNode | string>) =>
  h("button")
    .attr("type", "button")
    .css("padding", "0.25rem")
    .inner(...children);

export const NavLink = (href: string, ...children: Array<RNode | string>) =>
  h("a")
    .attr("href", href)
    .attr("target", "_blank")
    .inner(...children);

export const ClickLink = (...children: Array<RNode | string>) =>
  h("a")
    .css("cursor", "pointer")
    .css("color", "blue")
    .inner(...children);

export const TextInput = (val: Signal<string>) =>
  h("input")
    .attr("type", "text")
    .watch([val], (node) => {
      (node.el as HTMLInputElement).value = val.get();
    })
    .on("change", (event) => val.set(event.target.value));

export const NumberInput = (val: Signal<number>) =>
  h("input")
    .attr("type", "number")
    .watch([val], (node) => {
      (node.el as HTMLInputElement).value = `${val.get()}`;
    })
    .on("change", (event) => val.set(event.target.value));
