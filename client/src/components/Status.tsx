//@ts-nocheck

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleExclamation, faSquareCheck, faTriangleExclamation } from "@fortawesome/free-solid-svg-icons";
import { renderToStaticMarkup } from "react-dom/server"
import React from 'react'

// insane person type code i hate react and want to punish it by using it in a way it's not designed used in
export const toNode = x => {
  const χ = document.createElement('p')
  χ.innerHTML = renderToStaticMarkup(x);
  return χ.children[0]; };
export const toReact = e => {
  const props = {};
  for(let attr of e.attributes)
    props[attr.name] = attr.value;
  const children = Array.from(e.childNodes).map((c) => {
    if (c.nodeType === Node.ELEMENT_NODE) return toReact(c);
    else if (c.nodeType === Node.TEXT_NODE) return c.textContent;
    return null;
  }).filter(c => c !== null);
  if(props.style) props.style=(s=>{
      const css_json = `{"${s.replace(/; /g, '", "').replace(/: /g, '": "').replace(";", "")}"}`;
      const obj = JSON.parse(css_json);
      const keyValues = Object.keys(obj).map((key) => {
        var camelCased = key.replace(/-[a-z]/g, (g) => g[1].toUpperCase());
        return { [camelCased]: obj[key] }; });
      return Object.assign({}, ...keyValues); })(props.style);
  if(props.class) props.className=props.class;
  delete props.class;
  return React.createElement(e.tagName.toLowerCase(), props, ...children); };

// Get relevent properties from status color/int∈{-1,0,1}
export const c2s = (x:string|Number) => ({
      [-1]: {t:"Good"    , i:faSquareCheck        , c:"text-green-500" },
      [ 0]: {t:"Warning" , i:faTriangleExclamation, c:"text-yellow-500"},
      [ 1]: {t:"Critical", i:faCircleExclamation  , c:"text-red-500"   }
    }[x==="Green"||x===1 ?1: x==="Yellow"||x===0 ?0: -1]);

export const StatusInfo = () => toNode(
  <div className="flex flex-row text-xs p-2 justify-between">
    {[-1,0,1].map(c2s).map(s => (
      <div className="flex flex-row gap-1 flex-wrap justify-center items-center">
        <FontAwesomeIcon className={s.c+" center"} icon={s.i} size="2x"/>
        <h1>{s.t}</h1>
      </div>
    ))}
  </div>);