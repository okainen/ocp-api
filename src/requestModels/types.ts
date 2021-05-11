export type SingleChoiceQuestionResponse = {
  choice: string;
};

export type MultiChoiceQuestionResponse = {
  choice: string[];
};

export type QuestionResponse =
  | SingleChoiceQuestionResponse
  | MultiChoiceQuestionResponse;
