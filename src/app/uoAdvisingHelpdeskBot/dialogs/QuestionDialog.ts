import { Dialog, DialogContext, DialogTurnResult } from "botbuilder-dialogs";
import { CardFactory } from "botbuilder";

const QuestionCard = require("./QuestionCard.json");
const questionCard = CardFactory.adaptiveCard(QuestionCard);

export default class QuestionDialog extends Dialog {
    constructor(dialogId: string) {
        super(dialogId);

    }

    public async beginDialog(context: DialogContext, options?: any): Promise<DialogTurnResult> {
        await context.context.sendActivity(`Sure thing! fill in the information below and I'll
        send your question to our peer advisors. They'll respond as soon as possible!`);
        await context.context.sendActivity( { attachments: [questionCard] } );
        return await context.endDialog();
    }

}