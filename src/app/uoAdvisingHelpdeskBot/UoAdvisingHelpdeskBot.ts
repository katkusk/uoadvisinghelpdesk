import { BotDeclaration, MessageExtensionDeclaration, PreventIframe } from "express-msteams-host";
import * as debug from "debug";
import { Dialog, DialogSet, DialogState } from "botbuilder-dialogs";
import { StatePropertyAccessor, TurnContext, MemoryStorage, ConversationState, ActivityTypes, TeamsActivityHandler, CardFactory, BotState, UserState } from "botbuilder";
import ScheduleDialog from "./dialogs/ScheduleDialog";
import WelcomeDialog from "./dialogs/WelcomeDialog";
import QuestionDialog from "./dialogs/QuestionDialog";

// Initialize debug logging module
const log = debug("msteams");

/**
 * Implementation for UO Advising Helpdesk Bot
 */
@BotDeclaration(
    "/api/messages",
    new MemoryStorage(),
    process.env.MICROSOFT_APP_ID,
    process.env.MICROSOFT_APP_PASSWORD)

export class UoAdvisingHelpdeskBot extends TeamsActivityHandler {
    private readonly conversationState: ConversationState;
    private readonly dialogs: DialogSet;
    private dialogState: StatePropertyAccessor<DialogState>;

    /**
     * The constructor
     * @param { ConversationState } conversationState
     */
    public constructor(conversationState: ConversationState) {
        super();

        this.conversationState = conversationState as ConversationState;
        this.dialogState = conversationState.createProperty("dialogState");
        this.dialogs = new DialogSet(this.dialogState);
        this.dialogs.add(new WelcomeDialog('welcome'));
        this.dialogs.add(new ScheduleDialog("schedule"));
        this.dialogs.add(new QuestionDialog("question"));

        // Set up the Activity processing

        this.onMessage(async (context: TurnContext): Promise<void> => {
            // TODO: add your own bot logic in here
            switch (context.activity.type) {
                case ActivityTypes.Message:
                    let text = TurnContext.removeRecipientMention(context.activity);
                    text = text.toLowerCase();
                    if (text.startsWith("hello")) {
                        await context.sendActivity("Oh, hello to you as well!");
                        return;
                    } else if (text.startsWith("ask")) {
                        const dc = await this.dialogs.createContext(context);
                        await dc.beginDialog("question");
                    } else if (text.startsWith("schedule an appointment")) {
                        const dc = await this.dialogs.createContext(context);
                        await dc.beginDialog("schedule");
                    } else {
                        const welcomeCard = CardFactory.heroCard(
                            'Welcome to the Advising Helpdesk. How can we be of support?',
                            [],
                            ['Schedule an Appointment', 'Ask a Registration Question']
                       );
                        await context.sendActivity( { attachments: [welcomeCard] } );
                    }
                    break;
                default:
                    break;
            }
            // Save state changes
            return this.conversationState.saveChanges(context);
        });

        this.onConversationUpdate(async (context: TurnContext): Promise<void> => {
            if (context.activity.membersAdded && context.activity.membersAdded.length !== 0) {
                for (const idx in context.activity.membersAdded) {
                    if (context.activity.membersAdded[idx].id === context.activity.recipient.id) {
                        const dc = await this.dialogs.createContext(context);
                        await dc.beginDialog("welcome");
                    }
                }
            }
        });

        this.onMessageReaction(async (context: TurnContext): Promise<void> => {
            const added = context.activity.reactionsAdded;
            if (added && added[0]) {
                await context.sendActivity({
                    textFormat: "xml",
                    text: `That was an interesting reaction (<b>${added[0].type}</b>)`
                });
            }
        });;
   }


}
