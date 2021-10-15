//simple hello command
import{
    Discord,
    SimpleCommand,
    SimpleCommandMessage,
}from "discordx";

@Discord()
class helloCommand{
    @SimpleCommand("hello", {aliases: ["hi"]})
    hello(command: SimpleCommandMessage){
        command.message.reply(`👋 ${command.message.member}`);
    }
}