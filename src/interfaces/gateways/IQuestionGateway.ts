export default interface IQuestionGateway<Question> {
  create: (question: Question) => Promise<Question>;
  get: (id: string) => Promise<Question | null>;
  update: (question: Question) => Promise<Question | null>;
  delete: (id: string) => Promise<Question | null>;
}
