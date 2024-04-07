declare module 'node:child_process' {
  export const fork: (modulePath: string) => void;
}
