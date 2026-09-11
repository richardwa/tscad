import { h, Signal } from "solid-vanilla";

export const Panel = () =>
  h("div")
    .css("border-radius", "5px")
    .css("padding", "0.5rem")
    .css("background-color", "#424242");

export const Header = () =>
  h("div").css("height", "2rem").css("line-height", "2rem");

export const Button = () =>
  h("button").attr("type", "button").css("padding", "0.25rem");

export const NavLink = (href: string) =>
  h("a").attr("href", href).attr("target", "_blank").css("cursor", "pointer");

export const ClickLink = () =>
  h("a").css("cursor", "pointer").css("color", "blue");

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
