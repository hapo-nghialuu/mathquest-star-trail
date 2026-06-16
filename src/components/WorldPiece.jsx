// WorldPiece — composable layer for map decor (floating islands, clouds,
// bridge segment). The parent supplies absolute coordinates and z-index.
import React from 'react';

export default function WorldPiece({
  src,
  alt = '',
  left,
  top,
  width,
  zIndex = 1,
  opacity = 1,
  rotate = 0,
  className = '',
}) {
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      style={{
        position: 'absolute',
        left,
        top,
        width,
        zIndex,
        opacity,
        transform: rotate ? `rotate(${rotate}deg)` : undefined,
        pointerEvents: 'none',
      }}
      draggable={false}
    />
  );
}
