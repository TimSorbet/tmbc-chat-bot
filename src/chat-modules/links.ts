import fbapi = require("facebook-chat-api");
import { Utils } from "../utils";
import { IContext, MessageModule } from "./chat-module";

export class LinksModule extends MessageModule {
    public getHelpLine(): string {
        return "/links: show chat guide link and my source";
    }

    public processMessage(ctx: IContext<fbapi.MessageEvent>): void {
        if (ctx.message.body === "/links") {
            Utils.sendMessage(ctx,
                "https://bit.ly/TMBCChatGuide" + "\n" +
                "https://github.com/Mini-Geek/tmbc-chat-bot");
        }
    }
}
