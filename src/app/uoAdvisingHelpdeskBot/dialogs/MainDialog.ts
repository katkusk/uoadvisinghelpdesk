import { StatePropertyAccessor, TurnContext } from 'botbuilder';
import {
    ChoiceFactory,
    ChoicePrompt,
    ComponentDialog,
    DialogSet,
    DialogState,
    DialogTurnResult,
    DialogTurnStatus,
    WaterfallDialog,
    WaterfallStepContext
} from 'botbuilder-dialogs';

const CHOICE_PROMPT = 'CHOICE_PROMPT';
const MAIN_WATERFALL_DIALOG = 'WATERFALL_DIALOG';

export class MainDialog extends ComponentDialog {
    
    constructor(id: string) {
        super(id);

        this.addDialog(new ChoicePrompt(CHOICE_PROMPT));
        this.addDialog(new WaterfallDialog(MAIN_WATERFALL_DIALOG, [
                this.initialStep.bind(this),
                this.finalStep.bind(this)
            ]));

        this.initialDialogId = MAIN_WATERFALL_DIALOG;
    }

    /**
     * The run method handles the incoming activity (in the form of a DialogContext) and passes it through the dialog system.
     * If no dialog is active, it will start the default dialog.
     * @param {TurnContext} context
     * @param {accessor}
     */
    public async run(context: TurnContext, accessor: StatePropertyAccessor<DialogState>) {
        const dialogSet = new DialogSet(accessor);
        dialogSet.add(this);

        const dialogContext = await dialogSet.createContext(context);
        const results = await dialogContext.continueDialog();
        if (results.status === DialogTurnStatus.empty) {
            await dialogContext.beginDialog(this.id);
        }
    }

    /**
     * Initial step in the waterfall. This will kick of the site dialog
     */
    private async initialStep(stepContext: WaterfallStepContext): Promise<DialogTurnResult> {
        console.log(stepContext);
        return await stepContext.prompt(CHOICE_PROMPT, {
            choices: ChoiceFactory.toChoices(['Car', 'Bus', 'Bicycle']),
            prompt: 'Please enter your mode of transport.'
        });
    }

    /**
     * This is the final step in the main waterfall dialog.
     */
    private async finalStep(stepContext: WaterfallStepContext): Promise<DialogTurnResult> {
        console.log("final step accessed");
        let transportMethod = stepContext.result.value;
        let msg = `I have your mode of transport as ${transportMethod}.`;
        await stepContext.context.sendActivity(msg);
        return await stepContext.endDialog();

    }
}