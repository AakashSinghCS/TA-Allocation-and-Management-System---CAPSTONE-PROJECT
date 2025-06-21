import { mockTaProfileQuestion1 } from "../../../../mocked-objects/profile/mockTaProfileQuestions"
import { render, screen } from "@testing-library/react";
import { ProfileQuestionAnswer } from "./ProfileQuestionAnswer";

describe("QuestionAnswer", () => {
    const mockQuestion = mockTaProfileQuestion1;

    it("shows questions and answers", () => {
        render(<ProfileQuestionAnswer profileQuestion={mockQuestion} />);

        expect(screen.getByText(new RegExp(`^${mockQuestion.description?.replace(/\s+/g, "\\s*")}`, "i"))).toBeInTheDocument();
        if (mockQuestion.answers)
            expect(screen.getByText(new RegExp(`^${mockQuestion.answers[0].description?.replace(/\s+/g, "\\s*")}`))).toBeInTheDocument();
    })
})