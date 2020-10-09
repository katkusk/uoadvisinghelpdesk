import { Dialog, DialogContext, DialogTurnResult } from "botbuilder-dialogs";
import {CardFactory} from "botbuilder"

export default class WelcomeDialog extends Dialog {
    constructor(dialogId: string) {
        super(dialogId);
    }

    public async beginDialog(context: DialogContext, options?: any): Promise<DialogTurnResult> {
        const welcomeCard = CardFactory.heroCard(
            'Welcome to the Advising Helpdesk. How can we be of support?',
            [],
            ['Schedule an Appointment', 'Ask a Registration Question']
       );
        await context.context.sendActivity( { attachments: [welcomeCard] } );
        return await context.endDialog();
    }
}
