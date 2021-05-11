export default interface IQuestionResponseGateway<QuestionResponse> {
  create: (questionResponse: QuestionResponse) => Promise<QuestionResponse>;
  get: (id: string) => Promise<QuestionResponse | null>;
  update: (
    questionResponse: QuestionResponse
  ) => Promise<QuestionResponse | null>;
  delete: (id: string) => Promise<QuestionResponse | null>;
}
