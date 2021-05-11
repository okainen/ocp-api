export default class Quiz {
  constructor(
    public readonly id?: string,
    public readonly name?: string,
    public readonly estimatedEffort?: number,
    public readonly availableScore?: number
  ) {}
}
