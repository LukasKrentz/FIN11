//created by Kevin - (https://github.com/Kyukishi)

import { Discord, SimpleCommand, SimpleCommandMessage, On, ArgsOf } from 'discordx';
import { MessageEmbed, Message } from 'discord.js';

let commandMsg:Message;
let replyCount = 0;
let channelId = '';
let authorId = '';
let checkoutMsgId = '';
let cancelMsgIds:string[] = [];
let messagesToDelete:Message[] = [];

interface ITodoContent{
    category: string | undefined
    expires: Date | undefined
    content: string | undefined
}
const todoContent:ITodoContent = {
    category: undefined,
    expires: undefined,
    content: undefined
};

interface ITodoAuthor{
    name: string
    iconURL: string | null
}
class TodoEmbed extends MessageEmbed{
    constructor(category:string, expires:Date, content:string, author:ITodoAuthor){
        super({
            color: '#007bff',
            title: 'Hausaufgabe',
            description: `Fach: ${category}`,
            thumbnail: {
                url: 'https://raw.githubusercontent.com/Kyukishi/Kyukishi/main/round_drive_file_rename_outline_white_48dp.png'
            },
            fields: [
                {name: 'Wann?', value: expires.toLocaleDateString('de-DE', {weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'})},
                {name: 'Was?', value: content},
                {name: '\u200B', value: '\u200B'}
            ],
            footer: (()=>{
                if(author.iconURL !== null){
                    return {
                        text: author.name,
                        iconURL: author.iconURL
                    };
                }else{
                    return {
                        text: author.name
                    };
                }
            })()
        });
    }
}

//clean up the discord chat and reset the replyCount
function checkout(){
    replyCount = 0;
    messagesToDelete.forEach(async(message)=>{
        if(message.deletable){
            message.delete();
        }
    });
}

@Discord()
class todoCommand{
    @SimpleCommand('todo', {aliases: ['hw', 'homework']})
    async todo(command: SimpleCommandMessage){
        commandMsg = command.message;
        channelId = command.message.channelId;
        authorId = command.message.author.id;
        replyCount = 1;
        messagesToDelete = [];
        cancelMsgIds = [];

        await command.message.reply('Fach?').then((msg)=>{
            messagesToDelete.push(msg);
            cancelMsgIds.push(msg.id);
            msg.react('❌');
        });
    }

    @On('messageCreate')
    async onMessage([message]:ArgsOf<'messageCreate'>){
        if(message.channelId === channelId && message.author.id === authorId && replyCount > 0){
            messagesToDelete.push(message);
            switch(replyCount){
                //category input
                case 1:{
                    //detect keywords
                    todoContent.category = (()=>{
                        switch(message.content.toLocaleLowerCase()){
                            case'sk':case'so':case'soz':return 'Sozialkunde';
                            case'sp':case'spo':return 'Sport';
                            case'e':case'en':case'eng':return 'Englisch';
                            case'd':case'de':case'deu':return 'Deutsch';
                            default:return message.content;
                        }
                    })();
                    replyCount++;
                    const question = await commandMsg.reply('Abgabedatum?');
                    messagesToDelete.push(question);
                    cancelMsgIds.push(question.id);
                    question.react('❌');
                }break;
                //date input
                case 2:{
                    const expDate:Date | undefined = (()=>{
                        function getNextDayOfWeek(dayOfWeek:number) {
                            const resultDate = new Date();
                            resultDate.setDate(resultDate.getDate() + (7 + dayOfWeek - resultDate.getDay()) % 7);
                            return resultDate;
                        }

                        switch(message.content.toLocaleLowerCase()){
                            case'tomorrow':case'tmrw':case'morgen':return(()=>{
                                const day= new Date();
                                day.setDate(day.getDate() + 1);
                                return day;
                            })();
                            case'the day after tomorrow':case'übermorgen':return(()=>{
                                const day= new Date();
                                day.setDate(day.getDate() + 2);
                                return day;
                            })();
                            case'sunday':case'sun':case'sonntag':case'son':return getNextDayOfWeek(7);
                            case'monday':case'mon':case'montag':return getNextDayOfWeek(1);
                            case'tuesday':case'tue':case'dienstag':case'die':return getNextDayOfWeek(2);
                            case'wednesday':case'wed':case'mittwoch':case'mit':return getNextDayOfWeek(3);
                            case'thursday':case'thu':case'donnerstag':case'don':return getNextDayOfWeek(4);
                            case'friday':case'fri':case'freitag':case'fre':return getNextDayOfWeek(5);
                            case'saturday':case'sat':case'samstag':case'sam':return getNextDayOfWeek(6);
                            default: return(()=>{
                                let splittedMsg:string[] | undefined;
                                if(message.content.includes('-'))
                                    splittedMsg = message.content.split('-');
                                if(message.content.includes('.'))
                                    splittedMsg = message.content.split('.');
                                if(message.content.includes(' '))
                                    splittedMsg = message.content.split(' ');
                                
                                if(typeof splittedMsg !== 'undefined'){
                                    try{
                                        splittedMsg.forEach((date:string)=>{
                                            if(!/^\d+$/.test(date))
                                                throw '';
                                        });
                                        const currDate = new Date();
    
                                        let year = parseInt(splittedMsg[2])-1;
                                        let month = parseInt(splittedMsg[1])-1;
                                        const day = parseInt(splittedMsg[0]);
    
                                        if(typeof splittedMsg[1] === 'undefined'){
                                            if(currDate.getDate() >= day){
                                                currDate.setMonth(currDate.getMonth() + 1);
                                                month = currDate.getMonth();
                                            }
                                            month = currDate.getMonth();
                                        }
                                        if(typeof splittedMsg[2] === 'undefined'){
                                            year = currDate.getFullYear();
                                        }

                                        const outDate = new Date();
                                        outDate.setFullYear(year, month, day);
                                        return outDate;
                                    }catch(e){
                                        return undefined;
                                    }
                                }else{
                                    if(/^\d+$/.test(message.content)){
                                        try{
                                            const outDate = new Date();
                                            if(outDate.getDate() >= parseInt(message.content)){
                                                outDate.setMonth(outDate.getMonth() + 1);
                                            }
                                            outDate.setDate(parseInt(message.content));
                                            return outDate;
                                        }catch(e){
                                            return undefined;
                                        }
                                    }else{
                                        return undefined;
                                    }
                                }
                            })();
                        }
                    })();
                    if(typeof expDate !== 'undefined'){
                        todoContent.expires = expDate;
                        replyCount++;
                        const question = await commandMsg.reply('Inhalt?');
                        messagesToDelete.push(question);
                        cancelMsgIds.push(question.id);
                        question.react('❌');
                    }else{
                        const question = await commandMsg.reply('sorry, kannst du das datum wiederholen? (dd-mm-yyyy) - monat und jahr ist nicht nötig, es geht auch "morgen" etc');
                        messagesToDelete.push(question);
                        cancelMsgIds.push(question.id);
                        question.react('❌');
                    }
                }break;
                //content input
                case 3:{
                    todoContent.content = message.content;
                    replyCount = 0;
                    if(typeof todoContent.category !== 'undefined' && typeof todoContent.expires !== 'undefined' && typeof todoContent.content !== 'undefined'){
                        const embed = new TodoEmbed(todoContent.category, todoContent.expires, todoContent.content, {name: commandMsg.author.username, iconURL: commandMsg.author.avatarURL()});
                        const question = await commandMsg.reply(`das nach <#${channels.todos?.id}> senden?`);
                        question.embeds.push(embed);
                        question.react('✅');
                        question.react('❌');
                        await commandMsg.channel.send({embeds: [embed]}).then((embedMsg)=>messagesToDelete.push(embedMsg));
                        checkoutMsgId = question.id;
                        messagesToDelete.push(question);
                    }
                }break;
            }
        }
    }

    @On('messageReactionAdd')
    onReact([reaction]:ArgsOf<'messageReactionAdd'>){
        if(reaction.message.id === checkoutMsgId){
            reaction.users.fetch().then((users)=>{
                if(users.has(authorId))
                switch(reaction.emoji.name){
                    case'✅':{
                        checkout();
                        const embed = new TodoEmbed(<string>todoContent.category, <Date>todoContent.expires, <string>todoContent.content, {name: commandMsg.author.username, iconURL: commandMsg.author.avatarURL()});
                        channels.todos?.send({embeds: [embed]});
                        commandMsg.reply(`send to <#${channels.todos?.id}>`);
                    }break;
                    case'❌':{
                        checkout();
                        commandMsg.reply(`canceled todo creation`);
                    }break;
                }
            });
        }else if(cancelMsgIds.includes(reaction.message.id)){
            reaction.users.fetch().then((users)=>{
                if(users.has(authorId))
                if(reaction.emoji.name === '❌'){
                    checkout();
                    commandMsg.reply(`canceled todo creation`);
                }
            });
        }
    }
}