const Discord = require('discord.js');
const got = require('got');
const fs = require('fs');
var path = require("path");
const fileName = '../hwchannels.json';
var pathToJson = path.resolve(__dirname, fileName);
const file = require(pathToJson);


module.exports = {

    getMemberByUsername(message, username){
        var members = message.guild.members.cache;
        var user = message.client.users.cache.find(u => u.tag === username);
        console.log(`yes its me, user ${user}`);
        if(!user){
            return message.reply(`User ${username} not found`);
        }
        userID = user.id;
        return members.get(userID);
    },


    openFileAndDo(url, aFunction, message) {
        (async () => {
            try {
                const response = await got(url);
                console.log(response.body);
                var csv = response.body;
                var usernames = csv.split("\r\n");
                usernames.forEach(username => {
                    console.log(username);
                    var member = module.exports.getMemberByUsername(message, username);
                    aFunction(member);
                });
            } catch (error) {
                console.log(error.response.body);
            }
        })();
    },

    writeToFile(path, file){
        fs.writeFile(path, JSON.stringify(file), function writeJSON(err) {
            if (err){
                console.log(err);
                return false;
            } 
            console.log(JSON.stringify(file));
            console.log('writing to ' + path);
        });
    },

    addHomeworkChannel(channelID, message, classCode){
        console.log(channelID);
        if (channelID in file.ids){
            message.followUp(`Channel <#${channelID}> has already been added as a Homework Channel. <a:shookysad:949689086665437184>`)
            return false;
        }
        console.log('SAVING NEW CHANNEL')
        console.log(channelID, classCode);

        file.ids[channelID] = classCode;
        this.writeToFile(pathToJson, file);
        return true;
    },
    addPreviewChannel(channelID, message){
        const previewFileName = '../previewlinkschannel.json';
        var pathToPreviewJson = path.resolve(__dirname, previewFileName);
        const filePreview = require(pathToPreviewJson);
        if (channelID in filePreview.ids){
            message.followUp(`Channel <#${channelID}> has already been added to preview links. <a:shookysad:949689086665437184>`)
            return false;
        }
        console.log(filePreview.ids);
        filePreview.ids.push(channelID);
        this.writeToFile(pathToPreviewJson, filePreview);
        return true;
    },
    removeHomeworkChannel(channelID, message){
        if (!(channelID in file.ids)){
            message.followUp(`Channel <#${channelID}> has not been added as a Homework Channel. <a:shookysad:949689086665437184>`)
            return false;
        }
        console.log('SAVING NEW CHANNEL')

        delete file.ids[channelID];
        this.writeToFile();
        return true;
    },
    createPreviewMessage(message, text, images) {
        const authorName = `${message.author.username}#${message.author.discriminator} (ID ${message.author.id})`
        var pictureLinks = ''
        if (images.size){
            images.forEach(image => {
                pictureLinks += `${image['proxyURL']}\n` ;
            })
        }
        console.log(pictureLinks);
        var randomColor = Math.floor(Math.random()*16777215).toString(16);
        const embed = new Discord.MessageEmbed()
          .setColor(randomColor)
          .setAuthor(authorName, message.author.avatarURL())
          .setDescription(`${text} ${pictureLinks ? '\r\n\r\n  Attachments: ' + pictureLinks : ''}\r\n\r\n **Message link:** ${message.url}`)
          .addFields(
            { name: '\u200b', value: `Message in ${message.channel}`,inline: true })
          .setImage(`${images.first() ? `${images.first().attachment}` : ''}`)
          .setFooter(`Message from: `)
          .setTimestamp(message.editedTimestamp || message.createdTimestamp);

        return embed;
    }
};
