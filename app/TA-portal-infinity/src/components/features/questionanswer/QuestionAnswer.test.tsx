import { mockTaProfileQuestions } from "../../../mocked-objects/mockTaProfileQuestions"
import { render, screen } from "@testing-library/react";
import { QuestionAnswer } from "./QuestionAnswer";

describe("QuestionAnswer", () => {
    const mockQuestion = mockTaProfileQuestions;

    it("shows questions and answers", () => {
        render(<QuestionAnswer profileQuestion={mockQuestion} />);

        expect(screen.getByText(new RegExp(`^${mockQuestion.description?.replace(/\s+/g, "\\s*")}`, "i"))).toBeInTheDocument();
        if (mockQuestion.answers)
            expect(screen.getByText(new RegExp(`^${mockQuestion.answers[0].description?.replace(/\s+/g, "\\s*")}`))).toBeInTheDocument();
    })
})