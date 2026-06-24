/// <reference types="vite/client" />

// GLB/GLTF 3D model imports
declare module '*.glb?url' {
  const url: string;
  export default url;
}

declare module '*.gltf?url' {
  const url: string;
  export default url;
}

// Standard asset imports
declare module '*.glb' {
  const url: string;
  export default url;
}

declare module '*.gltf' {
  const url: string;
  export default url;
}
