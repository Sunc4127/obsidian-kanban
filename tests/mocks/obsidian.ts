export class App {}

export class Setting {}

export class TFile {
  constructor(public path: string) {}
}

export class TFolder {
  constructor(public path: string) {}
}

export function normalizePath(value: string) {
  return value.replace(/\\/g, '/').replace(/\/{2,}/g, '/');
}
