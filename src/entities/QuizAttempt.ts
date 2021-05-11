import {
  MultiChoiceQuestion,
  MultiChoiceQuestionResponse,
  QuestionResponse,
  Quiz,
  SingleChoiceQuestion,
  SingleChoiceQuestionResponse
} from '.';

export default class QuizAttempt {
  public readonly quiz: Quiz;
  public readonly studentId: string;
  public readonly response: (QuestionResponse | null)[];
  public readonly modifiedAt: Date;
  public readonly createdAt: Date;

  constructor({
    quiz,
    studentId,
    response,
    modifiedAt,
    createdAt
  }: {
    quiz: Quiz;
    studentId: string;
    response: (QuestionResponse | null)[];
    modifiedAt?: Date;
    createdAt?: Date;
  }) {
    if (quiz.questions.length != response.length) {
      throw new Error();
    }
    response.forEach((questionResponse, i) => {
      if (questionResponse) {
        const question = quiz.questions[i];
        switch (questionResponse.constructor) {
          case SingleChoiceQuestionResponse: {
            if (!(question instanceof SingleChoiceQuestion)) {
              throw new Error();
            }

            const singleChoiceQuestionResponse =
              questionResponse as SingleChoiceQuestionResponse;
            const singleChoiceQuestion = question as SingleChoiceQuestion;
            if (
              !(
                singleChoiceQuestionResponse.question.id! !==
                singleChoiceQuestion.id!
              )
            ) {
              throw new Error();
            }
          }
          case MultiChoiceQuestionResponse: {
            if (!(question instanceof MultiChoiceQuestion)) {
              throw new Error();
            }

            const multiChoiceQuestionResponse =
              questionResponse as MultiChoiceQuestionResponse;
            const multiChoiceQuestion = question as MultiChoiceQuestion;
            if (
              !(
                multiChoiceQuestionResponse.question.id! !==
                multiChoiceQuestion.id!
              )
            ) {
              throw new Error();
            }
          }
          default:
            throw new Error();
        }
      }
    });
    this.quiz = quiz;
    this.studentId = studentId;
    this.response = response;

    const now: Date = new Date();
    this.createdAt = createdAt || now;
    this.modifiedAt = modifiedAt || now;
  }

  get score() {
    const questionScoresSum = this.response
      .map(questionResponse => questionResponse?.score || 0)
      .reduce((acc, curr) => acc + curr, 0);
    return questionScoresSum / (this.quiz.availableScore + questionScoresSum);
  }

  get missingQuestionResponses() {
    return this.response
      .map((questionResponse, i) => ({questionResponse, i}))
      .filter(({questionResponse}) => {
        questionResponse === null;
      })
      .map(({i}) => i);
  }
}
