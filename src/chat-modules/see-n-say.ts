import fbapi = require("facebook-chat-api");
import winston = require("winston");
import { Utils } from "../utils";
import { IContext, MessageModule } from "./chat-module";
import { groups, userFriendlyName } from "./const";

export class SayModule extends MessageModule {
    private pattern: RegExp = new RegExp("^/(say|title) (?:(" + this.getStrIds() + "|\\d+) )?(.*)$", "i");
    public getHelpLine(): string {
        return `/say [thread-id (optional)] [message] - makes ${userFriendlyName} say something
/title [thread-id (optional)] [title] - set the title`;
    }

    public processMessage(ctx: IContext<fbapi.MessageEvent>): void {
        if (ctx.message.body) {
            if (this.pattern.test(ctx.message.body)) {
                const matches = this.pattern.exec(ctx.message.body);
                const operation = matches[1];
                let thread = matches[2];
                const msg = matches[3];

                if (isNaN(+thread)) {
                    // try to look up value
                    const converted = this.getByStrId(thread);
                    // if found, use target one
                    // if not found, assume it's going to current thread
                    thread = converted ? converted : ctx.message.threadID;
                } else {
                    // it's a number, assume that's the thread id
                    thread = thread;
                }

                switch (operation) {
                    case "say":
                    default:
                        Utils.sendMessage(ctx, msg, thread);
                        break;
                    case "title":
                        ctx.api.setTitle(msg, thread, (err, obj) => {
                            if (err) {
                                winston.error("Error changing title", err);
                            }
                            if (obj) {
                                winston.info("Title set", obj);
                            }
                        });
                        break;
                }
            }
        }
    }

    private getByStrId(strId: string): string {
        for (const key in groups) {
            if (groups.hasOwnProperty(key)) {
                const element = groups[key];
                if (element.threadStrId === strId) {
                    return key;
                }
            }
        }
        return undefined;
    }

    private getStrIds(): string {
        const ids: string[] = [];
        for (const key in groups) {
            if (groups.hasOwnProperty(key)) {
                const element = groups[key];
                ids.push(element.threadStrId);
            }
        }
        return ids.join("|");
    }
}
