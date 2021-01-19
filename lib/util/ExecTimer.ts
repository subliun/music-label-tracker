export class ExecTimer {
  readonly rand: number;
  constructor(readonly label: string) {
    this.rand = Math.random() % 1000;
  }

  private fullLabel() {
    return this.label + " " + this.rand;
  }

  timeStart() {
    console.time(this.fullLabel());
  }

  timeEnd() {
    console.timeEnd(this.fullLabel());
  }
}
